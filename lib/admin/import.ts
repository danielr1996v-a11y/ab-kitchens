import "server-only";
import { db, now } from "./db";
import { HttpError } from "./session";
import { displayTitle, typeById, type EntryData } from "./schema";
import { sanitizeFields } from "./sanitize";
import { articles } from "@/lib/articles";
import { aboutProjects, kitchenPages, testimonials as homeReviews } from "@/lib/content";
import { featuredLetter, featuredQuote, googleReviews, testimonials as wallReviews } from "@/lib/testimonialsPage";
import { clientVideos } from "@/lib/videos";
import { channelVideos, hiddenVideoIds } from "@/lib/channel";

/**
 * ייבוא התוכן שיושב היום בקבצי lib/ אל מסד הנתונים (המפרט §11).
 *
 * - מזהה קבוע לכל פריט (`repo-<סוג>-<מפתח>`), כך שהרצה חוזרת לא
 *   יוצרת כפילויות. **פריט שכבר קיים לא נדרס** - עריכה במערכת
 *   גוברת על הקובץ.
 * - כל פריט נכנס כמפורסם, עם גרסה ראשונה בהיסטוריה.
 * - כל התמונות שבשימוש נרשמות בספריית המדיה, כדי שיופיעו בבוחר.
 *
 * ⛔ מול מסד בענן רק באישור מפורש של דניאל (המפרט §0). השער:
 * ADMIN_ALLOW_IMPORT=1 בסביבה - בלעדיו, ייבוא לענן נחסם.
 */

const ARTICLE_PATHS: Record<string, string> = {
  /* מתוך ה-rewrites ב-next.config.ts - הכתובות הציבוריות שכבר מדורגות */
  classic: "/מטבח-קלאסי",
  modern: "/מטבחים-מודרניים",
  rustic: "/מטבחים-כפריים",
  "stone-natural": "/שיש-טבעי",
  "stone-quartz": "/שיש-קוורץ",
  "stone-porcelain": "/שיש-פורצלן",
};

type Item = { id: string; type: string; fields: Record<string, unknown>; path?: string };

function collect(): Item[] {
  const items: Item[] = [];

  for (const a of articles) {
    items.push({
      id: `repo-article-${a.slug}`,
      type: "article",
      path: ARTICLE_PATHS[a.slug],
      fields: {
        title: a.title,
        excerpt: a.excerpt,
        relatedStyle: a.relatedStyle,
        blocks: a.blocks.map((b) => ({ heading: b.heading ?? "", paragraphs: b.paragraphs })),
        image: a.image ?? "",
        imageAlt: a.imageAlt ?? "",
      },
    });
  }

  /* המלצות כתובות - הנוסח העדכני מהקוד, לא מ-Sanity (ADMIN-SPEC §0) */
  for (const r of homeReviews) {
    items.push({
      id: `repo-testimonial-${r.id}`,
      type: "testimonial",
      fields: { kind: "written", name: r.name, rating: r.rating, text: r.text, onHome: true },
    });
  }
  /* הקיר: המכתב מוצמד ראשון, ואחריו הסדר הקיים */
  for (const [t, pinned] of [[featuredLetter, true], [featuredQuote, false], ...wallReviews.map((w) => [w, false] as const)] as const) {
    items.push({
      id: `repo-testimonial-${t.id}`,
      type: "testimonial",
      fields: {
        kind: "screenshot",
        name: t.author ?? "",
        source: t.source,
        image: t.image,
        quote: t.quote,
        imageAlt: t.imageAlt,
        place: t.place ?? "",
        date: t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date) ? t.date : "",
        scores: t.scores ?? [],
        pinned,
      },
    });
  }
  for (const g of googleReviews) {
    items.push({
      id: `repo-testimonial-${g.id}`,
      type: "testimonial",
      fields: { kind: "google", name: g.name, rating: g.rating, text: g.text },
    });
  }

  for (const v of clientVideos) {
    items.push({
      id: `repo-video-client-${v.id}`,
      type: "video",
      fields: { kind: "client", youtube: v.id, alt: v.alt, poster: `/images/testimonials/video/${v.id}.webp` },
    });
  }
  for (const v of channelVideos) {
    items.push({
      id: `repo-video-${v.id}`,
      type: "video",
      fields: {
        kind: "channel",
        youtube: v.id,
        title: v.title,
        category: v.cat,
        poster: v.w ? `/images/videos/${v.id}.webp` : "",
        hidden: hiddenVideoIds.has(v.id),
      },
    });
  }

  /* פרויקטים: רשימה אחת עם שני מתגים (ADMIN-SPEC §1.4, החלטה 2).
     תמונה שמופיעה גם ברצועה וגם בגלריה - פריט אחד */
  const projects = new Map<string, Item>();
  for (const p of aboutProjects.columns.flat()) {
    const style = p.id.split("-")[1];
    projects.set(p.src, { id: `repo-project-${p.id}`, type: "project", fields: { image: p.src, alt: p.alt, style, inStrip: true, inGallery: false } });
  }
  for (const [style, page] of Object.entries(kitchenPages)) {
    for (const g of page.gallery) {
      const existing = projects.get(g.image);
      if (existing) {
        existing.fields.inGallery = true;
        /* התיאור הספציפי של הגלריה טוב יותר מהכללי של הרצועה */
        existing.fields.alt = g.alt;
      } else {
        const key = g.image.replace(/^\/images\/|\.webp$/g, "");
        projects.set(g.image, { id: `repo-project-${key}`, type: "project", fields: { image: g.image, alt: g.alt, style, inStrip: false, inGallery: true } });
      }
    }
  }
  items.push(...projects.values());

  return items;
}

