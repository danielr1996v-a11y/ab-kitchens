/**
 * ייצוא העמודים (עצי האלמנטים) מהמסד לקובץ בפרויקט - content/pages.seed.json.
 *
 *   node --env-file=.env.local scripts/export-pages.mjs
 *
 * ⚠️ למה: אחרי שלב 5ב העמודים קיימים רק במסד - ה-JSX שממנו יובאו נמחק.
 * הקובץ הזה הוא הגיבוי, ונכנס ל-git. הוא גם המקור להעתקה לענן בשלב 10
 * (באישור דניאל בלבד). רק עמודים מפורסמים, ורק תוכן ציבורי - בלי
 * משתמשים, בלי פניות ובלי שום פרט אישי.
 */
import { createClient } from "@libsql/client";
import { writeFileSync } from "node:fs";

const db = createClient({ url: process.env.TURSO_DATABASE_URL || "file:.data/admin.db", authToken: process.env.TURSO_AUTH_TOKEN });
const { rows } = await db.execute("SELECT id, data FROM entries WHERE type = 'page' AND status = 'publish' ORDER BY id");
const pages = rows.map((r) => ({ id: String(r.id), ...JSON.parse(String(r.data)) }));
writeFileSync("content/pages.seed.json", JSON.stringify(pages, null, 1) + "\n");
console.log(`${pages.length} עמודים יוצאו ל-content/pages.seed.json`);
