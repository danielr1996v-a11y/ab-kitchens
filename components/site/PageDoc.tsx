import { notFound } from "next/navigation";
import { getPage } from "@/lib/site/pages";
import RenderTree from "./RenderTree";

/**
 * עמוד שמרונדר מעץ האלמנטים שבמסד (שלב 5ב).
 *
 * ⚠️ אין נפילה חזרה לקוד הישן: אחרי ההעברה ה-JSX של העמוד נמחק,
 * והמסד הוא המקור היחיד. לכן ייבוא העמודים הוא שלב חובה לפני
 * פריסה (ADMIN-SPEC §8, שלב 10) - עמוד שלא יובא מחזיר 404.
 */
export default async function PageDoc({ path }: { path: string }) {
  const page = await getPage(path);
  if (!page) notFound();
  return <RenderTree nodes={page.doc.nodes} />;
}
