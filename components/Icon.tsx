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
      return (
        <svg {...common}>
          <path
            d="M20.5 11.7a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.4-4.6A8.4 8.4 0 1 1 20.5 11.7z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 9.1c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6a6 6 0 0 0 2.8 2.4c.3.1.5 0 .6-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.8c.2.1.4.2.4.4a2 2 0 0 1-1.4 1.7c-.6.2-1.5.2-4-1.1a8 8 0 0 1-3.2-3.4c-.5-1-.5-1.9-.4-2.4a2 2 0 0 1 .6-.8z"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
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
