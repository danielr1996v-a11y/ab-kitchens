import "server-only";
import { createClient, type Client } from "@libsql/client";

/**
 * מסד הנתונים של מערכת הניהול.
 *
 * בפיתוח: קובץ מקומי ב-.data/ (לא נכנס ל-git - יש בו פרטים אישיים
 * של פניות ומשתמשים). בענן: Turso, לפי TURSO_DATABASE_URL.
 *
 * ⚠️ בבדיקות לא נוגעים במסד המשותף (ADMIN-SPEC §8, המפרט §0):
 * כל עוד TURSO_DATABASE_URL לא מוגדר מקומית, אין שום דרך להגיע
 * אליו מהמחשב הזה.
 */

const url = process.env.TURSO_DATABASE_URL || "file:.data/admin.db";

let client: Client | null = null;
let ready: Promise<void> | null = null;

/** הטבלאות לפי מודל הנתונים של המפרט (§2), ועוד redirects
    להפניה אוטומטית כששינוי כתובת מתפרסם (ADMIN-SPEC §0). */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS entries (
     id TEXT PRIMARY KEY,
     type TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('publish','draft','trash')),
     data TEXT NOT NULL,
     revision INTEGER NOT NULL DEFAULT 1,
     updated_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS entries_type ON entries(type, status)`,
  `CREATE TABLE IF NOT EXISTS drafts (
     entry_id TEXT PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
     data TEXT NOT NULL,
     revision INTEGER NOT NULL,
     updated_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS revisions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     entry_id TEXT NOT NULL,
     data TEXT NOT NULL,
     author TEXT,
     created_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS revisions_entry ON revisions(entry_id, id)`,
  `CREATE TABLE IF NOT EXISTS submissions (
     id TEXT PRIMARY KEY,
     kind TEXT NOT NULL,
     data TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('new','in_progress','done','trash')),
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS settings (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS users (
     email TEXT PRIMARY KEY,
     name TEXT NOT NULL DEFAULT '',
     role TEXT NOT NULL,
     active INTEGER NOT NULL DEFAULT 1,
     password_hash TEXT,
     setup_token TEXT,
     setup_expires TEXT,
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
     key TEXT PRIMARY KEY,
     count INTEGER NOT NULL,
     expires_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS redirects (
     from_path TEXT PRIMARY KEY,
     to_path TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
];

async function migrate(c: Client) {
  /* foreign keys כבויים כברירת מחדל ב-SQLite - בלעדיהם מחיקת
     פריט משאירה טיוטה יתומה */
  await c.execute("PRAGMA foreign_keys = ON");
  await c.batch(SCHEMA, "write");
}

/** החיבור, אחרי שהטבלאות קיימות. נוצר פעם אחת לתהליך. */
export async function db(): Promise<Client> {
  if (!client) {
    if (url.startsWith("file:")) {
      const { mkdirSync } = await import("node:fs");
      mkdirSync(".data", { recursive: true });
    }
    client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    ready = migrate(client);
  }
  await ready;
  return client;
}

export const now = () => new Date().toISOString();
