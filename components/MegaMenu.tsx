import Link from "next/link";
import Image from "next/image";

type MenuItem = { href: string; label: string; image?: string };

type Props = {
  items: MenuItem[];
  /** תמונת גיבוי לפריט שאין לו תמונה משלו */
  fallbackImage: string;
  isOpen: boolean;
  onLinkBlur?: () => void;
};

/**
 * MegaMenu - תפריט "מטבחים" כקטלוג ויזואלי.
 *
 * כל קטגוריה היא בלוק שלם ולחיץ: תמונה מרובעת + כותרת לצידה.
 * כל פריט מביא את התמונה שלו מקובץ התוכן, כך שאין כפילות מקורות.
 * הרעיון הוא שהמשתמש יזהה את הסגנון מהמבט הראשון, בלי לקרוא -
 * ולכן התמונה היא חלק מהניווט ולא קישוט.
 *
 * מודולרי: מקבל את הפריטים מבחוץ, ולכן ניתן לשימוש חוזר בכל פריט ניווט.
 */
export default function MegaMenu({ items, fallbackImage, isOpen, onLinkBlur }: Props) {
  return (
    <div className={`mega${isOpen ? " is-open" : ""}`} role="menu">
      <ul className="mega__grid">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="mega__card"
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
              onBlur={onLinkBlur}
            >
              <span className="mega__thumb">
                <Image
                  src={item.image ?? fallbackImage}
                  alt=""
                  fill
                  sizes="112px"
                  className="mega__img"
                />
              </span>

              <span className="mega__text">
                <span className="mega__title">{item.label}</span>
                <span className="mega__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M19 12H5M11 6l-6 6 6 6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
