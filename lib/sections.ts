import {
  heroSlideshow,
  about,
  styleSection,
  values,
  trustedBy,
  leadBanner,
  testimonials,
} from "@/lib/content";

/**
 * הגדרת הבלוקים שמהם מורכב עמוד.
 *
 * זו נקודת החיבור העתידית למערכת הניהול: כל סקשן באתר הוא פריט
 * במערך, עם `_type` שקובע איזו קומפוננטה מרנדרת אותו. היום המערך
 * נבנה מ-content.ts, ובהמשך הוא יגיע מ-Sanity - בלי שהרנדרר או
 * הקומפוננטות ידעו מאיפה הגיע.
 *
 * למה מערך ולא רשימת JSX קבועה: כדי שסדר, הסתרה והוספה של סקשנים
 * יהיו נתון ולא קוד. השדות `align` ו-`reverse` כבר בטיפוס אבל עוד
 * לא בשימוש - הם נפתחים בשלב הבא, בלי לשנות את המבנה.
 */

/** יישור אפשרי. סט סגור בכוונה - לא CSS חופשי. */
export type Align = "right" | "center";

/** מה שמשותף לכל בלוק, בלי קשר לסוג שלו */
type BlockBase = {
  /** מזהה יציב. משמש כ-key וכעוגן לעריכה הוויזואלית */
  _key: string;
  /** הסתרה בלי מחיקה - שימושי לסקשן עונתי */
  hidden?: boolean;
  align?: Align;
  /** היפוך סדר תמונה/טקסט בסקשנים דו-טוריים */
  reverse?: boolean;
};

export type Section =
  | (BlockBase & { _type: "hero"; slideshow: typeof heroSlideshow })
  | (BlockBase & { _type: "about"; content: typeof about })
  | (BlockBase & { _type: "styleGrid"; content: typeof styleSection })
  | (BlockBase & { _type: "values"; content: typeof values })
  | (BlockBase & { _type: "trustedBy"; content: typeof trustedBy })
  | (BlockBase & { _type: "leadBanner"; content: typeof leadBanner; withForm?: boolean })
  | (BlockBase & { _type: "testimonials"; reviews: typeof testimonials });

/** שמות הסוגים - נגזר מהטיפוס, כך שאי אפשר לשכוח לעדכן */
export type SectionType = Section["_type"];

/**
 * דף הבית כפי שהוא היום, בדיוק באותו סדר.
 *
 * זהו מקור הזמני. כשה-CMS יחובר, הפונקציה הזו תוחלף בשאילתה -
 * וזו כל השרשרת שתשתנה.
 */
export const homeSections: Section[] = [
  { _key: "hero", _type: "hero", slideshow: heroSlideshow },
  { _key: "about", _type: "about", content: about },
  { _key: "styleGrid", _type: "styleGrid", content: styleSection },
  { _key: "values", _type: "values", content: values },
  { _key: "trustedBy", _type: "trustedBy", content: trustedBy },
  { _key: "leadBanner", _type: "leadBanner", content: leadBanner },
  { _key: "testimonials", _type: "testimonials", reviews: testimonials },
];
