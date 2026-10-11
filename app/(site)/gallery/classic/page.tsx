import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "מטבחים קלאסיים | א. בית המטבחים",
  description: "מטבחים קלאסיים בהתאמה אישית - שלייפלק וצבע בתנור, נגרות איכותית וגימור מדויק.",
  alternates: { canonical: "/גלריה/קלאסי" },
  openGraph: {
    title: "מטבחים קלאסיים | א. בית המטבחים",
    description: "מטבחים קלאסיים בהתאמה אישית - שלייפלק וצבע בתנור, נגרות איכותית וגימור מדויק.",
    url: "/גלריה/קלאסי",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/גלריה/קלאסי" />;
}
