import type { Metadata } from "next";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "תקנון | א. בית המטבחים",
  description: "תקנון השימוש באתר א. בית המטבחים.",
  alternates: { canonical: "/תקנון-ומדיניות-פרטיות" },
};

export default function Page() {
  return (
    <section className="section-block legal">
      <h1 className="page-title">תקנון שימוש</h1>

      <p className="legal__intro">
        השימוש באתר א. בית המטבחים כפוף לתנאים המפורטים להלן. הגלישה באתר
        מהווה הסכמה לתנאים אלה.
      </p>

      <h2 className="legal__heading">מהות האתר</h2>
      <p className="legal__text">
        האתר משמש להצגת שירותי החברה בתחום תכנון, ייצור והתקנת מטבחים ושיש.
        האתר אינו אתר מסחר אלקטרוני ולא מתבצעות בו רכישות מקוונות.
      </p>

      <h2 className="legal__heading">תמונות ותכנים</h2>
      <p className="legal__text">
        התמונות באתר נועדו להמחשה בלבד. גוונים, מרקמים וגימורים עשויים להשתנות
        בין המסך למוצר בפועל, ובין פרויקט לפרויקט. אין באמור באתר משום התחייבות
        למחיר, ללוח זמנים או למפרט - אלה ייקבעו בהצעת מחיר ובהסכם בכתב בלבד.
      </p>

      <h2 className="legal__heading">קניין רוחני</h2>
      <p className="legal__text">
        כל הזכויות בתכני האתר, לרבות טקסטים, תמונות, סימני מסחר ועיצוב, שמורות
        לא. בית המטבחים. אין להעתיק, לשכפל או לעשות שימוש מסחרי בתכנים ללא אישור
        מראש ובכתב.
      </p>

      <h2 className="legal__heading">אחריות</h2>
      <p className="legal__text">
        החברה עושה מאמץ לוודא שהמידע באתר מדויק ומעודכן, אך אינה אחראית לטעויות
        או להשמטות. השימוש במידע הוא באחריות המשתמש בלבד.
      </p>

      <h2 className="legal__heading">יצירת קשר</h2>
      <p className="legal__text">
        לשאלות בנוגע לתקנון:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> · {site.phone1}
      </p>

      <p className="legal__note">תקנון זה עודכן לאחרונה בחודש אוגוסט 2026.</p>
    </section>
  );
}
