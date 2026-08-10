import type { Metadata } from "next";
import KitchenPage from "@/components/KitchenPage";

export const metadata: Metadata = {
  title: "מטבחים כפריים | א. בית המטבחים",
  description: "מטבחים כפריים בהתאמה אישית - חזיתות ממוסגרות, גוונים חמים ומשטחים טבעיים.",
  alternates: { canonical: "/גלריה/כפרי" },
  openGraph: {
    title: "מטבחים כפריים | א. בית המטבחים",
    description: "מטבחים כפריים בהתאמה אישית - חזיתות ממוסגרות, גוונים חמים ומשטחים טבעיים.",
    url: "/גלריה/כפרי",
  },
};

export default function Page() {
  return <KitchenPage styleKey="rustic" />;
}
