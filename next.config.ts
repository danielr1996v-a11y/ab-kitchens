import type { NextConfig } from "next";

/**
 * הערה חשובה: הנתיבים הציבוריים של האתר הם בעברית, זהים לאתר הישן,
 * כדי לא לאבד דירוג אורגני. תיקיות הקוד באנגלית כי Next.js 16 + Turbopack
 * לא תומך בשמות תיקיות בעברית ב-static generation.
 * ה-rewrites למטה מגשרים בין השניים - הגולש וגוגל רואים עברית בלבד.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },

  async rewrites() {
    return [
      { source: "/גלריה", destination: "/gallery" },
      { source: "/גלריה/קלאסי", destination: "/gallery/classic" },
      { source: "/גלריה/מודרני", destination: "/gallery/modern" },
      { source: "/גלריה/כפרי", destination: "/gallery/rustic" },
      { source: "/גלריה/בהתאמה-אישית", destination: "/gallery/custom" },
      { source: "/אודותינו", destination: "/about" },
      { source: "/המלצות", destination: "/testimonials" },
      { source: "/מאמרים-וטיפים", destination: "/articles" },
      { source: "/מטבחים-מודרניים", destination: "/articles/modern" },
      { source: "/מטבחים-כפריים", destination: "/articles/rustic" },
      { source: "/שיש-למטבח", destination: "/stone" },
      { source: "/מטבחים---כל-מה-שרצית-לדעת", destination: "/articles/guide" },
      { source: "/המעצבים-שלנו", destination: "/designers" },
      { source: "/תקנון-ומדיניות-פרטיות", destination: "/terms" },
      { source: "/מדיניות-פרטיות", destination: "/privacy" },
      { source: "/הצהרת-נגישות", destination: "/accessibility" },
    ];
  },

  async redirects() {
    return [
      // עמוד המחשבון נדחה לשלב ב'. עד אז מפנים ליצירת קשר כדי למנוע 404.
      { source: "/מחשבון", destination: "/contact", permanent: false },
    ];
  },
};

export default nextConfig;
