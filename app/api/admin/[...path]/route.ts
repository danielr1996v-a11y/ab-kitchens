import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
