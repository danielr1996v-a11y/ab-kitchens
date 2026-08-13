import type { Metadata } from "next";
import DesignersHero from "@/components/DesignersHero";

export const metadata: Metadata = {
  title: "המעצבים שלנו | א. בית המטבחים",
  description:
    "מה קורה בפגישה עם מעצב מטבחים: מה כדאי להביא, מה עוברים יחד, ומה יוצאים איתו. ללא עלות וללא התחייבות.",
  alternates: { canonical: "/המעצבים-שלנו" },
  openGraph: {
    title: "המעצבים שלנו | א. בית המטבחים",
    description:
      "מה קורה בפגישה עם מעצב מטבחים: מה כדאי להביא, מה עוברים יחד, ומה יוצאים איתו.",
    url: "/המעצבים-שלנו",
  },
};

/**
 * עמוד "המעצבים שלנו".
 *
 * הוכרע עם דניאל: העמוד מדבר ללקוח פרטי ולא מציג צוות בשמות
 * ותמונות. לכן הוא לא עוסק במי הם אלא בפגישה עצמה - מה שמסיר
 * את אי-הוודאות בדיוק לפני ה-CTA.
 *
 * נבנה סקשן אחר סקשן. כרגע: הפתיח בלבד.
 */
export default function DesignersPage() {
  return <DesignersHero />;
}
