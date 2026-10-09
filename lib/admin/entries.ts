import "server-only";
import { randomUUID } from "node:crypto";
import { db, now } from "./db";
import { HttpError, type AdminUser } from "./session";
import { displayTitle, typeById, type ContentType, type EntryData } from "./schema";
import { missingRequired, safePath, sanitizeFields, sanitizeSeo } from "./sanitize";

/**
 * פריטי תוכן: טיוטה, פרסום, היסטוריה, סל מיחזור וסדר.
 *
 * המודל (המפרט §2):
 *   entries.data   = הגרסה המפורסמת (או, לפריט שמעולם לא פורסם, הנוכחית)
 *   drafts.data    = עותק העבודה. טיוטה אחת לפריט
 *   revisions      = כל פרסום. נשמרות 20 האחרונות (ADMIN-SPEC §0)
 *
 * ⚠️ revision: כל שמירה שולחת את המספר שהיא ראתה. אם מישהו שמר
 * בינתיים בחלון אחר - 409 עם הודעה ברורה, ולא דריסה שקטה.
 */

const KEEP_REVISIONS = 20;
const CONFLICT = "התוכן השתנה בחלון אחר. רעננו את העמוד כדי לראות את הגרסה העדכנית";

export type Status = "publish" | "draft" | "trash";

export type EntrySummary = {
  id: string;
  type: string;
  status: Status;
  title: string;
  image: string;
  filter: string;
  path: string;
  hasDraft: boolean;
  updatedAt: string;
};

export type EntryFull = {
  id: string;
  type: string;
  status: Status;
  revision: number;
  hasDraft: boolean;
  /** הגרסה לעריכה: הטיוטה אם יש, אחרת המפורסמת */
  data: EntryData;
  /** הכתובת המפורסמת - כדי להציג "הכתובת תשתנה" */
  publishedPath: string;
  updatedAt: string;
};

function requireType(typeId: string): ContentType {
  const t = typeById(typeId);
  if (!t) throw new HttpError(404, "סוג תוכן לא מוכר");
  return t;
}

const parse = (s: unknown): EntryData => {
  try {
    return JSON.parse(String(s));
  } catch {
    return { title: "", fields: {} };
  }
};

/** מנקה ובונה רשומה מלאה מהקלט של הטופס */
function buildData(type: ContentType, raw: Record<string, unknown>): EntryData {
  const fields = sanitizeFields(type, raw.fields);
  const data: EntryData = { title: displayTitle(type, fields), fields };
  if (type.hasPage) {
    data.path = safePath(raw.path) || safePath(String(fields[type.titleField] ?? ""));
    data.seo = sanitizeSeo(raw.seo);
  }
  return data;
}

export async function listEntries(typeId: string, trash: boolean): Promise<EntrySummary[]> {
  const type = requireType(typeId);
  const { rows } = await (await db()).execute({
    sql: `SELECT e.id, e.type, e.status, e.data, e.updated_at, d.data AS draft, d.updated_at AS draft_at
          FROM entries e LEFT JOIN drafts d ON d.entry_id = e.id
          WHERE e.type = ? AND ${trash ? "e.status = 'trash'" : "e.status != 'trash'"}
          ORDER BY e.position ASC, e.updated_at DESC`,
    args: [type.id],
  });
  return rows.map((r) => {
    const data = parse(r.draft ?? r.data);
    const f = data.fields ?? {};
    return {
      id: String(r.id),
      type: type.id,
      status: r.status as Status,
      title: displayTitle(type, f),
      image: type.imageField ? String(f[type.imageField] ?? "") : "",
      filter: type.filterField ? String(f[type.filterField] ?? "") : "",
      path: data.path ?? "",
      hasDraft: r.draft != null && r.status === "publish",
      updatedAt: String(r.draft_at ?? r.updated_at),
    };
  });
}

