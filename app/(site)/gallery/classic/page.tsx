import type { Metadata } from "next";
import KitchenPage from "@/components/KitchenPage";

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

export default function Page() {
  return <KitchenPage styleKey="classic" />;
}
