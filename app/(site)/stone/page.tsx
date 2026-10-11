import type { Metadata } from "next";
import PageDoc from "@/components/site/PageDoc";

export const metadata: Metadata = {
  title: "שיש למטבח | א. בית המטבחים",
  description:
    "משטחי שיש למטבח - מעבד מורשה של חברות השיש. מדידה, חיתוך וגימור אצלנו, בלי קבלני משנה.",
  alternates: { canonical: "/שיש-למטבח" },
  openGraph: {
    title: "שיש למטבח | א. בית המטבחים",
    description:
      "משטחי שיש למטבח - מעבד מורשה של חברות השיש. מדידה, חיתוך וגימור אצלנו, בלי קבלני משנה.",
    url: "/שיש-למטבח",
  },
};

/* ⚠️ שלב 5ב: התוכן מעץ האלמנטים שבמסד (יובא מה-JSX שהיה כאן).
   ה-JSX הישן נמחק - הוא בהיסטוריית git, קומיט 90c02b5 */
export default function Page() {
  return <PageDoc path="/שיש-למטבח" />;
}
