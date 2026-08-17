import type { Metadata } from "next";
import ProjectStrip from "@/components/ProjectStrip";
import AboutValues from "@/components/AboutValues";

export const metadata: Metadata = {
  title: "אודותינו | א. בית המטבחים - דור שני בענף",
  description: "דור שני בענף המטבחים. אנחנו המפעל והספק הישיר - תכנון, נגרות, שיש והתקנה, הכל תחת קורת גג אחת.",
  alternates: { canonical: "/אודותינו" },
  openGraph: {
    title: "אודותינו | א. בית המטבחים - דור שני בענף",
    description: "דור שני בענף המטבחים. אנחנו המפעל והספק הישיר - תכנון, נגרות, שיש והתקנה, הכל תחת קורת גג אחת.",
    url: "/אודותינו",
  },
};

export default function Page() {
  return (
    <>
      {/* h1 של העמוד. הרצועה נושאת h2, ולכן הכותרת הראשית
          חייבת לשבת כאן כדי לשמור על היררכיה תקינה */}
      <h1 className="sr-only">אודות א. בית המטבחים</h1>
      <ProjectStrip />
      <AboutValues />
    </>
  );
}
