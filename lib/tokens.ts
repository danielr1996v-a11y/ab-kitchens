/**
 * מפת השפה הגרפית - השמות בלבד, לא הערכים.
 *
 * ⚠️ הערכים יושבים **רק** ב-:root של globals.css. כאן רשום מה קיים
 * ולמה הוא משמש. עמוד הדוגמה קורא את הערך החי מהדפדפן, כך שאי
 * אפשר שהשניים ייפרדו. כשהעורך הוויזואלי ייבנה (שלב 6), בוחר הצבע
 * ובוחרי הגדלים שלו נבנים מהרשימה הזו.
 */

export type Token = {
  name: string;
  label: string;
  /** מתי משתמשים בו - מוצג בעמוד הדוגמה ובעורך */
  use?: string;
};

/**
 * צבעי המותג - מה שיופיע בבוחר הצבע של העורך (ADMIN-SPEC §3).
 * ⛔ שני הזהבים נפרדים ועם תווית שימוש, כדי שלא יוחלפו בטעות.
 */
export const brandColors: Token[] = [
  { name: "--color-header-bg", label: "פחם", use: "הדר, כרטיסים כהים" },
  { name: "--color-bg", label: "לבן", use: "רקע העמוד, משטחים" },
  { name: "--color-fg", label: "טקסט", use: "טקסט ראשי" },
  { name: "--color-muted", label: "אפור משני", use: "טקסט משני" },
  { name: "--color-surface", label: "משטח", use: "רקע אודות ופוטר" },
  { name: "--color-gold", label: "זהב פעולה", use: "כפתורים בלבד" },
  { name: "--color-logo-gold", label: "זהב לוגו", use: "מותג: מספרים, מרקר" },
];

/** צבעים שקיימים באתר אבל לא בבוחר: תפקיד צר מדי לעריכה חופשית */
export const systemColors: Token[] = [
  { name: "--color-deep", label: "פחם כהה", use: "סקשן הערכים" },
  { name: "--color-border", label: "קו", use: "קווי הפרדה ומסגרות" },
  { name: "--color-gold-text", label: "טקסט על זהב" },
  { name: "--color-on-dark", label: "על רקע כהה", use: "טקסט על פחם או תמונה" },
  { name: "--color-header-bg-hover", label: "פחם בריחוף" },
  { name: "--color-whatsapp", label: "וואטסאפ", use: "הכפתור הצף בלבד" },
];

export const fontSizes: Token[] = [
  { name: "--fs-display", label: "כותרת ראשית" },
  { name: "--fs-h1", label: "כותרת עמוד" },
  { name: "--fs-sub", label: "כותרת משנה" },
  { name: "--fs-card-title", label: "כותרת כרטיס" },
  { name: "--fs-card-body", label: "טקסט כרטיס" },
  { name: "--fs-base", label: "טקסט" },
  { name: "--fs-sm", label: "קטן" },
];

export const fontWeights = [
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 700, label: "Bold" },
];

export const spaces: Token[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  name: `--space-${n}`,
  label: `ריווח ${n}`,
}));

export const layout: Token[] = [
  { name: "--side-padding", label: "ריפוד צדדי" },
  { name: "--section-gap", label: "מרווח בין סקשנים" },
  { name: "--header-height", label: "גובה ההדר" },
];

export const radii: Token[] = [
  "--radius-6",
  "--radius-8",
  "--radius-10",
  "--radius-12",
  "--radius-16",
  "--radius-32",
  "--radius-round",
].map((name) => ({ name, label: name.replace("--radius-", "") }));

export const shadows: Token[] = [
  "--shadow-header",
  "--shadow-header-scrolled",
  "--shadow-review",
  "--shadow-card",
  "--shadow-card-hover",
  "--shadow-form",
  "--shadow-mega",
  "--shadow-thumb",
  "--shadow-thumb-hover",
  "--shadow-badge",
  "--shadow-hotspot-label",
  "--shadow-hotspot-ring",
  "--shadow-hotspot-ring-active",
  "--shadow-video-active",
  "--shadow-play-hover",
  "--shadow-fab",
  "--shadow-fab-hover",
].map((name) => ({ name, label: name.replace("--shadow-", "") }));

/** צללי טקסט - מוצגים על תמונה, כי על לבן לא רואים אותם */
export const textShadows: Token[] = [
  { name: "--shadow-text-on-photo", label: "טקסט על תמונה" },
  { name: "--shadow-title-on-photo", label: "כותרת על תמונה" },
];

export const motion: Token[] = [
  { name: "--dur", label: "מהיר" },
  { name: "--dur-slow", label: "איטי" },
  { name: "--ease", label: "האצה רגילה" },
  { name: "--ease-soft", label: "האצה רכה" },
];
