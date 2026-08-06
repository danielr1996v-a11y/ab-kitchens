import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבח בהתאמה אישית | א. בית המטבחים",
  description: "מטבח שמתוכנן סביבכם - מהמדידה ועד ההתקנה, הכל תחת קורת גג אחת במפעל שלנו.",
  alternates: { canonical: "/גלריה/בהתאמה-אישית" },
  openGraph: {
    title: "מטבח בהתאמה אישית | א. בית המטבחים",
    description: "מטבח שמתוכנן סביבכם - מהמדידה ועד ההתקנה, הכל תחת קורת גג אחת במפעל שלנו.",
    url: "/גלריה/בהתאמה-אישית",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מטבח בהתאמה אישית</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
