"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ViewTransition } from "react";
import { styleSection } from "@/lib/content";

/**
 * StyleGrid - "בחרו את הסגנון שלכם" כ-Bento Grid.
 *
 * קומפוזיציה: כרטיס גדול (2x2) + כרטיסים קטנים (1x1), לפי שדה size בכל כרטיס.
 * ב-RTL העמודה הראשונה היא הימנית, ולכן הכרטיס הגדול נוחת מימין למעלה -
 * שם העין הישראלית נעצרת ראשונה.
 *
 * ההופעה בגלילה נעשית ב-IntersectionObserver (מובנה בדפדפן, בלי ספריות),
 * וההשהיה המדורגת מוזרקת כמשתנה CSS לכל כרטיס.
 */

export type StyleGridProps = { content?: typeof styleSection };

export default function StyleGrid({ content = styleSection }: StyleGridProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // פעם אחת בלבד - לא מבזבז משאבים
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cards = content.cards.filter((card) => card.enabled);

  return (
    <section
      ref={sectionRef}
      className={`section-block styles${isVisible ? " is-visible" : ""}`}
      id="styles"
      aria-labelledby="styles-title"
    >
      <h2 className="styles__title" id="styles-title">
        <span className="reveal-mask">
          <span className="reveal-mask__inner">{content.title}</span>
        </span>
        <span className="styles__rule" aria-hidden="true" />
      </h2>

      <div className="bento">
        {cards.map((card, i) => (
          <Link
            key={card.id}
            href={card.href}
            className={`bento__card bento__card--${card.size}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            {/* שם ייחודי לכל סגנון: שם משותף אחד לשלושת הכרטיסים
                היה יוצר התנגשות והדפדפן לא היה יודע מי מורף */}
            <ViewTransition name={`kitchen-shot-${card.id}`}>
            <div className="bento__media">
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes={
                  {
                    full: "(max-width: 900px) 90vw, 90vw",
                    wide: "(max-width: 900px) 90vw, 63vw",
                    narrow: "(max-width: 900px) 90vw, 27vw",
                  }[card.size]
                }
                className="bento__img"
              />
              <span className="bento__overlay" aria-hidden="true" />
              <span className="bento__sheen" aria-hidden="true" />
            </div>
            </ViewTransition>
            <span className="bento__label">
              <span className="bento__label-text">{card.title}</span>
              <svg
                viewBox="0 0 24 24"
                className="link-arrow__icon"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M19 12H5M11 6l-6 6 6 6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
