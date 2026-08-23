import type { Metadata } from "next";
import KitchenPage from "@/components/KitchenPage";
import TrustedBy from "@/components/TrustedBy";
import { trustedBy } from "@/lib/content";

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

/**
 * עמוד השיש. אותו מבנה בדיוק כמו עמודי המטבחים - KitchenPage
 * נבנתה לכך שהוספת עמוד היא רשומה ב-kitchenPages ולא קוד חדש.
 *
 * ההבדל היחיד: סקשן הספקים מתחתיו. הוא רלוונטי כאן במיוחד -
 * דווקא בעמוד שמדבר על "מעבד מורשה של חברות השיש", הלוגואים
 * הם ההוכחה לטענה ולא קישוט.
 */
export default function Page() {
  return (
    <>
      <KitchenPage styleKey="stone" />
      <TrustedBy content={trustedBy} />
    </>
  );
}
