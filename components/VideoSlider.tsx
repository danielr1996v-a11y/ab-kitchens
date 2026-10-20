"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clientVideos, videosSection } from "@/lib/videos";

/**
 * סליידר סרטוני הלקוחות - כל סרטון מקבל את הבמה שלו.
 *
 * ⚠️ **נבנה מחדש ב-20.10, אחרי שלושה תיקונים שלא עצרו את ההבהוב
 * באייפון.** הגרסה הקודמת הייתה גוללן נייטיבי עם שלושה עותקים של
 * כל סרטון (36 כרטיסים), "קפיצה" שקטה חזרה לעותק האמצעי כשהגלילה
 * נחה, וסקייל שנכתב לכל כרטיס בכל פריים של גלילה. באייפון הגלילה
 * ממשיכה בתנופה אחרי שהאצבע עוזבת, והקפיצה נפלה באמצע התנופה -
 * זה ההבהוב. אי אפשר לתקן את זה מבחוץ, כי זה המנגנון עצמו.
 *
 * עכשיו אין גלילה בכלל. כל כרטיס יודע את המרחק שלו מהמרכז במעגל
 * (k), והמיקום שלו הוא transform עם transition - תזוזה אחת לכל
 * מעבר, על כרטיס המסך, בלי JS בכל פריים ובלי עותקים.
 *
 * מה שנשמר מהגרסאות הקודמות, ולמה:
 * - **מעגלי, בלי קצה.** משני צדי הסרטון הראשון תמיד יש כרטיסים,
 *   והחצים לעולם לא "נתקעים" - שתי התלונות של דניאל על הגרסה
 *   הלינארית הראשונה.
 * - **גרירה בעכבר וגם החלקה באצבע.** הכרטיסים עוקבים אחרי האצבע
 *   ומתיישבים על הסרטון הבא. גלילה אנכית של העמוד לא נפגעת.
 * - **הנגן נטען רק בלחיצה.** עד אז רק סטילס ששמור אצלנו, בלי מגע
 *   עם יוטיוב. סרטון אחד פתוח בכל רגע.
 * - 650ms למעבר - "המעבר בין סרטונים מאוד מהיר" (דניאל).
 */

const N = clientVideos.length;
/* כמה מתכווץ כל צעד מהמרכז, ואיפה זה נעצר - כמו קודם */
const SHRINK = 0.09;
const SHRINK_MAX = 2.5;
/* כרטיס רחוק מזה מוסתר. ⚠️ חייב להיות קטן מחצי המעגל: כרטיס
   שעובר מצד לצד (מ-k=-5 ל-k=6 ב-12 סרטונים) עושה את זה כשהוא
   מוסתר, ולכן לא נראה עף לרוחב המסך. */
const HIDE = Math.max(1, Math.min(3, Math.floor(N / 2) - 1));
/* מתחת לזה זו נגיעה רועדת ולא החלקה */
const SWIPE_MIN = 50;
/* גרירה מתחילה רק אחרי תזוזה אופקית אמיתית - אחרת זו לחיצה */
const DRAG_START = 8;

/** המרחק במעגל מהמרכז: 0 = הבמה, חיובי = הבא (משמאל ב-RTL) */
const kOf = (i: number, active: number) => {
  let k = (((i - active) % N) + N) % N;
  if (k > N / 2) k -= N;
  return k;
};

