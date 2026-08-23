import Image from "next/image";
import { heroSlideshow } from "@/lib/content";

/**
 * Hero - באנר ראשי עם רקע תמונות מתחלפות (Ken Burns + Cross Fade).
 *
 * למה CSS ולא ספריה: האנימציה רצה על opacity + transform בלבד, כלומר על ה-compositor -
 * חלקה גם במכשירים חלשים, בלי JavaScript ובלי משקל נוסף.
 *
 * העיתוי נגזר מההגדרות ב-content, כך שהלקוח יוכל לשנות מספר תמונות
 * וזמנים מממשק הניהול - ה-keyframes מחושבים אוטומטית בהתאם.
 */

export type HeroProps = { slideshow?: typeof heroSlideshow };

export default function Hero({ slideshow = heroSlideshow }: HeroProps = {}) {
  const { slides, displaySeconds, transitionSeconds, enabled, scrollIndicator } =
    heroSlideshow;
  const count = slides.length;
  const isAnimated = enabled && count > 1;

  // מחזור מלא = מספר התמונות × זמן התצוגה
  const cycle = count * displaySeconds;
  const pctFadeIn = (transitionSeconds / cycle) * 100;
  const pctHoldEnd = (displaySeconds / cycle) * 100;
  const pctFadeOut = ((displaySeconds + transitionSeconds) / cycle) * 100;

  const keyframes = `@keyframes heroKenBurns {
  0% { opacity: 0; transform: scale(1); }
  ${pctFadeIn.toFixed(3)}% { opacity: 1; }
  ${pctHoldEnd.toFixed(3)}% { opacity: 1; }
  ${pctFadeOut.toFixed(3)}% { opacity: 0; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(1.05); }
}`;

  return (
    <section className="hero" aria-label="באנר ראשי">
      {isAnimated && <style dangerouslySetInnerHTML={{ __html: keyframes }} />}

      {slides.map((slide, i) => (
        <div
          key={slide.image}
          className={`hero__slide${isAnimated ? " hero__slide--animated" : ""}`}
          style={
            isAnimated
              ? {
                  animationDuration: `${cycle}s`,
                  animationDelay: `${i * displaySeconds}s`,
                }
              : { opacity: i === 0 ? 1 : 0 }
          }
        >
          <Image
            src={slide.image}
            alt={i === 0 ? slide.alt : ""}
            aria-hidden={i !== 0}
            fill
            priority={i === 0}
            /* ⚠️ רק השקופית הבאה נטענת מראש, לא כולן.
               הראשונה priority. השנייה eager כי היא נחוצה בעוד
               שניות בודדות. השאר lazy - יש להן מחזור שלם ויותר,
               ולטעון את כולן יחד יוצר פרץ שמתחרה על הרוחב פס
               ומשאיר שקופית ריקה ברשת איטית. */
            loading={i === 1 ? "eager" : undefined}
            sizes="100vw"
            className="hero__img"
          />
        </div>
      ))}

      {scrollIndicator.enabled && (
        <a
          href={`#${scrollIndicator.targetId}`}
          className="scroll-cue"
          aria-label={scrollIndicator.label}
        >
          <span className="scroll-cue__line" aria-hidden="true" />
          <svg
            viewBox="0 0 24 24"
            className="scroll-cue__chevron"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
          >
            <path d="M5 9l7 7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </section>
  );
}
