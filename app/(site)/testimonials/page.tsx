import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "המלצות לקוחות | סיפורי הצלחה של א. בית המטבחים",
  description: "לקוחות מספרים על העבודה איתנו - שירות, איכות ועמידה בזמנים. דירוג 5.0 בגוגל.",
  alternates: { canonical: "/המלצות" },
  openGraph: {
    title: "המלצות לקוחות | סיפורי הצלחה של א. בית המטבחים",
    description: "לקוחות מספרים על העבודה איתנו - שירות, איכות ועמידה בזמנים. דירוג 5.0 בגוגל.",
    url: "/המלצות",
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs
        className="crumbs--top"
        trail={[{ label: "דף הבית", href: "/" }, { label: "המלצות" }]}
      />
      <section className="section-block">
        <h1 className="page-title">המלצות לקוחות</h1>
        <p className="page-note">התוכן של העמוד הזה ייבנה בהמשך, סקשן אחר סקשן.</p>
      </section>
    </>
  );
}
