import type { Metadata } from "next";
import KitchenPage from "@/components/KitchenPage";

export const metadata: Metadata = {
  title: "מטבחים מודרניים | א. בית המטבחים",
  description: "מטבחים מודרניים בקווים נקיים - פורמייקה, פולימר ואקריליק, בהתאמה אישית מלאה.",
  alternates: { canonical: "/גלריה/מודרני" },
  openGraph: {
    title: "מטבחים מודרניים | א. בית המטבחים",
    description: "מטבחים מודרניים בקווים נקיים - פורמייקה, פולימר ואקריליק, בהתאמה אישית מלאה.",
    url: "/גלריה/מודרני",
  },
};

export default function Page() {
  return <KitchenPage styleKey="modern" />;
}
