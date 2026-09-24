import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";
import TestimonialWall from "@/components/TestimonialWall";
import VideoGrid from "@/components/VideoGrid";
import { videosSection } from "@/lib/videos";
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
 *
 * ⚠️ ה-noindex וההוצאה מ-sitemap.ts הוסרו - העמוד כבר לא ריק.
 * (הוא הוכנס כשהעמוד המתין לתוכן; ראה קומיט a8df7f0 ואילך.)
 *
 * סדר הקריאה: המכתב בכתב יד פותח, ואחריו קיר ההמלצות. המכתב
 * לא יושב ברשת כי הוא לא מאותו סוג - הוא נייר, הוא כתב יד,
 * והוא ההוכחה שהכי קשה לביים.
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

      {/* ===== המכתב בכתב יד ===== */}
      <section className="tletter" aria-labelledby="letter-title">
        <Reveal className="tletter__inner">
          <div className="tletter__text">
            <h2 className="tletter__title" id="letter-title">
              מכתב שהגיע אלינו
            </h2>
            <blockquote className="tletter__quote">
              {featuredLetter.quote.map((p) => (
                <p className="tletter__p" key={p.slice(0, 28)}>
                  {p}
                </p>
              ))}
            </blockquote>
            <p className="tletter__meta">{featuredLetter.place}</p>
          </div>

          <figure className="tletter__figure">
            <Image
              src={featuredLetter.image}
              alt={featuredLetter.imageAlt}
              width={1080}
              height={1498}
              className="tletter__img"
              sizes="(max-width: 900px) 90vw, 40vw"
            />
          </figure>
        </Reveal>
      </section>

      {/* ===== גריד הצילומים המקוריים =====
          ⚠️ ההמלצה הארוכה חזרה לכאן. קודם הייתה לה רצועת טקסט
          משלה, אבל דניאל ביקש שמהמכתב והלאה יוצג המקור - ולכן
          היא צילום כמו כל השאר. */}
      <section className="treviews__wall" aria-label="המלצות מלקוחות">
        <TestimonialWall items={[featuredQuote, ...testimonials]} />
      </section>

      {/* ===== סרטוני לקוחות =====
          ⚠️ אחרי הצילומים ולא לפניהם: סרטון הוא ההוכחה החזקה
          ביותר, אבל הוא גם דורש מהמבקר להחליט לצפות. הצילומים
          נקראים בלי מאמץ ומחממים את הקרקע. */}
      <section className="tvideos" aria-labelledby="videos-title">
        <Reveal>
          <h2 className="tvideos__title" id="videos-title">
            {videosSection.title}
          </h2>
        </Reveal>
        <VideoGrid />
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
