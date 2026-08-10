import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודותינו | א. בית המטבחים - דור שני בענף",
  description: "דור שני בענף המטבחים. אנחנו המפעל והספק הישיר - תכנון, נגרות, שיש והתקנה, הכל תחת קורת גג אחת.",
  alternates: { canonical: "/אודותינו" },
  openGraph: {
    title: "אודותינו | א. בית המטבחים - דור שני בענף",
    description: "דור שני בענף המטבחים. אנחנו המפעל והספק הישיר - תכנון, נגרות, שיש והתקנה, הכל תחת קורת גג אחת.",
    url: "/אודותינו",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">אודותינו</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
