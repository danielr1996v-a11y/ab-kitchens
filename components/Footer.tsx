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
              src="/logo-dark.png"
              alt={site.name}
              width={1640}
              height={460}
              className="footer__logo-img"
            />
          </Link>

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
              <a
                href={`mailto:${site.email}`}
                className="footer__contact-link footer__contact-link--underline"
              >
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

        {/* ===== טופס - שמאל ===== */}
        <div className="footer__form-card">
          <p className="footer__form-intro">{footerNew.formIntro}</p>

          {/* ⚠️ הטופס עדיין ללא יעד. נדרש endpoint או שירות טפסים. */}
          <form className="footer__form" action="#" method="post">
            <div className="footer__fields">
              {footerNew.fields.map((f) => (
                <div className="field" key={f.id}>
                  <label className="field__label" htmlFor={`f-${f.id}`}>
                    {f.label}
                    <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`f-${f.id}`}
                    name={f.id}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    required
                    className="field__input"
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="footer__submit">
              {footerNew.submitLabel}
            </button>
          </form>
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
