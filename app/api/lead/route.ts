import { site } from "@/lib/content";
import { isValidPhone, type LeadResult } from "@/lib/lead";

/**
 * POST /api/lead - שולח מייל לאברהם על כל פנייה מהאתר.
 *
 * ⚠️ **השליחה דרך FormSubmit (9.11), לא Resend.** דניאל ביקש את
 * הדרך הפשוטה ביותר: בלי חשבון, בלי מפתח ובלי רשומות DNS. המחיר:
 * המייל מגיע מכתובת של FormSubmit, ויש סיכוי גבוה יותר לספאם.
 *
 * ⚠️ **הפעלה חד-פעמית:** הפנייה הראשונה לא נמסרת. FormSubmit
 * שולח לאברהם מייל "Activate", ורק אחרי לחיצה המיילים מתחילים
 * להגיע. עד אז FormSubmit מחזיר success=false, והטופס מציג
 * לגולש וואטסאפ וטלפון - פנייה לא נבלעת בשקט.
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

  const origin = new URL(request.url).origin;

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
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
      return json({ ok: false, error: "send-failed" }, 502);
    }
  } catch {
    return json({ ok: false, error: "send-failed" }, 502);
  }

  return json({ ok: true });
}
