import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "שיש למטבח | סוגים, יתרונות ובחירה | א. בית המטבחים",
  description: "מדריך לבחירת שיש למטבח - סוגי שיש, יתרונות וחסרונות. אנחנו מעבד מורשה של חברות השיש.",
  alternates: { canonical: "/שיש-למטבח" },
  openGraph: {
    title: "שיש למטבח | סוגים, יתרונות ובחירה | א. בית המטבחים",
    description: "מדריך לבחירת שיש למטבח - סוגי שיש, יתרונות וחסרונות. אנחנו מעבד מורשה של חברות השיש.",
    url: "/שיש-למטבח",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">שיש למטבח</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
    </section>
  );
}
