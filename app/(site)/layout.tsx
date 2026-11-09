import { ViewTransition } from "react";
import "../globals.css";
import Analytics from "@/components/Analytics";
import DevInspector from "@/components/DevInspector";
import SharedPart from "@/components/site/SharedPart";
import FloatingActions from "@/components/FloatingActions";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import SmoothScroll from "@/components/SmoothScroll";
import Schema from "@/components/Schema";

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
      {/* שלב 5ג: הדר ופוטר מהמסד - נשמרים פעם אחת לכל האתר */}
      <SharedPart kind="header" />
      {/* רק תוכן העמוד מונפש. ההדר והפוטר נשארים מחוץ לעטיפה
          במכוון - הם העוגן שגורם למעבר להרגיש כמו משטח אחד
          רציף ולא כמו מצגת שקופיות. */}
      <ViewTransition name="page">
        <main className="flex-1 flex flex-col">{children}</main>
      </ViewTransition>
      <SharedPart kind="footer" />
      <FloatingActions />
      <AccessibilityMenu />
      <Analytics />
      {/* כלי פנימי - לא מרנדר כלום עד שמפעילים אותו ב-Ctrl+Shift+D */}
      <DevInspector />
    </>
  );
}
