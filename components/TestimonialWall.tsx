"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  testimonialsPage,
  type Testimonial,
} from "@/lib/testimonialsPage";

/**
 * קיר ההמלצות + חלון הצילום המקורי.
 *
 * ההחלטה המרכזית: **הטקסט הוא התוכן, הצילום הוא ההוכחה.**
 * צילום מסך הוא תמונה של טקסט - גוגל לא קורא אותו, קורא מסך
 * לא מקריא אותו, והוא מטושטש במסך טוב. לכן המילים מוקלדות
 * בטיפוגרפיה של האתר, והצילום נפתח בלחיצה למי שרוצה לוודא.
 *
 * ⚠️ הפריסה היא `columns` ולא `grid` במכוון: אורכי ההמלצות
 * נעים בין שורה אחת לחמש פסקאות. ב-grid שורה שלמה מתיישרת
 * לגובה הכרטיס הארוך ביותר ונוצרים חורים ענקיים. `columns`
 * מזרים אותן ומסדר את עצמו.
 *
 * ⚠️ <dialog> מקורי ולא div: נעילת פוקוס, סגירה ב-Escape ורקע
 * חוסם מגיעים מהדפדפן. אותה בחירה כמו ב-DesignerCta.
 */
export default function TestimonialWall({
  items,
}: {
  items: Testimonial[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState<Testimonial | null>(null);

  const open = (t: Testimonial) => {
    setShown(t);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <ul className="twall">
        {items.map((t) => (
          <li className="tcard" key={t.id}>
            <blockquote className="tcard__quote">
              {t.quote.map((p) => (
                <p className="tcard__p" key={p.slice(0, 28)}>
                  {p}
                </p>
              ))}
            </blockquote>

            {/* דירוגי מידרג, כשיש. הנמוך מוצג יחד עם הגבוהים. */}
            {t.scores && (
              <ul className="tscore">
                {t.scores.map((s) => (
                  <li className="tscore__item" key={s.label}>
                    <span className="tscore__label">{s.label}</span>
                    <span className="tscore__value">{s.value}</span>
                  </li>
                ))}
              </ul>
            )}

            <footer className="tcard__foot">
              <div className="tcard__who">
                {/* ⚠️ בלי שם - מוצג המקור בלבד. לא ממציאים שם. */}
                {t.author && <p className="tcard__name">{t.author}</p>}
                <p className="tcard__meta">
                  {[t.place, t.date].filter(Boolean).join(" · ")}
                  {(t.place || t.date) && " · "}
                  {t.source}
                </p>
              </div>

              <button
                type="button"
                className="tcard__proof"
                onClick={() => open(t)}
              >
                {testimonialsPage.originalLabel}
              </button>
            </footer>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef} className="tproof" aria-label="הצילום המקורי">
        <button
          type="button"
          className="tproof__close"
          onClick={() => dialogRef.current?.close()}
        >
          {testimonialsPage.closeLabel}
        </button>
        {shown && (
          <Image
            src={shown.image}
            alt={shown.imageAlt}
            width={1200}
            height={900}
            className="tproof__img"
            sizes="(max-width: 700px) 90vw, 60vw"
          />
        )}
      </dialog>
    </>
  );
}
