import { site } from "@/lib/content";

// כפתור צף קבוע (וואטסאפ + טלפון) - best practice מקומי שאומת במחקר העיצובי
export default function WhatsAppButton() {
  const waHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    `שלום, אשמח לקבל פרטים על מטבח מ${site.name}`
  )}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שליחת הודעת וואטסאפ"
        className="w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.42-1.34a9.9 9.9 0 0 0 4.62 1.14c5.46 0 9.91-4.45 9.91-9.9C21.95 6.45 17.5 2 12.04 2m0 18.06a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.09.76.82-3-.2-.31a8.08 8.08 0 0 1-1.24-4.3c0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.16-8.03 8.16" />
        </svg>
      </a>
      <a
        href={`tel:${site.phone1}`}
        aria-label="חיוג טלפוני"
        className="w-14 h-14 rounded-full bg-[var(--color-fg)] shadow-lg flex items-center justify-center text-[var(--color-bg)] hover:scale-105 transition-transform"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z" />
        </svg>
      </a>
    </div>
  );
}
