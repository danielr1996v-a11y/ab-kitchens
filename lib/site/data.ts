import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/admin/db";
import type { EntryData } from "@/lib/admin/schema";
import type { Article } from "@/lib/articles";
import type { Testimonial } from "@/lib/testimonialsPage";
import type { ClientVideo } from "@/lib/videos";
import type { ChannelVideo } from "@/lib/channel";

/**
 * מה שהאתר הציבורי קורא ממסד הנתונים - שלב 5א.
 *
 * ⚠️ רק פריטים **מפורסמים**, בסדר הידני מהמערכת. טיוטות לא נוגעות
 * באתר (המפרט §1).
 *
 * ⚠️ הצורות כאן זהות לאלה שהרכיבים קיבלו מקבצי lib/ עד היום -
 * כך הרכיבים לא השתנו, רק המקור. זה מה שמבטיח שהמראה לא זז.
 *
 * מטמון: כל סוג תוכן מתויג `entries:<type>`. פרסום, ביטול פרסום,
 * מחיקה וסידור מחדש מרוקנים את התג (lib/site/revalidate.ts).
 * שמירת טיוטה לא (המפרט §4).
 */

export const entriesTag = (type: string) => `entries:${type}`;

type Row = { id: string; fields: Record<string, unknown>; path: string; seo: EntryData["seo"] };

async function published(type: string): Promise<Row[]> {
  const { rows } = await (await db()).execute({
    sql: "SELECT id, data FROM entries WHERE type = ? AND status = 'publish' ORDER BY position ASC, updated_at DESC",
    args: [type],
  });
  return rows.map((r) => {
    const d = JSON.parse(String(r.data)) as EntryData;
    return { id: String(r.id), fields: d.fields ?? {}, path: d.path ?? "", seo: d.seo };
  });
}

/** מידות של כל התמונות - בלעדיהן יש קפיצת פריסה בטעינה */
async function mediaSizes(): Promise<Map<string, { w: number; h: number }>> {
  const { rows } = await (await db()).execute("SELECT url, width, height FROM media WHERE width IS NOT NULL");
  return new Map(rows.map((r) => [String(r.url), { w: Number(r.width), h: Number(r.height) }]));
}

const s = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
/* מזהה למפתחות React - בלי הקידומת של הייבוא, כמו שהיה בקבצים */
const shortId = (id: string, type: string) => id.replace(new RegExp(`^repo-${type}-`), "");

/* ===== מאמרים ===== */

export type SiteArticle = Article & { path: string; seo: EntryData["seo"] };

export const getArticles = unstable_cache(
  async (): Promise<SiteArticle[]> =>
    (await published("article")).map((r) => ({
      slug: shortId(r.id, "article"),
      path: r.path,
      seo: r.seo,
      title: s(r.fields.title),
      excerpt: s(r.fields.excerpt),
      image: s(r.fields.image) || undefined,
      imageAlt: s(r.fields.imageAlt) || undefined,
      relatedStyle: s(r.fields.relatedStyle) as Article["relatedStyle"],
      blocks: arr<{ heading?: string; paragraphs?: string[] }>(r.fields.blocks).map((b) => ({
        heading: b.heading || undefined,
        paragraphs: arr<string>(b.paragraphs),
      })),
    })),
  ["site-articles"],
  { tags: [entriesTag("article")] },
);

/* ===== המלצות ===== */

export type HomeReview = { id: string; name: string; rating: number; text: string };

export const getTestimonials = unstable_cache(
  async () => {
    const [rows, sizes] = await Promise.all([published("testimonial"), mediaSizes()]);
    const written: HomeReview[] = [];
    const google: HomeReview[] = [];
    const wall: (Testimonial & { pinned: boolean })[] = [];
    for (const r of rows) {
      const f = r.fields;
      const id = shortId(r.id, "testimonial");
      if (f.kind === "written" && f.onHome) {
        written.push({ id, name: s(f.name), rating: Number(f.rating ?? 5), text: s(f.text) });
      } else if (f.kind === "google") {
        google.push({ id, name: s(f.name), rating: Number(f.rating ?? 5), text: s(f.text) });
      } else if (f.kind === "screenshot") {
        const size = sizes.get(s(f.image)) ?? { w: 1080, h: 1080 };
        wall.push({
          id,
          quote: arr<string>(f.quote),
          author: s(f.name) || undefined,
          place: s(f.place) || undefined,
          source: s(f.source) as Testimonial["source"],
          image: s(f.image),
          imageAlt: s(f.imageAlt),
          w: size.w,
          h: size.h,
          date: s(f.date) || undefined,
          scores: arr<{ label: string; value: number }>(f.scores).length ? arr(f.scores) : undefined,
          pinned: f.pinned === true,
        });
      }
    }
    /* מוצמדים (המכתב) ראשונים, השאר לפי הסדר הידני */
    wall.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    return { written, google, wall };
  },
  ["site-testimonials"],
  { tags: [entriesTag("testimonial")] },
);

/* ===== סרטונים ===== */

export const getVideos = unstable_cache(
  async () => {
    const [rows, sizes] = await Promise.all([published("video"), mediaSizes()]);
    const client: (ClientVideo & { poster: string })[] = [];
    const channel: (ChannelVideo & { poster: string })[] = [];
    for (const r of rows) {
      const f = r.fields;
      if (f.hidden === true) continue;
      const id = s(f.youtube);
      const poster = s(f.poster);
      const size = sizes.get(poster) ?? { w: 0, h: 0 };
      if (f.kind === "client") client.push({ id, alt: s(f.alt), poster, w: size.w, h: size.h });
      else channel.push({ id, title: s(f.title), cat: s(f.category) as ChannelVideo["cat"], poster, w: size.w, h: size.h });
    }
    return { client, channel };
  },
  ["site-videos"],
  { tags: [entriesTag("video")] },
);

/* ===== פרויקטים ===== */

export type SiteProject = { id: string; src: string; alt: string; style: string; inStrip: boolean; inGallery: boolean };

export const getProjects = unstable_cache(
  async (): Promise<SiteProject[]> =>
    (await published("project")).map((r) => ({
      id: shortId(r.id, "project"),
      src: s(r.fields.image),
      alt: s(r.fields.alt),
      style: s(r.fields.style),
      inStrip: r.fields.inStrip === true,
      inGallery: r.fields.inGallery === true,
    })),
  ["site-projects"],
  { tags: [entriesTag("project")] },
);

/* ===== הפניות - כתובת שהשתנתה בפרסום ===== */

export const getRedirect = unstable_cache(
  async (path: string): Promise<string | null> => {
    const { rows } = await (await db()).execute({ sql: "SELECT to_path FROM redirects WHERE from_path = ?", args: [path] });
    return rows[0] ? String(rows[0].to_path) : null;
  },
  ["site-redirect"],
  { tags: ["redirects"] },
);
