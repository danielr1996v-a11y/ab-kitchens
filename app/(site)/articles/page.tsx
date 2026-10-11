import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";
import { articlesPage } from "@/lib/articles";

export const metadata: Metadata = {
  title: "מאמרים על מטבחים ושיש | א. בית המטבחים",
  description: articlesPage.lead,
  alternates: { canonical: "/מאמרים-וטיפים" },
  openGraph: {
    title: "מאמרים על מטבחים ושיש | א. בית המטבחים",
    description: articlesPage.lead,
    url: "/מאמרים-וטיפים",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/מאמרים-וטיפים" />;
}
