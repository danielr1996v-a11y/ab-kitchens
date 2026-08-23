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
    /* ⚠️ מייעל התמונות של Vercel מכובה במכוון. לא להחזיר אותו
       בלי לבדוק קודם את מכסת הטרנספורמציות.

       למה: שקופיות נעלמו לסירוגין, וצילומי המסך של דניאל הראו את
       צלמית התמונה השבורה - כלומר הבקשה **נשלחה ונכשלה**, ולא
       שהתמונה עוד נטענת. בבדיקה ישירה נקודת הקצה מחזירה 200,
       ולכן זו לא תקלה קבועה אלא כשל תחת עומס: החשבון על תוכנית
       hobby, שבה מספר הטרנספורמציות חסום. כל צירוף של
       (מקור, רוחב, איכות) נספר בנפרד, וכל דיפלוי חדש מרוקן את
       הקאש - לכן זה הלך והחמיר.

       המחיר אפסי: כל 39 הקבצים ב-public/images כבר WebP, 3.1MB
       בסך הכל, והגדול ביותר 296KB. המייסל החזיר עליהם כמעט את
       אותם בייטים.

       תמונות Sanity נטענות מ-cdn.sanity.io שמייעל בעצמו דרך
       פרמטרים בכתובת, ולכן גם הן לא מפסידות דבר. */
    unoptimized: true,

    /* נשמר למקרה שהמייעל יוחזר - בלי זה כל תמונת Sanity תיפול. */
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },

  async rewrites() {
    return [
      { source: heb("/גלריה/קלאסי"), destination: "/gallery/classic" },
      { source: heb("/גלריה/מודרני"), destination: "/gallery/modern" },
      { source: heb("/גלריה/כפרי"), destination: "/gallery/rustic" },
      { source: heb("/אודותינו"), destination: "/about" },
      { source: heb("/המלצות"), destination: "/testimonials" },
      { source: heb("/מטבחים-מודרניים"), destination: "/articles/modern" },
      { source: heb("/מטבחים-כפריים"), destination: "/articles/rustic" },
      { source: heb("/שיש-למטבח"), destination: "/stone" },
      { source: heb("/מטבחים---כל-מה-שרצית-לדעת"), destination: "/articles/guide" },
      { source: heb("/תקנון-ומדיניות-פרטיות"), destination: "/terms" },
      { source: heb("/מדיניות-פרטיות"), destination: "/privacy" },
      { source: heb("/הצהרת-נגישות"), destination: "/accessibility" },
    ];
  },

  async redirects() {
    return [
      // עמוד המחשבון נדחה לשלב ב'. עד אז מפנים ליצירת קשר כדי למנוע 404.
      { source: heb("/מחשבון"), destination: "/contact", permanent: false },
      /* עמוד "מאמרים וסרטונים" הורד מהאוויר זמנית לבקשת דניאל.
         ⚠️ הקוד לא נמחק - app/(site)/articles נשאר במקומו,
         וההחזרה היא הסרת ההפניה והחזרת השורות ל-nav ול-sitemap.
         מפנים ולא מוחקים: הנתיב היה באתר הישן ומאונדקס.
         ⚠️ שלושת המאמרים עצמם (מודרניים, כפריים, המדריך) לא
         הוסרו - הם נתיבים ישנים ונפרדים ונשארו ב-sitemap.
         הם מיותמים כרגע מבחינת קישור פנימי. */
      { source: heb("/מאמרים-וטיפים"), destination: "/", permanent: false },
      /* עמוד "המעצבים שלנו" הורד מהאוויר זמנית לבקשת דניאל.
         ⚠️ הקוד לא נמחק - app/(site)/designers ו-DesignersHero
         נשארו במקומם. ההחזרה היא הסרת ההפניה הזו והחזרת השורות
         ל-nav ול-sitemap, ותו לא.
         מפנים ולא מוחקים כדי שמי שיש לו את הקישור לא ייתקל
         ב-404. הנתיב לא היה באתר הישן ולכן אין כאן סיכון SEO. */
      { source: heb("/המעצבים-שלנו"), destination: "/contact", permanent: false },
      // הקטגוריה "בהתאמה אישית" הוסרה לבקשת הלקוח. מפנים לגלריה
      // הראשית כדי לא לאבד תנועה מהנתיב שהיה מאונדקס.
      // permanent: false במכוון - ההחלטה הפיכה.
      { source: heb("/גלריה/בהתאמה-אישית"), destination: heb("/גלריה/קלאסי"), permanent: false },
      /* עמוד הגלריה הראשי הוסר לבקשת הלקוח - "מטבחים" בתפריט
         הוא פותח תפריט בלבד ואין מאחוריו עמוד.
         מפנים ולא מוחקים: /גלריה היה נתיב באתר הישן ועשוי להיות
         מאונדקס, ו-404 היה מאבד את התנועה. permanent: false כי
         ההחלטה הפיכה. */
      { source: heb("/גלריה"), destination: heb("/גלריה/קלאסי"), permanent: false },
    ];
  },
};

export default nextConfig;
