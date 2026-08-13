import Link from "next/link";
import Image from "next/image";
import { site, nav, kitchenTypes, footerLinks, footerNew } from "@/lib/content";
import Icon from "./Icon";

/**
 * Footer - נבנה לפי הפיגמה (node 2022:1255).
 *
 * ארבע עמודות. ב-RTL הראשונה ב-DOM היא הימנית, ולכן הסדר כאן הוא:
 *   מותג ופרטי קשר · ניווט באתר · המטבחים שלנו · טופס
 *
 * הטופס יושב על כרטיס לבן מרחף מעל רקע אפור-בהיר עם טקסטורה עדינה,
 * בדיוק כמו בעיצוב.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* ===== מותג ופרטי קשר - ימין ===== */}
        <div className="footer__brand">
          <Link href="/" className="footer__logo">
            <Image
              src="/logo.png"
              alt={site.name}
              width={1640}
              height={460}
              className="footer__logo-img"
            />
          </Link>

          <ul className="footer__social">
            {site.social.map((sc) => (
              <li key={sc.id}>
                <a
                  href={sc.href}
                  className="footer__social-link"
                  aria-label={sc.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon id={sc.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ===== ניווט באתר ===== */}
        <nav className="footer__col">
          <h3 className="footer__title">{footerNew.navTitle}</h3>
          <ul className="footer__list">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ===== המטבחים שלנו ===== */}
        <nav className="footer__col">
          <h3 className="footer__title">{footerNew.kitchensTitle}</h3>
          <ul className="footer__list">
            {kitchenTypes.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ===== שעות ומענה - שמאל =====
            הטופס הוסר מכאן: הוא כפל את הטופס שכבר קיים למעלה
            בכל עמוד, ובפוטר הוא גם היה ללא יעד. */}
        <div className="footer__col">
          <h3 className="footer__title">{footerNew.hoursTitle}</h3>
          <ul className="footer__list">
            {site.hours.map((h) => (
              <li key={h.days} className="footer__hours">
                <span>{h.days}</span>
                <span className="footer__hours-time">{h.time}</span>
              </li>
            ))}
          </ul>

        </div>

        {/* ===== דברו איתנו - שמאל ===== */}
        <div className="footer__col">
          <h3 className="footer__title">דברו איתנו</h3>
          <ul className="footer__contact">
            <li>
              <a
                href={`tel:${site.phone1.replace(/-/g, "")}`}
                className="footer__contact-link"
              >
                <Icon id="phone" />
                <span>{site.phone1}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="footer__contact-link">
                <Icon id="mail" />
                <span>{site.email}</span>
              </a>
            </li>
            <li className="footer__contact-link footer__contact-link--static">
              <Icon id="pin" />
              <span>{site.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.
        </p>
        <ul className="footer__legal">
          {footerLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="footer__link">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
