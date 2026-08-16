import { ViewTransition } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import SmoothScroll from "@/components/SmoothScroll";
import Schema from "@/components/Schema";
import SanityBridge from "@/components/SanityBridge";
import Intro from "@/components/Intro";

/* רץ סינכרונית לפני הציור הראשון - אחרת התוכן מהבהב לרגע לפני
   שהשכבה עולה. מוסיף את המחלקה רק אם באמת מריצים פתיחה, כך
   שברירת המחדל (אין JS / סשן חוזר / תנועה מופחתת) היא אתר רגיל. */
const introBoot = `(function(){try{
if(sessionStorage.getItem('ab-intro-seen'))return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var r=document.documentElement;r.classList.add('has-intro');
/* בלי זה האתר נפתח היכן שהמשתמש היה לפני הרענון - לרוב בפוטר */
if('scrollRestoration' in history)history.scrollRestoration='manual';
window.scrollTo(0,0);r.classList.add('intro-scrolllock');
/* רשת ביטחון עצמאית: גם אם כל שאר הסקריפט ייפול, הגלילה משתחררת */
setTimeout(function(){r.classList.remove('intro-scrolllock')},8000);
}catch(e){}})();`;

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
      <script dangerouslySetInnerHTML={{ __html: introBoot }} />
      <Intro />
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
    </>
  );
}
