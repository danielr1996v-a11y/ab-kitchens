import type { Metadata } from "next";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | א. בית המטבחים",
  description: "מדיניות הפרטיות של אתר א. בית המטבחים.",
  alternates: { canonical: "/מדיניות-פרטיות" },
};

export default function Page() {
  return (
    <section className="section-block legal">
      <h1 className="page-title">מדיניות פרטיות</h1>

      <p className="legal__intro">
        א. בית המטבחים מכבדת את פרטיות המשתמשים באתר. מסמך זה מפרט איזה מידע
        נאסף, לאיזו מטרה, וכיצד ניתן לממש את זכויותיכם לגביו.
      </p>

      <h2 className="legal__heading">איזה מידע נאסף</h2>
      <ul className="legal__list">
        <li>
          <strong>מידע שאתם מוסרים ביוזמתכם</strong> - שם, טלפון ודוא&quot;ל
          בעת פנייה דרך טופס יצירת קשר או בקשה להצעת מחיר.
        </li>
        <li>
          <strong>מידע טכני</strong> - נתוני גלישה אנונימיים הנאספים באמצעות
          כלי אנליטיקה, לצורך שיפור חוויית השימוש באתר.
        </li>
      </ul>

      <h2 className="legal__heading">השימוש במידע</h2>
      <p className="legal__text">
        המידע משמש למענה לפניות, מתן הצעות מחיר, תיאום פגישות ושיפור השירות.
        איננו מוכרים או מעבירים מידע אישי לצדדים שלישיים, למעט ספקי שירות
        הפועלים מטעמנו או כאשר הדבר נדרש על פי דין.
      </p>

      <h2 className="legal__heading">עוגיות (Cookies)</h2>
      <p className="legal__text">
        האתר עושה שימוש בעוגיות לצורך תפעול תקין ומדידת ביצועים. ניתן לחסום
        עוגיות דרך הגדרות הדפדפן, אך הדבר עשוי לפגוע בחלק מפעולות האתר.
      </p>

      <h2 className="legal__heading">אבטחת מידע</h2>
      <p className="legal__text">
        אנו נוקטים באמצעים סבירים לאבטחת המידע. עם זאת, אין באפשרותנו להבטיח
        חסינות מוחלטת מפני חדירה בלתי מורשית.
      </p>

      <h2 className="legal__heading">הזכויות שלכם</h2>
      <p className="legal__text">
        אתם רשאים לבקש לעיין במידע שנאסף עליכם, לתקנו או למחקו. לפנייה בנושא:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>

      <p className="legal__note">מדיניות זו עודכנה לאחרונה בחודש אוגוסט 2026.</p>
    </section>
  );
}
