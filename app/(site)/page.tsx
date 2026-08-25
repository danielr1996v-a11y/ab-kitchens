import SectionRenderer from "@/components/SectionRenderer";
import { homeSections } from "@/lib/sections";
import DesignerCta from "@/components/DesignerCta";
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

  /* ה-CTA אינו בלוק CMS בשלב הזה - הוא סקשן קבוע בסוף העמוד.
     לכן הוא מרונדר כאן ולא דרך SectionRenderer, שאחרת היה
     נעלם כשהתוכן מגיע מ-Sanity ולא כולל אותו. */
  return (
    <>
      {/* ⚠️ ה-h1 של דף הבית. הוא מוסתר ולא מעוצב במכוון:
          ההירו הוא סליידר תמונות ללא טקסט, ולכן העמוד רץ עד
          כה **בלי h1 בכלל** בעוד שבכל שאר העמודים באתר יש
          בדיוק אחד. זו הייתה החמצה בעמוד החשוב ביותר.
          אותו פתרון כבר קיים ב-app/(site)/about/page.tsx. */}
      <h1 className="sr-only">
        א. בית המטבחים - מטבחים ושיש בהתאמה אישית בירושלים
      </h1>
      <SectionRenderer sections={sections} />
      <DesignerCta />
    </>
  );
}
