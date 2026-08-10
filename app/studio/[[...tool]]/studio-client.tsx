"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

/**
 * עטיפת הלקוח של ה-Studio. מופרדת מה-page כדי שה-page יוכל להיות
 * שרת ולבדוק isConfigured בלי למשוך את כל ה-Studio לכל בקשה.
 */
export default function StudioClient() {
  return <NextStudio config={config} />;
}
