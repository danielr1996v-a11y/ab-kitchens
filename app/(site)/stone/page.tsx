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

/* רק ספקי השיש. הסינון לפי id ולא לפי מיקום במערך - הוספת
   קבוצה או שינוי סדר ב-content לא ישברו את העמוד הזה. */
const stoneOnly = {
  ...trustedBy,
  groups: trustedBy.groups.filter((g) => g.id === "stone"),
};

/**
 * עמוד השיש. אותו מבנה בדיוק כמו עמודי המטבחים - KitchenPage
 * נבנתה לכך שהוספת עמוד היא רשומה ב-kitchenPages ולא קוד חדש.
 *
 * ההבדל היחיד: ספקי השיש מוצגים מעל הגלריה. בעמוד שטוען "מעבד
 * מורשה של חברות השיש", הלוגואים הם ההוכחה לטענה - ולכן הם
 * באים לפני העבודות ולא אחריהן.
 */
export default function Page() {
  return (
    <KitchenPage
      styleKey="stone"
      beforeGallery={<TrustedBy content={stoneOnly} />}
    />
  );
}