export async function getEntry(id: string): Promise<EntryFull> {
  const { rows } = await (await db()).execute({
    sql: `SELECT e.*, d.data AS draft, d.revision AS draft_rev, d.updated_at AS draft_at
          FROM entries e LEFT JOIN drafts d ON d.entry_id = e.id WHERE e.id = ?`,
    args: [id],
  });
  const r = rows[0];
  if (!r) throw new HttpError(404, "הפריט לא נמצא. אולי נמחק בחלון אחר");
  const published = parse(r.data);
  return {
    id: String(r.id),
    type: String(r.type),
    status: r.status as Status,
    revision: Number(r.draft_rev ?? r.revision),
    hasDraft: r.draft != null && r.status === "publish",
    data: r.draft != null ? parse(r.draft) : published,
    publishedPath: r.status === "publish" ? (published.path ?? "") : "",
    updatedAt: String(r.draft_at ?? r.updated_at),
  };
}

/** פריט חדש נפתח כטיוטה ריקה, בראש הרשימה */
export async function createEntry(typeId: string): Promise<string> {
  const type = requireType(typeId);
  const c = await db();
  const id = randomUUID();
  const top = await c.execute({ sql: "SELECT MIN(position) AS p FROM entries WHERE type = ?", args: [type.id] });
  const position = Number(top.rows[0]?.p ?? 0) - 1;
  const data = JSON.stringify(buildData(type, {}));
  await c.execute({
    sql: `INSERT INTO entries (id, type, status, data, revision, updated_at, position)
          VALUES (?, ?, 'draft', ?, 1, ?, ?)`,
    args: [id, type.id, data, now(), position],
  });
  return id;
}

/** שמירת טיוטה. לא נוגעת באתר הציבורי (המפרט §4: לא מרוקנת מטמון) */
export async function saveDraft(id: string, raw: Record<string, unknown>, baseRevision: number) {
  const entry = await getEntry(id);
  if (entry.status === "trash") throw new HttpError(409, "הפריט בסל המיחזור. שחזרו אותו קודם");
  if (entry.revision !== baseRevision) throw new HttpError(409, CONFLICT);
  const data = buildData(requireType(entry.type), raw);
  const revision = baseRevision + 1;
  const t = now();
  const c = await db();
  if (entry.status === "draft") {
    /* פריט שלא פורסם מעולם: אין גרסה ציבורית לשמור בצד, ולכן
       הטיוטה היא הרשומה עצמה. כך הרשימה מציגה את השם העדכני */
    await c.execute({
      sql: "UPDATE entries SET data = ?, revision = ?, updated_at = ? WHERE id = ? AND revision = ?",
      args: [JSON.stringify(data), revision, t, id, baseRevision],
    });
  } else {
    await c.execute({
      sql: `INSERT INTO drafts (entry_id, data, revision, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(entry_id) DO UPDATE SET data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at`,
      args: [id, JSON.stringify(data), revision, t],
    });
  }
  return { revision, data, updatedAt: t };
}

