import type { MetadataRoute } from "next";

/**
 * robots.txt
 *
 * רק דיפלוי פרודקשן אמיתי מותר לאינדוקס. כל תצוגה מקדימה
 * (preview) נחסמת, כדי שלא ייווצר תוכן כפול שמתחרה באתר החי.
 *
 * VERCEL_ENV מקבל את הערכים: production | preview | development
 */
const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.ab-kitchens.co.il/sitemap.xml",
  };
}
