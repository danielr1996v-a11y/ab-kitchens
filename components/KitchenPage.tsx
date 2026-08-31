import { ViewTransition } from "react";
import Image from "next/image";
import { kitchenPages, kitchenProcess, heroSlideshow } from "@/lib/content";
import LeadBanner from "./LeadBanner";
import ArticleCard from "./ArticleCard";
import Breadcrumbs from "./Breadcrumbs";
import { byStyle } from "@/lib/articles";
import Reveal from "./Reveal";
import ParallaxImage from "./ParallaxImage";
import Hotspots from "./Hotspots";
import { renderRichText } from "@/lib/richText";

/**
 * KitchenPage - התבנית המשותפת לעמודי הסגנונות.
 * נבנתה לפי הפיגמה (node 2059:188).
 *
 * שלושת העמודים (מודרני, קלאסי, כפרי) זהים במבנה, ולכן יש כאן
 * קומפוננטה אחת שמקבלת מפתח סגנון ושואבת את התוכן מ-content.
 * הוספת סגנון = הוספת רשומה ל-kitchenPages, בלי קוד חדש.
 *
 * הסקשן האחרון הוא LeadBanner הקיים - הפיגמה לא כללה סקשן
 * יצירת קשר, ואין סיבה לבנות שני פאנלים כהים שונים באתר.
 */
