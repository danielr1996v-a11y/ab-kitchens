import "server-only";
import { randomUUID } from "node:crypto";
import { db, now } from "./db";
import { fetchChannelFeed, hiddenVideoIds } from "@/lib/channel";
import { displayTitle, typeById, type EntryData } from "./schema";
import { sanitizeFields } from "./sanitize";

/**
 * סנכרון הערוץ - ADMIN-SPEC §1.3, החלטה 1.
 *
 * כל סרטון בפיד שעוד לא קיים במערכת (בשום מצב - כולל סל המיחזור,
 * כדי שסרטון שנמחק לא יחזור) נכנס כ**טיוטה** עם קטגוריה מנוחשת.
 * באתר הוא מופיע רק אחרי שמישהו מאשר ומפרסם.
 */
export async function syncChannel() {
  const feed = await fetchChannelFeed();
  const c = await db();
  const { rows } = await c.execute(
    "SELECT json_extract(data, '$.fields.youtube') AS yt FROM entries WHERE type = 'video'",
  );
  const known = new Set(rows.map((r) => String(r.yt)));
  const type = typeById("video")!;
  const added: string[] = [];
  const top = await c.execute("SELECT MIN(position) AS p FROM entries WHERE type = 'video'");
  let position = Number(top.rows[0]?.p ?? 0);

  /* הפיד מהחדש לישן; מוסיפים מהישן לחדש כדי שהחדש ביותר יהיה ראשון */
  for (const v of [...feed].reverse()) {
    if (known.has(v.id) || hiddenVideoIds.has(v.id)) continue;
    const fields = sanitizeFields(type, { kind: "channel", youtube: v.id, title: v.title, category: v.cat });
    const data: EntryData = { title: displayTitle(type, fields), fields };
    await c.execute({
      sql: `INSERT INTO entries (id, type, status, data, revision, updated_at, position)
            VALUES (?, 'video', 'draft', ?, 1, ?, ?)`,
      args: [randomUUID(), JSON.stringify(data), now(), --position],
    });
    added.push(v.title);
  }
  return { checked: feed.length, added };
}
