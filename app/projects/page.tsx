import { styles } from "@/lib/content";

export default function ProjectsPage() {
  return (
    <>
      <section className="section">
        <p className="text-sm tracking-wide text-[var(--color-accent)] mb-4">גלריה</p>
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          גלריית העבודות שלנו
        </h1>
        <p className="text-lg text-[var(--color-muted)] mt-6 max-w-2xl">
          מגוון רחב של סגנונות מטבח - עיצובים מותאמים אישית, חומרים איכותיים
          וביצוע מקצועי לכל סוגי המטבחים.
        </p>
      </section>

      <section className="section-auto">
        {/* פילטר סגנונות - לפי ממצאי המחקר העיצובי (Semel: ניווט לפי סגנון/צבע) */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button className="rounded-full px-5 py-2 text-sm bg-[var(--color-fg)] text-[var(--color-bg)]">
            הכל
          </button>
          {styles.map((s) => (
            <button
              key={s.slug}
              className="rounded-full px-5 py-2 text-sm border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* פלייסהולדר גלריה - להזנה בתמונות אמיתיות מהדרייב לאחר קבלת עיצוב הפיגמה */}
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl bg-[var(--color-border)] flex items-center justify-center text-sm text-[var(--color-muted)]"
            >
              תמונה #{i + 1} - ממתינה לעיצוב ולתמונות מהדרייב
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
