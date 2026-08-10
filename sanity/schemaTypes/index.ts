import { defineField, defineType, defineArrayMember } from "sanity";
import {
  heroBlock,
  aboutBlock,
  styleGridBlock,
  valuesBlock,
  trustedByBlock,
  leadBannerBlock,
  testimonialsBlock,
} from "./blocks";

/**
 * מסמך "עמוד" - מערך סקשנים.
 *
 * בשלב 1 המערך נעול לעריכת תוכן בלבד: sortable=false ואין
 * הוספה/מחיקה מהממשק. שלב 2 פותח את הגרירה בשינוי דגל אחד.
 */
const page = defineType({
  name: "page",
  title: "עמוד",
  type: "document",
  fields: [
    defineField({ name: "title", title: "שם העמוד (פנימי)", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "כתובת",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "סקשנים",
      type: "array",
      // שלב 1: בלי גרירה ובלי הוספה - עריכת תוכן בלבד.
      // שלב 2: מוחקים את שתי השורות האלה.
      options: { sortable: false, disableActions: ["add", "remove", "duplicate", "copy"] },
      of: [
        defineArrayMember({ type: "hero" }),
        defineArrayMember({ type: "about" }),
        defineArrayMember({ type: "styleGrid" }),
        defineArrayMember({ type: "values" }),
        defineArrayMember({ type: "trustedBy" }),
        defineArrayMember({ type: "leadBanner" }),
        defineArrayMember({ type: "testimonials" }),
      ],
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const schemaTypes = [
  page,
  heroBlock,
  aboutBlock,
  styleGridBlock,
  valuesBlock,
  trustedByBlock,
  leadBannerBlock,
  testimonialsBlock,
];
