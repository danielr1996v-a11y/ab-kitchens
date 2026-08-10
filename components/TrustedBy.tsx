import { trustedBy } from "@/lib/content";

/**
 * TrustedBy - "סומכים עלינו", שלוש שורות לפי קטגוריה.
 *
 * שיטת ה-marquee: שתי קבוצות זהות, כל אחת עם min-width של 100%
 * מרוחב המיכל, ושתיהן נעות ב-translateX מרוחב עצמן. כשקבוצה אחת
 * יוצאת מהמסך, השנייה נוחתת בדיוק במקומה.
 *
 * למה זה עדיף על מסלול אחד ארוך: אין תלות בחישוב רוחב כולל.
 * שינוי בגודל הלוגו, במספר הלוגואים או ברוחב המסך לא יכול ליצור חלל.
 *
 * הכיוון מתחלף בין שורה לשורה, והמהירויות שונות במעט - כך התנועה
 * מרגישה טבעית ולא כמו מנגנון אחד שחוזר על עצמו.
 *
 * ביצועים: transform בלבד, בלי JavaScript.
 */

export type TrustedByProps = { content?: typeof trustedBy };

export default function TrustedBy({ content = trustedBy }: TrustedByProps = {}) {
  return (
    <section className="section-block trusted" aria-labelledby="trusted-title">
      <h2 className="trusted__title" id="trusted-title">
        {content.title}
      </h2>

      <div className="trusted__rows">
        {content.groups.map((group, gi) => (
          <div className="trusted__row" key={group.id} role="group" aria-label={group.label}>
            <div
              className={`marquee marquee--${group.direction}`}
              /* מהירות מעט שונה לכל שורה, כדי שלא ינועו כגוש אחד */
              style={{ "--marquee-dur": `${34 + gi * 6}s` } as React.CSSProperties}
            >
              {/* שתי קבוצות זהות - השנייה מוסתרת מקוראי מסך */}
              {[0, 1].map((copy) => (
                <ul
                  className="marquee__group"
                  key={copy}
                  aria-hidden={copy === 1 || undefined}
                >
                  {group.logos.map((logo) => (
                    <li className="marquee__item" key={`${logo.name}-${copy}`}>
                      {/* plain img ולא next/image - SVG חיצוני חסום כברירת מחדל */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo.src}
                        alt={copy === 0 ? logo.name : ""}
                        className="marquee__logo"
                        loading="lazy"
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
