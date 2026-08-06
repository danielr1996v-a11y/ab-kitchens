"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * DevInspector - כלי פנימי לסימון מדויק של אלמנטים באתר.
 *
 * לא נשלח ללקוח בשום מצב: מוגן ב-NODE_ENV, כך שב-production build
 * (מה שעולה בפועל ל-Vercel) הקומפוננטה הזו כלל לא קיימת בקוד שנשלח
 * לדפדפן - לא רק "מוסתרת", אלא לא נבנית מלכתחילה. זו הגנה ברמת הבנייה,
 * לא ברמת localStorage שיכול להתנהג בצורה לא עקבית בין דפדפנים.
 *
 * כשמריצים מקומית (npm run dev) - הכפתור פשוט תמיד שם, בלי צורך
 * בהפעלה או קיצור מקלדת.
 *
 * התנהגות הכפתורים:
 *   ✕ בפאנל     - סוגר את הפאנל וחוזר לכפתור "בחר אלמנט"
 *   🎯 בפאנל     - אותו דבר (בחירה חוזרת)
 *   Ctrl+Alt+D  - מסתיר/מציג את הכלי כולו (לרגע שמראים מסך למישהו)
 *   Esc         - יציאה ממצב בחירה
 */

type Picked = {
  selector: string;
  section: string;
  tag: string;
  text: string;
  styles: string;
};

function buildSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const classes = Array.from(el.classList).filter(
    (c) => !c.startsWith("is-") && !c.startsWith("dev-")
  );
  if (classes.length) return `.${classes.join(".")}`;
  const parent = el.parentElement;
  if (parent) {
    const parentClass = Array.from(parent.classList).find((c) => !c.startsWith("is-"));
    if (parentClass) {
      const index = Array.from(parent.children).indexOf(el) + 1;
      return `.${parentClass} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
    }
  }
  return el.tagName.toLowerCase();
}

function findSection(el: HTMLElement): string {
  const map: Record<string, string> = {
    header: "Header (תפריט ראשי)",
    hero: "Hero (באנר ראשי)",
    about: "אודות",
    trusted: "סומכים עלינו",
    styles: "בחרו את הסגנון שלכם",
    values: "מה שמוביל אותנו",
    testimonials: "המלצות לקוחות",
    footer: "Footer",
  };
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    for (const [cls, label] of Object.entries(map)) {
      if (node.classList.contains(cls)) return label;
    }
    node = node.parentElement;
  }
  return "לא זוהה";
}

function readStyles(el: HTMLElement): string {
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return [
    `גודל טקסט: ${cs.fontSize}`,
    `משקל: ${cs.fontWeight}`,
    `צבע: ${cs.color}`,
    `רקע: ${cs.backgroundColor}`,
    `מידות: ${Math.round(rect.width)}×${Math.round(rect.height)}px`,
  ].join(" · ");
}

export default function DevInspector() {
  // גלוי/מוסתר לסשן הנוכחי בלבד (לא נשמר) - נועד רק להסתרה זמנית
  // בזמן שמראים למישהו את המסך, בלי לסמוך על אחסון שיכול להתנהג לא עקבי.
  const [visible, setVisible] = useState(true);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const hoverRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setVisible((v) => !v);
        setPicking(false);
      }
      if (e.key === "Escape") {
        setPicking(false);
        setPicked(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!picking) return;

    const onMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest(".dev-panel, .dev-trigger")) return;
      if (hoverRef.current === el) return;
      hoverRef.current?.removeAttribute("data-dev-hover");
      el.setAttribute("data-dev-hover", "");
      hoverRef.current = el;
    };

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest(".dev-panel, .dev-trigger")) return;
      e.preventDefault();
      e.stopPropagation();
      setPicked({
        selector: buildSelector(el),
        section: findSection(el),
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 80),
        styles: readStyles(el),
      });
      setNote("");
      setCopied(false);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
      hoverRef.current?.removeAttribute("data-dev-hover");
    };
  }, [picking]);

  const copy = useCallback(() => {
    if (!picked) return;
    const text = [
      "### תיקון",
      `**סקשן:** ${picked.section}`,
      `**אלמנט:** \`${picked.selector}\` (${picked.tag})`,
      picked.text ? `**טקסט:** "${picked.text}"` : "",
      `**מצב נוכחי:** ${picked.styles}`,
      "",
      `**מה לשנות:** ${note || "(מלא כאן)"}`,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [picked, note]);

  const reset = () => {
    setPicked(null);
    setNote("");
    setCopied(false);
  };

  // חסימה ברמת הבנייה: ב-production הקומפוננטה הזו לא קיימת בכלל בקוד שנשלח לדפדפן
  if (process.env.NODE_ENV === "production") return null;
  if (!visible) return null;

  return (
    <>
      {picking && (
        <style>{`
          [data-dev-hover] {
            outline: 2px solid #2f6fed !important;
            outline-offset: 1px !important;
            background: rgba(47, 111, 237, 0.06) !important;
            cursor: crosshair !important;
          }
        `}</style>
      )}

      {!picked && (
        <button
          type="button"
          className={`dev-trigger${picking ? " is-active" : ""}`}
          onClick={() => setPicking((p) => !p)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="8" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>{picking ? "לחץ על אלמנט..." : "בחר אלמנט"}</span>
        </button>
      )}

      {picked && (
        <div className="dev-panel">
          <div className="dev-panel__head">
            <button
              type="button"
              onClick={reset}
              className="dev-panel__icon-btn"
              aria-label="סגור וחזור לבחירה"
            >
              ✕
            </button>
            <strong className="dev-panel__title">בחר אלמנט</strong>
            <button
              type="button"
              onClick={reset}
              className="dev-panel__icon-btn"
              aria-label="בחר אלמנט אחר"
              title="בחר אלמנט אחר"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="8" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="dev-panel__body">
            <dl className="dev-panel__info">
              <dt>סקשן</dt>
              <dd>{picked.section}</dd>
              <dt>אלמנט</dt>
              <dd>
                <code>{picked.selector}</code>
              </dd>
              {picked.text && (
                <>
                  <dt>טקסט</dt>
                  <dd className="dev-panel__text">{picked.text}</dd>
                </>
              )}
              <dt>מצב</dt>
              <dd className="dev-panel__styles">{picked.styles}</dd>
            </dl>

            <textarea
              className="dev-panel__note"
              placeholder="מה לשנות כאן?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              autoFocus
            />

            <button type="button" onClick={copy} className="dev-panel__copy">
              {copied ? "הועתק ✓" : "העתק לקלוד"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
