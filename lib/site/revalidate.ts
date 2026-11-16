import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
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
  revalidateSite();
}

/**
 * ⚠️ **בלי זה שום פרסום לא הגיע לאתר החי** (נמצא 16.11, שבוע אחרי
 * ההשקה: דף הבית הוגש עם age של 6 ימים - העותק מהבנייה).
 *
 * העמודים סטטיים, ונבנים בזמן build. ב-build cached() קורא ישר מהמסד
 * בלי unstable_cache (lib/site/cache.ts) - ולכן לעותק הסטטי של העמוד
 * לא נרשמה אף תגית, ו-revalidateTag ריקן רק את מטמון הנתונים ולא את
 * ה-HTML השמור. revalidatePath על ה-layout הראשי מסמן את כל העמודים
 * לבנייה מחדש בבקשה הבאה. האתר קטן (19 עמודים) ופרסום נדיר - זה זול.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function revalidateEntry(id: string) {
  const { rows } = await (await db()).execute({ sql: "SELECT type FROM entries WHERE id = ?", args: [id] });
  if (rows[0]) revalidateType(String(rows[0].type));
}
