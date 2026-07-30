"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { nav, quickDial } from "@/lib/content";

/**
 * Header - בר הניווט הראשי.
 * מבוסס על הפיגמה (רקע פחם, כפתור זהב) + מפת האתר (מטבחים עם 4 תתי-סוגים בהובר).
 * חוקי פיתוח: מרווחים אופקיים ב-vw, גבהים ב-rem/vh, line-height ב-em, בלי px (למעט hairline).
 * client component כי יש dropdown אינטראקטיבי עם מצב פתוח/סגור.
 */
export default function Header() {
  // ניהול פתיחת ה-dropdown - נתמך גם בעכבר (hover) וגם במקלדת (focus)
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = (href: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(href);
  };
  // עיכוב קטן בסגירה כדי לאפשר מעבר עכבר מהפריט אל התפריט הנפתח
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header className="header container-full">
      <div className="header__bar">
        {/* לוגו - בהיר על רקע כהה */}
        <Link href="/" className="header__logo" aria-label="א. בית המטבחים - דף הבית">
          <Image
            src="/logo.png"
            alt="א. בית המטבחים"
            width={1640}
            height={460}
            priority
            className="header__logo-img"
          />
        </Link>

        {/* ניווט ראשי */}
        <nav className="header__nav" aria-label="ניווט ראשי">
          {nav.map((item) =>
            item.children ? (
              <div
                key={item.href}
                className="header__item header__item--has-menu"
                onMouseEnter={() => open(item.href)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  href={item.href}
                  className="header__link"
                  aria-haspopup="true"
                  aria-expanded={openMenu === item.href}
                  onFocus={() => open(item.href)}
                >
                  {item.label}
                  <span className="header__caret" aria-hidden="true" />
                </Link>

                <div
                  className={`header__dropdown ${openMenu === item.href ? "is-open" : ""}`}
                  onMouseEnter={() => open(item.href)}
                  onMouseLeave={scheduleClose}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="header__dropdown-link"
                      tabIndex={openMenu === item.href ? 0 : -1}
                      onBlur={scheduleClose}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="header__link">
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* כפתור לחיוג מהיר - זהב */}
        <a href="tel:055-2775488" className="header__cta">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z" />
          </svg>
          <span>{quickDial.label}</span>
        </a>
      </div>
    </header>
  );
}
