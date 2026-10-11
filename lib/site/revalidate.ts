import "server-only";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/admin/db";
import { entriesTag } from "./data";

/**
 * ריקון מטמון של האתר הציבורי אחרי פעולה שמשנה אותו (המפרט §4):
 * פרסום, ביטול פרסום, סל, שחזור וסדר. שמירת טיוטה - לא.
 *
 * "max" = stale-while-revalidate: המבקר הבא מקבל את העמוד הישן
 * ומפעיל בנייה ברקע, וזה שאחריו כבר את החדש. ההמלצה של Next 16.
 */
export function revalidateType(type: string) {
  revalidateTag(entriesTag(type), "max");
  revalidateTag("redirects", "max");
}

export async function revalidateEntry(id: string) {
  const { rows } = await (await db()).execute({ sql: "SELECT type FROM entries WHERE id = ?", args: [id] });
  if (rows[0]) revalidateType(String(rows[0].type));
}
