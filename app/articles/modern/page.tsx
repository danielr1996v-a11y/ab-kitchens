import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחים מודרניים | חדשנות ועיצוב עכשווי | א. בית המטבחים",
  description: "המטבח המודרני מתאפיין בקווים נקיים ומגוון חומרים כמו פורמייקה, אקריליק וצבע בתנור. כל מה שצריך לדעת.",
  alternates: { canonical: "/מטבחים-מודרניים" },
  openGraph: {
    title: "מטבחים מודרניים | חדשנות ועיצוב עכשווי | א. בית המטבחים",
    description: "המטבח המודרני מתאפיין בקווים נקיים ומגוון חומרים כמו פורמייקה, אקריליק וצבע בתנור. כל מה שצריך לדעת.",
    url: "/מטבחים-מודרניים",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מטבחים מודרניים</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
