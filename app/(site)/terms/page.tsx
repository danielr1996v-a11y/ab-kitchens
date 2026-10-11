import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "תקנון | א. בית המטבחים",
  description: "תקנון השימוש באתר א. בית המטבחים.",
  alternates: { canonical: "/תקנון-ומדיניות-פרטיות" },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/תקנון-ומדיניות-פרטיות" />;
}