export default function VideoSlider({ titleId }: { titleId: string }) {
  const stageRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const drag = useRef({ id: -1, x: 0, y: 0, on: false, dx: 0 });
  /* גרירה שהסתיימה על כרטיס היא לא לחיצה - נצרך פעם אחת */
  const swallowClick = useRef(false);
  const wheel = useRef({ acc: 0, until: 0 });

  const go = (d: number) => {
    /* נגן שנשאר פתוח מחוץ לבמה ממשיך להשמיע קול. עוזבים - סוגרים */
    setOpenIndex(null);
    setActive((a) => (a + d + N) % N);
  };

  const setDrag = (px: number) =>
    stageRef.current?.style.setProperty("--drag", `${px}px`);

  const onPointerDown = (e: React.PointerEvent) => {
    /* ⚠️ גרירה עם pointer capture לא תמיד מייצרת click על הכרטיס,
       ואז הדגל נשאר דולק ובולע את הלחיצה האמיתית הבאה. כל מחווה
       חדשה מתחילה נקי. */
    swallowClick.current = false;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, dx: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.on) {
      /* אנכי = גלילת העמוד. לא לוקחים אותו */
      if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(dy)) return;
      d.on = true;
      stageRef.current?.classList.add("vslider--drag");
      stageRef.current?.setPointerCapture(e.pointerId);
    }
    d.dx = dx;
    setDrag(dx);
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = -1;
    if (!d.on) return;
    const stage = stageRef.current;
    stage?.classList.remove("vslider--drag");
    if (stage?.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    setDrag(0);
    swallowClick.current = true;
    /* האצבע זזה ימינה = הבא, כי ב-RTL הבא יושב משמאל ונמשך פנימה */
    if (Math.abs(d.dx) >= SWIPE_MIN) go(d.dx > 0 ? 1 : -1);
  };

  /* גלגלת/משטח מגע אופקי בלבד. אנכי ממשיך לגלול את העמוד */
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const w = wheel.current;
    if (e.timeStamp < w.until) return;
    w.acc += e.deltaX;
    if (Math.abs(w.acc) > 60) {
      go(w.acc > 0 ? 1 : -1);
      w.acc = 0;
      /* תנופה של משטח מגע שולחת עוד אירועים - צעד אחד לכל מחווה */
      w.until = e.timeStamp + 600;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(1);
    else if (e.key === "ArrowRight") go(-1);
  };

  /* ניקוי משתנה הגרירה אם הרכיב יוצא באמצע מחווה */
  useEffect(() => () => setDrag(0), []);

  if (N === 0) return null;

  return (
    <>
      <div className="tvideos__head">
        <h2 className="tvideos__title" id={titleId}>
          {videosSection.title}
        </h2>
        {/* ⚠️ ב-RTL "הקודם" מימין, ולכן החץ שלו מצביע ימינה.
            בלי מצב מושבת: המעגל אין לו קצה. */}
        <div className="vnav">
          <button type="button" className="vnav__btn" onClick={() => go(-1)} aria-label="הסרטון הקודם">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="vnav__btn" onClick={() => go(1)} aria-label="הסרטון הבא">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <ul
        className="vslider"
        ref={stageRef}
        aria-roledescription="carousel"
        aria-label={videosSection.title}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      >
        {clientVideos.map((v, i) => {
          const k = kOf(i, active);
          const far = Math.abs(k) > HIDE;
          const scale = 1 - Math.min(Math.abs(k), SHRINK_MAX) * SHRINK;
          return (
            <li
              key={v.id}
              className={`vcard${k === 0 ? " vcard--active" : ""}${far ? " vcard--far" : ""}`}
              style={{ "--k": k, "--s": scale } as React.CSSProperties}
              /* רק הבמה והשכנים הקרובים אמיתיים לקורא מסך */
              aria-hidden={Math.abs(k) > 1 || undefined}
            >
              {openIndex === i && k === 0 ? (
                <iframe
                  className="vcard__frame"
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
                  title={v.alt}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="vcard__btn"
                  tabIndex={Math.abs(k) > 1 ? -1 : undefined}
                  onClick={() => {
                    if (swallowClick.current) {
                      swallowClick.current = false;
                      return;
                    }
                    /* כרטיס בצד - קודם מביאים אותו לבמה, ורק בלחיצה עליו שם נפתח */
                    if (k !== 0) {
                      setOpenIndex(null);
                      setActive(i);
                      return;
                    }
                    setOpenIndex(i);
                  }}
                  aria-label={`${videosSection.playLabel}: ${v.alt}`}
                >
                  <Image
                    src={`/images/testimonials/video/${v.id}.webp`}
                    alt={v.alt}
                    width={v.w}
                    height={v.h}
                    className="vcard__poster"
                    sizes="(max-width: 700px) 68vw, 320px"
                    /* הבמה והשכנים נטענים מראש - שלא יופיע כרטיס ריק בהגעה */
                    loading={far ? "lazy" : "eager"}
                    draggable={false}
                  />
                  <span className="vcard__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72L19 12z" />
                    </svg>
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
