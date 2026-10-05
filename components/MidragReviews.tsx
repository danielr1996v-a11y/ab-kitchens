import { midragReviews, midragSection } from "@/lib/testimonialsPage";

/**
 * רצועת ההמלצות ממידרג - בתחתית עמוד ההמלצות.
 *
 * ⚠️ **כרטיס טקסט ולא צילום, בשונה משאר העמוד.** בכל שאר
 * ההמלצות הצילום הוא ההוכחה; כאן אין קובץ מקור בריפו, ולכן
 * מה שמחליף אותו הוא **הציונים** - הם מה שמידרג מציגה ומה
 * שאפשר לאמת מול הפרופיל שלה.
 *
 * server component - רק תצוגה.
 */
export default function MidragReviews() {
  if (midragReviews.length === 0) return null;

  return (
    <section className="mrevs" aria-labelledby="midrag-title">
      <h2 className="mrevs__title" id="midrag-title">
        {midragSection.title}
      </h2>

      <ul className="mrevs__list">
        {midragReviews.map((r) => (
          <li className="mrev" key={r.id}>
            <div className="mrev__head">
              <div className="mrev__who">
                <p className="mrev__name">{r.author}</p>
                {r.service && <p className="mrev__service">{r.service}</p>}
              </div>
              {/* הציון הכולל, כמו העיגול בפינת הכרטיס במידרג */}
              <span
                className="mrev__score"
                aria-label={`ציון כולל ${r.score} מתוך 10`}
              >
                {r.score}
              </span>
            </div>

            <blockquote className="mrev__quote">
              {r.quote.map((p) => (
                <p className="mrev__p" key={p.slice(0, 28)}>
                  {p}
                </p>
              ))}
            </blockquote>

            <ul className="mrev__scores">
              {r.scores.map((s) => (
                <li className="mrev__scores-item" key={s.label}>
                  <span className="mrev__scores-label">{s.label}</span>
                  <span className="mrev__scores-value">{s.value}</span>
                </li>
              ))}
            </ul>

            <p className="mrev__meta">
              {midragSection.sourceLabel}
              {r.date && ` · ${r.date}`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
