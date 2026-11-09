"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { a11yCopy } from "@/lib/content";
import Icon from "./Icon";

type Toggle = (typeof a11yCopy.options)[number]["id"];
type Prefs = { size: number; on: Toggle[] };

const KEY = "ab-a11y";
const MAX_SIZE = 2;
const EMPTY: Prefs = { size: 0, on: [] };

/* כל העדפה היא מחלקה על <html>. ה-CSS בגוש "תפריט נגישות"
   ב-globals.css עושה את השאר - הרכיב לא נוגע בסגנון ישירות. */
const apply = ({ size, on }: Prefs) => {
  const root = document.documentElement;
  for (let i = 1; i <= MAX_SIZE; i++) root.classList.toggle(`a11y-fs-${i}`, size === i);
  for (const { id } of a11yCopy.options) root.classList.toggle(`a11y-${id}`, on.includes(id));
};

/**
 * תפריט נגישות צף - בצד שמאל, לבקשת דניאל (9.11).
 *
 * ⚠️ **רכיב שלנו ולא תוסף חיצוני** (נגיש בקליק, UserWay וכו').
 * תוסף חיצוני טוען סקריפט של צד שלישי בכל עמוד, מביא עיצוב
 * משלו ואוסף נתונים. כאן ארבע התאמות שבאמת עובדות על האתר
 * הזה, בשפה העיצובית שלו.
 *
 * ⚠️ הגדלת טקסט עובדת כי כל הפונטים באתר ב-rem (גם ה-clamp),
 * ולכן שינוי font-size של <html> מגדיל את כולם יחד.
 *
 * ההעדפות נשמרות בדפדפן של הגולש, כך שהן נשארות במעבר בין
 * עמודים ובביקור הבא. אם האחסון חסום - התפריט עובד, רק לא זוכר.
 */
export default function AccessibilityMenu() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(EMPTY);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // טעינה פעם אחת מהאחסון
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as Prefs | null;
      if (saved) setPrefs(saved);
    } catch {}
  }, []);

  useEffect(() => {
    apply(prefs);
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  // Escape סוגר ומחזיר את הפוקוס לכפתור; לחיצה מחוץ לפאנל סוגרת
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !toggleRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const setSize = (d: number) =>
    setPrefs((p) => ({ ...p, size: Math.min(MAX_SIZE, Math.max(0, p.size + d)) }));
  const flip = (id: Toggle) =>
    setPrefs((p) => ({
      ...p,
      on: p.on.includes(id) ? p.on.filter((x) => x !== id) : [...p.on, id],
    }));

  return (
    <div className="a11y">
      <button
        ref={toggleRef}
        type="button"
        className="a11y__toggle"
        aria-label={a11yCopy.open}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon id="accessibility" />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        className="a11y__panel"
        role="dialog"
        aria-label={a11yCopy.title}
        hidden={!open}
      >
        <p className="a11y__title">{a11yCopy.title}</p>

        <div className="a11y__size">
          <span>{a11yCopy.textSize}</span>
          <button
            type="button"
            onClick={() => setSize(-1)}
            disabled={prefs.size === 0}
            aria-label={a11yCopy.smaller}
          >
            א-
          </button>
          <button
            type="button"
            onClick={() => setSize(1)}
            disabled={prefs.size === MAX_SIZE}
            aria-label={a11yCopy.larger}
          >
            א+
          </button>
        </div>

        <ul className="a11y__list">
          {a11yCopy.options.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className="a11y__opt"
                aria-pressed={prefs.on.includes(id)}
                onClick={() => flip(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="a11y__foot">
          <button type="button" className="a11y__reset" onClick={() => setPrefs(EMPTY)}>
            {a11yCopy.reset}
          </button>
          <Link href={a11yCopy.statement.href} className="a11y__link">
            {a11yCopy.statement.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
