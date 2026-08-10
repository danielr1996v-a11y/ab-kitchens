import { defineField, defineType, defineArrayMember } from "sanity";

/**
 * סכמות הבלוקים - שיקוף אחד-לאחד של הטיפוסים ב-lib/sections.ts
 * ושל הצורות ב-lib/content.ts. שדה שלא קיים שם לא קיים כאן.
 *
 * שני שדות עתידיים - align ו-reverse - כבר כתובים אבל hidden:
 * שלב 2 הוא מחיקת שורת ה-hidden, לא מיגרציה של נתונים.
 *
 * העברית בכותרות (title) היא מה שדניאל רואה ב-Studio. שמות השדות
 * (name) באנגלית - הם המפתחות בנתונים.
 */

/** שדות משותפים לכל בלוק. hidden עד שלב 2 */
const futureFields = [
  defineField({
    name: "align",
    title: "יישור",
    type: "string",
    options: { list: [
      { title: "ימין", value: "right" },
      { title: "מרכז", value: "center" },
    ], layout: "radio" },
    initialValue: "right",
    hidden: true, // נפתח בשלב 2
  }),
  defineField({
    name: "hidden",
    title: "מוסתר באתר",
    type: "boolean",
    initialValue: false,
    hidden: true, // נפתח בשלב 2
  }),
];

/** תמונה עם hotspot - הפותר של בעיית הקרופ במובייל */
const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "טקסט חלופי (לנגישות ולגוגל)",
        type: "string",
        validation: (r) => r.required().error("חובה - מתאר את התמונה למי שלא רואה אותה"),
      }),
    ],
  });

/* ===== הירו ===== */
export const heroBlock = defineType({
  name: "hero",
  title: "באנר ראשי",
  type: "object",
  fields: [
    defineField({
      name: "slides",
      title: "תמונות (מתחלפות בסליידשואו)",
      type: "array",
      of: [defineArrayMember(imageField("slide", "תמונה") as never)],
      validation: (r) => r.min(1).error("צריך לפחות תמונה אחת"),
    }),
    ...futureFields,
  ],
  preview: { select: { media: "slides.0" }, prepare: (s) => ({ title: "באנר ראשי", media: s.media as never }) },
});

/* ===== אודות ===== */
export const aboutBlock = defineType({
  name: "about",
  title: "אודות",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "כותרת (Enter = ירידת שורה בעיצוב)",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "paragraphs",
      title: "פסקאות",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "ctaText", title: "טקסט הכפתור", type: "string" }),
    ...futureFields,
  ],
  preview: { select: { title: "title" }, prepare: (s) => ({ title: "אודות", subtitle: String(s.title ?? "").split("\n")[0] }) },
});

/* ===== בחרו סגנון ===== */
export const styleGridBlock = defineType({
  name: "styleGrid",
  title: "בחרו סגנון",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "cards",
      title: "כרטיסים",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "title", title: "שם הסגנון", type: "string", validation: (r) => r.required() }),
          imageField("image", "תמונה"),
        ],
        preview: { select: { title: "title", media: "image" } },
      })],
    }),
    ...futureFields,
  ],
  preview: { select: { title: "title" }, prepare: (s) => ({ title: "בחרו סגנון", subtitle: s.title as string }) },
});

/* ===== עקרונות ===== */
export const valuesBlock = defineType({
  name: "values",
  title: "עקרונות",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
    defineField({ name: "intro", title: "משפט פתיחה", type: "string" }),
    defineField({
      name: "items",
      title: "העקרונות",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
          defineField({
            name: "description",
            title: "תיאור (**מודגש** בין כוכביות)",
            type: "text",
            rows: 3,
          }),
          imageField("image", "תמונה"),
        ],
        preview: { select: { title: "title", media: "image" } },
      })],
    }),
    ...futureFields,
  ],
  preview: { select: { title: "title" }, prepare: (s) => ({ title: "עקרונות", subtitle: s.title as string }) },
});

/* ===== סומכים עלינו ===== */
export const trustedByBlock = defineType({
  name: "trustedBy",
  title: "סומכים עלינו",
  type: "object",
  fields: [
    defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "groups",
      title: "קבוצות לוגואים",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "label", title: "שם הקבוצה", type: "string", validation: (r) => r.required() }),
          defineField({
            name: "logos",
            title: "לוגואים",
            type: "array",
            of: [defineArrayMember({
              type: "image",
              fields: [defineField({ name: "name", title: "שם החברה", type: "string", validation: (r) => r.required() })],
            })],
          }),
        ],
        preview: { select: { title: "label" } },
      })],
    }),
    ...futureFields,
  ],
  preview: { prepare: () => ({ title: "סומכים עלינו" }) },
});

/* ===== באנר מובילים ===== */
export const leadBannerBlock = defineType({
  name: "leadBanner",
  title: "באנר מובילים",
  type: "object",
  fields: [
    defineField({ name: "titleBold", title: "שורה ראשונה (מודגשת)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "titleLight", title: "שורה שנייה", type: "string" }),
    defineField({ name: "subtitle", title: "משפט משנה", type: "string" }),
    defineField({ name: "ctaText", title: "טקסט הכפתור", type: "string" }),
    defineField({
      name: "slides",
      title: "תמונות רקע (מתחלפות)",
      type: "array",
      of: [defineArrayMember(imageField("slide", "תמונה") as never)],
    }),
    ...futureFields,
  ],
  preview: { select: { title: "titleBold" }, prepare: (s) => ({ title: "באנר מובילים", subtitle: s.title as string }) },
});

/* ===== המלצות ===== */
export const testimonialsBlock = defineType({
  name: "testimonials",
  title: "המלצות",
  type: "object",
  fields: [
    defineField({
      name: "reviews",
      title: "ביקורות",
      type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "name", title: "שם הלקוח", type: "string", validation: (r) => r.required() }),
          defineField({ name: "text", title: "הביקורת", type: "text", rows: 4, validation: (r) => r.required() }),
          defineField({
            name: "rating",
            title: "דירוג (1-5)",
            type: "number",
            initialValue: 5,
            validation: (r) => r.required().min(1).max(5).integer(),
          }),
        ],
        preview: { select: { title: "name", subtitle: "text" } },
      })],
    }),
    ...futureFields,
  ],
  preview: { prepare: () => ({ title: "המלצות" }) },
});
