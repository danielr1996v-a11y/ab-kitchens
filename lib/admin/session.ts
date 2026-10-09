import "server-only";
import { cookies } from "next/headers";
import { db, now } from "./db";
import { readSessionValue, SESSION_COOKIE } from "./auth";
import { can, isRole, type Permission, type Role } from "./roles";

export type AdminUser = { email: string; name: string; role: Role };

/**
 * המשתמש המחובר, או null.
 *
 * ⚠️ העוגייה מוכיחה רק *מי* נכנס. התפקיד וה"פעיל" נקראים מהמסד
 * בכל בקשה - כך משתמש שהושבת או שתפקידו שונה מאבד גישה מיד,
 * ולא אחרי 14 יום כשהעוגייה פגה.
 */
export async function currentUser(): Promise<AdminUser | null> {
  const email = readSessionValue((await cookies()).get(SESSION_COOKIE)?.value);
  if (!email) return null;
  const { rows } = await (await db()).execute({
    sql: "SELECT email, name, role, active FROM users WHERE email = ?",
    args: [email],
  });
  const u = rows[0];
  if (!u || !u.active || !isRole(u.role)) return null;
  return { email: String(u.email), name: String(u.name), role: u.role };
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** לכל פעולה בשרת: מחובר, ועם ההרשאה. אחרת 401/403. */
export async function requireUser(permission?: Permission): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "צריך להתחבר מחדש");
  if (permission && !can(user.role, permission)) {
    throw new HttpError(403, "אין לך הרשאה לפעולה הזו");
  }
  return user;
}

/**
 * הגבלת קצב - נשמרת במסד ולא בזיכרון: ב-Vercel כל בקשה יכולה
 * לנחות על מופע אחר, ומונה בזיכרון מתאפס בכל אחד מהם.
 * מחזיר false כשעברו את המכסה.
 */
export async function rateLimit(key: string, max: number, windowSec: number) {
  const c = await db();
  const t = now();
  await c.execute({ sql: "DELETE FROM rate_limits WHERE expires_at < ?", args: [t] });
  const expires = new Date(Date.now() + windowSec * 1000).toISOString();
  const { rows } = await c.execute({
    sql: `INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET count = count + 1
          RETURNING count`,
    args: [key, expires],
  });
  return Number(rows[0].count) <= max;
}
