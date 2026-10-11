import type { SiteNode } from "@/lib/site/tree";

/**
 * פעולות מבנה ועיצוב בעורך - שלב 6ב. כל פעולה מחזירה עץ חדש.
 * השרת מנקה הכל שוב מול העותק המהימן (lib/admin/sanitizeDoc.ts) -
 * כאן רק נוחות, לא אבטחה.
 */

export type Device = "desktop" | "tablet" | "mobile";

/** מזהה חדש - אותו פורמט שהשרת מקבל (אותיות וספרות, 3-24) */
export const newId = () => "n" + Math.random().toString(36).slice(2, 10);

type Loc = { parent: SiteNode[]; index: number };

function locate(nodes: SiteNode[], id: string): Loc | null {
  const i = nodes.findIndex((n) => n.id === id);
  if (i >= 0) return { parent: nodes, index: i };
  for (const n of nodes) {
    if (n.children) {
      const l = locate(n.children, id);
      if (l) return l;
    }
  }
  return null;
}

/** עותק עמוק שאפשר לשנות בו בבטחה */
const clone = (nodes: SiteNode[]) => structuredClone(nodes);

export function moveNode(nodes: SiteNode[], id: string, dir: -1 | 1): SiteNode[] {
  const next = clone(nodes);
  const loc = locate(next, id);
  if (!loc) return nodes;
  const to = loc.index + dir;
  if (to < 0 || to >= loc.parent.length) return nodes;
  const [n] = loc.parent.splice(loc.index, 1);
  loc.parent.splice(to, 0, n);
  return next;
}

/** אפשר להזיז? - לכפתורים בפאנל */
export function canMove(nodes: SiteNode[], id: string, dir: -1 | 1) {
  const loc = locate(nodes, id);
  if (!loc) return false;
  const to = loc.index + dir;
  return to >= 0 && to < loc.parent.length;
}

/** שכפול: מזהים חדשים לכל העץ, ו-copyOf לכל צומת - כך השרת לוקח את
    המחלקות וההגדרות מהמקור המהימן (המפרט §5) */
function withNewIds(n: SiteNode): SiteNode & { copyOf?: string } {
  return { ...n, id: newId(), copyOf: n.id, children: n.children?.map(withNewIds) } as SiteNode & { copyOf?: string };
}

export function duplicateNode(nodes: SiteNode[], id: string): { nodes: SiteNode[]; newId: string | null } {
  const next = clone(nodes);
  const loc = locate(next, id);
  if (!loc) return { nodes, newId: null };
  const copy = withNewIds(loc.parent[loc.index]);
  loc.parent.splice(loc.index + 1, 0, copy);
  return { nodes: next, newId: copy.id };
}

export function deleteNode(nodes: SiteNode[], id: string): SiteNode[] {
  const next = clone(nodes);
  const loc = locate(next, id);
  if (!loc) return nodes;
  loc.parent.splice(loc.index, 1);
  return next;
}

/* ===== הוספה ===== */

export type AddKind = "section" | "heading" | "paragraph" | "button" | "image";

const leaf = (text: string): SiteNode => ({ id: newId(), type: "text", props: { text } });

/** אלמנט חדש - רק סוגים פשוטים, בלי מחלקות. העיצוב שלו מהעורך */
export function makeNode(kind: AddKind, image?: { src: string; alt: string }): SiteNode {
  const id = newId();
  switch (kind) {
    case "section":
      /* אזור ברוחב מלא עם ריווח של סקשן, ובתוכו מיכל ברוחב התוכן -
         ההיררכיה הקבועה של המפרט §3 */
      return {
        id,
        type: "section",
        tag: "section",
        style: { base: { desktop: { "padding-top": "var(--section-gap)", "padding-bottom": "var(--section-gap)", "padding-left": "var(--side-padding)", "padding-right": "var(--side-padding)" } } },
        children: [
          {
            id: newId(),
            type: "container",
            tag: "div",
            style: { base: { desktop: { "max-width": "70rem", "margin-left": "auto", "margin-right": "auto" } } },
            children: [{ id: newId(), type: "heading", tag: "h2", children: [leaf("כותרת חדשה")] }],
          },
        ],
      };
    case "heading":
      return { id, type: "heading", tag: "h2", children: [leaf("כותרת חדשה")] };
    case "paragraph":
      return { id, type: "text", tag: "p", children: [leaf("טקסט חדש. לחצו כדי לערוך.")] };
    case "button":
      /* כפתור = קישור בעיצוב הכפתור של האתר: זהב פעולה, טקסט כהה */
      return {
        id,
        type: "link",
        tag: "a",
        props: { attrs: { href: "/contact" } },
        style: { base: { desktop: { "background-color": "var(--color-gold)", color: "var(--color-gold-text)", "padding-top": "var(--space-2)", "padding-bottom": "var(--space-2)", "padding-left": "var(--space-4)", "padding-right": "var(--space-4)", "font-weight": "700" } } },
        children: [leaf("לתיאום פגישה")],
      };
    case "image":
      return { id, type: "image", tag: "img", props: { attrs: { src: image?.src ?? "", alt: image?.alt ?? "" } }, style: { base: { desktop: { width: "100%" } } } };
  }
}

/** הוספה אחרי האלמנט שנבחר; בלי בחירה - בסוף העמוד */
export function insertAfter(nodes: SiteNode[], afterId: string | null, node: SiteNode): SiteNode[] {
  const next = clone(nodes);
  const loc = afterId ? locate(next, afterId) : null;
  if (!loc) {
    next.push(node);
    return next;
  }
  /* אזור חדש אחרי אלמנט פנימי - עולה לרמת העמוד, ליד האזור שמכיל אותו */
  if (node.type === "section" && loc.parent !== next) {
    const top = next.findIndex((n) => JSON.stringify(n).includes(`"id":"${afterId}"`));
    next.splice(top + 1, 0, node);
    return next;
  }
  loc.parent.splice(loc.index + 1, 0, node);
  return next;
}

/* ===== עיצוב ===== */

export function setStyle(nodes: SiteNode[], id: string, device: Device, prop: string, value: string | null): SiteNode[] {
  const next = clone(nodes);
  const loc = locate(next, id);
  if (!loc) return nodes;
  const n = loc.parent[loc.index];
  const base = { ...(n.style?.base ?? {}) };
  const decl = { ...(base[device] ?? {}) };
  if (value === null || value === "") delete decl[prop];
  else decl[prop] = value;
  if (Object.keys(decl).length) base[device] = decl;
  else delete base[device];
  n.style = Object.keys(base).length ? { base } : undefined;
  return next;
}

/** הערך שחל במכשיר הזה, ומאיפה הוא בא (ירושה: מחשב ← טאבלט ← טלפון) */
export function effectiveStyle(n: SiteNode, device: Device, prop: string): { value?: string; from?: Device } {
  const order: Device[] = device === "mobile" ? ["mobile", "tablet", "desktop"] : device === "tablet" ? ["tablet", "desktop"] : ["desktop"];
  for (const d of order) {
    const v = n.style?.base[d]?.[prop];
    if (v) return { value: v, from: d };
  }
  return {};
}

export function toggleHide(nodes: SiteNode[], id: string, device: Device): SiteNode[] {
  const next = clone(nodes);
  const loc = locate(next, id);
  if (!loc) return nodes;
  const n = loc.parent[loc.index];
  const hide = { ...(n.hide ?? {}) };
  if (hide[device]) delete hide[device];
  else hide[device] = true;
  n.hide = Object.keys(hide).length ? hide : undefined;
  return next;
}

