import "server-only";
import { parse, NodeType as HtmlNodeType, type HTMLElement, type Node } from "node-html-parser";
import { nodeId, type NodeType, type SiteNode } from "@/lib/site/tree";
import { db, now } from "./db";
import { HttpError } from "./session";

/**
 * המרת עמוד קיים לעץ אלמנטים - ADMIN-SPEC §8 ("איך כל עמוד הופך
 * לעץ אלמנטים בלי שהמראה ישתנה").
 *
 * הדרך: קוראים את ה-HTML שהעמוד **כבר** מוציא, וממירים אותו צומת
 * אחר צומת - אותן תגיות, מחלקות ומאפיינים. כך לא כותבים שום עמוד
 * מחדש ביד, ואין איפה לטעות בהעתקה.
 *
 * מה שה-HTML לבדו לא מגלה מסומן ברכיב עצמו:
 *   - data-reveal   → Reveal (כניסה למסך)
 *   - data-widget   → רכיב נעול (components/site/widgets.tsx)
 * ומה שמזוהה לפי מבנה:
 *   - img עם data-nimg → next/image   (RenderTree)
 *   - a עם href פנימי  → next/link    (RenderTree)
 *   - nav.crumbs       → פירורי לחם, עם JSON-LD שנבנה מחדש
 */

const SECTION_TAGS = new Set(["section", "article", "header", "footer", "nav", "aside", "main"]);
const TEXT_TAGS = new Set(["p", "span", "strong", "em", "b", "i", "small", "li", "label", "blockquote", "figcaption", "time", "br", "summary", "dt", "dd", "cite", "mark"]);

function typeOf(tag: string): NodeType {
  if (/^h[1-6]$/.test(tag)) return "heading";
  if (tag === "a") return "link";
  if (tag === "img") return "image";
  if (tag === "svg") return "icon";
  if (SECTION_TAGS.has(tag)) return "section";
  if (TEXT_TAGS.has(tag)) return "text";
  return "container";
}

/** מאפיינים כמו שהם, **בסדר המקורי**. class נשמר במקומו כסימון ריק
    (התוכן ב-classes) - כך הרינדור מוציא את המאפיינים באותו סדר בדיוק */
function attrsOf(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(el.attributes)) out[k] = k === "class" ? "" : v;
  return out;
}

/* ===== זיהוי רכיבים נעולים ===== */

function breadcrumbs(el: HTMLElement): SiteNode {
  const trail = el.querySelectorAll(".crumbs__item").map((li) => {
    const a = li.querySelector("a.crumbs__link");
    const label = (a ?? li.querySelector(".crumbs__current"))?.text ?? "";
    return a ? { label, href: decodeURI(a.getAttribute("href") ?? "") } : { label };
  });
  const extra = el.classList.value.filter((c) => c !== "crumbs").join(" ");
  return { id: nodeId(), type: "widget", settings: { widget: "breadcrumbs", data: { trail, className: extra } } };
}

/* ===== ההמרה ===== */

function convert(n: Node): SiteNode | null {
  if (n.nodeType === HtmlNodeType.COMMENT_NODE) return null;
  if (n.nodeType === HtmlNodeType.TEXT_NODE) {
    /* text מפענח ישויות (&amp; → &). React יקודד מחדש ברינדור */
    const text = n.text;
    return text === "" ? null : { id: nodeId(), type: "text", props: { text } };
  }
  const el = n as HTMLElement;
  const tag = el.rawTagName?.toLowerCase();
  if (!tag) return null;

  if (tag === "nav" && el.classList.contains("crumbs")) return breadcrumbs(el);

  const attrs = attrsOf(el);
  const classes = el.classList.value.length ? [...el.classList.value] : undefined;

  /* רכיב נעול: כל העץ שמתחתיו מוחלף ב-widget אחד */
  if (attrs["data-widget"]) {
    let data: Record<string, unknown> = {};
    try {
      data = attrs["data-props"] ? JSON.parse(attrs["data-props"]) : {};
    } catch {
      throw new Error(`data-props לא תקין ב-${attrs["data-widget"]}`);
    }
    return { id: nodeId(), type: "widget", settings: { widget: attrs["data-widget"], data } };
  }

  if (tag === "script") {
    if (attrs.type !== "application/ld+json") return null;
    return { id: nodeId(), type: "html", props: { json: el.innerHTML } };
  }
  if (tag === "svg") {
    return { id: nodeId(), type: "icon", tag: "svg", classes, props: { attrs, svg: el.innerHTML } };
  }

  const node: SiteNode = { id: nodeId(), type: typeOf(tag), tag, classes };
  /* מעבר משותף בין עמודים (ViewTransition) - מסומן על התמונה */
  if (attrs["data-vt"]) {
    node.settings = { ...node.settings, viewTransition: attrs["data-vt"] };
    delete attrs["data-vt"];
  }
  if ("data-reveal" in attrs) {
    const t = Number(attrs["data-reveal"]);
    node.settings = { ...node.settings, reveal: Number.isFinite(t) && attrs["data-reveal"] !== "" ? { threshold: t } : {} };
    delete attrs["data-reveal"];
  }
  if (Object.keys(attrs).some((k) => k !== "class")) node.props = { attrs };
  const children = el.childNodes.map(convert).filter((c): c is SiteNode => c !== null);
  if (children.length) node.children = children;
  return node;
}

/** אלמנט שלם (למשל הפוטר) → צומת אחד, כולל האלמנט עצמו */
export function htmlElementToNodes(html: string, selector: string): SiteNode[] {
  const root = parse(html, { comment: false, blockTextElements: { script: true, style: true } });
  const el = root.querySelector(selector);
  if (!el) throw new Error(`לא נמצא ${selector} בעמוד`);
  const node = convert(el);
  return node ? [node] : [];
}

