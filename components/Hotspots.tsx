"use client";

import { useState } from "react";
import Image from "next/image";
import ParallaxImage from "./ParallaxImage";

type Point = { x: number; y: number; label: string; pos: "top" | "bottom" };
type Mobile = { image: string; ratio: number; band: [number, number] };

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
  ratio,
  mobile,
}: {
  image: string;
  alt: string;
  points: readonly Point[];
  /** יחס התמונה. המסגרת נגזרת ממנו - ראה ההערה ב-.khot--tall */
  ratio?: number;
  /** תמונה מלאה לטלפון - ראה ההערה ב-lib/content.ts */
  mobile?: Mobile;
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure
      className={`khot${ratio ? " khot--tall" : ""}`}
      style={
        ratio
          ? ({
              "--khot-ratio": ratio,
              ...(mobile && { "--khot-ratio-m": mobile.ratio }),
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* התמונה והנקודות יחד בשכבת הפרלקס, כדי שהנקודות יישארו
          נעולות על הפריטים שהן מסמנות */}
      {/* ⚠️ פרלקס מרוכך במסגרת הגבוהה. ברירת המחדל 0.12 מזיזה
          את השכבה ב-15% מגובה המסגרת, והנקודה העליונה בתמונה
          של המטבח הקלאסי יושבת ב-12% - כלומר בקצה התנודה היא
          יצאה מהמסגרת לגמרי. נמדד -2.8%. */}
      <ParallaxImage amount={ratio ? 0.05 : undefined}>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1100px) 100vw, 75vw"
          className={`khot__img${mobile ? " khot__img--desk" : ""}`}
        />
        {/* ⚠️ שתי תמונות ולא אחת: display:none + lazy לא נטען
            בדפדפן, כך שכל מכשיר מוריד רק את שלו */}
        {mobile && (
          <Image
            src={mobile.image}
            alt=""
            fill
            sizes="100vw"
            className="khot__img khot__img--m"
          />
        )}
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
                /* בטלפון: אותה נקודה בתמונה המלאה. החיתוך של
                   הדסקטופ הוא פס [התחלה, גובה] בתוכה, באחוזים */
                ...(mobile && {
                  "--ym": `${mobile.band[0] + (p.y * mobile.band[1]) / 100}%`,
                }),
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
