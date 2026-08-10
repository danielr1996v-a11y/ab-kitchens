import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "המעצבים שלנו | א. בית המטבחים",
  description: "צוות המעצבות שלנו מלווה אתכם משלב התכנון ועד הגמר. לשיתופי פעולה עם מעצבות ואדריכלים.",
  alternates: { canonical: "/המעצבים-שלנו" },
  openGraph: {
    title: "המעצבים שלנו | א. בית המטבחים",
    description: "צוות המעצבות שלנו מלווה אתכם משלב התכנון ועד הגמר. לשיתופי פעולה עם מעצבות ואדריכלים.",
    url: "/המעצבים-שלנו",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">המעצבים שלנו</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
