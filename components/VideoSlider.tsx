"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clientVideos, videosSection } from "@/lib/videos";

/**
 * סליידר סרטוני הלקוחות - כל סרטון מקבל את הבמה שלו.
 *
 * ⚠️ **רצף אינסופי, ולא רשימה עם התחלה וסוף.** הגרסה הראשונה
 * הייתה רשימה לינארית ודניאל עלה על שתי בעיות שנובעות מאותו
 * מקום: מימין לסרטון הראשון לא היה **כלום** (ריפוד המירכוז
 * חשוף), והסליידר "נתקע" בקצה כשהחץ הושבת. שלושת העותקים
 * מוחקים את שתיהן - תמיד יש כרטיסים משני הצדדים, והחצים
 * לעולם לא נגמרים.
 *
 * ⚠️ **וגם גרירה בעכבר, וזה תיקון ולא נוחות.** גוללן אופקי לא
 * מגיב לגלגלת אנכית, ובדסקטופ בלי גרירה הדרך **היחידה** להזיז
 * אותו הייתה החצים. זה מה שנקרא "נתקע".
 *
 * ⚠️ **הנגן נטען רק בלחיצה.** מה שנטען בהתחלה הוא סטילס ששמור
 * אצלנו; youtube-nocookie נכנס רק כשהמבקר בחר לצפות, ועד אז
 * לגוגל אין שום מגע איתו. סרטון אחד פתוח בכל רגע.
 */

/* ⚠️ שלושה עותקים ולא שניים: הנורמליזציה קופצת עותק שלם, וצריך
   עותק שלם **משני הצדדים** של האמצעי כדי שהקפיצה לא תיראה. */
const COPIES = 3;
/* כמה מתכווץ כל צעד מהמרכז, ואיפה זה נעצר */
const SHRINK = 0.09;
const SHRINK_MAX = 2.5;

const N = clientVideos.length;

/** מרכז האלמנט בפיקסלים של המסך */
const midOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
};

