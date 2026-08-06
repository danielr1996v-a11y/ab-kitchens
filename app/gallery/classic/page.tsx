import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחים קלאסיים | א. בית המטבחים",
  description: "מטבחים קלאסיים בהתאמה אישית - שלייפלק וצבע בתנור, נגרות איכותית וגימור מדויק.",
  alternates: { canonical: "/גלריה/קלאסי" },
  openGraph: {
    title: "מטבחים קלאסיים | א. בית המטבחים",
    description: "מטבחים קלאסיים בהתאמה אישית - שלייפלק וצבע בתנור, נגרות איכותית וגימור מדויק.",
    url: "/גלריה/קלאסי",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מטבחים קלאסיים</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
