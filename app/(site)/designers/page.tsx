import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "המעצבים שלנו | א. בית המטבחים",
  description:
    "מה קורה בפגישה עם מעצב מטבחים: מה כדאי להביא, מה עוברים יחד, ומה יוצאים איתו. ללא עלות וללא התחייבות.",
  alternates: { canonical: "/המעצבים-שלנו" },
  openGraph: {
    title: "המעצבים שלנו | א. בית המטבחים",
    description:
      "מה קורה בפגישה עם מעצב מטבחים: מה כדאי להביא, מה עוברים יחד, ומה יוצאים איתו.",
    url: "/המעצבים-שלנו",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/designers" />;
}
