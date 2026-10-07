"use client";

import { useEffect, useRef } from "react";

/**
 * ביקורות גוגל חיות - הווידג'ט של Trustindex.
 *
 * ⚠️ **בחירה של דניאל (7.10):** ווידג'ט מוכן שנראה כמו גוגל,
 * מציג את כל הביקורות ומתעדכן לבד - במקום רשימה קבועה שצריך
 * לעדכן ביד.
 *
 * ⚠️ **למה הסקריפט מוזרק ידנית ולא דרך next/script.** הטוען של
 * Trustindex מצייר את הווידג'ט **במקום שבו תג הסקריפט יושב**.
 * next/script מוסיף את התג לסוף ה-body, ואז הווידג'ט היה מופיע
 * בתחתית העמוד ולא כאן. לכן התג נכנס לתוך ה-div הזה בלבד.
 *
 * ⚠️ **בלי מזהה - מוצג ה-fallback** (6 הביקורות שנקראו ידנית).
 * כך הסקשן אף פעם לא ריק, גם לפני שהחשבון נפתח.
 */
export default function GoogleReviewsWidget({
  widgetId,
  children,
}: {
  /** המזהה מקוד ההטמעה: loader.js?<המזהה> */
  widgetId: string;
  /** מה שמוצג כשאין מזהה */
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!widgetId || !el || el.querySelector("script")) return;
    const s = document.createElement("script");
    s.src = `https://cdn.trustindex.io/loader.js?${widgetId}`;
    s.defer = true;
    s.async = true;
    el.appendChild(s);
  }, [widgetId]);

  if (!widgetId) return <>{children}</>;

  return (
    <section className="greviews" aria-label="ביקורות בגוגל">
      <div className="greviews__inner" ref={box} />
    </section>
  );
}
