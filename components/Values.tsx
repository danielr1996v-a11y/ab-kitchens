"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { values } from "@/lib/content";
import { renderRichText, renderHighlight } from "@/lib/richText";

/**
 * Values - "מה שמוביל אותנו" כסקשן נעול (Pinned Section).
 *
 * דסקטופ: כל הסקשן ננעל במקום, והערכים מתחלפים בתוכו אחד אחרי השני
 * ככל שגוללים. מבוסס position: sticky בלבד - הגלילה נשארת טבעית לחלוטין
 * ואין "חטיפה" של הגלילה מהמשתמש.
 *
 * המנגנון: מסלול גבוה (track) שבתוכו אלמנט דביק בגובה מסך אחד.
 * סמנים בלתי-נראים פרוסים לאורך המסלול, וכשסמן חוצה את מרכז המסך
 * הערך המתאים הופך לפעיל.
 *
 * מובייל: הנעילה מבוטלת. סקשן נעול במסך קטן מרגיש כמו תקלה,
 * ולכן שם הערכים זורמים רגיל, כל אחד עם התמונה שלו.
 */

export type ValuesProps = { content?: typeof values };

export default function Values({ content = values }: ValuesProps = {}) {
  const items = content.items.filter((item) => item.enabled);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // חשיפת הכותרת בכניסה לסקשן
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // מעקב אחרי הסמנים - קובע איזה ערך פעיל
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    markerRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`values${isVisible ? " is-visible" : ""}`}
      id="process"  /* שמירת העוגן מהאתר הישן: /#process */
      aria-labelledby="values-title"
      style={{ "--values-count": items.length } as React.CSSProperties}
    >
      <div className="values__track">
        {/* סמנים בלתי-נראים - קובעים מתי כל ערך נכנס לפוקוס */}
        {items.map((item, i) => (
          <div
            key={`marker-${item.id}`}
            ref={(el) => {
              markerRefs.current[i] = el;
            }}
            className="values__marker"
            style={{ "--i": i } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}

        <div className="values__pin">
          <header className="values__header">
            <h2 className="values__title" id="values-title">
              <span className="reveal-mask">
                <span className="reveal-mask__inner">{renderHighlight(content.title)}</span>
              </span>
            </h2>
            <p className="values__intro">
              <span className="reveal-mask">
                <span className="reveal-mask__inner">{content.intro}</span>
              </span>
            </p>
          </header>

          <div className="values__grid">
            {/* עמודה 1 ב-RTL = ימין: התמונה */}
            <div className="values__media">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className={`values__frame${i === activeIndex ? " is-active" : ""}`}
                  aria-hidden={i !== activeIndex}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 900px) 90vw, 45vw"
                    priority={i === 0}
                    className="values__img"
                  />
                </div>
              ))}
            </div>

            {/* עמודה 2 ב-RTL = שמאל: הערכים, מתחלפים במקום */}
            <ol className="values__stack">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className={`value${i === activeIndex ? " is-active" : ""}`}
                >
                  <span className="value__number" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="value__title">{item.title}</h3>
                  <p className="value__text">{renderRichText(item.description)}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* מחוון התקדמות - המשתמש תמיד יודע איפה הוא */}
          <div className="values__progress" aria-hidden="true">
            {items.map((item, i) => (
              <span
                key={`dot-${item.id}`}
                className={`values__dot${i === activeIndex ? " is-active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* מובייל: זרימה רגילה, כל ערך עם התמונה שלו */}
      <div className="values__mobile">
        <header className="values__header">
          <h2 className="values__title">{renderHighlight(content.title)}</h2>
          <p className="values__intro">{content.intro}</p>
        </header>
        <ol className="values__mobile-list">
          {items.map((item, i) => (
            <li key={item.id} className="value value--mobile">
              <div className="value__mobile-media">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="90vw"
                  className="values__img"
                />
              </div>
              <span className="value__number" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="value__title">{item.title}</h3>
              <p className="value__text">{renderRichText(item.description)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
