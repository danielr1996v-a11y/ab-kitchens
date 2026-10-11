import { NextResponse } from "next/server";
import { syncChannel } from "@/lib/admin/youtube";

/**
 * סנכרון יומי של ערוץ היוטיוב - נקרא מ-Vercel Cron (vercel.json).
 *
 * ⚠️ מוגן ב-CRON_SECRET: Vercel שולח אותו בכותרת Authorization.
 * בלעדיו כל אחד היה יכול להפעיל קריאות ליוטיוב ולמסד.
 * לא נוגע באתר - רק מוסיף טיוטות, ולכן גם לא מרוקן מטמון.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await syncChannel());
  } catch (e) {
    /* יוטיוב לא ענה - מחר ינסה שוב. האתר לא מושפע */
    console.error("[cron/youtube]", e);
    return NextResponse.json({ error: "feed unavailable" }, { status: 502 });
  }
}