export async function publishEntry(id: string, baseRevision: number, user: AdminUser) {
  const entry = await getEntry(id);
  if (entry.status === "trash") throw new HttpError(409, "הפריט בסל המיחזור. שחזרו אותו קודם");
  if (entry.revision !== baseRevision) throw new HttpError(409, CONFLICT);
  const type = requireType(entry.type);
  const data = entry.data;

  const missing = missingRequired(type.fields, data.fields);
  if (type.hasPage && !data.path) missing.push("כתובת העמוד");
  if (missing.length) throw new HttpError(422, `חסר כדי לפרסם: ${missing.join(" · ")}`);

  const c = await db();
  if (type.hasPage && data.path) {
    const clash = await c.execute({
      sql: "SELECT id FROM entries WHERE id != ? AND status != 'trash' AND json_extract(data, '$.path') = ?",
      args: [id, data.path],
    });
    if (clash.rows.length) throw new HttpError(409, `הכתובת ${data.path} כבר בשימוש. בחרו כתובת אחרת`);
  }

  const t = now();
  const revision = baseRevision + 1;
  const writes = [
    {
      sql: "UPDATE entries SET data = ?, status = 'publish', revision = ?, updated_at = ?, prev_status = NULL WHERE id = ?",
      args: [JSON.stringify(data), revision, t, id],
    },
    { sql: "DELETE FROM drafts WHERE entry_id = ?", args: [id] },
    {
      sql: "INSERT INTO revisions (entry_id, data, author, created_at) VALUES (?, ?, ?, ?)",
      args: [id, JSON.stringify(data), user.name || user.email, t],
    },
    {
      sql: `DELETE FROM revisions WHERE entry_id = ? AND id NOT IN
            (SELECT id FROM revisions WHERE entry_id = ? ORDER BY id DESC LIMIT ${KEEP_REVISIONS})`,
      args: [id, id],
    },
  ];
  /* כתובת שהשתנתה: הישנה מפנה לחדשה, כדי לא לאבד דירוג שכבר נבנה
     (ADMIN-SPEC §0). ואם מישהו חוזר לכתובת ישנה - ההפניה ממנה נמחקת */
  if (type.hasPage && entry.publishedPath && entry.publishedPath !== data.path) {
    writes.push(
      {
        sql: `INSERT INTO redirects (from_path, to_path, created_at) VALUES (?, ?, ?)
              ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path`,
        args: [entry.publishedPath, data.path!, t],
      },
      { sql: "UPDATE redirects SET to_path = ? WHERE to_path = ?", args: [data.path!, entry.publishedPath] },
      { sql: "DELETE FROM redirects WHERE from_path = ?", args: [data.path!] },
    );
  }
  await c.batch(writes, "write");
  return { revision, redirectedFrom: entry.publishedPath !== data.path ? entry.publishedPath : "" };
}

/** ביטול פרסום / העברה לסל / שחזור מהסל */
export async function setStatus(id: string, action: "unpublish" | "trash" | "untrash") {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT status, prev_status FROM entries WHERE id = ?", args: [id] });
  const r = rows[0];
  if (!r) throw new HttpError(404, "הפריט לא נמצא");
  const t = now();
  if (action === "unpublish") {
    if (r.status !== "publish") return;
    /* הטיוטה (אם יש) נשארת. היא תהיה הגרסה הבאה שתפורסם */
    await c.execute({ sql: "UPDATE entries SET status = 'draft', revision = revision + 1, updated_at = ? WHERE id = ?", args: [t, id] });
  } else if (action === "trash") {
    if (r.status === "trash") return;
    await c.execute({
      sql: "UPDATE entries SET prev_status = status, status = 'trash', revision = revision + 1, updated_at = ? WHERE id = ?",
      args: [t, id],
    });
  } else {
    /* "בטל" מיד אחרי מחיקה מחזיר בדיוק למצב הקודם, כולל פרסום */
    await c.execute({
      sql: "UPDATE entries SET status = COALESCE(prev_status, 'draft'), prev_status = NULL, revision = revision + 1, updated_at = ? WHERE id = ?",
      args: [t, id],
    });
  }
}

export async function listRevisions(id: string) {
  const { rows } = await (await db()).execute({
    sql: "SELECT id, author, created_at, data FROM revisions WHERE entry_id = ? ORDER BY id DESC",
    args: [id],
  });
  return rows.map((r) => ({
    id: Number(r.id),
    author: String(r.author ?? ""),
    createdAt: String(r.created_at),
    title: parse(r.data).title,
  }));
}

/** שחזור גרסה - הולך לטיוטה, לא לאתר (המפרט §4) */
export async function restoreRevision(id: string, revisionId: number, baseRevision: number) {
  const { rows } = await (await db()).execute({
    sql: "SELECT data FROM revisions WHERE id = ? AND entry_id = ?",
    args: [revisionId, id],
  });
  if (!rows[0]) throw new HttpError(404, "הגרסה לא נמצאה");
  const data = parse(rows[0].data);
  return saveDraft(id, { fields: data.fields, path: data.path, seo: data.seo }, baseRevision);
}

/** סדר ידני: הרשימה כולה, לפי הסדר החדש */
export async function reorder(typeId: string, ids: string[]) {
  requireType(typeId);
  const c = await db();
  await c.batch(
    ids.slice(0, 500).map((id, i) => ({
      sql: "UPDATE entries SET position = ? WHERE id = ? AND type = ?",
      args: [i, id, typeId],
    })),
    "write",
  );
}
