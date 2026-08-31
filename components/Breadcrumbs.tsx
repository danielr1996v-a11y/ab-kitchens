import Link from "next/link";

const BASE = "https://www.ab-kitchens.co.il";

export type Crumb = {
  label: string;
  /** נתיב פנימי בעברית. חסר = הפריט הנוכחי, שאינו קישור */
  href?: string;
};

/**
 * Breadcrumbs - נתיב ניווט, גלוי ומסומן לגוגל.
 *
 * ⚠️ שני הפלטים נגזרים מ**אותו מערך**. זו לא קפדנות: גוגל
 * פוסל סימון BreadcrumbList שאינו תואם למה שהמשתמש רואה
 * בעמוד, ושני מקורות נפרדים היו נפרדים זה מזה בעדכון הראשון.
 *
 * ⚠️ פריט ביניים חייב href אמיתי. אין להכניס לכאן את "מטבחים" -
 * הוא פותח תפריט בלבד ואין מאחוריו עמוד, וקישור שבור בסימון
 * גרוע מהיעדר סימון.
 *
 * הכתובות בסימון מוחלטות, כי גוגל דורש URL מלא.
 * הקידוד דרך encodeURI - הנתיבים בעברית.
 *
 * server component - אין מצב, רק תצוגה.
 */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: BASE + encodeURI(c.href) } : {}),
    })),
  };

  return (
    <nav className="crumbs" aria-label="מיקומך באתר">
      <ol className="crumbs__list">
        {trail.map((c, i) => (
          <li className="crumbs__item" key={c.label}>
            {c.href ? (
              <Link href={c.href} className="crumbs__link">
                {c.label}
              </Link>
            ) : (
              /* הפריט הנוכחי. aria-current מודיע לקוראי מסך
                 שזו כתובת העמוד הנוכחי ולא יעד לניווט. */
              <span className="crumbs__current" aria-current="page">
                {c.label}
              </span>
            )}
            {i < trail.length - 1 && (
              <span className="crumbs__sep" aria-hidden="true">
                ›
              </span>
            )}
          </li>
        ))}
      </ol>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </nav>
  );
}
