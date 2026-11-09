import "server-only";
import { randomUUID } from "node:crypto";
import { db, now } from "./db";
import { HttpError } from "./session";

/**
 * פניות מהאתר - שלב 7 (ADMIN-SPEC §6).
 *
 * ⚠️ כל פנייה נשמרת כאן **לפני** שליחת המייל. מייל שנכשל או FormSubmit
 * שלא הופעל - הפנייה עדיין ברשימה. "שום פנייה לא הולכת לאיבוד".
 *
 * פרטים אישיים: שם וטלפון יושבים רק במסד - לא בקוד, לא ב-git ולא
 * בתיקייה הציבורית (המפרט §5).
 */

export type LeadStatus = "new" | "in_progress" | "done" | "trash";
export const LEAD_STATUSES: LeadStatus[] = ["new", "in_progress", "done"];

export type Lead = {
  id: string;
  kind: "lead" | "contact";
  name: string;
  phone: string;
  message: string;
  source: string;
  note: string;
  emailed: boolean;
  status: LeadStatus;
  createdAt: string;
};

export async function saveLead(input: { name: string; phone: string; message: string; source: string }) {
  const id = randomUUID();
  const kind = input.message ? "contact" : "lead";
  await (await db()).execute({
    sql: "INSERT INTO submissions (id, kind, data, status, created_at) VALUES (?, ?, ?, 'new', ?)",
    args: [id, kind, JSON.stringify({ ...input, note: "", emailed: false }), now()],
  });
  return id;
}

export async function markEmailed(id: string) {
  await (await db()).execute({
    sql: "UPDATE submissions SET data = json_set(data, '$.emailed', json('true')) WHERE id = ?",
    args: [id],
  });
}

function toLead(r: Record<string, unknown>): Lead {
  const d = JSON.parse(String(r.data));
  return {
    id: String(r.id),
    kind: r.kind as Lead["kind"],
    name: d.name ?? "",
    phone: d.phone ?? "",
    message: d.message ?? "",
    source: d.source ?? "",
    note: d.note ?? "",
    emailed: d.emailed === true,
    status: r.status as LeadStatus,
    createdAt: String(r.created_at),
  };
}

export async function listLeads(trash: boolean): Promise<Lead[]> {
  const { rows } = await (await db()).execute(
    `SELECT * FROM submissions WHERE ${trash ? "status = 'trash'" : "status != 'trash'"} ORDER BY created_at DESC LIMIT 2000`,
  );
  return rows.map((r) => toLead(r as unknown as Record<string, unknown>));
}

export async function updateLead(id: string, patch: { status?: string; note?: string }) {
  const c = await db();
  if (patch.status !== undefined) {
    if (![...LEAD_STATUSES, "trash"].includes(patch.status as LeadStatus)) throw new HttpError(422, "סטטוס לא מוכר");
    await c.execute({ sql: "UPDATE submissions SET status = ? WHERE id = ?", args: [patch.status, id] });
  }
  if (patch.note !== undefined) {
    await c.execute({
      sql: "UPDATE submissions SET data = json_set(data, '$.note', ?) WHERE id = ?",
      args: [patch.note.slice(0, 2000), id],
    });
  }
}

/** מחיקה לצמיתות - רק מהסל, ורק למי שיש הרשאה (leads.delete) */
export async function deleteLead(id: string) {
  const res = await (await db()).execute({ sql: "DELETE FROM submissions WHERE id = ? AND status = 'trash'", args: [id] });
  if (!res.rowsAffected) throw new HttpError(422, "אפשר למחוק לצמיתות רק פנייה מהסל");
}

/**
 * ייצוא CSV. ⚠️ הגנה מהזרקת נוסחאות (המפרט §5): ערך שמתחיל ב-= + - @
 * מקבל גרש לפניו, אחרת אקסל מריץ אותו כנוסחה כשפותחים את הקובץ.
 */
export function toCsv(leads: Lead[]): string {
  const STATUS: Record<string, string> = { new: "חדשה", in_progress: "בטיפול", done: "טופלה", trash: "בסל" };
  const cell = (v: string) => {
    let s = v.replace(/\r?\n/g, " ");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = ["תאריך", "שם", "טלפון", "הודעה", "מאיפה", "סטטוס", "הערה"];
  const rows = leads.map((l) =>
    [new Date(l.createdAt).toLocaleString("he-IL"), l.name, l.phone, l.message, l.source, STATUS[l.status], l.note].map(cell).join(","),
  );
  /* BOM - כדי שאקסל יפתח עברית נכון */
  return "﻿" + [head.map(cell).join(","), ...rows].join("\r\n");
}

/* ===== לוח הבקרה ===== */

export async function leadStats() {
  const c = await db();
  const since60 = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const { rows } = await c.execute({
    sql: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS n FROM submissions WHERE status != 'trash' AND created_at >= ? GROUP BY day",
    args: [since60],
  });
  const byDay = new Map(rows.map((r) => [String(r.day), Number(r.n)]));
  const days = (from: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const d = new Date(Date.now() - (from + count - 1 - i) * 86_400_000).toISOString().slice(0, 10);
      return { day: d, n: byDay.get(d) ?? 0 };
    });
  const recent = days(0, 30);
  const previous = days(30, 30);
  const { rows: nr } = await c.execute("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'");
  return {
    newCount: Number(nr[0].n),
    recent,
    total30: recent.reduce((a, d) => a + d.n, 0),
    totalPrev30: previous.reduce((a, d) => a + d.n, 0),
  };
}
