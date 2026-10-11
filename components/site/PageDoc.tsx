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
        {doc.nodes.length ? (
          <RenderTree nodes={doc.nodes} editing />
        ) : (
          /* עמוד חדש - מסגרת בעורך בלבד (המפרט §12). בטיוטה, לא באתר */
          <div style={{ margin: "calc(var(--header-clearance)) var(--side-padding) var(--section-gap)", padding: "4rem 1rem", border: "2px dashed var(--color-border)", textAlign: "center", color: "var(--color-muted)" }}>
            העמוד ריק - הוסיפו אזור מהלשונית &quot;הוספה&quot;
          </div>
        )}
        <EditBridge docId={doc.id} />
      </>
    );
  }
  const page = await getPage(path);
  if (!page) notFound();
  return <RenderTree nodes={page.doc.nodes} />;
}
