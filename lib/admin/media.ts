import "server-only";
import { randomBytes } from "node:crypto";
import type { OutputInfo } from "sharp";
import { db, now } from "./db";
import { HttpError } from "./session";

/**
 * העלאת תמונות - המפרט §5.
 *
 * ⚠️ הסוג נקבע לפי ה-magic bytes של הקובץ, לא לפי השם או ה-MIME
 * שהדפדפן שלח - את שניהם אפשר לזייף. השם נקבע כאן, בשרת.
 *
 * ⚠️ כל תמונה עוברת sharp: מסובבת לפי ה-EXIF, מוקטנת ל-2400px,
 * נשמרת כ-WebP, **ובלי מטא-דאטה**. צילום מטלפון נושא את מיקום
 * ה-GPS של הבית - זה לא נכנס לאתר.
 *
 * אחסון: Vercel Blob כשיש BLOB_READ_WRITE_TOKEN, אחרת קובץ מקומי
 * ב-.data/media שמוגש דרך /media/<name> (פיתוח בלבד).
 */

/** מעל זה Vercel דוחה את הבקשה (4.5MB). הדפדפן מקטין לפני ההעלאה */
export const MAX_UPLOAD = 4.4 * 1024 * 1024;
const MAX_SIDE = 2400;

function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /^(avif|avis)$/.test(buf.toString("ascii", 8, 12))) return "avif";
  return null;
}

export type MediaItem = { url: string; name: string; width: number; height: number; bytes: number; createdAt: string };

export async function uploadImage(file: File): Promise<MediaItem> {
  if (file.size > MAX_UPLOAD) throw new HttpError(413, "התמונה גדולה מדי. נסו תמונה קטנה יותר");
  const input = Buffer.from(await file.arrayBuffer());
  if (!sniff(input)) throw new HttpError(415, "אפשר להעלות רק תמונות JPG, PNG, WebP או AVIF");

  let out: { data: Buffer; info: OutputInfo };
  try {
    /* ⚠️ טעינה רק כאן ולא בראש הקובץ (9.11): הקובץ נטען בכל בקשה של
       /api/admin, ו-sharp שלא נטען ב-Vercel הפיל גם את הגדרת הסיסמה
       והכניסה. עכשיו תקלה ב-sharp פוגעת רק בהעלאת תמונה */
    const sharp = (await import("sharp")).default;
    out = await sharp(input, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new HttpError(415, "לא הצלחנו לקרוא את התמונה. נסו לשמור אותה מחדש כ-JPG");
  }

  const name = `${new Date().toISOString().slice(0, 10)}-${randomBytes(6).toString("hex")}.webp`;
  let url: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`media/${name}`, out.data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 31_536_000,
    });
    url = blob.url;
  } else {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(".data/media", { recursive: true });
    await writeFile(`.data/media/${name}`, out.data);
    url = `/media/${name}`;
  }

  const item: MediaItem = {
    url,
    /* שם הקובץ המקורי - רק לחיפוש בספרייה. מנוקה ומקוצר */
    name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 80) || name,
    width: out.info.width,
    height: out.info.height,
    bytes: out.info.size,
    createdAt: now(),
  };
  await (await db()).execute({
    sql: "INSERT INTO media (url, name, width, height, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [item.url, item.name, item.width, item.height, item.bytes, item.createdAt],
  });
  return item;
}

export async function listMedia(): Promise<MediaItem[]> {
  const { rows } = await (await db()).execute("SELECT * FROM media ORDER BY created_at DESC LIMIT 500");
  return rows.map((r) => ({
    url: String(r.url),
    name: String(r.name),
    width: Number(r.width),
    height: Number(r.height),
    bytes: Number(r.bytes),
    createdAt: String(r.created_at),
  }));
}
