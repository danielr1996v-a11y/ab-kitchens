/**
 * הגדרות הסביבה של Sanity.
 *
 * projectId מגיע ממשתנה סביבה ולא מהקוד, כדי שהריפו יישאר נקי
 * מזהויות. עד שדניאל יוצר את הפרויקט ב-sanity.io ומזין את הערכים,
 * isConfigured=false וכל האתר ממשיך לרוץ מ-lib/content.ts כרגיל -
 * הבילד ירוק גם בלי חשבון.
 *
 * NEXT_PUBLIC_ כי ה-Studio רץ בדפדפן וצריך את הערכים שם.
 * ה-API token לעומת זאת הוא סוד שרת בלבד (SANITY_API_TOKEN,
 * בלי NEXT_PUBLIC) - משמש רק את סקריפט המיגרציה ואת מצב הטיוטה.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/** נעוץ לתאריך כדי שהתנהגות ה-API לא תשתנה מתחתינו */
export const apiVersion = "2026-08-01";

/** האם יש חיבור אמיתי - כל קוד Sanity בודק את זה לפני שהוא רץ */
export const isConfigured = projectId.length > 0;
