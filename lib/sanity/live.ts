import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { isConfigured } from "@/sanity/env";

/**
 * העדכון החי - הלב של "שינוי מופיע תוך שניות בלי בנייה".
 *
 * defineLive מחזיר שניים:
 * - sanityFetch: שאילתה שהתוצאה שלה מתעדכנת כשהתוכן משתנה
 * - SanityLive: קומפוננטה שיושבת ב-layout ומחזיקה את החיבור
 *
 * הטוקן הוא סוד שרת (בלי NEXT_PUBLIC). דניאל מזין אותו בעצמו
 * ל-.env.local ולוורסל - הוא לא עובר דרכי ולא נכנס לריפו.
 *
 * כשאין חיבור (לפני שהחשבון קיים) המודול מייצא null-ים, והאתר
 * ממשיך לרוץ מ-lib/content.ts. הבדיקה הזו היא מה ששומר על בילד
 * ירוק בלי env.
 */
const token = process.env.SANITY_API_TOKEN;

export const { sanityFetch, SanityLive } = isConfigured && client
  ? defineLive({
      client,
      serverToken: token,
      browserToken: token,
    })
  : { sanityFetch: null, SanityLive: null };
