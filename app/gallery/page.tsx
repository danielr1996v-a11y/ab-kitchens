import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחים מעוצבים | א. בית המטבחים - מגוון סגנונות ופתרונות",
  description: "מגוון רחב של סגנונות מטבח - משלייפלק ופורמייקה ועד פולימר וסטנדרט. עיצובים מותאמים אישית, חומרים איכותיים וביצוע מקצועי לכל סוגי המטבחים.",
  alternates: { canonical: "/גלריה" },
  openGraph: {
    title: "מטבחים מעוצבים | א. בית המטבחים - מגוון סגנונות ופתרונות",
    description: "מגוון רחב של סגנונות מטבח - משלייפלק ופורמייקה ועד פולימר וסטנדרט. עיצובים מותאמים אישית, חומרים איכותיים וביצוע מקצועי לכל סוגי המטבחים.",
    url: "/גלריה",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מטבחים</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>

      {/* שימור העוגנים מהאתר הישן. קישורים חיצוניים ל-/גלריה#Rural וכו'
          חייבים להמשיך לנחות במקום הנכון - 301 לא מטפל בעוגנים.
          מונחי החומר נשמרים בכוונה: הם מונחי חיפוש שכבר מביאים תנועה. */}
      <div id="Rural" className="anchor-target">
        <h2>מטבחי שלייפלק (צבע בתנור כפרי)</h2>
      </div>
      <div id="Formica" className="anchor-target">
        <h2>מטבחי פורמייקה ידית אינטגרלי</h2>
      </div>
      <div id="polymer" className="anchor-target">
        <h2>מטבחי פולימר</h2>
      </div>
      <div id="standard" className="anchor-target">
        <h2>מטבחי סטנדרט</h2>
      </div>
    </section>
  );
}
