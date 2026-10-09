import { readFile } from "node:fs/promises";

/**
 * הגשת תמונות שהועלו - **בפיתוח בלבד**.
 *
 * בענן התמונות יושבות ב-Vercel Blob ומוגשות משם ישירות, והראוט
 * הזה מחזיר 404. מקומית הן ב-.data/media (מחוץ ל-public, כי
 * התיקייה הזו לא נכנסת ל-git).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  /* רק שם קובץ שהשרת עצמו יצר - בלי נתיבים ובלי ".." */
  if (process.env.BLOB_READ_WRITE_TOKEN || !/^[\w-]+\.webp$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await readFile(`.data/media/${name}`);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
