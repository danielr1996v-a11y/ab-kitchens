/**
 * Placeholder - סקשן שממתין לתוכן מהלקוח.
 *
 * ⛔ **לא מוצג ב-production.** אותו מנגנון של DevInspector
 * (components/DevInspector.tsx:170). הוחלט עם דניאל: אברהם לא
 * רואה "בקרוב" באתר שמשותף איתו - אתר חצי בנוי נקרא גרוע יותר
 * מאתר שבו הסקשן פשוט עוד לא קיים.
 *
 * ⚠️ המשמעות המעשית: גם **תצוגת הלקוח ב-Vercel** בנויה כ-
 * production, ולכן כדי לראות את החריצים צריך `npm run dev`.
 *
 * למה רכיב אחד ולא ארבעה סקשנים: ארבעה מקומות מחכים לתוכן
 * (זוויות בקלאסי, פרויקטים בשיש, ממליצים חיצוניים, סרטון
 * המלצה). דפוס אחד = מחיקה אחת כשהתוכן מגיע.
 *
 * ⚠️ **חוק 6 של הפרויקט: בלי קוד מת.** ברגע שתוכן נכנס למקום
 * מסוים - למחוק את הקריאה, לא להשאיר אותה "למקרה שיהיה עוד".
 */
export default function Placeholder({
  title,
  slots = 3,
  note,
  ratio = "4 / 3",
}: {
  /** כותרת הסקשן כפי שתופיע כשהתוכן ייכנס */
  title: string;
  /** כמה חריצים לצייר */
  slots?: number;
  /** מה בדיוק חסר, בשפה של דניאל - זו תזכורת לו, לא ללקוח */
  note: string;
  /** יחס החריץ. סרטון מקבל 16/9, תמונות 4/3 */
  ratio?: string;
}) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <section className="phold" aria-label={`${title} - ממתין לתוכן`}>
      <div className="phold__head">
        <h2 className="phold__title">{title}</h2>
        <p className="phold__note">{note}</p>
      </div>
      <ul className="phold__grid">
        {Array.from({ length: slots }).map((_, i) => (
          <li
            className="phold__slot"
            key={i}
            style={{ aspectRatio: ratio }}
          >
            <span className="phold__num">{i + 1}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
