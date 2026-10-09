/**
 * סכמת סוגי התוכן - ADMIN-SPEC §1. קובץ אחד, שממנו נבנים:
 *   - הטפסים במערכת (components/admin/ItemEditor.tsx)
 *   - הניקוי והבדיקה בשרת (lib/admin/sanitize.ts)
 *
 * ⚠️ "אל תמציא סוגי תוכן או שדות" (המפרט §0): כל שדה כאן קיים היום
 * באתר, בקבצי lib/. שדה חדש נכנס רק אחרי החלטה של דניאל - ונכנס
 * כאן, ומכאן לבד גם לניקוי בשרת.
 *
 * הקובץ משותף לדפדפן ולשרת, ולכן בלי שום דבר סודי.
 */

export type Option = { value: string; label: string };

type Base = {
  key: string;
  label: string;
  required?: boolean;
  /** הסבר קצר מתחת לשדה */
  help?: string;
  /** מוצג רק כשהתנאי מתקיים - "שדה לא רלוונטי מוסתר" (המפרט §7) */
  when?: { field: string; in: string[] };
};

export type Field =
  | (Base & { kind: "text"; max?: number; dir?: "ltr" })
  | (Base & { kind: "textarea"; max?: number; rows?: number })
  /** טקסט עשיר במובן של האתר: פסקאות, ו-**מודגש**. בלי HTML בכלל */
  | (Base & { kind: "paragraphs" })
  | (Base & { kind: "stepper"; min: number; max: number })
  | (Base & { kind: "toggle" })
  | (Base & { kind: "segmented"; options: Option[] })
  | (Base & { kind: "date" })
  | (Base & { kind: "image" })
  | (Base & { kind: "youtube" })
  | (Base & { kind: "repeater"; itemLabel: string; fields: Field[] });

export type FieldKind = Field["kind"];

export type ContentType = {
  id: "article" | "testimonial" | "video" | "project";
  view: "articles" | "testimonials" | "videos" | "projects";
  singular: string;
  plural: string;
  /** "המלצה חדשה" ולא "המלצה חדש" */
  feminine?: boolean;
  /** יש לפריט עמוד משלו באתר - ולכן כתובת ו-SEO */
  hasPage: boolean;
  /** איזה שדה הוא שם הפריט ברשימות */
  titleField: string;
  /** שדה שני לשם, כשהראשון ריק (סרטון לקוח: אין כותרת, יש תיאור) */
  altTitleField?: string;
  /** כשאין שם (המלצה אנונימית, פרויקט) */
  fallbackTitle?: string;
  imageField?: string;
  /** פילטר בשורה מעל הרשימה (המפרט §6) */
  filterField?: string;
  fields: Field[];
};

const STYLES: Option[] = [
  { value: "classic", label: "קלאסי" },
  { value: "modern", label: "מודרני" },
  { value: "rustic", label: "כפרי" },
  { value: "stone", label: "שיש" },
];

