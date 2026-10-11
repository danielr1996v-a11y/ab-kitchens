import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "יצירת קשר | א. בית המטבחים",
  description:
    "פגישה עם מעצב/ת ללא עלות. אולם התצוגה בבית ישראל 2, ירושלים. טלפון 055-2775488.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "יצירת קשר | א. בית המטבחים",
    description: "פגישה עם מעצב/ת ללא עלות. אולם התצוגה בבית ישראל 2, ירושלים.",
    url: "/contact",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/contact" />;
}