export default function KitchenPage({
  styleKey,
  beforeGallery,
}: {
  styleKey: string;
  /* חריץ אופציונלי שנפתח מעל הגלריה. קיים בשביל עמוד השיש,
     שמציג שם את ספקי השיש - הלוגואים הם ההוכחה לטענה "מעבד
     מורשה", ולכן מקומם לפני העבודות ולא אחריהן. */
  beforeGallery?: React.ReactNode;
}) {
  const page = kitchenPages[styleKey];

  /* התהליך לפי עמוד. עמוד השיש מגדיר משלו, כי התהליך המשותף
     מדבר על הזמנת מטבח וסתר את ה-FAQ של אותו עמוד. */
  const flow = page.process ?? kitchenProcess;
  const related = byStyle(styleKey as Parameters<typeof byStyle>[0]);
  if (!page) return null;

  return (
    <>
      {/* ===== הירו - תמונה בפול-בליד עם שכבת כהות ===== */}
      <section className="kpage__hero">
        {/* אותו שם כמו הכרטיס בבנטו - זה מה שגורם לתמונה
            למורף במקום להחליף */}
        <ViewTransition name={`kitchen-shot-${styleKey}`}>
          <Image
            src={page.heroImage}
            alt={page.heroAlt}
            fill
            priority
            sizes="100vw"
            className="kpage__hero-img"
          />
        </ViewTransition>
        <h1 className="kpage__hero-title">{page.heroTitle}</h1>

        {/* אותו סימן גלילה של דף הבית - רכיב אחד, לא שני */}
        <a
          href="#kpage-article"
          className="scroll-cue"
          aria-label={heroSlideshow.scrollIndicator.label}
        >
          <span className="scroll-cue__line" aria-hidden="true" />
          <svg
            viewBox="0 0 24 24"
            className="scroll-cue__chevron"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M5 9l7 7 7-7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      {/* ⚠️ מיד אחרי ההירו ולא מעליו: ההירו הוא תמונה מקצה
          לקצה, ופירורים מעליה היו יוצרים רצועה לבנה מתחת
          להדר הצף. */}
      <Breadcrumbs
        trail={[{ label: "דף הבית", href: "/" }, { label: page.heroTitle }]}
      />

      {/* ===== המאמר - עמודה ממורכזת, טקסט מיושר לימין ===== */}
      <article className="kpage__article" id="kpage-article">
        {page.article.map((block, i) => (
          <section
            /* בלוק עם תמונה יוצא מהגריד הדו-עמודתי ופורץ לקצה
               השמאלי. זה החריג היחיד. */
            className={`kpage__block${block.hotspots ? " kpage__block--full" : ""}`}
            key={block.heading ?? `block-${i}`}
          >
            {block.heading && <h2 className="kpage__heading">{block.heading}</h2>}
            <div
              /* גבול ה-62ch נועד לפסקאות. קוביות ותמונות רק
                 נמעכות ממנו, ולכן הן מקבלות את מלוא העמודה. */
              className={`kpage__block-body${
                block.cards ? " kpage__block-body--wide" : ""
              }`}
            >
              {block.cards && (
                <ul className="kpage__cards">
                  {block.cards.map((card) => (
                    <li className="kpage__card" key={card}>
                      {card}
                    </li>
                  ))}
                </ul>
              )}
              {/* תמונה עם נקודות חמות. בדסקטופ היא מחליפה את
                  הרשימה; במובייל היא מוצגת בלי נקודות והרשימה
                  חוזרת מתחתיה, כי שם אין ריחוף. */}
              {block.hotspots && (
                <Hotspots
                  image={block.hotspots.image}
                  alt={block.hotspots.alt}
                  points={block.hotspots.points}
                  tall={block.hotspots.tall}
                />
              )}

              {block.items && (
                <ul
                  className={`kpage__list${
                    block.hotspots ? " kpage__list--fallback" : ""
                  }`}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}

              {block.paragraphs?.map((text) => (
                <p className="kpage__paragraph" key={text.slice(0, 24)}>
                  {renderRichText(text)}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>

      {beforeGallery}

      {/* ===== גלריה ===== */}
      <section className="kpage__gallery" aria-labelledby="gallery-title">
        <h2 className="kpage__section-title" id="gallery-title">
          {page.galleryTitle}
        </h2>
        <ul className="kpage__grid">
          {page.gallery.map((item) => (
            <li className="kpage__shot" key={item.image}>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
                className="kpage__shot-img"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ===== התהליך - ארבעה כרטיסים, תמונה עם שכבה כהה ===== */}
      <section className="kpage__process" aria-labelledby="process-title">
        <Reveal>
          <h2 className="kpage__section-title" id="process-title">
            {flow.title}
          </h2>
        </Reveal>
        <ol className="kpage__steps">
          {flow.steps.map((step) => (
            <li className="kstep" key={step.id}>
              <Image
                src={step.image}
                alt=""
                fill
                sizes="(max-width: 700px) 80vw, (max-width: 1100px) 45vw, 22vw"
                className="kstep__img"
              />
              <div className="kstep__body">
                <h3 className="kstep__title">{step.title}</h3>
                <p className="kstep__text">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ⚠️ המאמר יושב **לפני** השאלות ותשובות, וזה מכוון.
          זה הסדר שאברהם הגדיר בקובץ "סגנון עיצוב הדף" בדרייב.
          בתחילה בנינו הפוך, דניאל הוצג עם הסתירה ואישר את
          הסדר של אברהם. לא להחליף בחזרה.

          הקובייה נשלפת לפי relatedStyle ולא מקודדת לעמוד -
          הוספת מאמר ב-lib/articles.ts מופיעה כאן לבד.
          עמוד השיש מקבל שלוש קוביות, כל סגנון מטבח אחת. */}
      {related.length > 0 && (
        <section className="krel" aria-labelledby="related-title">
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
      )}

      {/* ===== שאלות ותשובות =====
          <details> מקורי: נפתח בלי JS, נגיש למקלדת, ונשאר קריא
          גם אם הסקריפטים לא נטענו. */}
      <section className="kfaq" aria-labelledby="faq-title">
        <h2 className="kpage__section-title" id="faq-title">
          {page.faqTitle}
        </h2>
        <div className="kfaq__list">
          {page.faq.map((item) => (
            <details className="kfaq__item" key={item.q}>
              <summary className="kfaq__q">
                <span>{item.q}</span>
                <span className="kfaq__sign" aria-hidden="true" />
              </summary>
              <p className="kfaq__a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* גוגל מציג שאלות ותשובות ישירות בתוצאות. הסימון נגזר
          מאותו מקור תוכן, כך שהוא לא יכול להיפרד ממה שמוצג. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* ===== יצירת קשר - כאן עם טופס, בשונה מדף הבית ===== */}
      {/* ⚠️ אין כאן פריט ביניים "מטבחים": הוא פותח תפריט בלבד
          ואין מאחוריו עמוד, וקישור שבור בסימון גרוע מהיעדר
          סימון. שתי רמות בלבד, ושתיהן אמיתיות. */}
      <LeadBanner withForm />
    </>
  );
}
