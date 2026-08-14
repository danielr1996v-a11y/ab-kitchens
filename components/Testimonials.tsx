import { site, testimonials } from "@/lib/content";

export type Review = (typeof testimonials)[number];

/**
 * Testimonials - "מה אומרים עלינו", לפי הרפרנס שדניאל שלח.
 *
 * רשת של כרטיסים ולא סליידר: כל הביקורות נראות בבת אחת, בלי
 * שהמשתמש צריך לגלול כדי לגלות שיש עוד. הסליידר הקודם הסתיר
 * שתיים מתוך שלוש.
 *
 * server component - אין כאן מצב, רק תצוגה.
 *
 * סדר הכרטיס לפי הרפרנס: עיגול האות בקצה ימין, השם והכוכבים
 * לצידו, וההמלצה מתחת.
 *
 * ברפרנס מופיע גם "לפני חודשיים" ליד הכוכבים. אצלנו לא - דניאל
 * ביקש בלי תאריכים, ואין לנו את התאריך האמיתי של אף ביקורת.
 * לא נמציא אחד.
 */

function Stars({ count }: { count: number }) {
  return (
    <span className="stars" aria-label={`דירוג ${count} מתוך 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="stars__icon" aria-hidden="true">
          <path
            d="M10 1.6l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.4 5 17l1-5.6-4-3.9 5.6-.8z"
            fill={i < count ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

/** לוגו גוגל בצבעים המקוריים - זה מה שנותן לתג את האמינות */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="gscore__logo" aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.7-.4-3.9H24v7.1h12.1c-.2 1.8-1.6 4.5-4.5 6.3l6.9 5.3c4.1-3.8 6.6-9.4 6.6-14.8z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.3c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8.1 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.5 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.7-4.5l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 10l7.1-5.5z" />
      <path fill="#EA4335" d="M24 10.2c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4 29.9 2 24 2 15.4 2 8.1 6.9 4.4 14l7.1 5.5c1.8-5.3 6.7-9.3 12.5-9.3z" />
    </svg>
  );
}

export default function Testimonials({
  reviews = testimonials,
}: {
  reviews?: Review[];
} = {}) {
  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <div className="testimonials__inner">
        <header className="testimonials__header">
          {/* העינית והכותרת מקובצות יחד, אחרת space-between דוחף
              את הכותרת למרכז. שתיהן נצמדות ימינה. */}
          <div className="testimonials__heading">
            {/* עינית עם קו קצר, כמו ברפרנס */}
            <p className="testimonials__eyebrow">ממליצים</p>
            <h2 className="testimonials__title" id="testimonials-title">
              מה אומרים עלינו
            </h2>
          </div>

          {/* תג הדירוג - הצד הנגדי לכותרת */}
          <div className="gscore">
            <GoogleMark />
            {/* toFixed כדי שיוצג "5.0" ולא "5", כמו ברפרנס */}
            <span className="gscore__value">
              {site.googleRating.toFixed(1)}
            </span>
            <span className="gscore__meta">
              <Stars count={Math.round(site.googleRating)} />
              <span className="gscore__count">
                {site.googleReviews} ביקורות בגוגל
              </span>
            </span>
          </div>
        </header>

        <ul className="reviews">
          {reviews.map((r) => (
            <li className="review" key={r.id}>
              <div className="review__head">
                <span className="review__avatar" aria-hidden="true">
                  {r.name.trim().charAt(0)}
                </span>
                <div className="review__who">
                  <p className="review__name">{r.name}</p>
                  <Stars count={r.rating} />
                </div>
              </div>
              <p className="review__text">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
