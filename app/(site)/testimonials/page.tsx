import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import TestimonialWall from "@/components/TestimonialWall";
import VideoSlider from "@/components/VideoSlider";
import DesignerCta from "@/components/DesignerCta";
import {
  testimonialsPage,
  featuredLetter,
  featuredQuote,
  testimonials,
} from "@/lib/testimonialsPage";

export const metadata: Metadata = {
  title: "המלצות לקוחות | א. בית המטבחים",
  description:
    "לקוחות מספרים על העבודה איתנו - מדידה, ייצור, שיש והתקנה. לצד כל המלצה אפשר לפתוח את ההודעה המקורית.",
  alternates: { canonical: "/המלצות" },
  openGraph: {
    title: "המלצות לקוחות | א. בית המטבחים",
    description:
      "לקוחות מספרים על העבודה איתנו. לצד כל המלצה אפשר לפתוח את ההודעה המקורית.",
    url: "/המלצות",
  },
};

/**
 * עמוד ההמלצות.
 * סדר: באנר → פירורי לחם → קיר הצילומים → סרטונים → CTA.
 *
 * ⚠️ ה-noindex וההוצאה מ-sitemap.ts הוסרו - העמוד כבר לא ריק.
 * (הוא הוכנס כשהעמוד המתין לתוכן; ראה קומיט a8df7f0 ואילך.)
 *
 */
export default function Page() {
  return (
    <>
      {/* ===== הבאנר =====
          ⚠️ hero-country.webp נבחרה כי היא **לא בשימוש בשום
          מקום אחר באתר** - כל שאר התמונות הרחבות כבר מופיעות
          בסליידר הבית, במאמרים או בפאנל המעצבת שיושב בתחתית
          העמוד הזה עצמו.

          alt ריק במכוון: התמונה דקורטיבית וה-h1 נושא את
          המשמעות. אותה החלטה כמו ב-designerCta. */}
      <section className="tbanner">
        <Image
          src="/images/hero-country.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="tbanner__img"
        />
        <span className="tbanner__scrim" aria-hidden="true" />
        <h1 className="tbanner__title">{testimonialsPage.title}</h1>
      </section>

      {/* ⚠️ בלי crumbs--top: הבאנר כבר מפנה את ההדר הצף, בדיוק
          כמו בעמודי המטבחים. */}
      <Breadcrumbs
        trail={[{ label: "דף הבית", href: "/" }, { label: "המלצות" }]}
      />

      {/* ===== גריד הצילומים המקוריים =====
          ⚠️ כל ההמלצות כאן הן המקור עצמו - צילומים, בלי מלל
          שלנו. גם המכתב בכתב יד. */}
      <section className="treviews__wall" aria-label="המלצות מלקוחות">
        {/* ⚠️ המכתב ראשון בקיר. עד 5.10 הייתה לו רצועה משלו
            עם התמלול מימין; דניאל ביקש שיהיה צילום בין
            הצילומים, בלי מלל. התמלול נשאר ב-alt. */}
        <TestimonialWall
          items={[featuredLetter, featuredQuote, ...testimonials]}
        />
      </section>

      {/* ===== סרטוני לקוחות =====
          ⚠️ אחרי הצילומים ולא לפניהם: סרטון הוא ההוכחה החזקה
          ביותר, אבל הוא גם דורש מהמבקר להחליט לצפות. הצילומים
          נקראים בלי מאמץ ומחממים את הקרקע. */}
      <section className="tvideos" aria-labelledby="videos-title">
        {/* ⚠️ הכותרת נכנסה לתוך הקומפוננטה ולא נשארה כאן:
            חצי הניווט חולקים state עם המסלול, והם חייבים
            לשבת בשורת הכותרת - כלומר שלושתם תחת אותו רכיב. */}
        <VideoSlider titleId="videos-title" />
      </section>

      <DesignerCta />

      {/* ⚠️ אותו @id של components/Schema.tsx, כדי שההמלצות
          ייתלו בעסק הקיים ולא ייצרו ישות מתחרה באותו עמוד.
          ⛔ בלי aggregateRating - הדירוג טרם אומת מול פרופיל
          הגוגל (PROJECT.md §8). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://www.ab-kitchens.co.il/#business",
            review: [featuredLetter, ...testimonials]
              /* רק המלצות עם שם - ל-Review נדרש author */
              .filter((t) => t.author)
              .map((t) => ({
                "@type": "Review",
                author: { "@type": "Person", name: t.author },
                reviewBody: t.quote.join(" "),
              })),
          }),
        }}
      />
    </>
  );
}
