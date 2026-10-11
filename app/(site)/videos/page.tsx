import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "סרטונים - נגרות ושיש | א. בית המטבחים",
  description:
    "אברהם מסביר על נגרות ושיש למטבח: סוגי אבן, לוחות, אחסון, פרזול ותכנון - בסרטונים קצרים מהמפעל ומהאולם.",
  alternates: { canonical: "/סרטונים" },
  openGraph: {
    title: "סרטונים - נגרות ושיש | א. בית המטבחים",
    url: "/סרטונים",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/סרטונים" />;
}
