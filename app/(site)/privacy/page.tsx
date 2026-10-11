import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "מדיניות פרטיות | א. בית המטבחים",
  description: "מדיניות הפרטיות של אתר א. בית המטבחים.",
  alternates: { canonical: "/מדיניות-פרטיות" },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/מדיניות-פרטיות" />;
}
