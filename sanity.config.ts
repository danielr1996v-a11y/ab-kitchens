"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { projectId, dataset, apiVersion } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

/**
 * הגדרת ה-Studio.
 *
 * המבנה בסרגל בנוי כמו פאנל ניהול (הדמו שדניאל אישר): עמודים
 * למעלה, וכל השאר יתווסף בשלבים הבאים (מדיה, תפריט, הגדרות).
 *
 * presentationTool הוא העריכה הוויזואלית - העמוד האמיתי בתוך
 * ה-Studio, לחיצה על טקסט פותחת את השדה.
 */
export default defineConfig({
  name: "ab-kitchens",
  title: "א. בית המטבחים",
  projectId,
  dataset,
  basePath: "/studio",

  plugins: [
    structureTool({
      title: "עמודים",
      structure: (S) =>
        S.list()
          // id חובה לכל רשימה - בלעדיו ה-Studio זורק
          // "`id` is required for lists" ולא מציג כלום
          .id("content")
          .title("תוכן")
          .items([
            S.documentTypeListItem("page").id("pages").title("עמודים"),
          ]),
    }),
    presentationTool({
      title: "עריכה על העמוד",
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    // כלי שאילתות למפתח - שימושי לדיבוג, לא מזיק לדניאל
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: { types: schemaTypes },
});
