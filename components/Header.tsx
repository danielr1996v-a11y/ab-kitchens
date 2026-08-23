"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  nav,
  quickDial,
  styleSection,
  headerSocial,
  kitchenTypes,
  site,
  whatsappHref,
} from "@/lib/content";
import MegaMenu from "./MegaMenu";
import Icon from "./Icon";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // מאזין גלילה קליל: passive + סף יחיד, בלי חישובים בכל פריים
  useEffect(() => {
    const THRESHOLD = 40;
    const onScroll = () => setIsScrolled(window.scrollY > THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * התפריט פתוח: נועלים את גלילת הרקע, סוגרים ב-Escape, ומחזירים
   * את הפוקוס לכפתור כשנסגר - אחרת המקלדת "נופלת" לתחילת העמוד.
   * גם לחיצה מחוץ לפאנל סוגרת.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobileOpen(false);
      toggleRef.current?.focus(); // אחרת הפוקוס נופל לתחילת העמוד
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || toggleRef.current?.contains(t)) return;
      setMobileOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [mobileOpen]);

  // סגירה בניווט: ב-App Router הקומפוננטה לא נטענת מחדש בין עמודים,
  // ולכן בלי זה התפריט היה נשאר פתוח אחרי מעבר.
  const closeMobile = () => setMobileOpen(false);

  /* הנתיבים בתוכן הם בעברית והדפדפן מקודד אותם, ולכן משווים
     אחרי decode. "/" מושווה מדויק כדי שדף הבית לא ייצבע בכל עמוד. */
  const isCurrent = (href: string) => {
    const here = decodeURIComponent(pathname ?? "");
    return href === "/" ? here === "/" : here.startsWith(href);
  };

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
          {/* sizes חובה כאן: הקובץ הוא 1640 רוחב, ובלי sizes
              Next מייצר srcset של 1x/2x בלבד - וה-2x (3280) נופל
              לדלי 3840. כלומר הדפדפן הוריד לוגו ברוחב 3840 כדי
              להציג אותו ב-185px. עם sizes נוצר srcset מלא והדפדפן
              בוחר מועמד קטן. */}
          <Image
            src="/logo-dark.png"
            alt="א. בית המטבחים"
            width={1640}
            height={460}
            sizes="(max-width: 700px) 190px, 230px"
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
                {/* button ולא Link: "מטבחים" הוא פותח תפריט בלבד
                    ואין מאחוריו עמוד. button הוא הסמנטיקה הנכונה
                    לכך, ושומר על גישה במקלדת - בניגוד ל-span. */}
                <button
                  type="button"
                  className="header__link header__link--trigger"
                  aria-haspopup="true"
                  aria-expanded={openMenu === item.href}
                  onFocus={() => open(item.href)}
                  onClick={() =>
                    openMenu === item.href ? setOpenMenu(null) : open(item.href)
                  }
                >
                  {item.label}
                  <span className="header__caret" aria-hidden="true" />
                </button>

                <div
                  className="header__menu-wrap"
                  onMouseEnter={() => open(item.href)}
                  onMouseLeave={scheduleClose}
                >
                  <MegaMenu
                    items={item.children}
                    fallbackImage={FEATURED?.image ?? "/images/hero-modern.webp"}
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

        {/* רשתות - נשארות גלויות גם במובייל, שם הניווט מוסתר
            ואלה אמצעי הפנייה היחידים שנותרים */}
        <ul className="header__social">
          {headerSocial.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="header__social-link"
                aria-label={item.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon id={item.id} />
              </a>
            </li>
          ))}
        </ul>

        {/* במסך צר הטקסט מוסתר ונשאר אייקון בלבד, ולכן צריך שם נגיש */}
        <a href="tel:055-2775488" className="header__cta" aria-label={quickDial.label}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z" />
          </svg>
          <span>{quickDial.label}</span>
        </a>

        {/* מבורגר - מוצג רק מתחת ל-900px, שם header__nav מוסתר */}
        <button
          ref={toggleRef}
          type="button"
          className="header__burger"
          aria-label={mobileOpen ? "סגירת התפריט" : "פתיחת התפריט"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Icon id={mobileOpen ? "close" : "menu"} />
        </button>
      </div>

      {/* ===== תפריט מובייל - מסך מלא ===== */}
      <div
        className={`mnav${mobileOpen ? " mnav--open" : ""}`}
        id="mobile-nav"
        ref={panelRef}
      >
        <div className="mnav__inner">
          <div className="mnav__top">
            <Link href="/" className="mnav__logo" onClick={closeMobile}>
              {/* הגרסה הבהירה של הלוגו - נמדדה 216/255 מול 68 של
                  logo-dark, ולכן היא זו שנראית על הפחם */}
              <Image
                src="/logo.png"
                alt={site.name}
                width={1640}
                height={460}
                sizes="160px"
                className="mnav__logo-img"
              />
            </Link>
          </div>

          <nav aria-label="ניווט מובייל">
            <ul className="mnav__list">
              {nav.map((item, i) => (
                <li
                  key={item.href}
                  className="mnav__item"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {/* "מטבחים" אינו קישור - אין עמוד מאחוריו.
                      במובייל אין תפריט נפתח, ושלוש הקטגוריות
                      מוצגות ממילא ככרטיסים מתחת לרשימה. */}
                  {item.children ? (
                    <span className="mnav__link mnav__link--static">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="mnav__link"
                      onClick={closeMobile}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* הקטגוריות כקלפים מצולמים במקום שלוש שורות טקסט:
              זה מה שהמותג מוכר, וזה גם מקצר את התפריט */}
          <div className="mnav__styles">
            <p className="mnav__label">הסגנונות שלנו</p>
            <ul className="mnav__cards">
              {kitchenTypes.map((c, i) => (
                <li key={c.href} style={{ "--i": nav.length + i } as React.CSSProperties}>
                  <Link href={c.href} className="mnav__card" onClick={closeMobile}>
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="33vw"
                      className="mnav__card-img"
                    />
                    <span className="mnav__card-name">
                      {c.label.replace("מטבח ", "")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mnav__foot">
            <div className="mnav__actions">
              <a
                href={`tel:${site.phone1.replace(/-/g, "")}`}
                className="mnav__action mnav__action--call"
                onClick={closeMobile}
              >
                <Icon id="phone" />
                <span>{site.phone1}</span>
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mnav__action mnav__action--wa"
                onClick={closeMobile}
              >
                <Icon id="whatsapp" />
                <span>וואטסאפ</span>
              </a>
            </div>

            <ul className="mnav__social">
              {headerSocial
                .filter((s) => s.id !== "whatsapp")
                .map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      className="mnav__social-link"
                      aria-label={s.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon id={s.id} />
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
