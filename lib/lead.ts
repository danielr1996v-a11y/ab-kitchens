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

/** תשובת /api/lead: מזהה הפנייה שנשמרה (null = השמירה נכשלה) ולאן לשלוח את המייל */
export type LeadSaved = { ok: true; id: string | null; to: string } | Extract<LeadResult, { ok: false }>;

/** טלפון ישראלי סביר: 9-13 ספרות אחרי ניקוי רווחים ומקפים */
export const isValidPhone = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length >= 9 && d.length <= 13;
};

const post = (body: unknown) =>
  fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/**
 * שליחה מהדפדפן. לעולם לא זורק - כל כישלון חוזר כתוצאה.
 *
 * שלושה צעדים: שמירה במערכת (/api/lead, שמחזיר גם לאן לשלוח) ←
 * מייל ל-FormSubmit **מהדפדפן** ← דיווח למערכת שהמייל עבר.
 *
 * ⚠️ **המייל מהדפדפן ולא מהשרת (9.11).** באתר החי השליחה מהשרת של
 * Vercel נכשלה בכל פנייה - FormSubmit לא מקבל בקשות מכתובות של
 * שרתים. אותה בקשה מהדפדפן, מהדומיין של האתר, עוברת. כתובת המייל
 * גלויה בדפדפן - היא כבר גלויה בפוטר ובעמוד יצירת קשר.
 *
 * הגולש מקבל "נשלח" אם הפנייה נשמרה **או** שהמייל עבר.
 */
export async function sendLead(input: LeadInput): Promise<LeadResult> {
  let saved: LeadSaved;
  try {
    saved = (await (await post(input)).json()) as LeadSaved;
  } catch {
    saved = { ok: true, id: null, to: site.email };
  }
  if (!saved.ok) return saved;
  /* מלכודת הבוטים נתפסה בשרת - לא שולחים מייל */
  if (!saved.to) return { ok: true };

  let emailed = false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${saved.to}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        שם: input.name.trim(),
        טלפון: input.phone.trim(),
        ...(input.message?.trim() && { הודעה: input.message.trim() }),
        "נשלח מ": input.source,
        _subject: `פנייה חדשה מהאתר - ${input.name.trim()}`,
        _template: "table",
        _captcha: "false",
      }),
    });
    const data = (await res.json().catch(() => null)) as { success?: string | boolean } | null;
    emailed = res.ok && String(data?.success) === "true";
  } catch {
    /* רשת - נשאר emailed=false */
  }

  if (emailed && saved.id) post({ emailed: saved.id }).catch(() => {});
  return emailed || saved.id ? { ok: true } : { ok: false, error: "send-failed" };
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
