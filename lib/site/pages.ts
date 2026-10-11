import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/admin/db";
import type { SiteDoc } from "./tree";
import { entriesTag } from "./data";

/**
 * עמודים כעץ אלמנטים - נשמרים כרשומות מסוג "page" (המפרט §2:
 * `doc?:{nodes}` ברשומה). רק הגרסה המפורסמת מגיעה לאתר.
 */

export type PageEntry = { id: string; title: string; path: string; doc: SiteDoc };

export const getPage = unstable_cache(
  async (path: string): Promise<PageEntry | null> => {
    const { rows } = await (await db()).execute({
      sql: "SELECT id, data FROM entries WHERE type = 'page' AND status = 'publish' AND json_extract(data, '$.path') = ?",
      args: [path],
    });
    if (!rows[0]) return null;
    const d = JSON.parse(String(rows[0].data));
    return { id: String(rows[0].id), title: d.title ?? "", path: d.path, doc: d.doc };
  },
  ["site-page"],
  { tags: [entriesTag("page")] },
);

/** חלק משותף - הדר או פוטר. נשמר פעם אחת ומורכב לכל עמוד (המפרט §3) */
export const getPart = unstable_cache(
  async (kind: "header" | "footer"): Promise<SiteDoc | null> => {
    const { rows } = await (await db()).execute({
      sql: "SELECT data FROM entries WHERE id = ? AND type = 'part' AND status = 'publish'",
      args: [`part-${kind}`],
    });
    return rows[0] ? JSON.parse(String(rows[0].data)).doc : null;
  },
  ["site-part"],
  { tags: [entriesTag("part")] },
);
