import type { NextConfig } from "next";

/**
 * הערה חשובה: הנתיבים הציבוריים של האתר הם בעברית, זהים לאתר הישן,
 * כדי לא לאבד דירוג אורגני. תיקיות הקוד באנגלית כי Next.js 16 + Turbopack
 * לא תומך בשמות תיקיות בעברית ב-static generation.
 * ה-rewrites למטה מגשרים בין השניים - הגולש וגוגל רואים עברית בלבד.
 */

/**
 * ⚠️ קריטי: Next משווה את ה-source מול הנתיב **המקודד** שמגיע מהדפדפן,
 * ולא מול הנתיב המפוענח. source בעברית גולמית לעולם לא יתאים, וכל
 * הנתיבים העבריים יחזירו 404 - גם מקומית וגם בפרודקשן.
 *
 * heb() מקודד בזמן ה-build, כך שהעברית נשארת קריאה כאן בקוד
 * ובכל זאת ההשוואה מתבצעת נכון. אין להסיר את העטיפה הזו.
 */
const heb = (path: string) => encodeURI(path);

const nextConfig: NextConfig = {
  // מעברים בין עמודים דרך React ViewTransition.
  // ⚠️ עדיין experimental ב-Next 16 - לבדוק בשדרוג גרסה.
  // בדפדפן ללא תמיכה האתר עובד רגיל, פשוט בלי אנימציה.
  experimental: {
    viewTransition: true,
  },

  images: {
    // ה-Hero מבקש quality={90}. בלי שהערך מופיע כאן Next נופל חזרה ל-75
    // והתמונה הראשית מוגשת מטושטשת מהמתוכנן.
    qualities: [75, 90],
    remotePatterns: [
      /* תמונות התוכן מגיעות מ-CDN של Sanity אחרי המיגרציה.
         ערכי YouTube הישנים נמחקו - שריד מ-VideoPlayer שהוסר (חוק 6). */
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  async rewrites() {
    return [
      { source: heb("/גלריה"), destination: "/gallery" },
      { source: heb("/גלריה/קלאסי"), destination: "/gallery/classic" },
      { source: heb("/גלריה/מודרני"), destination: "/gallery/modern" },
      { source: heb("/גלריה/כפרי"), destination: "/gallery/rustic" },
      { source: heb("/אודותינו"), destination: "/about" },
      { source: heb("/המלצות"), destination: "/testimonials" },
      { source: heb("/מאמרים-וטיפים"), destination: "/articles" },
      { source: heb("/מטבחים-מודרניים"), destination: "/articles/modern" },
      { source: heb("/מטבחים-כפריים"), destination: "/articles/rustic" },
      { source: heb("/שיש-למטבח"), destination: "/stone" },
      { source: heb("/מטבחים---כל-מה-שרצית-לדעת"), destination: "/articles/guide" },
      { source: heb("/המעצבים-שלנו"), destination: "/designers" },
      { source: heb("/תקנון-ומדיניות-פרטיות"), destination: "/terms" },
      { source: heb("/מדיניות-פרטיות"), destination: "/privacy" },
      { source: heb("/הצהרת-נגישות"), destination: "/accessibility" },
    ];
  },

  async redirects() {
    return [
      // עמוד המחשבון נדחה לשלב ב'. עד אז מפנים ליצירת קשר כדי למנוע 404.
      { source: heb("/מחשבון"), destination: "/contact", permanent: false },
      // הקטגוריה "בהתאמה אישית" הוסרה לבקשת הלקוח. מפנים לגלריה
      // הראשית כדי לא לאבד תנועה מהנתיב שהיה מאונדקס.
      // permanent: false במכוון - ההחלטה הפיכה.
      { source: heb("/גלריה/בהתאמה-אישית"), destination: heb("/גלריה"), permanent: false },
    ];
  },
};

export default nextConfig;
