import { site } from "@/lib/content";

/**
 * פנייה מהאתר - החוזה המשותף בין הטפסים לשרת.
 *
 * ⚠️ **עד 7.10 אף טופס באתר לא שלח לשום מקום.** חלקם פתחו את
 * תוכנת המייל של הגולש (mailto) וחלקם שלחו ל-action="#" -
 * כלומר מי שמילא פשוט נעלם. דניאל בחר: מייל לאברהם.
 * כל הטפסים עוברים דרך sendLead, במקום אחד.
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
      error: "invalid" | "send-failed" | "network";
    };

/** טלפון ישראלי סביר: 9-13 ספרות אחרי ניקוי רווחים ומקפים */
export const isValidPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length >= 9 && d.length <= 13;
};

/**
 * שליחה מהדפדפן ישירות ל-FormSubmit. לעולם לא זורק - כל כישלון
 * חוזר כתוצאה.
 *
 * ⚠️ **מהדפדפן ולא מהשרת (9.11).** השליחה דרך /api/lead נכשלה
 * מהשרת של Vercel (send-failed) - FormSubmit לא מקבל בקשות מכתובות
 * של שרתים. אותה בקשה בדיוק מהדפדפן, מהדומיין של האתר, עברה. זה
 * גם השימוש ש-FormSubmit מתעד: AJAX מהעמוד עצמו.
 *
 * המחיר: כתובת המייל של אברהם גלויה בקוד של הדף - היא כבר גלויה
 * בפוטר ובעמוד יצירת קשר, אז לא נחשף כאן שום דבר חדש.
 */
export async function sendLead(input: LeadInput): Promise<LeadResult> {
  /* מלכודת לבוטים: שדה חבוי שאדם לא רואה ולא ממלא. בוט שמילא
     אותו מקבל "הצלחה" - כך הוא לא לומד לעקוף */
  if (input.company?.trim()) return { ok: true };

  const name = input.name.trim().slice(0, 80);
  const phone = input.phone.trim().slice(0, 30);
  const message = (input.message ?? "").trim().slice(0, 2000);
  const source = (input.source || "האתר").trim().slice(0, 60);
  if (!name || !isValidPhone(phone)) return { ok: false, error: "invalid" };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        שם: name,
        טלפון: phone,
        ...(message && { הודעה: message }),
        "נשלח מ": source,
        _subject: `פנייה חדשה מהאתר - ${name}`,
        _template: "table",
        _captcha: "false",
      }),
    });
    /* ⚠️ לפני הפעלה חד-פעמית FormSubmit מחזיר success=false - והטופס
       מציג לגולש וואטסאפ וטלפון, כך שפנייה לא נבלעת בשקט */
    const data = (await res.json().catch(() => null)) as { success?: string | boolean } | null;
    return res.ok && String(data?.success) === "true" ? { ok: true } : { ok: false, error: "send-failed" };
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
