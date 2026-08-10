import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * שער "בקרוב".
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

export function proxy(request: NextRequest) {
  // נקרא בכל בקשה ולא ברמת המודול, כדי שהערך לא ייצרב בזמן build
  if (process.env.COMING_SOON !== "1") return NextResponse.next();

  const { pathname } = request.nextUrl;

  // העמוד עצמו, נכסי הבנייה והקבצים הסטטיים חייבים לעבור
  if (
    pathname === TARGET ||
    pathname.startsWith("/_next/") ||
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
