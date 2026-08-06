import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחים כפריים | חמימות ואותנטיות | א. בית המטבחים",
  description: "המטבח הכפרי משלב עץ, צבעים חמים וגימורים ייחודיים. מדריך מלא לתכנון מטבח כפרי.",
  alternates: { canonical: "/מטבחים-כפריים" },
  openGraph: {
    title: "מטבחים כפריים | חמימות ואותנטיות | א. בית המטבחים",
    description: "המטבח הכפרי משלב עץ, צבעים חמים וגימורים ייחודיים. מדריך מלא לתכנון מטבח כפרי.",
    url: "/מטבחים-כפריים",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מטבחים כפריים</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
