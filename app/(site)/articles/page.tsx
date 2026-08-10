import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מאמרים וטיפים על מטבחים | א. בית המטבחים",
  description:
    "מדריכים, טיפים וסרטונים על תכנון מטבחים, בחירת שיש וסגנונות עיצוב.",
  alternates: { canonical: "/מאמרים-וטיפים" },
  openGraph: {
    title: "מאמרים וטיפים על מטבחים | א. בית המטבחים",
    description:
      "מדריכים, טיפים וסרטונים על תכנון מטבחים, בחירת שיש וסגנונות עיצוב.",
    url: "/מאמרים-וטיפים",
  },
};

export default function Page() {
  return (
    <section className="section-block">
      <h1 className="page-title">מאמרים וטיפים</h1>
      <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, לפי הפיגמה.</p>
    </section>
  );
}
