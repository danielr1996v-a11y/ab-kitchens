import { getDraftDoc, getPart } from "@/lib/site/pages";
import { isEditing } from "@/lib/site/editMode";
import RenderTree from "./RenderTree";

/**
 * הדר או פוטר מהמסד - נשמרים פעם אחת ומורכבים לכל עמוד (המפרט §3).
 * במצב עריכה - הטיוטה, עם סימון לבחירה.
 *
 * ⚠️ אין נפילה חזרה לקוד: כמו העמודים, ייבוא החלקים הוא שלב חובה
 * לפני פריסה. חלק חסר = לא מוצג (העמוד עצמו לא נופל).
 */
export default async function SharedPart({ kind }: { kind: "header" | "footer" }) {
  if (await isEditing()) {
    const doc = await getDraftDoc({ partId: `part-${kind}` });
    return doc ? <RenderTree nodes={doc.nodes} editing /> : null;
  }
  const doc = await getPart(kind);
  return doc ? <RenderTree nodes={doc.nodes} /> : null;
}
