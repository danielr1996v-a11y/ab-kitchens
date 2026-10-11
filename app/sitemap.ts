import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/site/data";

const BASE = "https://www.ab-kitchens.co.il";

/**
 * מפת אתר. הנתיבים בעברית - זהים לאתר הישן, כדי לא לאבד דירוג.
 * העדיפויות נגזרות מהערך העסקי והאורגני של כל עמוד.
 */
const routes: Array<{
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/גלריה/קלאסי", priority: 0.8, freq: "monthly" },
  { path: "/גלריה/מודרני", priority: 0.8, freq: "monthly" },
  { path: "/גלריה/כפרי", priority: 0.8, freq: "monthly" },
  { path: "/שיש-למטבח", priority: 0.8, freq: "monthly" },
  { path: "/contact", priority: 0.8, freq: "monthly" },
  /* ⚠️ /מטבחים---כל-מה-שרצית-לדעת ירד מכאן במכוון: אין לו מאמר
     בחומרים של הלקוח, והוא היה עמוד ריק שיושב באינדקס. */
  { path: "/מאמרים-וטיפים", priority: 0.7, freq: "monthly" },
  { path: "/אודותינו", priority: 0.6, freq: "monthly" },
  { path: "/המלצות", priority: 0.6, freq: "monthly" },
  { path: "/סרטונים", priority: 0.6, freq: "weekly" },
  { path: "/תקנון-ומדיניות-פרטיות", priority: 0.2, freq: "yearly" },
  { path: "/מדיניות-פרטיות", priority: 0.2, freq: "yearly" },
  { path: "/הצהרת-נגישות", priority: 0.2, freq: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  /* ⚠️ שלב 5א: המאמרים מהמערכת - מאמר חדש נכנס למפה לבד, ומאמר
     שמוסתר מגוגל (noindex) לא נכנס */
  const articles = (await getArticles())
    .filter((a) => !a.seo?.noindex)
    .map((a) => ({ path: a.path, priority: 0.7, freq: "monthly" as const }));
  return [...routes, ...articles].map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
