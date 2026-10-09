import "server-only";
import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * סיסמאות, עוגייה חתומה וקישורי כניסה - בלי ספרייה חיצונית.
 *
 * ⚠️ scrypt ולא SHA: גיבוב מהיר מאפשר לנחש מיליוני סיסמאות בשנייה
 * אם המסד דולף. scrypt נבנה להיות איטי ויקר בזיכרון בכוונה.
 * הפרמטרים (N=16384) הם ברירת המחדל של Node - כ-50ms לבדיקה.
 */

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [algo, saltB64, keyB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64url");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length);
  /* השוואה בזמן קבוע - השוואה רגילה נעצרת בתו הראשון שונה,
     והזמן מסגיר כמה תווים נכונים */
  return timingSafeEqual(actual, expected);
}

/* ===== עוגייה חתומה: מייל + תוקף בלבד (המפרט §5) ===== */

export const SESSION_COOKIE = "abk_admin";
/** 14 יום. ארוך מספיק כדי שאברהם לא יתחבר כל בוקר מחדש */
export const SESSION_DAYS = 14;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET חסר או קצר מ-32 תווים. ראו .env.example",
    );
  }
  return s;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSessionValue(email: string): string {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = Buffer.from(JSON.stringify({ e: email, x: exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** מחזיר את המייל אם העוגייה תקינה ובתוקף, אחרת null */
export function readSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof e !== "string" || typeof x !== "number" || x < Date.now()) return null;
    return e;
  } catch {
    return null;
  }
}

/* ===== קישור כניסה חד-פעמי ===== */

/** 72 שעות - מספיק כדי שאברהם יפתח את הוואטסאפ גם אחרי סוף שבוע */
export const SETUP_HOURS = 72;

/** ⚠️ במסד נשמר רק הגיבוב של הקישור, לא הקישור עצמו: מי שקורא
    את המסד לא יכול להיכנס בשם אף אחד. */
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("base64url");

export function createSetupToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    hash: hashToken(token),
    expires: new Date(Date.now() + SETUP_HOURS * 3_600_000).toISOString(),
  };
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
