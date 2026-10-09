import type { Permission } from "./roles";

/**
 * המסכים של מערכת הניהול והסיידבר - מקור אחד לשניהם.
 *
 * קבוצות לפי המפרט §6: תוכן עיקרי (סוגי התוכן) / תוכן האתר
 * (עמודים ותפריט+פוטר) / ניהול. מסך שאין עליו הרשאה לא מוצג
 * בסיידבר, **וגם נחסם בשרת** (app/admin/page.tsx).
 *
 * `stage` = השלב באפיון שבו המסך נבנה. עד אז מוצג מצב ריק שאומר
 * את זה במפורש, ולא מסך מזויף.
 */

export type ViewId =
  | "dashboard"
  | "articles"
  | "testimonials"
  | "videos"
  | "projects"
  | "pages"
  | "shared"
  | "leads"
  | "users"
  | "settings";

export type IconName =
  | "LayoutDashboard"
  | "FileText"
  | "MessageSquareQuote"
  | "Clapperboard"
  | "Images"
  | "PanelsTopLeft"
  | "Menu"
  | "Inbox"
  | "Users"
  | "Settings";

export type NavView = {
  id: ViewId;
  label: string;
  icon: IconName;
  permission?: Permission;
  stage?: number;
  /** מה המסך יעשה - מוצג במצב הריק עד שהוא נבנה */
  about: string;
};

export type NavGroup = { label?: string; views: NavView[] };

export const navGroups: NavGroup[] = [
  {
    views: [
      {
        id: "dashboard",
        label: "לוח בקרה",
        icon: "LayoutDashboard",
        stage: 7,
        about: "פניות חדשות, מגמה של 30 יום, ומה נשמר ועדיין לא פורסם.",
      },
    ],
  },
  {
    label: "תוכן עיקרי",
    views: [
      { id: "articles", label: "מאמרים", icon: "FileText", permission: "items.edit", stage: 4, about: "כל המאמרים: הוספה, עריכה, טיוטה ופרסום, וקידום בגוגל." },
      { id: "testimonials", label: "המלצות", icon: "MessageSquareQuote", permission: "items.edit", stage: 4, about: "המלצות כתובות, צילומי מסך וביקורות גוגל ברשימה אחת." },
      { id: "videos", label: "סרטונים", icon: "Clapperboard", permission: "items.edit", stage: 4, about: "סרטוני לקוחות וסרטוני הערוץ. סרטון חדש מהערוץ מחכה כאן לאישור." },
      { id: "projects", label: "פרויקטים", icon: "Images", permission: "items.edit", stage: 4, about: "תמונות הפרויקטים: לאיזה סגנון, ואם מופיעות ברצועת אודות או בגלריה." },
    ],
  },
  {
    label: "תוכן האתר",
    views: [
      { id: "pages", label: "עמודים", icon: "PanelsTopLeft", permission: "pages.text", stage: 6, about: "כל עמודי האתר, ועריכה ויזואלית על העמוד עצמו." },
      { id: "shared", label: "תפריט עליון ופוטר", icon: "Menu", permission: "shared.edit", stage: 6, about: "ההדר, התפריט בטלפון והפוטר - נשמרים פעם אחת לכל האתר." },
    ],
  },
  {
    label: "ניהול",
    views: [
      { id: "leads", label: "פניות", icon: "Inbox", permission: "leads.view", stage: 7, about: "כל פנייה מהטפסים: מי, מתי, מאיזה עמוד, וסטטוס טיפול." },
      { id: "users", label: "משתמשים", icon: "Users", permission: "users.manage", about: "" },
      { id: "settings", label: "הגדרות", icon: "Settings", permission: "settings.edit", stage: 7, about: "שם האתר, פרטי קשר, \"להסתיר מגוגל\" ומזהה אנליטיקס." },
    ],
  },
];

export const allViews = navGroups.flatMap((g) => g.views);

export const findView = (id: string | undefined) =>
  allViews.find((v) => v.id === id) ?? allViews[0];
