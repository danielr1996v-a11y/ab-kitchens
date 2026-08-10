import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/sanity/live";

/**
 * הגשר בין האתר ל-Sanity - שתי קומפוננטות שיושבות בסוף ה-layout:
 *
 * - SanityLive: מחזיק את חיבור העדכון החי. בזכותו שינוי ב-Studio
 *   מופיע באתר תוך שניות בלי בנייה
 * - VisualEditing: רק במצב טיוטה - שכבת הלחיצה שממפה כל טקסט
 *   בעמוד לשדה שלו ב-Studio
 *
 * כשאין חיבור (לפני החשבון) הקומפוננטה לא מרנדרת כלום, והאתר
 * מתנהג בדיוק כמו היום.
 */
export default async function SanityBridge() {
  if (!SanityLive) return null;
  const { isEnabled } = await draftMode();
  return (
    <>
      <SanityLive />
      {isEnabled && <VisualEditing />}
    </>
  );
}
