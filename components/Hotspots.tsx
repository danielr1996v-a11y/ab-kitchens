"use client";

import { useState } from "react";
import Image from "next/image";
import ParallaxImage from "./ParallaxImage";

type Point = { x: number; y: number; label: string; pos: "top" | "bottom" };

/**
 * Hotspots - התמונה עם הנקודות הפועמות.
 *
 * הנקודות היו מוסתרות לגמרי מתחת ל-1100px, כי תווית שנפתחת ליד
 * נקודה בקצה התמונה גולשת מהמסך (יש נקודות ב-x=8% ו-x=84%,
 * ותוויות באורך 24 תווים).
 *
 * הפתרון: במגע הנקודות פעילות, אבל התווית לא נפתחת לידן אלא
 * בפס קבוע מתחת לתמונה - שם היא לעולם לא גולשת, בלי קשר למיקום
 * הנקודה או לאורך הטקסט. בדסקטופ הריחוף נשאר בדיוק כמו שהיה.
 *
 * client component בגלל ה-state של הנקודה הפעילה. KitchenPage
 * נשאר server.
 */
export default function Hotspots({
  image,
  alt,
  points,
}: {
  image: string;
  alt: string;
  points: readonly Point[];
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure className="khot">
      {/* התמונה והנקודות יחד בשכבת הפרלקס, כדי שהנקודות יישארו
          נעולות על הפריטים שהן מסמנות */}
      <ParallaxImage>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1100px) 100vw, 75vw"
          className="khot__img"
        />
        {points.map((p, i) => (
          <button
            type="button"
            key={p.label}
            className={`khot__point khot__point--${p.pos}${
              active === i ? " is-active" : ""
            }`}
            style={{ "--x": `${p.x}%`, "--y": `${p.y}%` } as React.CSSProperties}
            aria-pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
          >
            <span className="khot__dot" aria-hidden="true" />
            <span className="khot__label">{p.label}</span>
          </button>
        ))}
      </ParallaxImage>

      {/* הפס מוצג רק במגע. aria-live כדי שקורא מסך יכריז על
          התווית שנבחרה, ולא רק יראה אותה */}
      <figcaption className="khot__bar" aria-live="polite">
        {active === null ? "לחצו על הנקודות כדי לגלות" : points[active].label}
      </figcaption>
    </figure>
  );
}
