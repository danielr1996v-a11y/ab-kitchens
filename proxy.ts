import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * שני שערים: נעילה בסיסמה (למטה, ראשונה), ושער "בקרוב".
 *
 * ב-Next 16 הקובץ הזה נקרא proxy ולא middleware - ה-convention
 * הישן הוצא משימוש.
 *
 * כשמשתנה הסביבה COMING_SOON דלוק, כל בקשה מנותבת לעמוד הבקרוב.
 * זו חסימה אמיתית ברמת השרת ולא הסתרת קישורים: גם מי שינחש
 * כתובת כמו /גלריה או /אודותינו יגיע לאותו עמוד.
 *
 * כבוי כברירת מחדל, כך שהדיפלוי של client-preview נשאר פתוח
 * לבדיקה של דניאל ואברהם. מדליקים רק על הדיפלוי שנשלח ללקוחות.
 */
const TARGET = "/coming-soon";

/* =========================================================
   נעילה זמנית בשם משתמש וסיסמה (15.10.26, לבקשת דניאל).

   ⚠️ **הערכים לא בקוד.** SITE_USER ו-SITE_PASSWORD מוגדרים ב-Vercel
   בלבד. אם אחד מהם חסר - האתר פתוח, כך שהקוד בטוח לדחיפה לפני
   שהמשתנים קיימים, והסרת המשתנים פותחת את האתר בלי שינוי קוד.

   Basic Auth של הדפדפן ולא עמוד כניסה: חלון אחד, הדפדפן זוכר
   את הפרטים עד שסוגרים אותו, ואין מה לעצב או לתחזק לנעילה זמנית.
   ⚠️ שינוי משתנים ב-Vercel תופס רק מהדיפלוי הבא.
   ========================================================= */
function locked(request: NextRequest): boolean {
  const user = process.env.SITE_USER;
  const pass = process.env.SITE_PASSWORD;
  if (!user || !pass) return false;

  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return true;
  let decoded = "";
  try {
    /* TextDecoder ולא atob ישר - כדי שגם סיסמה בעברית תעבור */
    const bytes = Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0));
    decoded = new TextDecoder().decode(bytes);
  } catch {
    return true;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return true;
  /* השוואה בזמן קבוע: השוואה רגילה נעצרת בתו הראשון השונה,
     והזמן מסגיר כמה תווים נכונים */
  return !(same(decoded.slice(0, i), user) & same(decoded.slice(i + 1), pass));
}

function same(a: string, b: string): number {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let k = 0; k < Math.max(x.length, y.length); k++) diff |= (x[k] ?? 0) ^ (y[k] ?? 0);
  return diff === 0 ? 1 : 0;
}

export function proxy(request: NextRequest) {
  if (locked(request)) {
    return new NextResponse("האתר נעול זמנית.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="ab-kitchens", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8",
        /* שהעמוד הנעול לא יישמר באף מטמון בדרך */
        "Cache-Control": "no-store",
      },
    });
  }

  // נקרא בכל בקשה ולא ברמת המודול, כדי שהערך לא ייצרב בזמן build
  if (process.env.COMING_SOON !== "1") return NextResponse.next();

  const { pathname } = request.nextUrl;

  // העמוד עצמו, נכסי הבנייה והקבצים הסטטיים חייבים לעבור
  if (
    pathname === TARGET ||
    pathname.startsWith("/_next/") ||
    /* ⚠️ נקודת הקצה של הטפסים - גם מאחורי השער פנייה חייבת לעבור */
    pathname.startsWith("/api/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/logos/") ||
    pathname === "/favicon.ico" ||
    pathname === "/logo.png" ||
    pathname === "/logo-dark.png" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // rewrite ולא redirect: הכתובת בשורת הכתובות נשארת כפי שהיא,
  // ואין רמז שקיימים עמודים אחרים מאחורי השער.
  return NextResponse.rewrite(new URL(TARGET, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
