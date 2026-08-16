import type { Metadata } from "next";
import "./globals.css";
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
    /* suppressHydrationWarning: הסקריפט של אנימציית הפתיחה
       (app/(site)/layout.tsx) מוסיף מחלקות ל-<html> לפני ההידרציה,
       ולכן ה-className בשרת ובלקוח לא זהים - וזה מכוון. */
    <html lang="he" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* הדר, פוטר וכפתור צף עברו ל-app/(site)/layout.tsx.
            כאן נשאר רק מה שחייב לחול גם על עמוד "בקרוב". */}
        <Analytics />
        {children}
        {/* כלי פנימי - לא מרנדר כלום עד שמפעילים אותו ב-Ctrl+Shift+D */}
        <DevInspector />
      </body>
    </html>
  );
}
