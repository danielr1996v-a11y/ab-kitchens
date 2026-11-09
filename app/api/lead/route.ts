import { isValidPhone, type LeadSaved } from "@/lib/lead";
import { site } from "@/lib/content";
import { markEmailed, saveLead } from "@/lib/admin/leads";
import { rateLimit } from "@/lib/admin/session";
import { getSettings } from "@/lib/admin/settings";

/**
 * POST /api/lead - שומר כל פנייה מהאתר במערכת (מסך "פניות").
 *
 * ⚠️ **המייל לא נשלח מכאן (9.11).** FormSubmit לא מקבל בקשות מהשרת
 * של Vercel - באתר החי כל פנייה החזירה send-failed. הדפדפן שולח את
 * המייל בעצמו (lib/lead.ts), והנתיב הזה רק:
 *   1. שומר את הפנייה ומחזיר לאן לשלוח את המייל (מההגדרות במערכת)
 *   2. מסמן "נשלח במייל" כשהדפדפן מדווח שהמייל עבר ({ emailed: id })
 *
 * ⚠️ שלב 7: **הפנייה נשמרת קודם.** אם היא נשמרה, הגולש מקבל "נשלח"
 * גם כשהמייל נכשל - הפנייה ממתינה במסך "פניות". רק כשגם השמירה וגם
 * המייל נכשלו - הגולש מקבל וואטסאפ וטלפון.
 */
const json = (body: LeadSaved, status = 200) =>
  Response.json(body, { status });

/** "מייל לפניות" מההגדרות, אחרת מייל העסק. מסד לא זמין - מהקוד */
async function leadEmail() {
  try {
    const s = await getSettings();
    return s.leadEmail || s.email;
  } catch {
    return site.email;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  /* דיווח מהדפדפן שהמייל עבר. מזהה הוא UUID אקראי - אי אפשר לנחש
     פנייה של מישהו אחר, והסימון לא חושף ולא משנה שום תוכן */
  if (typeof body.emailed === "string") {
    await markEmailed(body.emailed.slice(0, 64)).catch(() => {});
    return json({ ok: true, id: null, to: "" });
  }

  /* מלכודת לבוטים: שדה חבוי שאדם לא רואה ולא ממלא. בוט שמילא
     אותו מקבל "הצלחה" - כך הוא לא לומד לעקוף. */
  if (String(body.company ?? "").trim()) return json({ ok: true, id: null, to: "" });

  const name = String(body.name ?? "")
    .trim()
    .slice(0, 80);
  const phone = String(body.phone ?? "")
    .trim()
    .slice(0, 30);
  const message = String(body.message ?? "")
    .trim()
    .slice(0, 2000);
  const source = String(body.source ?? "האתר")
    .trim()
    .slice(0, 60);

  if (!name || !isValidPhone(phone)) {
    return json({ ok: false, error: "invalid" }, 422);
  }

  /* הגבלת קצב: 8 פניות ל-10 דקות מאותה כתובת (המפרט §5) */
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  try {
    if (!(await rateLimit(`lead:${ip}`, 8, 600))) return json({ ok: false, error: "invalid" }, 429);
  } catch {
    /* מסד לא זמין - לא חוסמים פנייה בגלל זה */
  }

  let id: string | null = null;
  try {
    id = await saveLead({ name, phone, message, source });
  } catch (e) {
    console.error("[lead] save failed", e);
  }

  return json({ ok: true, id, to: await leadEmail() });
}
