import { safeImageUrl } from "./sanitize";
import type { NodeType, SiteNode } from "@/lib/site/tree";

/**
 * ניקוי עץ אלמנטים שמגיע מהעורך - המפרט §5 ("עץ אלמנטים מהעורך").
 *
 * העיקרון: **העותק המהימן הוא מה שכבר שמור.** אלמנט קיים (או שכפול
 * שלו, copyOf) לוקח משם את כל מה שהעורך לא אמור לשנות: מחלקות,
 * הגדרות, רכיבים נעולים, svg, JSON-LD. מהעורך נלקח רק:
 *   - טקסט של עלה
 *   - src/alt של תמונה, href של קישור
 *   - הסתרה לפי מכשיר
 *   - עיצוב (style) - מרשימה סגורה של תכונות וערכים
 *   - סדר הילדים
 * אלמנט חדש יכול להיות רק מסוג פשוט, בלי מאפיינים חופשיים.
 *
 * ⚠️ כל שדה חדש שנכנס ל-SiteNode חייב להיכנס גם לכאן (המפרט §5).
 */

export type Device = "desktop" | "tablet" | "mobile";
export const DEVICES: Device[] = ["desktop", "tablet", "mobile"];

/* ===== עיצוב: רשימה סגורה ===== */

const LENGTH = /^-?\d+(\.\d+)?(px|rem|em|%|vw|vh)$|^0$/;
const TOKEN = /^var\(--[a-z0-9-]+\)$/;
const COLOR = /^#[0-9a-f]{3,8}$|^var\(--color-[a-z0-9-]+\)$|^transparent$/i;
const KEYWORDS: Record<string, string[]> = {
  "text-align": ["right", "left", "center", "start", "end", "justify"],
  "font-weight": ["300", "400", "500", "700"],
  "justify-content": ["flex-start", "flex-end", "center", "space-between", "space-around", "start", "end"],
  "align-items": ["flex-start", "flex-end", "center", "stretch", "baseline", "start", "end"],
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
};
const LENGTH_PROPS = [
  "font-size", "line-height", "letter-spacing",
  "padding-top", "padding-bottom", "padding-left", "padding-right",
  "margin-top", "margin-bottom", "margin-left", "margin-right",
  "gap", "width", "max-width", "min-height", "border-radius",
];
const COLOR_PROPS = ["color", "background-color"];

export const STYLE_PROPS = [...LENGTH_PROPS, ...COLOR_PROPS, ...Object.keys(KEYWORDS), "opacity"];

function cleanValue(prop: string, v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s || s.length > 80) return null;
  if (LENGTH_PROPS.includes(prop)) return LENGTH.test(s) || TOKEN.test(s) || s === "auto" ? s : null;
  if (COLOR_PROPS.includes(prop)) return COLOR.test(s) ? s : null;
  if (KEYWORDS[prop]) return KEYWORDS[prop].includes(s) ? s : null;
  if (prop === "opacity") return /^(0(\.\d+)?|1)$/.test(s) ? s : null;
  return null;
}

type Style = NonNullable<SiteNode["style"]>;

function cleanStyle(raw: unknown): Style | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const base = (raw as { base?: unknown }).base;
  if (!base || typeof base !== "object") return undefined;
  const out: Style = { base: {} };
  for (const d of DEVICES) {
    const decl = (base as Record<string, unknown>)[d];
    if (!decl || typeof decl !== "object") continue;
    const clean: Record<string, string> = {};
    for (const [prop, v] of Object.entries(decl as Record<string, unknown>)) {
      if (!STYLE_PROPS.includes(prop)) continue;
      const val = cleanValue(prop, v);
      if (val) clean[prop] = val;
    }
    if (Object.keys(clean).length) out.base[d] = clean;
  }
  return Object.keys(out.base).length ? out : undefined;
}

function cleanHide(raw: unknown): SiteNode["hide"] {
  if (!raw || typeof raw !== "object") return undefined;
  const h = raw as Record<string, unknown>;
  const out: NonNullable<SiteNode["hide"]> = {};
  for (const d of DEVICES) if (h[d] === true) out[d] = true;
  return Object.keys(out).length ? out : undefined;
}

/* ===== טקסט וכתובות ===== */

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const cleanText = (v: unknown, max = 5000) => (typeof v === "string" ? v.replace(CONTROL, "").slice(0, max) : "");

