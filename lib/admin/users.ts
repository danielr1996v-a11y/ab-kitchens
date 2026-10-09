import "server-only";
import { db, now } from "./db";
import {
  createSetupToken,
  hashPassword,
  hashToken,
  isEmail,
  normalizeEmail,
  verifyPassword,
} from "./auth";
import { MIN_PASSWORD } from "./limits";
import { HttpError, type AdminUser } from "./session";
import { isRole, type Role } from "./roles";

export type UserRow = {
  email: string;
  name: string;
  role: Role;
  active: boolean;
  /** יש סיסמה = הקישור כבר נוצל */
  hasPassword: boolean;
  linkExpires: string | null;
  createdAt: string;
};

export async function listUsers(): Promise<UserRow[]> {
  const { rows } = await (await db()).execute(
    "SELECT email, name, role, active, password_hash, setup_expires, created_at FROM users ORDER BY created_at",
  );
  return rows.map((r) => ({
    email: String(r.email),
    name: String(r.name),
    role: r.role as Role,
    active: Boolean(r.active),
    hasPassword: r.password_hash != null,
    linkExpires: r.setup_expires ? String(r.setup_expires) : null,
    createdAt: String(r.created_at),
  }));
}

/** משתמש חדש מקבל קישור חד-פעמי, לא סיסמה (המפרט §5).
    מחזיר את הקישור - הוא מוצג פעם אחת ולא נשמר בשום מקום. */
export async function createUser(input: { email: string; name: string; role: string }) {
  const email = normalizeEmail(input.email);
  if (!isEmail(email)) throw new HttpError(422, "כתובת המייל לא תקינה");
  if (!isRole(input.role)) throw new HttpError(422, "תפקיד לא מוכר");
  const name = input.name.trim().slice(0, 80);
  const { token, hash, expires } = createSetupToken();
  const c = await db();
  const exists = await c.execute({ sql: "SELECT 1 FROM users WHERE email = ?", args: [email] });
  if (exists.rows.length) throw new HttpError(409, "כבר יש משתמש עם המייל הזה");
  await c.execute({
    sql: `INSERT INTO users (email, name, role, active, setup_token, setup_expires, created_at)
          VALUES (?, ?, ?, 1, ?, ?, ?)`,
    args: [email, name, input.role, hash, expires, now()],
  });
  return { token, expires };
}

/** קישור כניסה חדש - גם לאיפוס סיסמה. מבטל את הקודם. */
export async function issueLink(email: string) {
  const { token, hash, expires } = createSetupToken();
  const res = await (await db()).execute({
    sql: "UPDATE users SET setup_token = ?, setup_expires = ? WHERE email = ?",
    args: [hash, expires, normalizeEmail(email)],
  });
  if (!res.rowsAffected) throw new HttpError(404, "המשתמש לא נמצא");
  return { token, expires };
}

export async function updateUser(
  actor: AdminUser,
  email: string,
  patch: { name?: string; role?: string; active?: boolean },
) {
  email = normalizeEmail(email);
  /* ⚠️ "אי אפשר להסיר לעצמך הרשאת ניהול" (המפרט §5) - אחרת
     מנהל יחיד יכול לנעול את כולם בחוץ בלחיצה אחת */
  if (email === actor.email && (patch.role !== undefined || patch.active === false)) {
    throw new HttpError(422, "אי אפשר לשנות את התפקיד שלך או להשבית את עצמך");
  }
  if (patch.role !== undefined && !isRole(patch.role)) throw new HttpError(422, "תפקיד לא מוכר");
  const sets: string[] = [];
  const args: (string | number)[] = [];
  if (patch.name !== undefined) {
    sets.push("name = ?");
    args.push(patch.name.trim().slice(0, 80));
  }
  if (patch.role !== undefined) {
    sets.push("role = ?");
    args.push(patch.role);
  }
  if (patch.active !== undefined) {
    sets.push("active = ?");
    args.push(patch.active ? 1 : 0);
  }
  if (!sets.length) return;
  const res = await (await db()).execute({
    sql: `UPDATE users SET ${sets.join(", ")} WHERE email = ?`,
    args: [...args, email],
  });
  if (!res.rowsAffected) throw new HttpError(404, "המשתמש לא נמצא");
}

/** הגדרת סיסמה מקישור. הקישור נמחק מיד - חד-פעמי באמת. */
export async function completeSetup(token: string, password: string) {
  if (password.length < MIN_PASSWORD) {
    throw new HttpError(422, `הסיסמה צריכה לפחות ${MIN_PASSWORD} תווים`);
  }
  const c = await db();
  const { rows } = await c.execute({
    sql: "SELECT email, setup_expires, active FROM users WHERE setup_token = ?",
    args: [hashToken(token)],
  });
  const u = rows[0];
  if (!u || !u.active || String(u.setup_expires) < now()) {
    throw new HttpError(410, "הקישור פג או שכבר נוצל. בקשו קישור חדש");
  }
  await c.execute({
    sql: "UPDATE users SET password_hash = ?, setup_token = NULL, setup_expires = NULL WHERE email = ?",
    args: [await hashPassword(password), u.email],
  });
  return String(u.email);
}

/** מחזיר את המייל אם הפרטים נכונים. הודעת שגיאה אחת לכל מקרה,
    כדי לא לגלות אילו כתובות רשומות במערכת. */
export async function checkLogin(emailRaw: string, password: string) {
  const email = normalizeEmail(emailRaw);
  const { rows } = await (await db()).execute({
    sql: "SELECT email, password_hash, active FROM users WHERE email = ?",
    args: [email],
  });
  const u = rows[0];
  const stored = u ? (u.password_hash as string | null) : null;
  /* גם כשאין משתמש מריצים scrypt אחד - אחרת התשובה המהירה
     מסגירה שהכתובת לא רשומה */
  if (!stored) await hashPassword(password);
  const ok = await verifyPassword(password, stored);
  if (!u || !u.active || !ok) throw new HttpError(401, "המייל או הסיסמה לא נכונים");
  return email;
}
