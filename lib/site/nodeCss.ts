import type { SiteNode } from "./tree";

/**
 * CSS של העיצוב מהעורך - המפרט §3 (".n-<id> עם משקל סלקטור קבוע").
 *
 * ⚠️ הסלקטור כפול (.n-x.n-x): משקל 0,2,0 קבוע, כדי שעיצוב מהעורך
 * יגבר על מחלקות ה-BEM של האתר (0,1,0) גם כשהן בתוך media query -
 * בלי !important ובלי תלות בסדר הקבצים.
 *
 * נקודות השבירה של האתר (ADMIN-SPEC §4): טאבלט ≤900, טלפון ≤700.
 * הירושה מחשב ← טאבלט ← טלפון נובעת מהסדר: כלל טלפון בא אחרון.
 */

export const TABLET_MAX = 900;
export const MOBILE_MAX = 700;

/** האם האלמנט צריך מחלקת n-<id> */
export const needsNodeClass = (n: SiteNode) => !!(n.style || n.hide);

export function nodeCss(nodes: SiteNode[]): string {
  const rules = { desktop: [] as string[], tablet: [] as string[], mobile: [] as string[] };
  const walk = (list: SiteNode[]) => {
    for (const n of list) {
      const sel = `.n-${n.id}.n-${n.id}`;
      for (const d of ["desktop", "tablet", "mobile"] as const) {
        const decl = { ...(n.style?.base[d] ?? {}) };
        if (n.hide?.[d]) decl.display = "none";
        const body = Object.entries(decl).map(([k, v]) => `${k}:${v}`).join(";");
        if (body) rules[d].push(`${sel}{${body}}`);
      }
      /* מוסתר במחשב אבל לא בטאבלט - צריך להחזיר אותו בטאבלט */
      if (n.hide?.desktop && !n.hide.tablet) rules.tablet.push(`${sel}{display:revert}`);
      if ((n.hide?.desktop || n.hide?.tablet) && !n.hide.mobile) rules.mobile.push(`${sel}{display:revert}`);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return [
    rules.desktop.join(""),
    rules.tablet.length ? `@media (max-width:${TABLET_MAX}px){${rules.tablet.join("")}}` : "",
    rules.mobile.length ? `@media (max-width:${MOBILE_MAX}px){${rules.mobile.join("")}}` : "",
  ].join("");
}