export default function VideoSlider({ titleId }: { titleId: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  /* אינדקס שטוח ברשימה המשולשת. null = כולם סגורים */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [active, setActive] = useState(N);

  const anim = useRef(0);
  const idle = useRef(0);
  /* ננעל בזמן אנימציה או גרירה - אסור לנרמל באמצע תנועה */
  const busy = useRef(false);
  const openRef = useRef<number | null>(null);
  openRef.current = openIndex;

  /**
   * מחשב מחדש את הסקייל של כל כרטיס ומחזיר את מי שבמרכז.
   *
   * ⚠️ הסקייל נכתב כ-inline style **בלי transition ב-CSS**. הוא
   * מחושב בכל פריים של גלילה, וכך עוקב אחרי האצבע בדיוק;
   * transition היה גורם לו לרדוף אחריה בפיגור קבוע.
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
    return nearest;
  }, []);

  /**
   * מחזיר את הגלילה לעותק האמצעי, בלי שרואים.
   *
   * ⚠️ **הקפיצה היא scrollBy עם דלתא של מרכזים, ולא השמה
   * ל-scrollLeft.** ב-RTL כרום מחזיר scrollLeft שלילי ופיירפוקס
   * וספארי לא מסכימים איתו על אפס, ולכן כל חשבון על הערך עצמו
   * שביר. דלתא בין שני מרכזים היא פיזית ונכונה בכל דפדפן.
   *
   * ⛔ לא נוגעים כשמשהו בתנועה או כשנגן פתוח: קפיצה באמצע
   * אנימציה נראית, וקפיצה עם נגן פתוח מזיזה אותו מהבמה.
   */
  const normalize = useCallback(() => {
    const track = trackRef.current;
    if (!track || busy.current || openRef.current !== null) return;

    const cards = Array.from(track.children);
    const nearest = update();
    if (nearest === undefined) return;
    if (nearest >= N && nearest < N * 2) return;

    const target = N + (nearest % N);
    track.scrollBy({
      left: midOf(cards[target]) - midOf(cards[nearest]),
      behavior: "auto",
    });
    update();
  }, [update]);

  /** מביא כרטיס למרכז הבמה */
  const goTo = useCallback(
    (index: number, instant = false) => {
      const track = trackRef.current;
      if (!track) return;

      const cards = track.children;
      const card = cards[Math.max(0, Math.min(cards.length - 1, index))];
      if (!card) return;

      const delta = midOf(card) - midOf(track);
      window.cancelAnimationFrame(anim.current);

      /* ⚠️ prefers-reduced-motion נבדק כאן ב-JS ולא נסמך על
         ה-CSS: הכלל הגלובלי מכבה משכי אנימציה, והלולאה הזאת
         היא JS ולא תיתפס בו. */
      if (
        instant ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        track.scrollBy({ left: delta, behavior: "auto" });
        update();
        return;
      }

      /* ⚠️ **אנימציה ידנית ולא scrollBy({behavior:"smooth"}).**
         הנייטיבי נשען על הגדרה שאפשר לכבות, ואז החץ פשוט לא זז
         בלי שגיאה ובלי סימן. לולאת rAF עובדת תמיד, וגם נותנת
         את אותו ה-ease-out של SmoothScroll.

         ⚠️ ה-snap מושהה למשך הלולאה: כל פריים כותב scrollLeft,
         ו-mandatory היה מצמיד בחזרה באמצע. */
      const from = track.scrollLeft;
      const t0 = performance.now();
      busy.current = true;
      track.classList.add("vslider--free");

      const tick = (now: number) => {
        const p = Math.min((now - t0) / 480, 1);
        track.scrollLeft = from + delta * (1 - Math.pow(1 - p, 3));
        if (p < 1) {
          anim.current = window.requestAnimationFrame(tick);
        } else {
          track.classList.remove("vslider--free");
          busy.current = false;
          normalize();
        }
      };
      anim.current = window.requestAnimationFrame(tick);
    },
    [update, normalize],
  );

  /* מתמקמים על הסרטון הראשון של העותק האמצעי.
     ⚠️ זה מה שנותן את הרצף: מימין יושב הזנב של העותק הקודם.
     ⚠️ **ישירות ולא בתוך requestAnimationFrame.** העטיפה ב-rAF
     הייתה הבאג: בלשונית שלא מצוירת הדפדפן מרעיב פריימים,
     המיקום ההתחלתי לא קרה, והסליידר נשאר על כרטיס 0 - כלומר
     שוב בלי כלום מימין. ה-effect רץ אחרי הפריסה ממילא, ולכן
     ה-rect כבר תקף כאן. */
  useEffect(() => {
    goTo(N, true);
  }, [goTo]);

  /* גלילה ושינוי גודל - מחשבים מחדש, ומנרמלים כשנעצרים */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const onScroll = () => {
      window.clearTimeout(idle.current);
      /* ⚠️ מנרמלים רק כשהגלילה נחה. באמצע תנופה הקפיצה נראית. */
      idle.current = window.setTimeout(normalize, 140);
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(anim.current);
      window.clearTimeout(idle.current);
    };
  }, [update, normalize]);

  /**
   * גרירה בעכבר.
   *
   * ⚠️ **רק עכבר.** במגע הגלילה הנייטיבית עושה את זה טוב יותר
   * מכל חיקוי, ולעקוף אותה רק היה מקלקל את התנופה.
   */
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!track || e.pointerType !== "mouse") return;

    window.cancelAnimationFrame(anim.current);
    drag.current = {
      on: true,
      x: e.clientX,
      left: track.scrollLeft,
      moved: false,
    };
    busy.current = true;
    track.classList.add("vslider--drag");
    track.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current.on) return;

    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    /* גרירה ימינה מזיזה את התוכן ימינה, כלומר scrollLeft קטן.
       נכון גם ב-LTR וגם ב-RTL - הסמנטיקה של scrollLeft זהה. */
    track.scrollLeft = drag.current.left - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current.on) return;

    drag.current.on = false;
    busy.current = false;
    track.classList.remove("vslider--drag");
    if (track.hasPointerCapture(e.pointerId))
      track.releasePointerCapture(e.pointerId);

    /* מתיישבים על הכרטיס הקרוב, והאנימציה מנרמלת בסופה */
    const nearest = update();
    if (nearest !== undefined) goTo(nearest);
  };

  if (N === 0) return null;

  /* שלושת העותקים. ⚠️ רק האמצעי אמיתי לקורא מסך - השניים
     האחרים הם אותו תוכן בדיוק, והקראתו שלוש פעמים היא רעש. */
  const slides = Array.from({ length: COPIES * N }, (_, flat) => ({
    v: clientVideos[flat % N],
    flat,
    clone: flat < N || flat >= N * 2,
  }));

  return (
    <>
      <div className="tvideos__head">
        <h2 className="tvideos__title" id={titleId}>
          {videosSection.title}
        </h2>
        {/* ⚠️ ב-RTL "הקודם" נמצא מימין, ולכן החץ שלו מצביע ימינה.
            ⚠️ ובלי מצב מושבת: הרשימה מעגלית ואין לה קצה. הקצה
            הוא בדיוק מה שנתן את תחושת ה"נתקע". */}
        <div className="vnav">
          <button
            type="button"
            className="vnav__btn"
            onClick={() => goTo(active - 1)}
            aria-label="הסרטון הקודם"
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
        /* Lenis מנהל את גלגלת העכבר של הדף. בלי זה הוא בולע גם
           את הגלילה האופקית כאן. */
        data-lenis-prevent
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {slides.map(({ v, flat, clone }) => (
          <li
            className={`vcard${flat === active ? " vcard--active" : ""}`}
            key={flat}
            aria-hidden={clone || undefined}
          >
            {openIndex === flat ? (
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
                tabIndex={clone ? -1 : undefined}
                onClick={() => {
                  /* גרירה שהסתיימה על כרטיס היא לא לחיצה */
                  if (drag.current.moved) return;
                  setOpenIndex(flat);
                  goTo(flat);
                }}
                aria-label={`${videosSection.playLabel}: ${v.alt}`}
              >
                <Image
                  src={`/images/testimonials/video/${v.id}.webp`}
                  alt={clone ? "" : v.alt}
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
