"use client";

import { useRef } from "react";

/**
 * Testimonials - "בואו תשמעו את הלקוחות שלנו" עם רקע שיש וסליידר כרטיסים.
 *
 * הסליידר מבוסס scroll-snap מקורי של הדפדפן, והחצים פשוט גוללים אותו.
 * היתרון: החלקה באצבע עובדת מעצמה במובייל, המקלדת עובדת, והגלילה
 * חלקה בלי ספריית קרוסלה.
 */

const reviews = [
  {
    id: "r1",
    name: "לקוח מרוצה",
    text: "אברהם מבית המטבחים התקין לנו שיש באופן מקצועי, מהיר, יסודי ומאוד אדיב. הופתענו לטובה כשהגיע למדידה והקדים בזמן, השיש היה מוכן להתקנה אחרי ימים ספורים וגם ההתקנה הייתה מהירה ויסודית.",
    rating: 5,
  },
  {
    id: "r2",
    name: "לקוח מרוצה",
    text: "היה מצוין לגמרי! הוא היה מאוד זמין וגמיש בזמנים, הגיע בזמן, עשה עבודה יפה ונתן מחיר טוב.",
    rating: 5,
  },
  {
    id: "r3",
    name: "לקוח מרוצה",
    text: "שירות מעולה! הייתי מאוד מרוצה, אני שמח שבחרתי בבית המטבחים. המחיר היה הוגן, היחס מהמם, ומהירות העבודה הייתה הרבה יותר מהר ממה שציפיתי.",
    rating: 5,
  },
];

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

export default function Testimonials() {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLLIElement>(".review");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    // ב-RTL הכיוון הפיזי הפוך, ולכן מכפילים בסימן המתאים
    const isRtl = getComputedStyle(track).direction === "rtl";
    const step = (card.offsetWidth + gap) * direction * (isRtl ? -1 : 1);
    track.scrollBy({ left: step, behavior: "smooth" });
  };

  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <div className="testimonials__inner">
        <header className="testimonials__header">
          <h2 className="testimonials__title" id="testimonials-title">
            בואו תשמעו את הלקוחות שלנו
          </h2>
          <p className="testimonials__source">ביקורות מ-Google · דירוג 5.0</p>
        </header>

        <div className="slider">
          <button
            type="button"
            className="slider__arrow slider__arrow--prev"
            onClick={() => scrollByCard(-1)}
            aria-label="ההמלצה הקודמת"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
              <path d="M9 6l6 6-6 6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <ul className="slider__track" ref={trackRef}>
            {reviews.map((review) => (
              <li className="review" key={review.id}>
                <Stars count={review.rating} />
                <p className="review__text">{review.text}</p>
                <footer className="review__footer">
                  <span className="review__avatar" aria-hidden="true">
                    {review.name.charAt(0)}
                  </span>
                  <span className="review__name">{review.name}</span>
                </footer>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="slider__arrow slider__arrow--next"
            onClick={() => scrollByCard(1)}
            aria-label="ההמלצה הבאה"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
              <path d="M15 6l-6 6 6 6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
