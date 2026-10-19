"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * גלריית עמוד מטבח + תצוגה מוגדלת (19.10, לבקשת הלקוח).
 *
 * אותו רכיב לכל ארבע הגלריות - כפרי, מודרני, קלאסי ושיש - כי
 * כולן נבנות ב-KitchenPage. הרשת נשארת בדיוק כמו שהייתה (אותן
 * מחלקות), רק שכל תמונה היא עכשיו כפתור.
 *
 * <dialog> נייטיבי, כמו בקיר ההמלצות: Escape, מלכודת פוקוס
 * והחזרת הפוקוס לכפתור שנלחץ - מהדפדפן, בלי ספרייה.
 *
 * ⚠️ כיוונים ב-RTL: "הבא" בצד שמאל. החץ השמאלי במקלדת = הבא,
 * והחלקה ימינה (האצבע זזה ימינה) = הבא - התמונה הבאה יושבת
 * משמאל, ומושכים אותה פנימה.
 */

type Item = { image: string; alt: string };

/* מתחת ל-50px זו נגיעה רועדת ולא החלקה */
const SWIPE_MIN = 50;

export default function GalleryLightbox({ items }: { items: Item[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const startX = useRef<number | null>(null);
  const count = items.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
    /* showModal לא נועל את הגלילה בספארי - העמוד זז מאחורה */
    document.documentElement.style.overflow = "hidden";
  };

  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + count) % count)),
    [count],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    /* close נורה גם מ-Escape וגם מהכפתור - מקום אחד לנקות */
    const onClose = () => {
      document.documentElement.style.overflow = "";
      setIndex(null);
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") step(1);
    else if (e.key === "ArrowRight") step(-1);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) >= SWIPE_MIN) step(dx > 0 ? 1 : -1);
  };

  /* לחיצה על הרקע (הדיאלוג עצמו, לא התמונה או הכפתורים) סוגרת */
  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  const shown = index === null ? null : items[index];

  return (
    <>
      <ul className="kpage__grid">
        {items.map((item, i) => (
          <li className="kpage__shot" key={item.image}>
            <button
              type="button"
              className="kpage__shot-btn"
              onClick={() => open(i)}
              aria-label={`הגדלת התמונה: ${item.alt}`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
                className="kpage__shot-img"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="glight"
        aria-label="תצוגה מוגדלת"
        onKeyDown={onKeyDown}
        onClick={onBackdrop}
      >
        <div className="glight__bar">
          <span className="glight__count" aria-live="polite">
            {index !== null && `${index + 1} / ${count}`}
          </span>
          <button type="button" className="glight__close" onClick={close} aria-label="סגירה">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          className="glight__stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onClick={onBackdrop}
        >
          {shown && (
            <Image
              key={shown.image}
              src={shown.image}
              alt={shown.alt}
              fill
              sizes="100vw"
              className="glight__img"
            />
          )}
        </div>

        {count > 1 && (
          <>
            <button type="button" className="glight__nav glight__nav--prev" onClick={() => step(-1)} aria-label="התמונה הקודמת">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="glight__nav glight__nav--next" onClick={() => step(1)} aria-label="התמונה הבאה">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
