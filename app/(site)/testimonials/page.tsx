import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "המלצות לקוחות | א. בית המטבחים",
  description:
    "לקוחות מספרים על העבודה איתנו - מדידה, ייצור, שיש והתקנה. לצד כל המלצה אפשר לפתוח את ההודעה המקורית.",
  alternates: { canonical: "/המלצות" },
  openGraph: {
    title: "המלצות לקוחות | א. בית המטבחים",
    description:
      "לקוחות מספרים על העבודה איתנו. לצד כל המלצה אפשר לפתוח את ההודעה המקורית.",
    url: "/המלצות",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/המלצות" />;
}
