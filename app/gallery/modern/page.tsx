import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחים מודרניים | א. בית המטבחים",
  description: "מטבחים מודרניים בקווים נקיים - פורמייקה, פולימר ואקריליק, בהתאמה אישית מלאה.",
  alternates: { canonical: "/גלריה/מודרני" },
  openGraph: {
    title: "מטבחים מודרניים | א. בית המטבחים",
    description: "מטבחים מודרניים בקווים נקיים - פורמייקה, פולימר ואקריליק, בהתאמה אישית מלאה.",
    url: "/גלריה/מודרני",
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
