import { NextResponse } from "next/server";
import { cookies, draftMode } from "next/headers";
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_DAYS,
} from "@/lib/admin/auth";
import { HttpError, rateLimit, requireUser } from "@/lib/admin/session";
import { permissionsOf, ROLES } from "@/lib/admin/roles";
import {
  createEntry,
  getEntry,
  listEntries,
  listRevisions,
  publishEntry,
  reorder,
  restoreRevision,
  saveDraft,
  setStatus,
} from "@/lib/admin/entries";
import { listMedia, MAX_UPLOAD, uploadImage } from "@/lib/admin/media";
import { importRepoContent } from "@/lib/admin/import";
import { importPages, importParts } from "@/lib/admin/pageImport";
import { createPage, discardPageDraft, isCustomPage, listPages, publishPage, savePageDraft } from "@/lib/admin/pageDocs";
import { can } from "@/lib/admin/roles";
import { deleteLead, leadStats, listLeads, toCsv, updateLead } from "@/lib/admin/leads";
import { getSettings, saveSettings, SETTINGS_TAG } from "@/lib/admin/settings";
import { revalidateTag } from "next/cache";
import { defaultHeaderMenu, designerCta, leadBanner } from "@/lib/content";
import { revalidateEntry, revalidateType } from "@/lib/site/revalidate";
import {
  checkLogin,
  completeSetup,
  createUser,
  issueLink,
  listUsers,
  updateUser,
} from "@/lib/admin/users";

/**
 * ראוט אחד לכל מערכת הניהול: /api/admin/<action>/<id?> (המפרט §4).
 *
 * ⚠️ כל action עובר requireUser עם ההרשאה שלו. אין action שסומך
 * על כך שהממשק הסתיר את הכפתור.
 */

export const dynamic = "force-dynamic";

/** 16KB לרוב הפעולות. טיוטה מקבלת 256KB - מאמר ארוך עם עשרות
    פסקאות עובר 16KB. העלאת תמונה נבדקת בנפרד (lib/admin/media.ts) */
const MAX_BODY = 16 * 1024;
const MAX_DRAFT = 256 * 1024;

type Ctx = { params: Promise<{ path: string[] }> };

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(req: Request, max = MAX_BODY): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > max) throw new HttpError(413, "הבקשה גדולה מדי");
  if (!text) return {};
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? v : {};
  } catch {
    throw new HttpError(400, "בקשה לא תקינה");
  }
}

/** בקשת כתיבה חייבת להגיע מהאתר עצמו. SameSite=Lax כבר חוסם
    את רוב המקרים, וזו שכבה שנייה מול זיוף בקשות מאתר אחר. */
function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    throw new HttpError(403, "בקשה ממקור לא מוכר");
  }
}

