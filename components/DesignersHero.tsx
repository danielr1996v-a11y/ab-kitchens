"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { designersPage } from "@/lib/content";

/**
 * הפתיח של עמוד "המעצבים שלנו" - לפי הרפרנס שדניאל שלח.
 *
 * הפריסה הפוכה לרפרנס כי האתר RTL: הטקסט מימין (צד ההתחלה)
 * והתמונה משמאל. בלי ההיפוך הקריאה הייתה מתחילה מהתמונה.
 *
 * client component בגלל הסליידר. הנקודות ברפרנס דקורטיביות -
 * כאן הן עובדות באמת ומחליפות בין שלושה צילומים של אברהם.
 */
export default function DesignersHero() {
  const [active, setActive] = useState(0);
  const { titleLines, lead, ctaText, ctaHref, slides, swatches, badge } =
    designersPage;

  return (
    <section className="dhero">
      <div className="dhero__inner">
        {/* ===== טקסט - ימין ב-RTL ===== */}
        <div className="dhero__text">
          <h1 className="dhero__title">
            {titleLines.map((line, i) => (
              <span
                key={line}
                className={`dhero__line${
                  i === titleLines.length - 1 ? " dhero__line--light" : ""
                }`}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="dhero__lead">{lead}</p>

          <Link href={ctaHref} className="dhero__cta">
            {ctaText}
          </Link>

          {/* דגימות הגימורים. aria-hidden כי הן ויזואליות בלבד -
              הבחירה האמיתית נעשית בפגישה, לא כאן */}
          <ul className="dhero__swatches" aria-hidden="true">
            {swatches.map((s) => (
              <li
                key={s.label}
                className="dhero__swatch"
                style={{ background: s.color }}
                title={s.label}
              />
            ))}
          </ul>
        </div>

        {/* ===== תמונה - שמאל ב-RTL ===== */}
        <div className="dhero__media-col">
        <div className="dhero__media">
          {slides.map((s, i) => (
            <Image
              key={s.image}
              src={s.image}
              alt={s.alt}
              fill
              priority={i === 0}
              quality={90}
              sizes="(max-width: 900px) 100vw, 55vw"
              className={`dhero__img${i === active ? " is-active" : ""}`}
            />
          ))}

          {/* העיגול הכהה מהרפרנס. שם היה מחיר - כאן הדירוג
              האמיתי מגוגל, כי מחיר על מטבח בהתאמה אישית מטעה */}
          <div className="dhero__badge">
            <span className="dhero__badge-value">
              <span className="dhero__badge-star" aria-hidden="true">
                ★
              </span>
              {badge.value}
            </span>
            <span className="dhero__badge-note">{badge.note}</span>
          </div>
        </div>

          {/* הנקודות יושבות מתחת לתמונה, כמו ברפרנס */}
          <div className="dhero__dots" role="tablist" aria-label="בחירת תמונה">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`תמונה ${i + 1} מתוך ${slides.length}`}
                className={`dhero__dot${i === active ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
