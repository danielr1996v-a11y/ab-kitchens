import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "מטבחים מודרניים | א. בית המטבחים",
  description: "מטבחים מודרניים בקווים נקיים - פורמייקה, פולימר ואקריליק, בהתאמה אישית מלאה.",
  alternates: { canonical: "/גלריה/מודרני" },
  openGraph: {
    title: "מטבחים מודרניים | א. בית המטבחים",
    description: "מטבחים מודרניים בקווים נקיים - פורמייקה, פולימר ואקריליק, בהתאמה אישית מלאה.",
    url: "/גלריה/מודרני",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/גלריה/מודרני" />;
}
