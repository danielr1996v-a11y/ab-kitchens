import { differentiators, painPoints, audience } from "@/lib/content";

export default function AboutPage() {
  return (
    <>
      <section className="section">
        <p className="text-sm tracking-wide text-[var(--color-accent)] mb-4">אודות</p>
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          דור שני בענף המטבחים - המפעל והספק הישיר שלכם
        </h1>
        <p className="text-lg text-[var(--color-muted)] mt-6 max-w-2xl leading-relaxed">
          בית המטבחים אינה עוד חנות מטבחים - אלא המפעל עצמו. אנחנו מתכננים, מייצרים
          ומתקינים מטבחים ושיש בהתאמה אישית תחת קורת גג אחת, ומלווים אתכם משלב הרעיון
          ועד למסירת המטבח המוגמר.
        </p>
      </section>

      <section className="section-auto">
        <h2 className="text-3xl font-bold mb-10">למה זה משנה בשבילכם</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {differentiators.map((item) => (
            <div key={item.title} className="border-t border-[var(--color-border)] pt-5">
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-[var(--color-muted)] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-auto bg-[var(--color-fg)] text-[var(--color-bg)]">
        <h2 className="text-3xl font-bold mb-10">מכירים את זה?</h2>
        <ul className="grid md:grid-cols-2 gap-4 max-w-3xl">
          {painPoints.map((p) => (
            <li key={p} className="flex gap-3 items-start">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="opacity-90">{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-auto">
        <h2 className="text-3xl font-bold mb-6">למי אנחנו עוזרים</h2>
        <div className="flex flex-wrap gap-3">
          {audience.groups.map((g) => (
            <span key={g} className="border border-[var(--color-border)] rounded-full px-5 py-2 text-sm">
              {g}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
