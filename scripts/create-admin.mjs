/**
 * יצירת המנהל הראשון (המפרט §5: "את המנהל הראשון יוצרים מסקריפט").
 *
 *   node --env-file=.env.local scripts/create-admin.mjs <email> [name]
 *
 * ⚠️ לא מקבל סיסמה. מדפיס קישור חד-פעמי, ובו בוחרים סיסמה בדפדפן -
 * כך סיסמה לא עוברת בטרמינל, בהיסטוריה של המעטפת או בצ'אט.
 * רץ מול המסד ש-TURSO_DATABASE_URL מצביע עליו, ובלעדיו מול הקובץ
 * המקומי. אם כבר יש מנהל פעיל עם סיסמה - נעצר, כדי שלא יהיה דלת אחורית.
 */
import { createClient } from "@libsql/client";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";

const [email, ...nameParts] = process.argv.slice(2);
const base = process.env.ADMIN_BASE_URL || "http://localhost:3200";

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("שימוש: node --env-file=.env.local scripts/create-admin.mjs <email> [name]");
  process.exit(1);
}

const url = process.env.TURSO_DATABASE_URL || "file:.data/admin.db";
if (url.startsWith("file:")) mkdirSync(".data", { recursive: true });
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

/* הטבלה עשויה עוד לא להתקיים אם האתר לא רץ אף פעם מול המסד הזה.
   ⚠️ חייב להיות זהה ל-users ב-lib/admin/db.ts */
await db.execute(`CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', role TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1, password_hash TEXT, setup_token TEXT,
  setup_expires TEXT, created_at TEXT NOT NULL)`);

/* מנהל שעוד לא בחר סיסמה לא נחשב - כך אפשר להנפיק לו קישור חדש
   כשהראשון פג או נתקע (9.11: הגדרת הסיסמה נפלה בתקלת שרת) */
const admins = await db.execute("SELECT email FROM users WHERE role = 'admin' AND active = 1 AND password_hash IS NOT NULL");
if (admins.rows.length) {
  console.error(`כבר יש מנהל פעיל (${admins.rows[0].email}). משתמשים נוספים - ממסך המשתמשים.`);
  process.exit(1);
}

const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("base64url");
const expires = new Date(Date.now() + 72 * 3_600_000).toISOString();
const normalized = email.trim().toLowerCase();

await db.execute({
  sql: `INSERT INTO users (email, name, role, active, setup_token, setup_expires, created_at)
        VALUES (?, ?, 'admin', 1, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET role = 'admin', active = 1, setup_token = excluded.setup_token, setup_expires = excluded.setup_expires`,
  args: [normalized, nameParts.join(" "), hash, expires, new Date().toISOString()],
});

console.log(`\nנוצר מנהל: ${normalized}\nפתחו את הקישור ובחרו סיסמה (תקף 72 שעות, חד-פעמי):\n\n${base}/admin/setup#t=${token}\n`);
