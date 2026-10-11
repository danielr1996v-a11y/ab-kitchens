import PageDoc from "@/components/site/PageDoc";

/**
 * דף הבית - מעץ האלמנטים שבמסד (שלב 5ב).
 *
 * ⚠️ עד שלב 5ב התוכן הגיע מ-Sanity. בייבוא נשמר בעץ מה שהוצג אז
 * באתר, חוץ מההמלצות, שמגיעות מהמערכת (הנוסח העדכני, ADMIN-SPEC §0).
 * ה-h1 המוסתר נשמר בעץ כמו שהוא.
 */
export default function HomePage() {
  return <PageDoc path="/" />;
}
