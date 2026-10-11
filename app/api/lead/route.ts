import { site } from "@/lib/content";
import { isValidPhone, type LeadResult } from "@/lib/lead";
import { markEmailed, saveLead } from "@/lib/admin/leads";
import { rateLimit } from "@/lib/admin/session";
import { getSettings } from "@/lib/admin/settings";

/**
 * POST /api/lead - שומר כל פנייה מהאתר במערכת, ושולח מייל לאברהם.
 *
 * ⚠️ שלב 7: **הפנייה נשמרת קודם.** אם היא נשמרה, הגולש מקבל "נשלח"
 * גם כשהמייל נכשל או שאין מפתח - הפנייה ממתינה במסך "פניות". רק
 * כשגם השמירה וגם המייל נכשלו - הגולש מקבל וואטסאפ וטלפון.
 *
 * ⚠️ **השליחה דרך Resend, ובלי מפתח היא לא עובדת.** המפתח
 * (RESEND_API_KEY) הוא סוד שרת - דניאל מזין אותו ב-Vercel
 * ובקובץ .env.local, והוא לא עובר דרך הקוד ולא נכנס לריפו.
 * בלי מפתח הפנייה עדיין נשמרת במערכת. not-configured חוזר רק אם
 * גם השמירה נכשלה - ואז הטופס מציג לגולש וואטסאפ וטלפון.
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

  const key = process.env.RESEND_API_KEY;
  if (!key) return storedId ? json({ ok: true }) : json({ ok: false, error: "not-configured" }, 503);

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
        /* היעד: LEAD_TO בסביבה, אחרת "מייל לפניות" מההגדרות, אחרת מייל העסק */
        to: [process.env.LEAD_TO ?? ((await getSettings()).leadEmail || (await getSettings()).email)],
        subject: `פנייה חדשה מהאתר - ${name}`,
        text,
      }),
    });
    if (!res.ok) return storedId ? json({ ok: true }) : json({ ok: false, error: "send-failed" }, 502);
  } catch {
    return storedId ? json({ ok: true }) : json({ ok: false, error: "send-failed" }, 502);
  }

  if (storedId) await markEmailed(storedId).catch(() => {});
  return json({ ok: true });
}
