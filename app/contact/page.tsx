import { site } from "@/lib/content";

export default function ContactPage() {
  return (
    <section className="section">
      <p className="text-sm tracking-wide text-[var(--color-accent)] mb-4">צור קשר</p>
      <h1 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight">
        בואו נדבר על המטבח שלכם
      </h1>
      <p className="text-lg text-[var(--color-muted)] mt-6 max-w-xl">
        ייעוץ ראשוני ללא עלות. השאירו פרטים ונחזור אליכם בהקדם.
      </p>

      <div className="grid md:grid-cols-2 gap-12 mt-12 max-w-4xl">
        {/* טופס קצר - שם, טלפון, הודעה בלבד (לפי מסקנות המחקר: לא לגייט) */}
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="שם מלא"
            className="border border-[var(--color-border)] rounded-xl px-4 py-3 bg-transparent"
          />
          <input
            type="tel"
            placeholder="טלפון"
            className="border border-[var(--color-border)] rounded-xl px-4 py-3 bg-transparent"
          />
          <textarea
            placeholder="ספרו לנו קצת על המטבח שאתם רוצים"
            rows={4}
            className="border border-[var(--color-border)] rounded-xl px-4 py-3 bg-transparent"
          />
          <button
            type="submit"
            className="bg-[var(--color-fg)] text-[var(--color-bg)] rounded-full px-8 py-4 font-medium w-fit"
          >
            שליחה
          </button>
        </form>

        <div className="flex flex-col gap-4 text-lg">
          <a href={`tel:${site.phone1}`} className="hover:text-[var(--color-accent)]">
            {site.phone1}
          </a>
          <a href={`tel:${site.phone2}`} className="hover:text-[var(--color-accent)]">
            {site.phone2}
          </a>
          <a href={`mailto:${site.email}`} className="hover:text-[var(--color-accent)]">
            {site.email}
          </a>
          <p className="text-[var(--color-muted)]">{site.address}</p>
        </div>
      </div>
    </section>
  );
}