/** ה-HTML של עמוד → הצמתים שבתוך <main> */
export function htmlToNodes(html: string): SiteNode[] {
  const root = parse(html, { comment: false, blockTextElements: { script: true, style: true } });
  const main = root.querySelector("main");
  if (!main) throw new Error("לא נמצא <main> בעמוד");
  return main.childNodes.map(convert).filter((c): c is SiteNode => c !== null);
}

/* ===== שמירה במסד ===== */


/** מזהה קבוע לעמוד לפי הכתובת - ייבוא חוזר לא יוצר כפילויות */
const pageId = (path: string) =>
  "repo-page-" + (path === "/" ? "home" : encodeURIComponent(path.slice(1)).replace(/%/g, "").toLowerCase().slice(0, 80));

/**
 * קורא כל עמוד מהאתר שרץ עכשיו ושומר אותו כעץ.
 * ⚠️ חייב לרוץ **לפני** שהעמוד עובר לרנדר מהעץ - אחרת הוא קורא
 * את עצמו. replace=true רק בפיתוח, כדי לייבא מחדש אחרי תיקון בייבוא.
 */
export async function importPages(origin: string, paths: string[], replace = false) {
  if (process.env.TURSO_DATABASE_URL && process.env.ADMIN_ALLOW_IMPORT !== "1") {
    throw new HttpError(403, "ייבוא למסד בענן דורש אישור מפורש (ADMIN_ALLOW_IMPORT)");
  }
  const c = await db();
  const done: Record<string, number> = {};
  for (const path of paths) {
    const res = await fetch(origin + encodeURI(path), { cache: "no-store", headers: { "x-page-import": "1" } });
    if (!res.ok) throw new HttpError(502, `${path}: ${res.status}`);
    const html = await res.text();
    const nodes = htmlToNodes(html);
    const h1 = parse(html).querySelector("main h1")?.text.trim() ?? path;
    const data = JSON.stringify({ title: h1, path, fields: {}, doc: { id: pageId(path), kind: "page", nodes } });
    const t = now();
    await c.batch(
      [
        replace
          ? {
              sql: `INSERT INTO entries (id, type, status, data, revision, updated_at) VALUES (?, 'page', 'publish', ?, 1, ?)
                    ON CONFLICT(id) DO UPDATE SET data = excluded.data, revision = revision + 1, updated_at = excluded.updated_at`,
              args: [pageId(path), data, t],
            }
          : {
              sql: `INSERT INTO entries (id, type, status, data, revision, updated_at) VALUES (?, 'page', 'publish', ?, 1, ?)
                    ON CONFLICT(id) DO NOTHING`,
              args: [pageId(path), data, t],
            },
        {
          sql: `INSERT INTO revisions (entry_id, data, author, created_at)
                SELECT ?, ?, 'ייבוא מהאתר', ? WHERE NOT EXISTS (SELECT 1 FROM revisions WHERE entry_id = ?)`,
          args: [pageId(path), data, t, pageId(path)],
        },
      ],
      "write",
    );
    done[path] = JSON.stringify(nodes).length;
  }
  return done;
}

/* ===== חלקים משותפים: הדר ופוטר (שלב 5ג) ===== */

/**
 * ההדר: רכיב נעול אחד (תפריט נפתח, המבורגר, מצב גלילה), והתפריט
 * עצמו נשמר כנתונים - זה מה שמסך "תפריט עליון ופוטר" יערוך.
 * הפוטר: צמתים רגילים, מה-HTML שהוא כבר מוציא - כמו העמודים.
 */
export async function importParts(origin: string, headerMenu: unknown, replace = false, blocks: { designerCta: unknown; leadBanner: unknown }) {
  if (process.env.TURSO_DATABASE_URL && process.env.ADMIN_ALLOW_IMPORT !== "1") {
    throw new HttpError(403, "ייבוא למסד בענן דורש אישור מפורש (ADMIN_ALLOW_IMPORT)");
  }
  const res = await fetch(origin + "/contact", { cache: "no-store" });
  if (!res.ok) throw new HttpError(502, `footer source: ${res.status}`);
  const footer = htmlElementToNodes(await res.text(), "footer.footer");
  const docs = [
    { id: "part-header", title: "הדר ותפריט", nodes: [{ id: nodeId(), type: "widget", settings: { widget: "header", data: { menu: headerMenu } } }] },
    { id: "part-footer", title: "פוטר", nodes: footer },
    /* שלב 6ג: סקשנים שחוזרים בכמה עמודים - נערכים פעם אחת */
    { id: "part-designerCta", title: "כרטיס פגישה עם המעצבת", nodes: [{ id: nodeId(), type: "widget", settings: { widget: "designerCta", data: { content: blocks.designerCta } } }] },
    { id: "part-leadBanner", title: "באנר לידים", nodes: [{ id: nodeId(), type: "widget", settings: { widget: "leadBanner", data: { content: blocks.leadBanner, withForm: true } } }] },
  ];
  const c = await db();
  const t = now();
  for (const d of docs) {
    const kind = d.id === "part-header" ? "header" : d.id === "part-footer" ? "footer" : "block";
    const data = JSON.stringify({ title: d.title, fields: {}, doc: { id: d.id, kind, nodes: d.nodes } });
    await c.execute({
      sql: `INSERT INTO entries (id, type, status, data, revision, updated_at) VALUES (?, 'part', 'publish', ?, 1, ?)
            ON CONFLICT(id) DO ${replace ? "UPDATE SET data = excluded.data, revision = revision + 1, updated_at = excluded.updated_at" : "NOTHING"}`,
      args: [d.id, data, t],
    });
  }
  return { header: 1, footer: JSON.stringify(footer).length };
}
