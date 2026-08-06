"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { nav, quickDial, styleSection } from "@/lib/content";
import MegaMenu from "./MegaMenu";

/**
 * Header - בר ניווט ראשי, דביק.
 * הבר לבן תמיד, עם צל עדין מאוד שמעמיק קלות בגלילה.
 * הלוגו בגרסה הכהה, שמתאימה לבר הלבן בכל מצב.
 */
// התמונה הראשית של התפריט נשאבת מכרטיס הקטגוריה בקובץ התוכן,
// כך שאין כפילות: החלפה שם מתעדכנת גם כאן.
const FEATURED = styleSection.cards.find((c) => c.id === "modern");

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // מאזין גלילה קליל: passive + סף יחיד, בלי חישובים בכל פריים
  useEffect(() => {
    const THRESHOLD = 40;
    const onScroll = () => setIsScrolled(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (href: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(href);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header className={`header container-full${isScrolled ? " header--scrolled" : ""}`}>
      <div className="header__bar">
        <Link href="/" className="header__logo" aria-label="א. בית המטבחים - דף הבית">
          <Image
            src="/logo-dark.png"
            alt="א. בית המטבחים"
            width={1640}
            height={460}
            priority
            className="header__logo-img"
          />
        </Link>

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
                  className="header__menu-wrap"
                  onMouseEnter={() => open(item.href)}
                  onMouseLeave={scheduleClose}
                >
                  <MegaMenu
                    items={item.children}
                    fallbackImage={FEATURED?.image ?? "/images/hero-1.webp"}
                    isOpen={openMenu === item.href}
                    onLinkBlur={scheduleClose}
                  />
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="header__link">
                {item.label}
              </Link>
            )
          )}
        </nav>

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
