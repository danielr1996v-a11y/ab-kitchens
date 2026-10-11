import { getPart } from "@/lib/site/pages";
import RenderTree from "./RenderTree";

/**
 * הדר או פוטר מהמסד - נשמרים פעם אחת ומורכבים לכל עמוד (המפרט §3).
 *
 * ⚠️ אין נפילה חזרה לקוד: כמו העמודים, ייבוא החלקים הוא שלב חובה
 * לפני פריסה. חלק חסר = לא מוצג (העמוד עצמו לא נופל).
 */
export default async function SharedPart({ kind }: { kind: "header" | "footer" }) {
  const doc = await getPart(kind);
  return doc ? <RenderTree nodes={doc.nodes} /> : null;
}
