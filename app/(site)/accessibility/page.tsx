import type { Metadata } from "next";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "הצהרת נגישות | א. בית המטבחים",
  description: "הצהרת הנגישות של אתר א. בית המטבחים.",
  alternates: { canonical: "/הצהרת-נגישות" },
};

export default function Page() {
  return (
    <section className="section-block legal">
      <h1 className="page-title">הצהרת נגישות</h1>

      <p className="legal__intro">
        א. בית המטבחים רואה חשיבות רבה במתן שירות שוויוני לכלל הלקוחות, ופועלת
        להנגשת האתר בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות
        לשירות), התשע&quot;ג-2013, ולתקן הישראלי 5568 המבוסס על הנחיות WCAG 2.0
        ברמה AA.
      </p>

      <h2 className="legal__heading">מה הונגש באתר</h2>
      <ul className="legal__list">
        <li>מבנה סמנטי תקין עם היררכיית כותרות ברורה.</li>
        <li>ניווט מלא באמצעות מקלדת, כולל סימון ברור של הפוקוס.</li>
        <li>טקסט חלופי לתמונות בעלות משמעות.</li>
        <li>תמיכה בהגדלת טקסט ללא פגיעה בפריסה.</li>
        <li>כיבוד העדפת המערכת להפחתת תנועה ואנימציות.</li>
        <li>ניגודיות צבעים מספקת בין טקסט לרקע.</li>
      </ul>

      <h2 className="legal__heading">הסתייגויות</h2>
      <p className="legal__text">
        חלקים מסוימים באתר עשויים שלא להיות נגישים במלואם, במיוחד תכנים
        המוטמעים מגורמי צד שלישי שאינם בשליטתנו. אנו פועלים לשיפור מתמיד של
        הנגישות באתר.
      </p>

      <h2 className="legal__heading">רכז הנגישות</h2>
      <p className="legal__text">
        נתקלתם בבעיית נגישות? נשמח לשמוע ולתקן. ניתן לפנות אלינו:
      </p>
      <ul className="legal__list">
        <li>
          טלפון: <a href={`tel:${site.phone1.replace(/-/g, "")}`}>{site.phone1}</a>
        </li>
        <li>
          דוא&quot;ל: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        <li>כתובת: {site.address}</li>
      </ul>

      <p className="legal__note">
        הצהרה זו עודכנה לאחרונה בחודש אוגוסט 2026.
      </p>
    </section>
  );
}
