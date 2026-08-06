import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחים כפריים | א. בית המטבחים",
  description: "מטבחים כפריים בעיצוב חם - שלייפלק, צבע בתנור ועץ, בייצור עצמי במפעל שלנו.",
  alternates: { canonical: "/גלריה/כפרי" },
  openGraph: {
    title: "מטבחים כפריים | א. בית המטבחים",
    description: "מטבחים כפריים בעיצוב חם - שלייפלק, צבע בתנור ועץ, בייצור עצמי במפעל שלנו.",
    url: "/גלריה/כפרי",
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
