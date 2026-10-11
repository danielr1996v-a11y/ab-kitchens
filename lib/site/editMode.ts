import "server-only";
import { draftMode } from "next/headers";
import { currentUser } from "@/lib/admin/session";
import { can } from "@/lib/admin/roles";

/**
 * מצב עריכה באתר הציבורי - שלב 6.
 *
 * דלוק רק כשגם תצוגת הטיוטה של Next דלוקה (העוגייה שהעורך מפעיל)
 * **וגם** יש משתמש מחובר עם הרשאת עריכת עמודים. עוגיית הטיוטה לבדה
 * לא מספיקה - מי שמעתיק אותה בלי להיות מחובר רואה את האתר הרגיל.
 *
 * ⚠️ draftMode() לא הופך עמודים לדינמיים לגולשים רגילים: בלי העוגייה
 * העמוד נשאר סטטי ונטען מהמטמון כרגיל.
 */
export async function isEditing(): Promise<boolean> {
  if (!(await draftMode()).isEnabled) return false;
  const user = await currentUser();
  return !!user && can(user.role, "pages.text");
}