export const contentTypes: ContentType[] = [
  {
    id: "article",
    view: "articles",
    singular: "מאמר",
    plural: "מאמרים",
    hasPage: true,
    titleField: "title",
    imageField: "image",
    filterField: "relatedStyle",
    fields: [
      { key: "title", label: "כותרת", kind: "text", required: true, max: 120 },
      { key: "excerpt", label: "תקציר", kind: "textarea", required: true, max: 220, rows: 2, help: "שורה אחת - מופיעה בכרטיס ברשימת המאמרים" },
      { key: "relatedStyle", label: "עמוד סגנון", kind: "segmented", required: true, options: STYLES, help: "בעמוד הזה תופיע קובייה עם המאמר" },
      {
        key: "blocks",
        label: "גוף המאמר",
        kind: "repeater",
        required: true,
        itemLabel: "קטע",
        fields: [
          { key: "heading", label: "כותרת הקטע (רשות)", kind: "text", max: 120 },
          { key: "paragraphs", label: "פסקאות", kind: "paragraphs", required: true },
        ],
      },
      { key: "image", label: "תמונה ראשית", kind: "image", help: "בלי תמונה: משטח פחם עם הלוגו" },
      { key: "imageAlt", label: "תיאור התמונה", kind: "text", max: 160, help: "מה רואים בתמונה - לקוראי מסך ולגוגל", when: { field: "image", in: ["*"] } },
    ],
  },
  {
    id: "testimonial",
    view: "testimonials",
    singular: "המלצה",
    plural: "המלצות",
    feminine: true,
    hasPage: false,
    titleField: "name",
    fallbackTitle: "המלצה ללא שם",
    imageField: "image",
    filterField: "kind",
    fields: [
      {
        key: "kind",
        label: "סוג",
        kind: "segmented",
        required: true,
        options: [
          { value: "written", label: "כתובה" },
          { value: "screenshot", label: "צילום מסך" },
          { value: "google", label: "גוגל" },
        ],
      },
      { key: "name", label: "שם", kind: "text", max: 60, help: "שם פרטי ואות. ריק = אנונימי" },
      { key: "text", label: "טקסט ההמלצה", kind: "textarea", required: true, max: 1500, rows: 5, when: { field: "kind", in: ["written", "google"] } },
      { key: "rating", label: "דירוג", kind: "stepper", min: 1, max: 5, when: { field: "kind", in: ["written", "google"] } },
      {
        key: "source",
        label: "מקור",
        kind: "segmented",
        required: true,
        options: [
          { value: "וואטסאפ", label: "וואטסאפ" },
          { value: "מידרג", label: "מידרג" },
          { value: "מכתב", label: "מכתב" },
        ],
        when: { field: "kind", in: ["screenshot"] },
      },
      { key: "image", label: "צילום", kind: "image", required: true, when: { field: "kind", in: ["screenshot"] } },
      { key: "quote", label: "תמלול", kind: "paragraphs", required: true, help: "הטקסט שבצילום, מילה במילה. פסקה לכל פסקה בצילום - בשביל קוראי מסך וגוגל", when: { field: "kind", in: ["screenshot"] } },
      { key: "imageAlt", label: "תיאור הצילום", kind: "text", required: true, max: 200, help: "משפט אחד: מה רואים. למשל \"הודעת וואטסאפ עם המלצה על המטבח\"", when: { field: "kind", in: ["screenshot"] } },
      { key: "place", label: "מקום", kind: "text", max: 60, when: { field: "kind", in: ["screenshot"] } },
      { key: "date", label: "תאריך", kind: "date", help: "רק כשהוא מופיע בצילום", when: { field: "kind", in: ["screenshot"] } },
      {
        key: "scores",
        label: "ציוני מידרג",
        kind: "repeater",
        itemLabel: "ציון",
        when: { field: "source", in: ["מידרג"] },
        fields: [
          { key: "label", label: "תחום", kind: "text", required: true, max: 40 },
          { key: "value", label: "ציון", kind: "stepper", min: 1, max: 10 },
        ],
      },
      { key: "onHome", label: "מוצג בדף הבית", kind: "toggle", when: { field: "kind", in: ["written"] } },
      { key: "pinned", label: "מוצמד לראש הקיר", kind: "toggle", help: "כמו המכתב של הלקוח", when: { field: "kind", in: ["screenshot"] } },
    ],
  },
  {
    id: "video",
    view: "videos",
    singular: "סרטון",
    plural: "סרטונים",
    hasPage: false,
    titleField: "title",
    altTitleField: "alt",
    fallbackTitle: "סרטון המלצה",
    imageField: "poster",
    filterField: "kind",
    fields: [
      {
        key: "kind",
        label: "סוג",
        kind: "segmented",
        required: true,
        options: [
          { value: "client", label: "המלצת לקוח" },
          { value: "channel", label: "ערוץ" },
        ],
      },
      { key: "youtube", label: "קישור יוטיוב", kind: "youtube", required: true },
      { key: "title", label: "כותרת", kind: "text", required: true, max: 120, when: { field: "kind", in: ["channel"] } },
      {
        key: "category",
        label: "קטגוריה",
        kind: "segmented",
        required: true,
        options: [
          { value: "carpentry", label: "נגרות" },
          { value: "stone", label: "שיש" },
        ],
        when: { field: "kind", in: ["channel"] },
      },
      { key: "alt", label: "תיאור נגיש", kind: "text", required: true, max: 200, help: "מה רואים בסרטון - בלי להמציא", when: { field: "kind", in: ["client"] } },
      { key: "poster", label: "תמונת כיסוי", kind: "image", help: "ריק = התמונה מיוטיוב" },
      { key: "hidden", label: "מוסתר באתר", kind: "toggle", help: "למשל סרטון כפול" },
    ],
  },
  {
    id: "project",
    view: "projects",
    singular: "פרויקט",
    plural: "פרויקטים",
    hasPage: false,
    titleField: "alt",
    fallbackTitle: "פרויקט",
    imageField: "image",
    filterField: "style",
    fields: [
      { key: "image", label: "תמונה", kind: "image", required: true },
      { key: "alt", label: "תיאור התמונה", kind: "text", required: true, max: 160 },
      { key: "style", label: "סגנון", kind: "segmented", required: true, options: STYLES },
      { key: "inStrip", label: "ברצועת הפרויקטים בעמוד אודות", kind: "toggle" },
      { key: "inGallery", label: "בגלריה של עמוד הסגנון", kind: "toggle" },
    ],
  },
];

export const typeById = (id: string) => contentTypes.find((t) => t.id === id);
export const typeByView = (view: string) => contentTypes.find((t) => t.view === view);

/** האם שדה מוצג, לפי הערכים הנוכחיים. "*" = כל ערך שאינו ריק */
export function isVisible(field: Field, values: Record<string, unknown>): boolean {
  if (!field.when) return true;
  const v = values[field.when.field];
  if (field.when.in.includes("*")) return v != null && v !== "";
  return field.when.in.includes(String(v ?? ""));
}

/** מזהה יוטיוב מכל צורה של קישור, או המזהה עצמו */
export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/* ===== SEO - המפרט §7 ===== */
export const SEO_TITLE_MAX = 60;
export const SEO_DESC_MAX = 155;

export type Seo = { title?: string; description?: string; image?: string; noindex?: boolean };

/** מבנה רשומה (המפרט §2), בלי status ו-revision שיושבים בעמודות */
export type EntryData = {
  title: string;
  /** רק לסוגים עם עמוד */
  path?: string;
  fields: Record<string, unknown>;
  seo?: Seo;
};

/** שם לתצוגה ברשימות, מהשדה שהסוג מגדיר */
export function displayTitle(type: ContentType, fields: Record<string, unknown>): string {
  for (const key of [type.titleField, type.altTitleField]) {
    const v = key ? fields[key] : "";
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return type.fallbackTitle || type.singular;
}
