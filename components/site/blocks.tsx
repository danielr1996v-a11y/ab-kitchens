import Reveal from "@/components/Reveal";
import ArticleCard from "@/components/ArticleCard";
import GalleryLightbox from "@/components/GalleryLightbox";
import TestimonialWall from "@/components/TestimonialWall";
import ClientVideos from "@/components/ClientVideos";
import { videosSection } from "@/lib/videos";
import Testimonials from "@/components/Testimonials";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";
import { trustindexWidgetId } from "@/lib/testimonialsPage";
import { getArticles, getProjects, getTestimonials, getVideos } from "@/lib/site/data";
import { widgetMarker } from "@/lib/site/marker";
import { jsonLd } from "@/lib/site/jsonLd";

/**
 * בלוקים שתוכנם מגיע מהמסד - שלב 5ב.
 *
 * ⚠️ מקור אחד: העמודים הקיימים (KitchenPage, עמוד ההמלצות, המאמרים)
 * והעץ (components/site/widgets.tsx) מרנדרים את אותם רכיבים. ה-markup
 * הועבר לכאן כמו שהוא מהעמודים, כדי שההשוואה תצא זהה.
 */

/* ===== עמודי הסגנון ===== */

/** הגלריה: פרויקטים בסגנון, שהמתג "בגלריית הסגנון" דלוק, בסדר הידני.
    19.10: כל תמונה נפתחת בהגדלה (GalleryLightbox) */
export async function ProjectGallery({ style }: { style: string }) {
  const gallery = (await getProjects()).filter((p) => p.inGallery && p.style === style);
  return <GalleryLightbox items={gallery.map((p) => ({ image: p.src, alt: p.alt }))} />;
}

/** קוביית המאמרים בעמוד הסגנון. אין מאמרים - אין סקשן */
export async function RelatedArticles({ style }: { style: string }) {
  const related = (await getArticles()).filter((a) => a.relatedStyle === style);
  if (!related.length) return null;
  return (
    <section className="krel" aria-labelledby="related-title" {...widgetMarker("relatedArticles", { style })}>
      <Reveal>
        <h2 className="kpage__section-title" id="related-title">
          {related.length > 1 ? "מאמרים בנושא" : "מאמר בנושא"}
        </h2>
      </Reveal>
      <ul className="krel__grid">
        {related.map((a) => (
          <li key={a.slug}>
            <ArticleCard article={a} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** JSON-LD של שאלות ותשובות - נגזר מהתוכן שמוצג, כדי שלא ייפרד ממנו */
export function FaqSchema({ items }: { items: { q: string; a: string }[] }) {
  return (
    <script
      {...widgetMarker("faqSchema")}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      }}
    />
  );
}

/* ===== מאמרים ===== */

export async function ArticleGrid() {
  const articles = await getArticles();
  return (
    <ul className="alist__grid" {...widgetMarker("articleGrid")}>
      {articles.map((a) => (
        <li key={a.slug}>
          <ArticleCard article={a} />
        </li>
      ))}
    </ul>
  );
}

/* ===== המלצות ===== */

export async function HomeTestimonials(props: { showMore?: boolean; plain?: boolean; videoSlot?: boolean }) {
  const { written } = await getTestimonials();
  return <Testimonials reviews={written} {...props} />;
}

export async function GoogleReviews() {
  const { google } = await getTestimonials();
  return (
    <GoogleReviewsWidget widgetId={trustindexWidgetId}>
      <Testimonials reviews={google} showMore={false} plain source="google" />
    </GoogleReviewsWidget>
  );
}

export async function TestimonialWallSection() {
  /* הקיר = צילומי מסך מפורסמים, המוצמדים (המכתב) ראשונים */
  const { wall } = await getTestimonials();
  return (
    <section className="treviews__wall" aria-label="המלצות מלקוחות" {...widgetMarker("testimonialWall")}>
      <TestimonialWall items={wall} />
    </section>
  );
}

/* ⚠️ רשת ולא סליידר (21.10, לבקשת דניאל) - כמו עמוד הסרטונים.
   שם ה-widget נשאר videoSlider כדי שהעצים במסד לא ישתנו */
export async function VideoSliderSection() {
  const { client } = await getVideos();
  return (
    <section className="tvideos" aria-labelledby="videos-title" {...widgetMarker("videoSlider")}>
      <div className="tvideos__head">
        <h2 className="tvideos__title" id="videos-title">
          {videosSection.title}
        </h2>
      </div>
      <div className="tvideos__body">
        <ClientVideos videos={client} />
      </div>
    </section>
  );
}

/** JSON-LD של ההמלצות. ⛔ בלי aggregateRating - הדירוג טרם אומת (PROJECT.md §8) */
export async function ReviewsSchema() {
  const { wall, google } = await getTestimonials();
  return (
    <script
      {...widgetMarker("reviewsSchema")}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://www.ab-kitchens.co.il/#business",
          review: [
            ...wall
              /* רק המלצות עם שם - ל-Review נדרש author */
              .filter((t) => t.author)
              .map((t) => ({
                "@type": "Review",
                author: { "@type": "Person", name: t.author },
                reviewBody: t.quote.join(" "),
              })),
            ...google.map((g) => ({
              "@type": "Review",
              author: { "@type": "Person", name: g.name },
              reviewRating: { "@type": "Rating", ratingValue: g.rating },
              reviewBody: g.text,
            })),
          ],
        }),
      }}
    />
  );
}
