import { isValidPhone, type LeadResult } from "@/lib/lead";
import { markEmailed, saveLead } from "@/lib/admin/leads";
import { rateLimit } from "@/lib/admin/session";
import { getSettings } from "@/lib/admin/settings";

/**
 * POST /api/lead - שומר כל פנייה מהאתר במערכת, ושולח מייל לאברהם.
 *
 * ⚠️ שלב 7: **הפנייה נשמרת קודם.** אם היא נשמרה, הגולש מקבל "נשלח"
 * גם כשהמייל נכשל (למשל לפני הפעלת FormSubmit) - הפנייה ממתינה במסך "פניות". רק
 * כשגם השמירה וגם המייל נכשלו - הגולש מקבל וואטסאפ וטלפון.
 *
 * ⚠️ **השליחה דרך FormSubmit (9.11), לא Resend.** דניאל ביקש את
 * הדרך הפשוטה ביותר: בלי חשבון, בלי מפתח ובלי רשומות DNS. המחיר:
 * המייל מגיע מכתובת של FormSubmit, ויש סיכוי גבוה יותר לספאם.
 *
 * FormSubmit דוחה בקשה בלי Referer, ולכן מעבירים את הכתובת
 * של האתר שממנו הגיעה הפנייה.
 */
const json = (body: LeadResult, status = 200) =>
  Response.json(body, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  /* מלכודת לבוטים: שדה חבוי שאדם לא רואה ולא ממלא. בוט שמילא
     אותו מקבל "הצלחה" - כך הוא לא לומד לעקוף. */
  if (String(body.company ?? "").trim()) return json({ ok: true });

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

  let storedId: string | null = null;
  try {
    storedId = await saveLead({ name, phone, message, source });
  } catch (e) {
    console.error("[lead] save failed", e);
  }

  /* היעד: "מייל לפניות" מההגדרות, אחרת מייל העסק */
  const settings = await getSettings();
  const to = settings.leadEmail || settings.email;
  const origin = new URL(request.url).origin;

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: origin,
        Referer: `${origin}/`,
      },
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
    const data = (await res.json().catch(() => null)) as {
      success?: string | boolean;
    } | null;
    if (!res.ok || String(data?.success) !== "true") {
      return storedId ? json({ ok: true }) : json({ ok: false, error: "send-failed" }, 502);
    }
  } catch {
    return storedId ? json({ ok: true }) : json({ ok: false, error: "send-failed" }, 502);
  }

  if (storedId) await markEmailed(storedId).catch(() => {});
  return json({ ok: true });
}
