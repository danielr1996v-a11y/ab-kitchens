"use client";

import { useEffect } from "react";
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
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReduced || isTouch) return;

    return init();
  }, []);

  return null;
}

function init() {
    const lenis = new Lenis({
      duration: 1.15, // משך ההאטה - גבוה מדי מרגיש כבד
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // ease-out עדין
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
}
