import "server-only";
import { db, now } from "./db";
import { HttpError, type AdminUser } from "./session";
import { can } from "./roles";
import { getEntry } from "./entries";
import { safePath } from "./sanitize";
import { sanitizeSeo } from "./sanitize";
import { onlyContentChanged, sanitizeNodes } from "./sanitizeDoc";
import type { SiteDoc, SiteNode } from "@/lib/site/tree";
import type { Seo } from "./schema";

/**
 * עמודים וחלקים משותפים בעורך - שלב 6.
 *
 * אותו מודל כמו פריטי תוכן (lib/admin/entries.ts): הגרסה המפורסמת
 * ב-entries, עותק העבודה ב-drafts, כל פרסום ב-revisions. ההבדל:
 * התוכן הוא עץ אלמנטים, והוא עובר ניקוי מול העותק המהימן.
 */

const KEEP_REVISIONS = 20;
const CONFLICT = "העמוד השתנה בחלון אחר. רעננו כדי לראות את הגרסה העדכנית";

export type PageData = { title: string; path?: string; seo?: Seo; fields: Record<string, unknown>; doc: SiteDoc };

export type PageSummary = { id: string; type: "page" | "part"; title: string; path: string; status: string; hasDraft: boolean; updatedAt: string };

export async function listPages(): Promise<PageSummary[]> {
  const { rows } = await (await db()).execute(
    `SELECT e.id, e.type, e.status, e.data, e.updated_at, d.data AS draft, d.updated_at AS draft_at
     FROM entries e LEFT JOIN drafts d ON d.entry_id = e.id
     WHERE e.type IN ('page', 'part') AND e.status != 'trash'
     ORDER BY e.type, json_extract(e.data, '$.path')`,
  );
  return rows.map((r) => {
    const d = JSON.parse(String(r.draft ?? r.data)) as PageData;
    return {
      id: String(r.id),
      type: r.type as "page" | "part",
      title: d.title,
      path: d.path ?? "",
      status: String(r.status),
      hasDraft: r.draft != null && r.status === "publish",
      updatedAt: String(r.draft_at ?? r.updated_at),
    };
  });
}

function requirePageEntry(e: { type: string }) {
  if (e.type !== "page" && e.type !== "part") throw new HttpError(404, "זה לא עמוד");
}

/** הגרסה שמולה מנקים: הטיוטה הקיימת אם יש, אחרת המפורסמת */
async function trustedDoc(id: string) {
  const entry = await getEntry(id);
  requirePageEntry(entry);
  return { entry, data: entry.data as unknown as PageData };
}

export async function savePageDraft(
  id: string,
  raw: { nodes?: unknown; title?: unknown; path?: unknown; seo?: unknown },
  baseRevision: number,
  user: AdminUser,
) {
  const { entry, data } = await trustedDoc(id);
  if (entry.revision !== baseRevision) throw new HttpError(409, CONFLICT);

  const nodes: SiteNode[] = sanitizeNodes(raw.nodes, data.doc.nodes);
  const layout = can(user.role, "pages.layout");
  /* ⚠️ עורך/ת תוכן: רק טקסט, תמונות וקישורים (ADMIN-SPEC §5). נבדק
     כאן, בשרת - הממשק מסתיר את השאר, אבל זה לא מה שמגן */
  if (!layout && !onlyContentChanged(data.doc.nodes, nodes)) {
    throw new HttpError(403, "אפשר לשנות כאן רק טקסטים ותמונות. שינויי מבנה ועיצוב - דרך דניאל");
  }
  if (entry.type === "part" && !can(user.role, "shared.edit")) throw new HttpError(403, "אין לך הרשאה לערוך את התפריט והפוטר");

  const next: PageData = {
    ...data,
    doc: { ...data.doc, nodes },
    /* כותרת, כתובת ו-SEO - רק מי שמנהל את מבנה האתר */
    ...(layout && typeof raw.title === "string" ? { title: raw.title.trim().slice(0, 120) || data.title } : {}),
    ...(layout && entry.type === "page" && raw.path !== undefined && data.path !== "/" ? { path: safePath(raw.path) || data.path } : {}),
    ...(layout && raw.seo !== undefined ? { seo: sanitizeSeo(raw.seo) } : {}),
  };

  const revision = baseRevision + 1;
  const t = now();
  await (await db()).execute({
    sql: `INSERT INTO drafts (entry_id, data, revision, updated_at) VALUES (?, ?, ?, ?)
          ON CONFLICT(entry_id) DO UPDATE SET data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at`,
    args: [id, JSON.stringify(next), revision, t],
  });
  return { revision, updatedAt: t, nodes };
}

export async function publishPage(id: string, baseRevision: number, user: AdminUser) {
  const { entry, data } = await trustedDoc(id);
  if (entry.revision !== baseRevision) throw new HttpError(409, CONFLICT);
  if (entry.type === "part" && !can(user.role, "shared.edit")) throw new HttpError(403, "אין לך הרשאה לערוך את התפריט והפוטר");
  if (!entry.hasDraft && entry.status === "publish") return { revision: entry.revision };

  const c = await db();
  const t = now();
  const revision = baseRevision + 1;
  const writes = [
    { sql: "UPDATE entries SET data = ?, status = 'publish', revision = ?, updated_at = ? WHERE id = ?", args: [JSON.stringify(data), revision, t, id] },
    { sql: "DELETE FROM drafts WHERE entry_id = ?", args: [id] },
    { sql: "INSERT INTO revisions (entry_id, data, author, created_at) VALUES (?, ?, ?, ?)", args: [id, JSON.stringify(data), user.name || user.email, t] },
    {
      sql: `DELETE FROM revisions WHERE entry_id = ? AND id NOT IN (SELECT id FROM revisions WHERE entry_id = ? ORDER BY id DESC LIMIT ${KEEP_REVISIONS})`,
      args: [id, id],
    },
  ];
  /* כתובת שהשתנתה - הפניה מהישנה, כמו במאמרים */
  if (entry.type === "page" && entry.publishedPath && data.path && entry.publishedPath !== data.path) {
    writes.push(
      { sql: "INSERT INTO redirects (from_path, to_path, created_at) VALUES (?, ?, ?) ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path", args: [entry.publishedPath, data.path, t] },
      { sql: "DELETE FROM redirects WHERE from_path = ?", args: [data.path] },
    );
  }
  await c.batch(writes, "write");
  return { revision };
}

/** ביטול הטיוטה - חזרה לגרסה שבאתר */
export async function discardPageDraft(id: string) {
  await (await db()).execute({ sql: "DELETE FROM drafts WHERE entry_id = ?", args: [id] });
}
