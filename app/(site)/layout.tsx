import { ViewTransition } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SmoothScroll from "@/components/SmoothScroll";
import Schema from "@/components/Schema";
import SanityBridge from "@/components/SanityBridge";

/**
 * הלייאאוט של האתר עצמו - הדר, פוטר וכפתור צף.
 *
 * למה קבוצת נתיבים ולא ה-root layout: עמוד "בקרוב" חייב להיות
 * בלי שום ניווט, אחרת אפשר לצאת ממנו לאתר שעדיין לא מוכן.
 * הקבוצה `(site)` שקופה ב-URL, כך שאף כתובת לא השתנתה.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Schema />
      <SmoothScroll />
      <Header />
      {/* רק תוכן העמוד מונפש. ההדר והפוטר נשארים מחוץ לעטיפה
          במכוון - הם העוגן שגורם למעבר להרגיש כמו משטח אחד
          רציף ולא כמו מצגת שקופיות. */}
      <ViewTransition name="page">
        <main className="flex-1 flex flex-col">{children}</main>
      </ViewTransition>
      <Footer />
      <WhatsAppButton />
      {/* עדכון חי + עריכה ויזואלית. ריק כל עוד Sanity לא חובר */}
      <SanityBridge />
    </>
  );
}
