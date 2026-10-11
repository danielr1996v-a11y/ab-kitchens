import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/admin/settings";

/**
 * robots.txt
 *
 * רק דיפלוי פרודקשן אמיתי מותר לאינדוקס. כל תצוגה מקדימה
 * (preview) נחסמת, כדי שלא ייווצר תוכן כפול שמתחרה באתר החי.
 *
 * VERCEL_ENV מקבל את הערכים: production | preview | development
 */
const isProduction = process.env.VERCEL_ENV === "production";

export default async function robots(): Promise<MetadataRoute.Robots> {
  /* שלב 7: "להסתיר מגוגל" בהגדרות - חוסם גם ב-production, עד ההשקה */
  if (!isProduction || (await getSettings()).hideFromGoogle) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.ab-kitchens.co.il/sitemap.xml",
  };
}
