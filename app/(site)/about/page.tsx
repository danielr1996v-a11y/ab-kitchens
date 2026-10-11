import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

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

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/אודותינו" />;
}
