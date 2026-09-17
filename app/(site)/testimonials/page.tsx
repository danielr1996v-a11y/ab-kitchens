import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Placeholder from "@/components/Placeholder";

/**
 * עמוד ההמלצות המרכזי - **ממתין לתוכן מאברהם.**
 *
 * הוראה של דניאל מ-17.09: העמוד קיים, אבל לא שמים בו כלום
 * עדיין. שבע ההמלצות הקיימות נשארו בדף הבית, והאוסף המלא
 * (כולל מידרג ופייסבוק) יגיע מאברהם.
 *
 * ⚠️ **noindex עד שיהיה תוכן.** עמוד ריק שמאונדקס הוא נזק
 * כפול: גוגל רואה תוכן דל תחת הדומיין, ומבקר שמגיע אליו
 * מתוצאות החיפוש נוחת על כלום. ההוצאה מ-`sitemap.ts` משלימה
 * את זה.
 *
 * ⛔ **כשהתוכן נכנס** - למחוק את `robots`, להחזיר את
 * `/המלצות` ל-sitemap, למחוק את ה-Placeholder, ולהחזיר את
 * סימון ה-Review (הגרסה המלאה קיימת בקומיט 31592e0).
 */
export const metadata: Metadata = {
  title: "המלצות לקוחות | א. בית המטבחים",
  description: "לקוחות מספרים על העבודה איתנו.",
  alternates: { canonical: "/המלצות" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs
        className="crumbs--top"
        trail={[{ label: "דף הבית", href: "/" }, { label: "המלצות" }]}
      />

      <section className="section-block">
        <h1 className="page-title">המלצות לקוחות</h1>
      </section>

      {/* ⛔ חסום ב-production - אברהם לא רואה "בקרוב" */}
      <Placeholder
        title="ההמלצות"
        slots={6}
        ratio="3 / 2"
        note="ממתין לאוסף המלא מאברהם, כולל מידרג ופייסבוק. שבע ההמלצות הקיימות נשארו בדף הבית."
      />
    </>
  );
}
