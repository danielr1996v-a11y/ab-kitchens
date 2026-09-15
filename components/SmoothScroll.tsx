"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * SmoothScroll - גלילה חלקה עם אינרציה עדינה, בכל האתר.
 *
 * מוגבל בכוונה:
 * - דסקטופ בלבד. במובייל הגלילה הטבעית של המערכת טובה יותר מכל חיקוי,
 *   ולכן שם לא מפעילים כלום.
 * - מכובה למי שהגדיר "הפחת תנועה" במערכת ההפעלה.
 *
 * הכיול מתון במכוון: חלק ומורגש, אבל לא "צף" ולא מעכב את המשתמש.
 * Lenis שומר על הגלילה המקורית של הדפדפן, ולכן position: sticky,
 * קישורי עוגן, מקלדת וגרירת סרגל הגלילה ממשיכים לעבוד כרגיל.
 */

/* ⚠️ מופע יחיד ברמת המודול. נחוץ כדי שאפשר יהיה לאפס את
   הגלילה מ-effect אחר, בלי להרוס ולבנות את Lenis מחדש בכל
   מעבר עמוד - בנייה מחדש הייתה קוטעת את התנופה. */
let lenisInstance: Lenis | null = null;

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReduced || isTouch) return;

    return init();
  }, []);

  /* ⚠️ איפוס הגלילה במעבר בין עמודים.
     Lenis מחזיק מצב גלילה פנימי משלו, ולכן כשהניווט של Next
     מחליף עמוד המצב הזה **לא מתאפס** והעמוד החדש נפתח בגובה
     של הקודם. במובייל זה נראה תקין רק מפני ש-Lenis לא רץ שם
     בכלל, ולכן האיפוס הידני נחוץ גם בלעדיו.

     עוגנים פנימיים לא מושפעים - שם ה-pathname לא משתנה. */
  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function init() {
    const lenis = new Lenis({
      duration: 1.15, // משך ההאטה - גבוה מדי מרגיש כבד
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // ease-out עדין
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisInstance = lenis;

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisInstance = null;
    };
}
