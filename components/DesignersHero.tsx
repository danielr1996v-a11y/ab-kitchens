import Link from "next/link";
import Image from "next/image";
import { designersPage } from "@/lib/content";

/**
 * הפתיח של עמוד "המעצבים שלנו" - לפי הרפרנס שדניאל שלח.
 *
 * הפריסה הפוכה לרפרנס כי האתר RTL: הטקסט מימין (צד ההתחלה)
 * והתמונה משמאל.
 *
 * ===== הפרט שמחזיק את העיצוב =====
 * ברפרנס הספה חורגת מהמסגרת ונכנסת לאזור הטקסט. כאן השיש עושה
 * את זה, בלי קובץ חתוך: שתי שכבות של אותו צילום, על אותה גיאומטריה
 * בדיוק, כך שאין תפר -
 *
 *   1. dhero__media  - המסגרת. overflow:hidden חותך את התמונה
 *   2. dhero__spill  - אותה תמונה בדיוק, לא חתוכה על ידי המסגרת,
 *                      עם clip-path שמשאיר רק את משטח האי
 *
 * הלוח (dhero__plate) רחב מהמסגרת ב---spill, ולכן החלק של האי
 * שנמצא מעבר לקצה המסגרת נחשף בשכבה השנייה - והשיש "יוצא החוצה".
 *
 * server component: אין כאן state, רק שכבות.
 */
export default function DesignersHero() {
  const { titleLines, lead, ctaText, ctaHref, hero, swatches, badge } =
    designersPage;

  /* אותה תמונה בשתי השכבות. priority רק על הראשונה - הדפדפן
     משתמש באותו קובץ פעמיים ולא מוריד אותו כפול. */
  const plate = (priority: boolean) => (
    <div className="dhero__plate">
      <Image
        src={hero.image}
        alt={priority ? hero.alt : ""}
        aria-hidden={!priority}
        fill
        priority={priority}
        quality={90}
        sizes="(max-width: 900px) 100vw, 60vw"
        className="dhero__img"
      />
    </div>
  );

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

          {/* דגימות הגימורים. ויזואליות בלבד - הבחירה האמיתית
              נעשית בפגישה, ולכן aria-hidden */}
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
        <div className="dhero__stage">
          <div className="dhero__media">{plate(true)}</div>

          {/* השכבה שחורגת. aria-hidden כי זו אותה תמונה שוב */}
          <div className="dhero__spill" aria-hidden="true">
            {plate(false)}
          </div>

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
      </div>
    </section>
  );
}
