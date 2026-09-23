"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { testimonialsPage, type Testimonial } from "@/lib/testimonialsPage";

/**
 * גריד ההמלצות - הצילומים המקוריים.
 *
 * ⚠️ **שינוי כיוון מהגרסה הראשונה, לבקשת דניאל.** קודם הטקסט
 * היה מוקלד והצילום נפתח בלחיצה; עכשיו הצילום **הוא** התוכן.
 *
 * ⚠️ **מה שזה עולה, ואיך זה מפוצה:** טקסט בתוך תמונה נעלם
 * מגוגל ומקורא מסך. לכן התמלול המלא של כל המלצה יושב ב-`alt`
 * של התמונה - הוא לא נראה, אבל הוא קיים למי שצריך אותו. סימון
 * ה-Review בעמוד נגזר מאותו תמלול.
 *
 * ⚠️ **columns ולא grid.** יחסי הצילומים נעים בין 0.78 ל-2.45
 * (צילום טלפון לאורך מול בועת הודעה רחבה). ב-grid כל שורה
 * מתיישרת לגובה הגבוה ביותר ונוצרים חורים, או שצריך לחתוך את
 * הצילומים - וחיתוך של הוכחה הורס את מה שהיא באה להוכיח.
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
          <li className="tshot" key={t.id}>
            <button
              type="button"
              className="tshot__btn"
              onClick={() => open(t)}
              /* שם נגיש לכפתור. ה-alt נושא את ההמלצה עצמה */
              aria-label={`הגדלת הצילום${t.author ? ` של ${t.author}` : ""}`}
            >
              <Image
                src={t.image}
                /* ⚠️ התמלול המלא, לא תיאור. זה מה שמחזיק את
                   ההמלצה קריאה לגוגל ולקורא מסך אחרי שהיא
                   הפכה לתמונה. */
                alt={t.quote.join(" ")}
                width={t.w}
                height={t.h}
                className="tshot__img"
                sizes="(max-width: 700px) 90vw, (max-width: 1200px) 45vw, 30vw"
              />
            </button>
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
            alt={shown.quote.join(" ")}
            width={shown.w}
            height={shown.h}
            className="tproof__img"
            sizes="(max-width: 700px) 90vw, 60vw"
          />
        )}
      </dialog>
    </>
  );
}
