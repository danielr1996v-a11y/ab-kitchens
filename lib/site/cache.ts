import { unstable_cache } from "next/cache";

/**
 * מטמון לשאילתות מהמסד - עם חריג אחד: **בזמן build קוראים ישר.**
 *
 * ⚠️ נמצא בשלב 9: unstable_cache שומר תוצאות ב-.next/cache, ו-Vercel
 * משמר את התיקייה בין בניות. build חדש קיבל נתונים מבנייה קודמת -
 * נמדד: כתובת מאמר מבדיקה שבוטלה לפני יומיים חזרה לרשימת העמודים.
 * בזמן ריצה המטמון נשאר, ומתרוקן בכל פרסום (lib/site/revalidate.ts).
 */
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string[], tags: string[]) {
  const c = unstable_cache(fn, key, { tags });
  return (...args: A): Promise<R> => (process.env.NEXT_PHASE === "phase-production-build" ? fn(...args) : c(...args));
}
