/**
 * JSON-LD בטוח לתוך <script> - שלב 9 (בדיקת אבטחה).
 *
 * ⚠️ JSON.stringify לא מקודד "<". המלצה או שאלה שנערכה במערכת ומכילה
 * "</script>" הייתה סוגרת את התגית ומריצה קוד באתר (XSS). כל "<"
 * הופך ל-< - אותו ערך בדיוק בעיני גוגל, ובלי דרך לצאת מהסקריפט.
 */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
