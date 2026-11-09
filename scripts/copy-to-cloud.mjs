/**
 * העתקת התוכן מהמסד המקומי למסד בענן (Turso) - ADMIN-SPEC §8, סעיף 5א.
 *
 *   node --env-file=.env.local scripts/copy-to-cloud.mjs
 *
 * ⚠️ למה העתקה ולא ייבוא: מאז שלב 5ב העמודים קיימים רק במסד (עצי
 * אלמנטים). בענן אין ממה "לייבא מחדש", ולכן מעתיקים את המסד המקומי -
 * שהושווה מול האתר החי ב-9.11 (19 כתובות זהות).
 *
 * מה עובר: תוכן (עמודים, חלקים, מאמרים, המלצות, סרטונים, פרויקטים),
 * היסטוריית גרסאות, הגדרות, ספריית המדיה והפניות כתובת.
 * ⛔ מה לא עובר: משתמשים, פניות והגבלות קצב. בענן המנהל נוצר מחדש
 * (scripts/create-admin.mjs) - סיסמאות ופרטים אישיים לא זזים ממחשב
 * למחשב.
 *
 * ⛔ רץ רק באישור מפורש של דניאל (המפרט §0), ובשלושה שערים:
 *   - TURSO_DATABASE_URL מוגדר ואינו קובץ מקומי
 *   - ADMIN_ALLOW_IMPORT=1
 *   - המסד בענן ריק מתוכן. מסד שכבר יש בו תוכן לא נדרס לעולם -
 *     שם כבר עובדים, וכל דריסה מוחקת עבודה של אבי
 */
import { createClient } from "@libsql/client";

const target = process.env.TURSO_DATABASE_URL;
if (!target || target.startsWith("file:")) {
  console.error("⛔ TURSO_DATABASE_URL לא מוגדר (או מצביע על קובץ מקומי). אין לאן להעתיק.");
  process.exit(1);
}
if (process.env.ADMIN_ALLOW_IMPORT !== "1") {
  console.error("⛔ העתקה לענן דורשת ADMIN_ALLOW_IMPORT=1 - אישור מפורש.");
  process.exit(1);
}

const src = createClient({ url: "file:.data/admin.db" });
const dst = createClient({ url: target, authToken: process.env.TURSO_AUTH_TOKEN });

const TABLES = ["entries", "drafts", "revisions", "settings", "media", "redirects"];

/* המבנה מועתק מהמסד המקומי כמו שהוא - כך אין שתי הגדרות שיכולות
   להיפרד. CREATE ... IF NOT EXISTS, אז הרצה על מסד קיים לא שוברת */
const { rows: ddl } = await src.execute(
  "SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type DESC",
);
for (const { sql } of ddl) {
  await dst.execute(String(sql).replace(/^CREATE (TABLE|INDEX|UNIQUE INDEX) /i, "CREATE $1 IF NOT EXISTS "));
}

const { rows: [{ n }] } = await dst.execute("SELECT count(*) AS n FROM entries");
if (Number(n) > 0) {
  console.error(`⛔ במסד בענן כבר יש ${n} פריטי תוכן. לא מעתיקים על מסד שעובדים בו.`);
  process.exit(1);
}

for (const table of TABLES) {
  const { rows, columns } = await src.execute(`SELECT * FROM ${table}`);
  if (!rows.length) {
    console.log(`${table}: ריק`);
    continue;
  }
  const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
  /* במנות - בקשה אחת ענקית נדחית ברשת */
  for (let i = 0; i < rows.length; i += 50) {
    await dst.batch(rows.slice(i, i + 50).map((r) => ({ sql, args: columns.map((c) => r[c]) })), "write");
  }
  console.log(`${table}: ${rows.length}`);
}

/* בדיקה בסוף: אותו מספר שורות בשני הצדדים */
for (const table of TABLES) {
  const a = Number((await src.execute(`SELECT count(*) AS n FROM ${table}`)).rows[0].n);
  const b = Number((await dst.execute(`SELECT count(*) AS n FROM ${table}`)).rows[0].n);
  if (a !== b) {
    console.error(`⛔ ${table}: מקומי ${a}, בענן ${b}`);
    process.exit(1);
  }
}
console.log("✓ הועתק. השלב הבא: scripts/create-admin.mjs מול הענן.");
