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
export const client = isConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      stega: { studioUrl: "/studio" },
    })
  : null;
