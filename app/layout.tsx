import type { Metadata } from "next";
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
        {/* ⚠️ השורש ריק בכוונה (שלב 3, 09.10.26): ה-CSS של האתר,
            הפיקסל וכלי הבדיקה עברו ל-app/(site)/layout.tsx, ומערכת
            הניהול טוענת CSS ניטרלי משלה (app/admin/layout.tsx).
            כך שתי השפות לא דולפות זו לזו, והפיקסל של פייסבוק לא
            רץ בתוך מערכת הניהול. */}
        {children}
      </body>
    </html>
  );
}
