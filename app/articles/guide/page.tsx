import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדריך מקיף למטבחים | כל מה שצריך לדעת | א. בית המטבחים",
  description: "מה הופך מטבח למטבח מעוצב? תכנון, חומרים, עיצוב מודרני והתאמה לאורח החיים - המדריך המלא.",
  alternates: { canonical: "/מטבחים---כל-מה-שרצית-לדעת" },
  openGraph: {
    title: "מדריך מקיף למטבחים | כל מה שצריך לדעת | א. בית המטבחים",
    description: "מה הופך מטבח למטבח מעוצב? תכנון, חומרים, עיצוב מודרני והתאמה לאורח החיים - המדריך המלא.",
    url: "/מטבחים---כל-מה-שרצית-לדעת",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מטבחים - כל מה שרצית לדעת</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
