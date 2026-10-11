import "server-only";
import { cached } from "@/lib/site/cache";
import { db } from "./db";
import { site } from "@/lib/content";

/**
 * הגדרות האתר - שלב 7 (המפרט §7, "הגדרות").
 *
 * ברירת המחדל = מה שבקוד (lib/content), כך שהאתר עובד גם לפני
 * שמישהו שמר משהו. ⚠️ hideFromGoogle פעיל כברירת מחדל - עד ההשקה
 * האתר החדש לא נכנס לגוגל (המפרט: "להסתיר מגוגל - ברירת המחדל עד ההשקה").
 */

export type SiteSettings = {
  name: string;
  description: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  whatsapp: string;
  /** להסתיר מגוגל - noindex בכל האתר, גם ב-production */
  hideFromGoogle: boolean;
  /** מזהה הפיקסל של פייסבוק - מוזרק רק לעמודים הציבוריים */
  pixelId: string;
  /** לאן נשלחות הפניות במייל. ריק = המייל של העסק */
  leadEmail: string;
};

export const defaultSettings: SiteSettings = {
  name: site.name,
  description: "תכנון, ייצור והתקנה של מטבחים ושיש בהתאמה אישית - הכל תחת קורת גג אחת. המפעל והספק הישיר, ללא מתווכים.",
  phone1: site.phone1,
  phone2: site.phone2,
  email: site.email,
  address: site.address,
  whatsapp: site.whatsappNumber,
  hideFromGoogle: true,
  pixelId: "981884166678578",
  leadEmail: "",
};

export const SETTINGS_TAG = "settings";

export const getSettings = cached(
  async (): Promise<SiteSettings> => {
    try {
      const { rows } = await (await db()).execute({ sql: "SELECT value FROM settings WHERE key = 'site'", args: [] });
      return rows[0] ? { ...defaultSettings, ...JSON.parse(String(rows[0].value)) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },
  ["site-settings"],
  [SETTINGS_TAG],
);

const CONTROL = /[\u0000-\u001F\u007F]/g;
const str = (v: unknown, max: number, fallback: string) => (typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : fallback);

export async function saveSettings(raw: Record<string, unknown>) {
  const cur = await getSettings();
  const next: SiteSettings = {
    name: str(raw.name, 80, cur.name) || cur.name,
    description: str(raw.description, 300, cur.description),
    phone1: str(raw.phone1, 30, cur.phone1),
    phone2: str(raw.phone2, 30, cur.phone2),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(raw.email, 120, "")) ? str(raw.email, 120, "") : cur.email,
    address: str(raw.address, 120, cur.address),
    whatsapp: /^\d{8,15}$/.test(str(raw.whatsapp, 15, "")) ? str(raw.whatsapp, 15, "") : cur.whatsapp,
    hideFromGoogle: typeof raw.hideFromGoogle === "boolean" ? raw.hideFromGoogle : cur.hideFromGoogle,
    pixelId: /^\d{0,20}$/.test(str(raw.pixelId, 20, "")) ? str(raw.pixelId, 20, "") : cur.pixelId,
    leadEmail: raw.leadEmail === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(raw.leadEmail, 120, "")) ? str(raw.leadEmail, 120, "") : cur.leadEmail,
  };
  await (await db()).execute({
    sql: "INSERT INTO settings (key, value) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    args: [JSON.stringify(next)],
  });
  return next;
}
