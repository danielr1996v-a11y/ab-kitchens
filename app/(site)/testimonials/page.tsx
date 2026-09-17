import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Testimonials from "@/components/Testimonials";
import DesignerCta from "@/components/DesignerCta";
import { site, testimonials } from "@/lib/content";

export const metadata: Metadata = {
  title: "המלצות לקוחות | סיפורי הצלחה של א. בית המטבחים",
  description: "לקוחות מספרים על העבודה איתנו - שירות, איכות ועמידה בזמנים. דירוג 5.0 בגוגל.",
  alternates: { canonical: "/המלצות" },
  openGraph: {
    title: "המלצות לקוחות | סיפורי הצלחה של א. בית המטבחים",
    description: "לקוחות מספרים על העבודה איתנו - שירות, איכות ועמידה בזמנים. דירוג 5.0 בגוגל.",
    url: "/המלצות",
  },
};

/**
 * עמוד ההמלצות המרכזי.
 *
 * ⚠️ **אין כאן המלצה שלא נאמרה.** כל השבע מגיעות מ-
 * lib/content.ts, שם הן שוחזרו מארכיון האתר הישן עם שמות
 * אמיתיים. המלצות ממידרג ומפייסבוק **ממתינות לטקסטים מדניאל**
 * - לא נשאבות ולא מומצאות.
 *
 * ה-h1 כאן ולא ב-Testimonials: הרכיב נושא h2 ומשמש גם בדף
 * הבית, שם ה-h1 הוא אחר.
 */
export default function Page() {
  return (
    <>
      <Breadcrumbs
        className="crumbs--top"
        trail={[{ label: "דף הבית", href: "/" }, { label: "המלצות" }]}
      />

      <section className="section-block treviews__head">
        <h1 className="page-title">המלצות לקוחות</h1>
        <p className="treviews__lead">
          {site.googleReviews} ביקורות בגוגל, דירוג {site.googleRating.toFixed(1)}.
          כאן אספנו את מה שלקוחות כתבו על העבודה איתנו.
        </p>
      </section>

      {/* בלי limit ובלי moreHref - זה העמוד שאליו מקשרים */}
      <Testimonials reviews={testimonials} />

      <DesignerCta />

      {/* ⚠️ אותו @id של components/Schema.tsx ולא LocalBusiness
          שני. JSON-LD ממזג צמתים לפי @id, ולכן ההמלצות נתלות
          בעסק הקיים במקום ליצור ישות מתחרה באותו עמוד.

          ⛔ **בלי aggregateRating.** הדירוג 5.0 על 11 ביקורות
          טרם אומת אחד-לאחד מול פרופיל הגוגל (רשום כחסום
          ב-PROJECT.md §8). סימון דירוג לא מאומת הוא חשיפה
          מול גוגל, לא רווח. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.ab-kitchens.co.il/#business",
            review: testimonials.map((r) => ({
              "@type": "Review",
              author: { "@type": "Person", name: r.name },
              reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 5,
              },
              reviewBody: r.text,
            })),
          }),
        }}
      />
    </>
  );
}
