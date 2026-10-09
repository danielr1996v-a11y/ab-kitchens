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

/** 16KB - מספיק לכל פעולה בשלב הזה. העלאות קבצים לא עוברות כאן */
const MAX_BODY = 16 * 1024;

type Ctx = { params: Promise<{ path: string[] }> };

const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new HttpError(413, "הבקשה גדולה מדי");
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