async function startSession(email: string) {
  (await cookies()).set(SESSION_COOKIE, createSessionValue(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/** הקישור מוצג פעם אחת. ⚠️ הטוקן ב-# ולא ב-?: החלק שאחרי # לא
    נשלח לשרת, ולכן לא נרשם בלוגים של Vercel. */
const setupUrl = (req: Request, token: string) =>
  `${new URL(req.url).origin}/admin/setup#t=${token}`;

const str = (v: unknown) => (typeof v === "string" ? v : "");
const int = (v: unknown) => (Number.isInteger(v) ? (v as number) : -1);

async function handle(req: Request, ctx: Ctx) {
  const [action = "", id] = (await ctx.params).path;
  const method = req.method;
  if (method !== "GET") assertSameOrigin(req);

  /* ===== בלי התחברות ===== */

  if (method === "POST" && action === "login") {
    const body = await readBody(req);
    const email = str(body.email);
    /* 10 ניסיונות ל-15 דקות, גם לכתובת IP וגם למייל: ניחוש סיסמה
       מכתובות רבות על אותו משתמש נחסם גם הוא */
    const okIp = await rateLimit(`login:ip:${clientIp(req)}`, 10, 900);
    const okUser = await rateLimit(`login:user:${email.toLowerCase()}`, 10, 900);
    if (!okIp || !okUser) throw new HttpError(429, "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה");
    await startSession(await checkLogin(email, str(body.password)));
    return json({ ok: true });
  }

  if (method === "POST" && action === "setup") {
    const body = await readBody(req);
    if (!(await rateLimit(`setup:ip:${clientIp(req)}`, 10, 900))) {
      throw new HttpError(429, "יותר מדי ניסיונות. נסו שוב בעוד רבע שעה");
    }
    await startSession(await completeSetup(str(body.token), str(body.password)));
    return json({ ok: true });
  }

  if (method === "POST" && action === "logout") {
    (await cookies()).delete(SESSION_COOKIE);
    return json({ ok: true });
  }

  /* ===== מחובר ===== */

  if (method === "GET" && action === "bootstrap") {
    const user = await requireUser();
    const permissions = permissionsOf(user.role);
    return json({ user, permissions });
  }

  if (action === "users") {
    const actor = await requireUser("users.manage");
    if (method === "GET") return json({ users: await listUsers(), roles: ROLES });
    if (method === "POST") {
      const body = await readBody(req);
      const { token, expires } = await createUser({
        email: str(body.email),
        name: str(body.name),
        role: str(body.role),
      });
      return json({ link: setupUrl(req, token), expires }, 201);
    }
    if (method === "PATCH" && id) {
      const body = await readBody(req);
      await updateUser(actor, decodeURIComponent(id), {
        name: typeof body.name === "string" ? body.name : undefined,
        role: typeof body.role === "string" ? body.role : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
      });
      return json({ ok: true });
    }
  }

  if (method === "POST" && action === "user-link" && id) {
    await requireUser("users.manage");
    const { token, expires } = await issueLink(decodeURIComponent(id));
    return json({ link: setupUrl(req, token), expires });
  }

  /* ===== פריטי תוכן (שלב 4) ===== */

  if (action === "entries") {
    await requireUser("items.edit");
    if (method === "GET") {
      const q = new URL(req.url).searchParams;
      return json({ items: await listEntries(q.get("type") ?? "", q.get("trash") === "1") });
    }
    if (method === "POST") {
      const body = await readBody(req);
      return json({ id: await createEntry(str(body.type)) }, 201);
    }
  }

  if (method === "GET" && action === "entry" && id) {
    await requireUser("items.edit");
    return json({ entry: await getEntry(id) });
  }

  if (method === "POST" && action === "draft" && id) {
    await requireUser("items.edit");
    const body = await readBody(req, MAX_DRAFT);
    const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {};
    return json(await saveDraft(id, data, int(body.revision)));
  }

  if (method === "POST" && action === "publish" && id) {
    const user = await requireUser("items.edit");
    const body = await readBody(req);
    const res = await publishEntry(id, int(body.revision), user);
    await revalidateEntry(id);
    return json(res);
  }

  if (method === "POST" && action === "status" && id) {
    await requireUser("items.edit");
    const a = str((await readBody(req)).action);
    if (a !== "unpublish" && a !== "trash" && a !== "untrash") throw new HttpError(422, "פעולה לא מוכרת");
    await setStatus(id, a);
    await revalidateEntry(id);
    return json({ ok: true });
  }

  if (method === "GET" && action === "history" && id) {
    await requireUser("items.edit");
    return json({ revisions: await listRevisions(id) });
  }

  if (method === "POST" && action === "restore" && id) {
    await requireUser("items.edit");
    const body = await readBody(req);
    return json(await restoreRevision(id, int(body.revisionId), int(body.revision)));
  }

  if (method === "POST" && action === "reorder") {
    await requireUser("items.edit");
    const body = await readBody(req, 64 * 1024);
    const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
    await reorder(str(body.type), ids);
    revalidateType(str(body.type));
    return json({ ok: true });
  }

  if (action === "media") {
    await requireUser("items.edit");
    if (method === "GET") return json({ media: await listMedia() });
    if (method === "POST") {
      /* בודקים גודל לפני שקוראים את הגוף - לא טוענים 100MB לזיכרון
         כדי לגלות שהם גדולים מדי */
      if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD + 64 * 1024) {
        throw new HttpError(413, "התמונה גדולה מדי. נסו תמונה קטנה יותר");
      }
      /* גוף שאינו multipart תקין - הודעה ברורה ולא 500 */
      const form = await req.formData().catch(() => null);
      const file = form?.get("file");
      if (!(file instanceof File)) throw new HttpError(400, "לא התקבל קובץ");
      return json({ item: await uploadImage(file) }, 201);
    }
  }

  /* ייבוא התוכן הקיים מקבצי lib/ - מנהל בלבד. ⚠️ מול מסד בענן
     רק באישור מפורש של דניאל (המפרט §0) - ראו import.ts */
  if (method === "POST" && action === "import") {
    await requireUser("settings.edit");
    const res = await importRepoContent();
    for (const t of ["article", "testimonial", "video", "project"]) revalidateType(t);
    return json(res);
  }

  /* ייבוא עמודים כעץ אלמנטים (שלב 5ב) - מנהל בלבד, וחסום מול ענן
     בלי ADMIN_ALLOW_IMPORT, כמו ייבוא התוכן */
  if (method === "POST" && action === "import-pages") {
    await requireUser("settings.edit");
    const body = await readBody(req, 64 * 1024);
    const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === "string" && p.startsWith("/")) : [];
    const res = await importPages(new URL(req.url).origin, paths, body.replace === true && process.env.NODE_ENV !== "production");
    revalidateType("page");
    return json(res);
  }

  /* ===== פניות, לוח בקרה והגדרות (שלב 7) ===== */

  if (method === "GET" && action === "leads") {
    await requireUser("leads.view");
    const trash = new URL(req.url).searchParams.get("trash") === "1";
    return json({ leads: await listLeads(trash) });
  }

  if (method === "PATCH" && action === "lead" && id) {
    await requireUser("leads.view");
    const body = await readBody(req);
    /* העברה לסל מותרת לכולם (הפיכה); מחיקה לצמיתות - רק עם leads.delete */
    await updateLead(id, { status: typeof body.status === "string" ? body.status : undefined, note: typeof body.note === "string" ? body.note : undefined });
    return json({ ok: true });
  }

  if (method === "POST" && action === "lead-delete" && id) {
    await requireUser("leads.delete");
    await deleteLead(id);
    return json({ ok: true });
  }

  if (method === "GET" && action === "leads.csv") {
    await requireUser("leads.view");
    const csv = toCsv(await listLeads(false));
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (method === "GET" && action === "dashboard") {
    const user = await requireUser();
    const [stats, pages, recentLeads] = await Promise.all([
      can(user.role, "leads.view") ? leadStats() : null,
      listPages(),
      can(user.role, "leads.view") ? listLeads(false).then((l) => l.slice(0, 5)) : [],
    ]);
    const { db } = await import("@/lib/admin/db");
    /* "נשמר ועדיין לא פורסם": פריטים עם טיוטה, ופריטים שלא פורסמו מעולם */
    const { rows } = await (await db()).execute(
      `SELECT e.id, e.type, e.status, COALESCE(d.data, e.data) AS data, COALESCE(d.updated_at, e.updated_at) AS at
       FROM entries e LEFT JOIN drafts d ON d.entry_id = e.id
       WHERE e.type IN ('article','testimonial','video','project') AND ((d.entry_id IS NOT NULL AND e.status = 'publish') OR e.status = 'draft')
       ORDER BY at DESC LIMIT 12`,
    );
    const drafts = [
      ...pages.filter((p) => p.hasDraft || p.status === "draft").map((p) => ({ id: p.id, kind: p.type, title: p.title, at: p.updatedAt, status: p.status })),
      ...rows.map((r) => ({ id: String(r.id), kind: String(r.type), title: JSON.parse(String(r.data)).title || "", at: String(r.at), status: String(r.status) })),
    ].sort((a, b) => b.at.localeCompare(a.at));
    return json({ stats, drafts, recentLeads });
  }

  if (action === "settings") {
    if (method === "GET") {
      await requireUser("settings.edit");
      return json({ settings: await getSettings() });
    }
    if (method === "POST") {
      await requireUser("settings.edit");
      const settings = await saveSettings(await readBody(req));
      /* ההגדרות נוגעות בכל עמוד (שם, גוגל, פיקסל, טלפון) */
      revalidateTag(SETTINGS_TAG, { expire: 0 });
      return json({ settings });
    }
  }

  /* ===== עורך העמודים (שלב 6) ===== */

  /* מצב עריכה: עוגיית תצוגת הטיוטה של Next. היא לבדה לא חושפת כלום -
     העמוד בודק גם משתמש מחובר עם הרשאה (lib/site/editMode.ts) */
  if (method === "POST" && action === "edit-mode") {
    await requireUser("pages.text");
    const dm = await draftMode();
    if ((await readBody(req)).on === false) dm.disable();
    else dm.enable();
    return json({ ok: true });
  }

  if (method === "GET" && action === "pages") {
    await requireUser("pages.text");
    return json({ pages: await listPages() });
  }

  if (method === "GET" && action === "page" && id) {
    const user = await requireUser("pages.text");
    const entry = await getEntry(id);
    if (entry.type !== "page" && entry.type !== "part") throw new HttpError(404, "זה לא עמוד");
    if (entry.type === "part" && !can(user.role, "shared.edit")) throw new HttpError(403, "אין לך הרשאה לערוך את התפריט והפוטר");
    return json({ entry });
  }

  if (method === "POST" && action === "page-draft" && id) {
    const user = await requireUser("pages.text");
    const body = await readBody(req, 1024 * 1024);
    return json(await savePageDraft(id, body, int(body.revision), user));
  }

  if (method === "POST" && action === "page-publish" && id) {
    const user = await requireUser("pages.text");
    const res = await publishPage(id, int((await readBody(req)).revision), user);
    revalidateType("page");
    revalidateType("part");
    return json(res);
  }

  if (method === "POST" && action === "page-new") {
    await requireUser("pages.layout");
    const body = await readBody(req);
    return json({ id: await createPage(str(body.title), str(body.path)) }, 201);
  }

  /* סל מיחזור לעמוד - רק לעמודים שנוצרו במערכת. לעמודי הבסיס יש
     קובץ נתיב קבוע, ומחיקה הייתה משאירה אותו מחזיר 404 */
  if (method === "POST" && action === "page-status" && id) {
    await requireUser("pages.layout");
    const a = str((await readBody(req)).action);
    if (!isCustomPage(id)) throw new HttpError(422, "אי אפשר למחוק עמוד בסיס של האתר. אפשר להסתיר אותו מגוגל");
    if (a !== "trash" && a !== "untrash") throw new HttpError(422, "פעולה לא מוכרת");
    await setStatus(id, a);
    revalidateType("page");
    return json({ ok: true });
  }

  if (method === "POST" && action === "page-discard" && id) {
    await requireUser("pages.text");
    await discardPageDraft(id);
    return json({ ok: true });
  }

  /* שחזור גרסה של עמוד - לטיוטה, ודרך אותו ניקוי והרשאות של שמירה רגילה */
  if (method === "POST" && action === "page-restore" && id) {
    const user = await requireUser("pages.text");
    const body = await readBody(req);
    const revs = await listRevisions(id);
    const rev = revs.find((r) => r.id === int(body.revisionId));
    if (!rev) throw new HttpError(404, "הגרסה לא נמצאה");
    const { db } = await import("@/lib/admin/db");
    const { rows } = await (await db()).execute({ sql: "SELECT data FROM revisions WHERE id = ?", args: [rev.id] });
    const data = JSON.parse(String(rows[0].data));
    return json(await savePageDraft(id, { nodes: data.doc?.nodes, title: data.title, path: data.path, seo: data.seo }, int(body.revision), user));
  }

  if (method === "POST" && action === "import-parts") {
    await requireUser("settings.edit");
    const body = await readBody(req);
    const res = await importParts(new URL(req.url).origin, defaultHeaderMenu, body.replace === true && process.env.NODE_ENV !== "production", { designerCta, leadBanner });
    revalidateType("part");
    return json(res);
  }

  throw new HttpError(404, "פעולה לא מוכרת");
}

async function run(req: Request, ctx: Ctx) {
  try {
    return await handle(req, ctx);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error("[admin]", e);
    return json({ error: "משהו השתבש בשרת. נסו שוב" }, 500);
  }
}

export { run as GET, run as POST, run as PATCH };
