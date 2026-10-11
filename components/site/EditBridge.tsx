"use client";

import { useEffect } from "react";

/**
 * הגשר בין העמוד (בתוך ה-iframe של העורך) לעורך שמסביב - שלב 6.
 * מרונדר רק במצב עריכה (components/site/PageDoc.tsx).
 *
 * מהעמוד לעורך:  ready · select(id) · scroll(y)
 * מהעורך לעמוד:  select(id, quiet?) · text(id, text) · image(id, src, alt) · css(css) · scroll(y)
 *
 * ⚠️ בדיקת origin בשני הכיוונים: רק העורך מאותו אתר מדבר עם העמוד.
 * ⚠️ בעריכה לחיצה בוחרת ולא מנווטת - קישורים וכפתורים לא פועלים.
 */

type Msg =
  | { type: "select"; id: string | null; quiet?: boolean }
  | { type: "scroll"; y: number }
  | { type: "text"; id: string; text: string }
  | { type: "image"; id: string; src: string; alt: string }
  | { type: "css"; css: string; ids?: string[] };

const OUTLINE = "#2563eb";

function box(color: string, z: number) {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: String(z),
    border: `2px solid ${color}`,
    borderRadius: "2px",
    display: "none",
    transition: "all 80ms ease-out",
  });
  document.body.appendChild(el);
  return el;
}

function place(el: HTMLElement, target: Element | null) {
  if (!target) {
    el.style.display = "none";
    return;
  }
  /* רכיב נעול עטוף ב-display:contents - אין לו מלבן משלו, לוקחים את הילד */
  const t = (target as HTMLElement).dataset.locked !== undefined ? target.firstElementChild ?? target : target;
  const r = t.getBoundingClientRect();
  Object.assign(el.style, { display: "block", top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
}

export default function EditBridge({ docId }: { docId: string }) {
  useEffect(() => {
    const parent = window.parent;
    if (parent === window) return;
    const send = (m: object) => parent.postMessage({ source: "abk-page", docId, ...m }, location.origin);

    const hover = box(OUTLINE + "88", 2147483646);
    const chosen = box(OUTLINE, 2147483647);
    let selected: Element | null = null;
    let hovered: Element | null = null;

    const find = (t: EventTarget | null) => (t instanceof Element ? t.closest("[data-n]") : null);

    const onMove = (e: MouseEvent) => {
      hovered = find(e.target);
      place(hover, hovered === selected ? null : hovered);
    };
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      selected = find(e.target);
      place(chosen, selected);
      place(hover, null);
      send({ type: "select", id: selected?.getAttribute("data-n") ?? null });
    };
    /* מסגרות זזות עם הגלילה, והעורך זוכר איפה עמדנו - כדי לחזור
       לאותו מקום אחרי טעינה מחדש */
    let scrollTimer = 0;
    const onScroll = () => {
      place(chosen, selected);
      place(hover, hovered === selected ? null : hovered);
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => send({ type: "scroll", y: window.scrollY }), 150);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.source !== "abk-editor") return;
      const m = e.data as Msg;
      if (m.type === "scroll") {
        window.scrollTo({ top: m.y, behavior: "instant" });
      } else if (m.type === "select") {
        selected = m.id ? document.querySelector(`[data-n="${CSS.escape(m.id)}"]`) : null;
        if (!m.quiet) selected?.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(() => place(chosen, selected), m.quiet ? 50 : 350);
      } else if (m.type === "text") {
        const el = document.querySelector(`[data-n="${CSS.escape(m.id)}"]`);
        if (el) el.textContent = m.text;
        place(chosen, selected);
      } else if (m.type === "image") {
        const el = document.querySelector(`[data-n="${CSS.escape(m.id)}"]`);
        if (el instanceof HTMLImageElement) {
          el.removeAttribute("srcset");
          el.src = m.src;
          el.alt = m.alt;
        }
      } else if (m.type === "css") {
        let tag = document.querySelector("style[data-node-css]");
        if (!tag) {
          tag = document.createElement("style");
          tag.setAttribute("data-node-css", "");
          document.head.appendChild(tag);
        }
        tag.textContent = m.css;
        for (const id of m.ids ?? []) document.querySelector(`[data-n="${CSS.escape(id)}"]`)?.classList.add(`n-${id}`);
        requestAnimationFrame(() => place(chosen, selected));
      }
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    /* שליחת טופס או לחיצה על Enter בשדה - גם הם לא פועלים בעריכה */
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("submit", block, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("message", onMsg);
    send({ type: "ready" });

    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", block, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("message", onMsg);
      hover.remove();
      chosen.remove();
    };
  }, [docId]);

  return null;
}
