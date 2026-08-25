export type IconId =
  | "facebook"
  | "instagram"
  | "phone"
  | "mail"
  | "whatsapp"
  | "pin"
  | "menu"
  | "close"
  /* חמישה לערכי עמוד אודות. מצוירים באותו סטנדרט - קו 1.5
     על גריד 24, currentColor - ולא מספרייה חיצונית. */
  | "ruler"
  | "gem"
  | "clock"
  | "handshake"
  | "lifebuoy";

/**
 * Icon - ספריית האייקונים של האתר.
 *
 * כולם מצוירים בקו של 1.5 על גריד 24, בדיוק כמו החץ, אייקון החיוג
 * והצ'יברון שכבר קיימים - כך שהמראה אחיד. currentColor מאפשר להם
 * לרשת את צבע ההובר מהאלמנט העוטף.
 *
 * מאחד את מה שהיה קודם SocialIcon, כדי שלא יהיו שתי ספריות אייקונים.
 */
export default function Icon({ id }: { id: IconId }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "facebook":
      return (
        <svg {...common}>
          <path
            d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3H12V6.5a1 1 0 0 1 1-1h2V3z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path
            d="M6.6 10.8a12.5 12.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" />
          <path
            d="m3.5 7 7.6 5.3a1.5 1.5 0 0 0 1.8 0L20.5 7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "whatsapp":
      /* ⚠️ הסמל הרשמי של וואטסאפ, לא ציור קו משלנו.
         הקודם היה מצויר ב-stroke 1.5 כמו שאר הספרייה, ובעיגול
         הצף הוא נקרא דק ומגורד. כאן זה נתיב **מלא** אחד: הבועה
         היא טבעת והשפופרת יושבת בתוכה, כך שצבע הכפתור מציץ
         ביניהן - בדיוק כמו הסמל המוכר.
         fill/stroke נדרסים כאן במכוון מול ברירת המחדל של
         common, שמוגדרת ל-stroke. */
      return (
        <svg
          viewBox="0 0 448 512"
          fill="currentColor"
          stroke="none"
          aria-hidden="true"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 110.9L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path
            d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.6" strokeWidth="1.5" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path
            d="M6 6l12 12M18 6L6 18"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    /* ===== ערכי עמוד אודות ===== */

    case "ruler":
      return (
        <svg {...common}>
          <rect x="2" y="8" width="20" height="8" rx="1.5" strokeWidth="1.5" />
          <path d="M7 8v3M12 8v4M17 8v3" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "gem":
      return (
        <svg {...common}>
          <path
            d="M6 3h12l3 6-9 12L3 9z"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M3 9h18M9 3 7.5 9 12 21M15 3l1.5 6L12 21" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
          <path d="M12 7v5.5l3.5 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "handshake":
      return (
        <svg {...common}>
          <path
            d="M3 10.5 7 7l3 2.5 2-1.5 2 1.5L17 7l4 3.5-3.5 5-2.5-2-3 2.5-3-2.5-2.5 2z"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "lifebuoy":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3.75" strokeWidth="1.5" />
          <path d="m5.6 5.6 3.7 3.7M14.7 14.7l3.7 3.7M18.4 5.6l-3.7 3.7M9.3 14.7l-3.7 3.7" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

  }
}
