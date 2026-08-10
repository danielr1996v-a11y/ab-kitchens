import { whatsappHref } from "@/lib/content";

/**
 * כפתור וואטסאפ צף - אחד בלבד, בצד ימין.
 *
 * במנוחה הוא עיגול קטן. בריחוף הוא נפתח לגלולה עם "דברו איתנו",
 * כך שהוא מזמין בלי לתפוס מקום כשלא נוגעים בו. במגע אין ריחוף
 * ולכן הוא נשאר עיגול - וזה בסדר, האייקון מוכר מספיק.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className="wa"
      aria-label="שליחת הודעת וואטסאפ"
    >
      <svg viewBox="0 0 24 24" className="wa__icon" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.42-1.34a9.9 9.9 0 0 0 4.62 1.14c5.46 0 9.91-4.45 9.91-9.9C21.95 6.45 17.5 2 12.04 2m0 18.06a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.09.76.82-3-.2-.31a8.08 8.08 0 0 1-1.24-4.3c0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.16-8.03 8.16" />
      </svg>
      <span className="wa__label">דברו איתנו</span>
    </a>
  );
}
