"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clientVideos, videosSection } from "@/lib/videos";

/**
 * סליידר סרטוני הלקוחות - כל סרטון מקבל את הבמה שלו.
 *
 * ⚠️ **החליף את הגריד (`columns: 4`).** בגריד 11 הפוסטרים היו
 * באותו משקל בדיוק ואף אחד לא קיבל מבט. כאן הכרטיס שבמרכז
 * בגודל מלא והשכנים מתכווצים - היררכיה במקום רשימה.
 *
 * ⚠️ **הנגן נטען רק בלחיצה, וזה לא השתנה.** 11 iframe של
 * יוטיוב בעמוד אחד מושכים מגה-בייטים של סקריפטים. מה שנטען
 * בהתחלה הוא סטילס ששמור אצלנו; `youtube-nocookie` נכנס רק
 * כשהמבקר בחר לצפות, ועד אז לגוגל אין שום מגע איתו.
 *
 * ⚠️ **סרטון אחד פתוח בכל רגע.** קודם זה היה `Set` וכמה יכלו
 * לרוץ במקביל. בסליידר שמציג במה אחת זה חסר טעם, ושני נגני
 * יוטיוב פתוחים גם מתנגנים זה על זה.
 *
 * ⚠️ **אין ספריית קרוסלה.** גוללן אופקי נייטיבי עם scroll-snap:
 * החלקה באצבע, גרירה וגלגלת עובדות מעצמן, והחצים רק גוללים
 * אותו.
 */

/* כמה מתכווץ כל צעד מהמרכז, ואיפה זה נעצר.
   0.09 ו-2.5 = הכרטיס הרחוק יורד ל-0.775 ולא נעלם. */
const SHRINK = 0.09;
const SHRINK_MAX = 2.5;

/** מרכז האלמנט בפיקסלים של המסך */
const midOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
};

export default function VideoSlider({ titleId }: { titleId: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  /* מזהה הסרטון הפתוח. null = כולם סגורים */
  const [openId, setOpenId] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  /* מזהה פריים האנימציה של החצים. ראה את ההערה ב-goTo */
  const anim = useRef(0);

  /**
   * מחשב מחדש את הסקייל של כל כרטיס ואת מי שבמרכז.
   *
   * ⚠️ הסקייל נכתב כ-inline style ולא כמחלקה, **ובלי transition
   * ב-CSS**. זו לא עצלנות: הוא מחושב בכל פריים של גלילה, וכך
   * הוא עוקב אחרי האצבע בדיוק. transition היה גורם לו לרדוף
   * אחרי הגלילה בפיגור קבוע.
   */
  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.children) as HTMLElement[];
    if (cards.length === 0) return;

    const center = midOf(track);
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = cards[0].offsetWidth + gap;

    let nearest = 0;
    let nearestDist = Infinity;

    cards.forEach((card, i) => {
      const dist = Math.abs(midOf(card) - center);
      const t = Math.min(dist / step, SHRINK_MAX);
      card.style.transform = `scale(${(1 - t * SHRINK).toFixed(3)})`;

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });

    setActive(nearest);
  }, []);

  /** מביא כרטיס למרכז הבמה */
  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = track.children;
    const i = Math.max(0, Math.min(cards.length - 1, index));
    const card = cards[i];
    if (!card) return;

    /* ⚠️ דלתא מ-getBoundingClientRect ולא חישוב על scrollLeft.
       ב-RTL כרום מחזיר scrollLeft שלילי, ופיירפוקס וספארי לא
       מסכימים איתו על אפס. דלתא של מרכזים היא פיזית ונכונה
       בכל דפדפן ובכל כיוון. */
    const delta = midOf(card) - midOf(track);

    window.cancelAnimationFrame(anim.current);

    /* ⚠️ prefers-reduced-motion נבדק כאן ב-JS ולא נסמך על
       ה-CSS: הכלל הגלובלי מכבה משכי אנימציה, והלולאה הזאת
       היא JS ולא תיתפס בו. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.scrollLeft += delta;
      return;
    }

    /* ⚠️ **אנימציה ידנית ולא scrollBy({behavior:"smooth"}).**
       הדפדפן הנייטיבי היה הבחירה הראשונה, אבל הוא נשען על
       הגדרה שאפשר לכבות (כרום אוטומטי, מערכות ישנות, דגלים),
       ואז החץ פשוט לא זז - בלי שגיאה ובלי סימן. לולאת rAF
       עובדת תמיד, וגם נותנת לנו את אותו ה-ease-out של Lenis
       כך שהתנועה באתר מרגישה אותו דבר.

       ⚠️ ה-snap מושהה למשך הלולאה: כל פריים כותב scrollLeft,
       ו-mandatory היה מצמיד בחזרה באמצע. */
    const from = track.scrollLeft;
    const t0 = performance.now();
    track.classList.add("vslider--free");

    const tick = (now: number) => {
      const p = Math.min((now - t0) / 480, 1);
      /* ease-out cubic - זהה לעקומה של SmoothScroll */
      track.scrollLeft = from + delta * (1 - Math.pow(1 - p, 3));
      if (p < 1) {
        anim.current = window.requestAnimationFrame(tick);
      } else {
        track.classList.remove("vslider--free");
      }
    };
    anim.current = window.requestAnimationFrame(tick);
  }, []);

  /* גלילה ושינוי גודל - שניהם רק מחשבים מחדש */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    /* הפעלה ראשונה: בלעדיה כל הכרטיסים נפתחים בגודל מלא */
    update();

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(anim.current);
    };
  }, [update]);

  if (clientVideos.length === 0) return null;

  const last = clientVideos.length - 1;

  return (
    <>
      {/* ⚠️ הכותרת כאן ולא בעמוד: החצים חולקים state עם המסלול
          וחייבים לשבת בשורה שלה. */}
      <div className="tvideos__head">
        <h2 className="tvideos__title" id={titleId}>
          {videosSection.title}
        </h2>
        <div className="vnav">
          {/* ⚠️ ב-RTL "הקודם" נמצא מימין, ולכן החץ שלו מצביע ימינה.
            סדר ה-DOM הוא קודם→הבא, וה-flex של הדף הופך אותו כך
            שהחץ שמאלה יושב בקצה שמאל. */}
          <button
            type="button"
            className="vnav__btn"
            onClick={() => goTo(active - 1)}
            aria-label="הסרטון הקודם"
            /* ⚠️ aria-disabled ולא disabled: כפתור מושבת יוצא
             מסדר הטאבים ונעלם למשתמש מקלדת באמצע הסריקה. */
            aria-disabled={active === 0 || undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="vnav__btn"
            onClick={() => goTo(active + 1)}
            aria-label="הסרטון הבא"
            aria-disabled={active === last || undefined}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <ul
        className="vslider"
        ref={trackRef}
        aria-roledescription="carousel"
        aria-label={videosSection.title}
        /* Lenis מנהל את גלגלת העכבר של הדף. בלי זה הוא בולע
           גם את הגלילה האופקית כאן. */
        data-lenis-prevent
      >
        {clientVideos.map((v, i) => (
          <li
            className={`vcard${i === active ? " vcard--active" : ""}`}
            key={v.id}
          >
            {openId === v.id ? (
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
                onClick={() => {
                  setOpenId(v.id);
                  /* סרטון שנפתח מהצד עולה קודם לבמה */
                  goTo(i);
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
                />
                <span className="vcard__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72L19 12z" />
                  </svg>
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
