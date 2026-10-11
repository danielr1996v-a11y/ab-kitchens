import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "הצהרת נגישות | א. בית המטבחים",
  description: "הצהרת הנגישות של אתר א. בית המטבחים.",
  alternates: { canonical: "/הצהרת-נגישות" },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/הצהרת-נגישות" />;
}
