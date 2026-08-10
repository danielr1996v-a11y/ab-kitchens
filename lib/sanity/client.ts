import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, isConfigured } from "@/sanity/env";

/**
 * הלקוח של Sanity.
 *
 * useCdn=false כי אנחנו על defineLive - העדכון החי מקבל את התוכן
 * הטרי ישירות, וה-CDN רק היה מוסיף שכבת השהיה.
 *
 * כשאין projectId (isConfigured=false) הלקוח לא אמור להישלח לשום
 * קריאה - lib/content.ts ממשיך לשרת את האתר. הבדיקה נעשית אצל
 * הקוראים, לא כאן, כדי שהמודול ייטען בלי לזרוק גם בלי env.
 */
/**
 * הטוקן נטען כאן ולא רק ב-defineLive: הדאטהסט חסום לקריאה
 * אנונימית, ובלי טוקן על הלקוח עצמו כל שאילתה חוזרת ריקה.
 *
 * SANITY_API_TOKEN הוא בלי NEXT_PUBLIC, ולכן Next לא מכניס אותו
 * לחבילת הדפדפן - בצד הלקוח הערך פשוט undefined. הוא נשאר בשרת.
 */
const raw = process.env.SANITY_API_TOKEN;
const token = raw && raw.length > 20 ? raw : undefined;

export const client = isConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
      stega: { studioUrl: "/studio" },
    })
  : null;
