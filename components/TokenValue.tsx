"use client";

import { useSyncExternalStore } from "react";

/**
 * הערך החי של משתנה CSS, כפי שהדפדפן רואה אותו.
 *
 * ⚠️ נקרא מהדפדפן ולא כתוב בקוד: כך עמוד הדוגמה תמיד מראה את
 * מה שבאמת ב-globals.css, גם אחרי שמשנים אותו.
 * useSyncExternalStore ולא useEffect+useState: הערך נקרא בזמן
 * הרינדור בדפדפן, בלי רינדור כפול. בשרת אין CSS, ולכן "…".
 */
const noop = () => () => {};

export default function TokenValue({ name }: { name: string }) {
  const value = useSyncExternalStore(
    noop,
    () =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    () => "",
  );
  return (
    <code className="sg__value" dir="ltr">
      {value || "…"}
    </code>
  );
}
