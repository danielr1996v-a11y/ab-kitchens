import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "מטבחים כפריים | א. בית המטבחים",
  description: "מטבחים כפריים בהתאמה אישית - חזיתות בחריטה, גוונים חמים ומשטחים טבעיים.",
  alternates: { canonical: "/גלריה/כפרי" },
  openGraph: {
    title: "מטבחים כפריים | א. בית המטבחים",
    description: "מטבחים כפריים בהתאמה אישית - חזיתות בחריטה, גוונים חמים ומשטחים טבעיים.",
    url: "/גלריה/כפרי",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/גלריה/כפרי" />;
}
