import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { site } from "@/lib/content";

// הערה: הפונטים הסופיים (Nitzotz Condensed / Polin) יגיעו כקבצים מ-hafontia -
// יוטענו כ-@font-face מקומי ב-globals.css, לא דרך next/font/google.
// עד אז, globals.css מגדיר font-family עם פונטי מערכת עבריים כפלייסהולדר.

export const metadata: Metadata = {
  title: `${site.name} | מטבחים ושיש בהתאמה אישית`,
  description:
    "תכנון, ייצור והתקנה של מטבחים ושיש בהתאמה אישית - הכל תחת קורת גג אחת. המפעל והספק הישיר, ללא מתווכים.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
