import Link from "next/link";
import Image from "next/image";
import { leadBanner } from "@/lib/content";

/**
 * LeadBanner - באנר דו-עמודתי לפי הפיגמה (node 2016:144).
 *
 * קנבס מקור 1325x528: תמונה ברוחב 716 (54%) מימין לפאנל כהה ברוחב 612 (46%).
 * ב-RTL העמודה הראשונה היא הימנית, ולכן הפאנל הכהה מוגדר ראשון.
 *
 * התמונה מתחלפת ברוטציה. האנימציה היא CSS טהור עם השהיה מדורגת -
 * בלי JS, בלי state, בלי טיימרים. אותה טכניקה בדיוק כמו ב-Hero.
 */
export default function LeadBanner() {
  const { slides, displaySeconds, transitionSeconds } = leadBanner;
  const count = slides.length;

  // המחזור נגזר ממספר השקופיות, כך שהוספה או הסרה מסתדרת לבד
  const cycle = count * displaySeconds;
  const pctFadeIn = (transitionSeconds / cycle) * 100;
  const pctHoldEnd = (displaySeconds / cycle) * 100;
  const pctFadeOut = ((displaySeconds + transitionSeconds) / cycle) * 100;

  return (
    <section className="lead" aria-labelledby="lead-title">
      {/* פאנל כהה - ימין ב-RTL */}
      <div className="lead__panel">
        <div className="lead__content">
          <h2 className="lead__title" id="lead-title">
            <strong className="lead__title-bold">{leadBanner.titleBold}</strong>
            <br />
            <span className="lead__title-light">{leadBanner.titleLight}</span>
          </h2>

          <p className="lead__subtitle">{leadBanner.subtitle}</p>

          <Link href={leadBanner.ctaHref} className="lead__cta">
            {leadBanner.ctaText}
          </Link>
        </div>
      </div>

      {/* תמונה מתחלפת - שמאל ב-RTL */}
      <div className="lead__media">
        <style>{`
          @keyframes leadFade {
            0%   { opacity: 0; transform: scale(1); }
            ${pctFadeIn.toFixed(3)}%  { opacity: 1; }
            ${pctHoldEnd.toFixed(3)}% { opacity: 1; }
            ${pctFadeOut.toFixed(3)}% { opacity: 0; transform: scale(1.012); }
            100% { opacity: 0; transform: scale(1.012); }
          }
        `}</style>

        {slides.map((slide, i) => (
          <div
            key={slide.image}
            className="lead__slide"
            style={{
              animationDuration: `${cycle}s`,
              animationDelay: `${i * displaySeconds}s`,
            }}
          >
            <Image
              src={slide.image}
              alt={i === 0 ? slide.alt : ""}
              fill
              sizes="(max-width: 900px) 100vw, 54vw"
              className="lead__img"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
