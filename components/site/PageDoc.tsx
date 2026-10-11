import { notFound } from "next/navigation";
import { getDraftDoc, getPage } from "@/lib/site/pages";
import { isEditing } from "@/lib/site/editMode";
import RenderTree from "./RenderTree";
import EditBridge from "./EditBridge";

/**
 * עמוד שמרונדר מעץ האלמנטים שבמסד (שלב 5ב).
 *
 * במצב עריכה (שלב 6): הטיוטה במקום המפורסם, עם סימון לכל אלמנט
 * וגשר לעורך שמסביב (EditBridge).
 *
 * ⚠️ אין נפילה חזרה לקוד הישן: אחרי ההעברה ה-JSX של העמוד נמחק,
 * והמסד הוא המקור היחיד. לכן ייבוא העמודים הוא שלב חובה לפני
 * פריסה (ADMIN-SPEC §8, שלב 10) - עמוד שלא יובא מחזיר 404.
 */
export default async function PageDoc({ path }: { path: string }) {
  if (await isEditing()) {
    const doc = await getDraftDoc({ path });
    if (!doc) notFound();
    return (
      <>
        <RenderTree nodes={doc.nodes} editing />
        <EditBridge docId={doc.id} />
      </>
    );
  }
  const page = await getPage(path);
  if (!page) notFound();
  return <RenderTree nodes={page.doc.nodes} />;
}
