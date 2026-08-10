import SectionRenderer from "@/components/SectionRenderer";
import { homeSections } from "@/lib/sections";
import { sanityFetch } from "@/lib/sanity/live";
import { homeQuery, adaptHome } from "@/lib/sanity/queries";

/**
 * דף הבית.
 *
 * התוכן מגיע מ-Sanity (sanityFetch - מתעדכן חי, בלי בנייה),
 * והאדפטר ממיר אותו ל-Section[] שהקומפוננטות מכירות.
 *
 * שתי רשתות ביטחון, שתיהן נופלות ל-homeSections מהקוד:
 * - אין env (סביבה בלי חשבון Sanity) - sanityFetch הוא null
 * - יש חיבור אבל אין מסמך / שגיאה - האדפטר מחזיר null
 * האתר לעולם לא מציג עמוד ריק בגלל תקלת CMS.
 */
export default async function HomePage() {
  let sections = homeSections;

  if (sanityFetch) {
    try {
      const { data } = await sanityFetch({ query: homeQuery });
      sections = adaptHome(data) ?? homeSections;
    } catch {
      // Sanity לא זמין - האתר ממשיך מהקוד. עדיף עמוד נכון מאתמול
      // מאשר שגיאה של עכשיו.
    }
  }

  return <SectionRenderer sections={sections} />;
}
