/**
 * סימון רכיב נעול ב-HTML, כדי שייבוא העמודים (lib/admin/pageImport.ts)
 * יזהה אותו ויחליף אותו ב-widget בעץ.
 *
 * ⚠️ זמני - שלב 5ב. אחרי שכל העמודים יובאו, הסימונים יוסרו מכל
 * הרכיבים יחד עם הקובץ הזה (ADMIN-SPEC §9, שלב 10). הם לא משפיעים
 * על המראה - רק שני מאפייני data ב-HTML.
 *
 * props: רק מה שאי אפשר לשחזר אחרת (תוכן שהגיע מ-Sanity, הגדרות
 * תצוגה). נתונים מהמסד לא נכנסים - ה-widget טוען אותם בעצמו.
 */
export const widgetMarker = (name: string, props?: Record<string, unknown>) => ({
  "data-widget": name,
  ...(props ? { "data-props": JSON.stringify(props) } : {}),
});
