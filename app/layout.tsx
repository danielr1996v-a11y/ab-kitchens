import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SmoothScroll from "@/components/SmoothScroll";
import Schema from "@/components/Schema";
import Analytics from "@/components/Analytics";
import DevInspector from "@/components/DevInspector";
import { site } from "@/lib/content";

/* שכבת הגנה שנייה: תג noindex ברמת העמוד בכל דיפלוי שאינו פרודקשן.
   robots.txt לבדו אינו מספיק - מנועי חיפוש עשויים להגיע דרך קישור ישיר. */
const isProduction = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false },
  metadataBase: new URL("https://www.ab-kitchens.co.il"),
  title: `${site.name} | מטבחים ושיש בהתאמה אישית`,
  description:
    "תכנון, ייצור והתקנה של מטבחים ושיש בהתאמה אישית - הכל תחת קורת גג אחת. המפעל והספק הישיר, ללא מתווכים.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: site.name,
    locale: "he_IL",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Schema />
        <Analytics />
        <SmoothScroll />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        {/* כלי פנימי - לא מרנדר כלום עד שמפעילים אותו ב-Ctrl+Shift+D */}
        <DevInspector />
        <WhatsAppButton />
      </body>
    </html>
  );
}
