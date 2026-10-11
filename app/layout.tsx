import type { Metadata } from "next";
import { getSettings } from "@/lib/admin/settings";

/* שכבת הגנה שנייה: תג noindex ברמת העמוד בכל דיפלוי שאינו פרודקשן.
   robots.txt לבדו אינו מספיק - מנועי חיפוש עשויים להגיע דרך קישור ישיר. */
const isProduction = process.env.VERCEL_ENV === "production";

/* שלב 7: שם, תיאור ו"להסתיר מגוגל" מההגדרות במערכת */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const hide = !isProduction || settings.hideFromGoogle;
  return {
  robots: hide ? { index: false, follow: false } : { index: true, follow: true },
  metadataBase: new URL("https://www.ab-kitchens.co.il"),
  title: `${settings.name} | מטבחים ושיש בהתאמה אישית`,
  description: settings.description,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: settings.name,
    locale: "he_IL",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  };
}

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
