import {
  isVisible,
  SEO_DESC_MAX,
  SEO_TITLE_MAX,
  youtubeId,
  type ContentType,
  type Field,
  type Seo,
} from "./schema";

/**
 * ניקוי בשרת - המפרט §5. כל ערך שנכנס למסד עובר כאן.
 *
 * ⚠️ הניקוי נגזר מהסכמה: שדה שלא מופיע בסכמה נזרק, ושדה חדש
 * בסכמה נוקה לבד לפי הסוג שלו. אין כאן רשימת שדות נפרדת שאפשר
 * לשכוח לעדכן.
 *
 * ⚠️ אין HTML בשום שדה. טקסט עשיר באתר הזה הוא פסקאות עם **מודגש**,
 * ו-React מציג אותו כטקסט - כך שאין מה לנקות מ-HTML ואין דרך
 * להזריק סקריפט.
 */

/* תווי בקרה (חוץ משורה חדשה וטאב) - לא שייכים לטקסט של אתר */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : "";

/** תמונה: רק מהאתר עצמו (/images, /media) או מאחסון Vercel Blob */
export function safeImageUrl(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (/^\/(images|media)\/[\w.\-/]+$/.test(s) && !s.includes("..")) return s;
  if (/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[\w.\-/%]+$/i.test(s)) return s;
  return "";
}

/** כתובת עמוד: /מילים-עם-מקפים. אותיות בכל שפה, ספרות ומקף */
export function safePath(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return s ? `/${s}` : "";
}

function cleanField(field: Field, v: unknown): unknown {
  switch (field.kind) {
    case "text":
      return clean(v, field.max ?? 200);
    case "textarea":
      return clean(v, field.max ?? 2000);
    case "paragraphs":
      return Array.isArray(v)
        ? v.map((p) => clean(p, 4000)).filter(Boolean).slice(0, 80)
        : [];
    case "stepper": {
      const n = Math.round(Number(v));
      return Number.isFinite(n) && v !== "" && v != null
        ? Math.min(field.max, Math.max(field.min, n))
        : null;
    }
    case "toggle":
      return v === true;
    case "segmented":
      return field.options.some((o) => o.value === v) ? v : "";
    case "date":
      return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
    case "image":
      return safeImageUrl(v);
    case "youtube":
      return typeof v === "string" ? (youtubeId(v) ?? "") : "";
    case "repeater":
      return Array.isArray(v)
        ? v
            .slice(0, 100)
            .map((item) => cleanFields(field.fields, item))
            .filter((item) => Object.values(item).some((x) => x !== "" && x != null && !(Array.isArray(x) && !x.length)))
        : [];
  }
}

function cleanFields(fields: Field[], raw: unknown): Record<string, unknown> {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.key] = cleanField(f, src[f.key]);
  return out;
}

export const sanitizeFields = (type: ContentType, raw: unknown) => cleanFields(type.fields, raw);

export function sanitizeSeo(raw: unknown): Seo {
  const s = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    /* מגבלה רכה בממשק (מונה), וקשיחה כאן עם מרווח - כדי שהקלדה
       של תו או שניים מעבר לא תיזרק בשקט */
    title: clean(s.title, SEO_TITLE_MAX + 40),
    description: clean(s.description, SEO_DESC_MAX + 80),
    image: safeImageUrl(s.image),
    noindex: s.noindex === true,
  };
}

const isEmpty = (v: unknown) =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0);

/** שדות חובה שחסרים - רק מתוך המוצגים (שדה מוסתר לא נבדק).
    מחזיר את השמות בעברית, כדי להציג אותם כמו שהם. */
export function missingRequired(fields: Field[], values: Record<string, unknown>, prefix = ""): string[] {
  const missing: string[] = [];
  for (const f of fields) {
    if (!isVisible(f, values)) continue;
    const v = values[f.key];
    if (f.required && isEmpty(v)) missing.push(prefix + f.label);
    if (f.kind === "repeater" && Array.isArray(v)) {
      v.forEach((item, i) =>
        missing.push(...missingRequired(f.fields, item as Record<string, unknown>, `${f.itemLabel} ${i + 1}: `)),
      );
    }
  }
  /* תיאור תמונה: חובה רק כשיש תמונה (ADMIN-SPEC §1.1) */
  if (values.image && "imageAlt" in values && isEmpty(values.imageAlt) && !prefix) {
    const f = fields.find((x) => x.key === "imageAlt");
    if (f && !missing.includes(f.label)) missing.push(f.label);
  }
  return missing;
}
