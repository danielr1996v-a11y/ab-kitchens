import { site } from "@/lib/content";

/**
 * פנייה מהאתר - החוזה המשותף בין הטפסים לשרת.
 *
 * ⚠️ **עד 7.10 אף טופס באתר לא שלח לשום מקום.** חלקם פתחו את
 * תוכנת המייל של הגולש (mailto) וחלקם שלחו ל-action="#" -
 * כלומר מי שמילא פשוט נעלם. דניאל בחר: מייל לאברהם.
 * כל הטפסים עוברים עכשיו דרך /api/lead, במקום אחד.
 */
export type LeadInput = {
  name: string;
  phone: string;
  /** רק בעמוד יצירת קשר */
  message?: string;
  /** איזה טופס שלח - מופיע בנושא המייל, כדי שאברהם יידע מאיפה הגיעו */
  source: string;
  /** מלכודת לבוטים. אדם לא רואה את השדה ולכן הוא תמיד ריק */
  company?: string;
};

export type LeadResult =
  | { ok: true }
  | {
      ok: false;
      error: "invalid" | "not-configured" | "send-failed" | "network";
    };

/** טלפון ישראלי סביר: 9-13 ספרות אחרי ניקוי רווחים ומקפים */
export const isValidPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length >= 9 && d.length <= 13;
};

/** שליחה מהדפדפן. לעולם לא זורק - כל כישלון חוזר כתוצאה */
export async function sendLead(input: LeadInput): Promise<LeadResult> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return (await res.json()) as LeadResult;
  } catch {
    return { ok: false, error: "network" };
  }
}

/**
 * ⚠️ **רשת הביטחון.** אם השליחה נכשלה מכל סיבה, הגולש מקבל
 * וואטסאפ לאברהם עם הפרטים שכבר מילא - כך פנייה לא נעלמת לעולם.
 */
export const leadWhatsappUrl = ({ name, phone, message }: Partial<LeadInput>) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    [
      "שלום, הגעתי מהאתר.",
      name ? `שם: ${name}` : "",
      phone ? `טלפון: ${phone}` : "",
      message ? `\n${message}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  )}`;
