"use client";

import { useState } from "react";
import Image from "next/image";
import ParallaxImage from "./ParallaxImage";

type Point = { x: number; y: number; label: string; pos: "top" | "bottom" };

/**
 * Hotspots - התמונה עם הנקודות הפועמות.
 *
 * במגע התווית נפתחת ישירות מתחת לנקודה שנלחצה.
 *
 * הבעיה שזה פותר: יש נקודות ב-x=8% וב-x=84%, ותווית באורך 24
 * תווים שמרוכזת עליהן גולשת מהתמונה. לכן כל נקודה מקבלת עוגן
 * לפי מיקומה - נקודה בקצה שמאל מיישרת את התווית ימינה וההפך,
 * ורק נקודה במרכז מרכזת אותה.
 *
 * client component בגלל ה-state של הנקודה הפעילה. KitchenPage
 * נשאר server.
 */

/** לאן ליישר את התווית כדי שלא תגלוש מהתמונה */
const anchorFor = (x: number) =>
  x < 25 ? "-1.25rem" : x > 75 ? "calc(-100% + 1.25rem)" : "-50%";
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
            style={
              {
                "--x": `${p.x}%`,
                "--y": `${p.y}%`,
                "--anchor": anchorFor(p.x),
              } as React.CSSProperties
            }
            aria-pressed={active === i}
            onClick={() => setActive(active === i ? null : i)}
          >
            <span className="khot__dot" aria-hidden="true" />
            <span className="khot__label">{p.label}</span>
          </button>
        ))}
      </ParallaxImage>
    </figure>
  );
}
