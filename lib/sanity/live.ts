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
/* טוקן אמיתי הוא ארוך מאוד. הבדיקה מסננת את ה-placeholder ("...")
   שיושב ב-.env.local עד שדניאל מדביק את האמיתי - עדיף בלי טוקן
   (עובד לתוכן ציבורי) מאשר עם טוקן שבור. */
const raw = process.env.SANITY_API_TOKEN;
const token = raw && raw.length > 20 ? raw : undefined;

export const { sanityFetch, SanityLive } = isConfigured && client
  ? defineLive({
      client,
      serverToken: token,
      /* לעולם לא הטוקן: browserToken נשלח לדפדפן של כל גולש.
         טוקן Editor כאן היה מאפשר לכל אחד לערוך את האתר.
         false = תצוגת טיוטה חיה עובדת רק דרך ה-Studio - מספיק. */
      browserToken: false,
    })
  : { sanityFetch: null, SanityLive: null };