/** קישור: נתיב באתר, עוגן, https, טלפון, מייל או וואטסאפ. לא javascript: */
export function safeHref(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (/^\/(?!\/)[^\s<>"]*$/.test(s)) return s;
  if (/^#[\w-]+$/.test(s)) return s;
  if (/^https:\/\/[^\s<>"]+$/.test(s)) return s;
  if (/^tel:[+\d-]{5,20}$/.test(s)) return s;
  if (/^mailto:[^\s<>"@]+@[^\s<>"]+$/.test(s)) return s;
  return null;
}

const ID = /^[a-z0-9]{3,24}$/i;

/* ===== אלמנטים חדשים ===== */

const NEW_TAGS: Partial<Record<NodeType, string[]>> = {
  section: ["section"],
  container: ["div"],
  heading: ["h2", "h3", "h4"],
  text: ["p"],
  link: ["a"],
  image: ["img"],
};

/* ===== הניקוי ===== */

function index(nodes: SiteNode[], map = new Map<string, SiteNode>()) {
  for (const n of nodes) {
    map.set(n.id, n);
    if (n.children) index(n.children, map);
  }
  return map;
}

function cleanNode(raw: unknown, trusted: Map<string, SiteNode>, seen: Set<string>, depth: number): SiteNode | null {
  if (!raw || typeof raw !== "object" || depth > 40) return null;
  const r = raw as Partial<SiteNode> & { copyOf?: string };
  if (typeof r.id !== "string" || !ID.test(r.id) || seen.has(r.id)) return null;
  seen.add(r.id);

  const source = trusted.get(r.id) ?? (r.copyOf ? trusted.get(r.copyOf) : undefined);
  let node: SiteNode;

  if (source) {
    /* קיים: הבסיס הוא העותק המהימן, בלי הילדים (נבנים מחדש למטה) */
    node = structuredClone({ ...source, children: undefined, style: undefined, hide: undefined });
    node.id = r.id;
  } else {
    /* חדש: רק סוג פשוט, תגית מהרשימה */
    const tags = r.type ? NEW_TAGS[r.type] : undefined;
    const isLeaf = r.type === "text" && !r.tag;
    if (!isLeaf && (!tags || !r.tag || !tags.includes(r.tag))) return null;
    node = { id: r.id, type: r.type as NodeType, ...(isLeaf ? {} : { tag: r.tag }) };
  }

  /* מה שמותר לשנות */
  if (node.type === "text" && !node.tag) {
    node.props = { text: cleanText(r.props?.text) };
    return node;
  }
  const attrs = { ...(node.props?.attrs ?? {}) };
  if (node.type === "image") {
    const src = safeImageUrl(r.props?.attrs?.src);
    if (src) attrs.src = src;
    else if (!source) return null;
    attrs.alt = cleanText(r.props?.attrs?.alt, 300);
  }
  if (node.type === "link") {
    const href = safeHref(r.props?.attrs?.href);
    if (href) attrs.href = href;
    else if (!source) attrs.href = "#";
  }
  if (Object.keys(attrs).length) node.props = { ...node.props, attrs };

  const style = cleanStyle(r.style);
  if (style) node.style = style;
  const hide = cleanHide(r.hide);
  if (hide) node.hide = hide;

  /* רכיב נעול, svg ו-JSON-LD: הילדים לא שייכים לעורך */
  if (node.type === "widget" || node.type === "icon" || node.type === "html") {
    if (source?.children) node.children = structuredClone(source.children);
    return node;
  }
  if (Array.isArray(r.children)) {
    const kids = r.children.map((c) => cleanNode(c, trusted, seen, depth + 1)).filter((c): c is SiteNode => c !== null);
    if (kids.length) node.children = kids;
  }
  return node;
}

/** העץ מהעורך, אחרי ניקוי מול העותק המהימן */
export function sanitizeNodes(incoming: unknown, trustedNodes: SiteNode[]): SiteNode[] {
  const trusted = index(trustedNodes);
  const seen = new Set<string>();
  return (Array.isArray(incoming) ? incoming : [])
    .slice(0, 400)
    .map((n) => cleanNode(n, trusted, seen, 0))
    .filter((n): n is SiteNode => n !== null);
}

/* ===== הרשאת "טקסט ותמונה בלבד" (ADMIN-SPEC §5) ===== */

/** שלד: מבנה, סדר, עיצוב והסתרה - בלי טקסטים, תמונות וקישורים */
function skeleton(nodes: SiteNode[]): unknown {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    tag: n.tag,
    style: n.style ?? null,
    hide: n.hide ?? null,
    children: n.children ? skeleton(n.children) : null,
  }));
}

/** true אם השינוי היחיד הוא בטקסטים, בתמונות ובקישורים */
export function onlyContentChanged(before: SiteNode[], after: SiteNode[]): boolean {
  return JSON.stringify(skeleton(before)) === JSON.stringify(skeleton(after));
}