async function imageSize(url: string): Promise<{ w: number | null; h: number | null; bytes: number | null }> {
  try {
    const { readFile } = await import("node:fs/promises");
    const sharp = (await import("sharp")).default;
    const buf = await readFile(`public${url}`);
    const m = await sharp(buf).metadata();
    return { w: m.width ?? null, h: m.height ?? null, bytes: buf.length };
  } catch {
    /* ב-Vercel public/ לא תמיד זמין לפונקציה - בלי מידות, לא נכשל */
    return { w: null, h: null, bytes: null };
  }
}

export async function importRepoContent() {
  if (process.env.TURSO_DATABASE_URL && process.env.ADMIN_ALLOW_IMPORT !== "1") {
    throw new HttpError(403, "ייבוא למסד בענן דורש אישור מפורש (ADMIN_ALLOW_IMPORT)");
  }
  const c = await db();
  const t = now();
  const counters: Record<string, number> = {};
  const perType: Record<string, number> = {};
  const images = new Set<string>();
  const writes = [];

  for (const item of collect()) {
    const type = typeById(item.type)!;
    const fields = sanitizeFields(type, item.fields);
    const data: EntryData = { title: displayTitle(type, fields), fields };
    if (type.hasPage) {
      data.path = item.path ?? "";
      data.seo = { title: "", description: "", image: "", noindex: false };
    }
    const position = (perType[item.type] = (perType[item.type] ?? -1) + 1);
    const json = JSON.stringify(data);
    writes.push(
      {
        sql: `INSERT INTO entries (id, type, status, data, revision, updated_at, position)
              VALUES (?, ?, 'publish', ?, 1, ?, ?) ON CONFLICT(id) DO NOTHING`,
        args: [item.id, item.type, json, t, position],
      },
      {
        sql: `INSERT INTO revisions (entry_id, data, author, created_at)
              SELECT ?, ?, 'ייבוא מהאתר', ? WHERE NOT EXISTS (SELECT 1 FROM revisions WHERE entry_id = ?)`,
        args: [item.id, json, t, item.id],
      },
    );
    counters[item.type] = (counters[item.type] ?? 0) + 1;
    for (const f of type.fields) if (f.kind === "image" && typeof fields[f.key] === "string" && fields[f.key]) images.add(fields[f.key] as string);
  }

  for (const url of images) {
    const { w, h, bytes } = await imageSize(url);
    writes.push({
      sql: `INSERT INTO media (url, name, width, height, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(url) DO NOTHING`,
      args: [url, url.split("/").pop()!, w, h, bytes, t],
    });
  }

  const before = await c.execute("SELECT COUNT(*) AS n FROM entries");
  await c.batch(writes, "write");
  const after = await c.execute("SELECT COUNT(*) AS n FROM entries");
  return { found: counters, added: Number(after.rows[0].n) - Number(before.rows[0].n), images: images.size };
}
