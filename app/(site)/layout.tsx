import { ViewTransition } from "react";
import "../globals.css";
import Analytics from "@/components/Analytics";
import DevInspector from "@/components/DevInspector";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import SmoothScroll from "@/components/SmoothScroll";
import Schema from "@/components/Schema";
import SanityBridge from "@/components/SanityBridge";

/**
 * הלייאאוט של האתר עצמו - הדר, פוטר וכפתור צף.
 *
 * למה קבוצת נתיבים ולא ה-root layout: יש עמודים שחייבים להיות
 * בלי הדר ופוטר (Studio היום, מערכת הניהול בהמשך). עמוד "בקרוב"
 * שבזכותו זה נבנה נמחק ב-09.10.26.
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
      <FloatingActions />
      {/* עדכון חי + עריכה ויזואלית. ריק כל עוד Sanity לא חובר */}
      <SanityBridge />
      <Analytics />
      {/* כלי פנימי - לא מרנדר כלום עד שמפעילים אותו ב-Ctrl+Shift+D */}
      <DevInspector />
    </>
  );
}
