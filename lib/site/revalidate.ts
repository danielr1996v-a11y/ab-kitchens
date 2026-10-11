import "server-only";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/admin/db";
import { entriesTag } from "./data";

/**
 * ריקון מטמון של האתר הציבורי אחרי פעולה שמשנה אותו (המפרט §4):
 * פרסום, ביטול פרסום, סל, שחזור וסדר. שמירת טיוטה - לא.
 *
 * ⚠️ { expire: 0 } ולא "max": עם "max" המבקר הראשון אחרי פרסום עוד
 * מקבל את הגרסה הקודמת. בעמוד חדש זה אומר 404 אחרי "פרסום" (נמצא
 * בבדיקה, שלב 6ג). פרסום הוא פעולה נדירה - עדיף שתיראה מיד.
 */
export function revalidateType(type: string) {
  revalidateTag(entriesTag(type), { expire: 0 });
  revalidateTag("redirects", { expire: 0 });
}

export async function revalidateEntry(id: string) {
  const { rows } = await (await db()).execute({ sql: "SELECT type FROM entries WHERE id = ?", args: [id] });
  if (rows[0]) revalidateType(String(rows[0].type));
}
