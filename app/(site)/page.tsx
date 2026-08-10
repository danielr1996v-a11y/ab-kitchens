import SectionRenderer from "@/components/SectionRenderer";
import { homeSections } from "@/lib/sections";

/**
 * דף הבית.
 *
 * הסקשנים מגיעים כנתון ולא כרשימת JSX קבועה, כדי שסדר והסתרה
 * יהיו ניתנים לשליטה ממערכת הניהול בלי לגעת בקוד. כרגע המקור הוא
 * content.ts; בהמשך תוחלף שורה אחת בשאילתה.
 */
export default function HomePage() {
  return <SectionRenderer sections={homeSections} />;
}
