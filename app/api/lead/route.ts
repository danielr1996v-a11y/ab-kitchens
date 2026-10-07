import { site } from "@/lib/content";
import { isValidPhone, type LeadResult } from "@/lib/lead";

/**
 * POST /api/lead - שולח מייל לאברהם על כל פנייה מהאתר.
 *
 * ⚠️ **השליחה דרך Resend, ובלי מפתח היא לא עובדת.** המפתח
 * (RESEND_API_KEY) הוא סוד שרת - דניאל מזין אותו ב-Vercel
 * ובקובץ .env.local, והוא לא עובר דרך הקוד ולא נכנס לריפו.
 * כל עוד אין מפתח, התשובה היא not-configured והטופס מציג
 * לגולש וואטסאפ וטלפון - פנייה לא נבלעת בשקט.
 *
 * ⚠️ **שולח (from):** Resend מאפשר לשלוח מ-onboarding@resend.dev
 * **רק לכתובת של בעל החשבון.** לכן או שהחשבון נפתח עם המייל
 * של אברהם, או שמאמתים את הדומיין ab-kitchens.co.il ומגדירים
 * LEAD_FROM. אחרת Resend ידחה את השליחה.
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

  const key = process.env.RESEND_API_KEY;
  if (!key) return json({ ok: false, error: "not-configured" }, 503);

  const text = [
    `שם: ${name}`,
    `טלפון: ${phone}`,
    message ? `\nהודעה:\n${message}` : "",
    `\nנשלח מ: ${source}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to: [process.env.LEAD_TO ?? site.email],
        subject: `פנייה חדשה מהאתר - ${name}`,
        text,
      }),
    });
    if (!res.ok) return json({ ok: false, error: "send-failed" }, 502);
  } catch {
    return json({ ok: false, error: "send-failed" }, 502);
  }

  return json({ ok: true });
}
