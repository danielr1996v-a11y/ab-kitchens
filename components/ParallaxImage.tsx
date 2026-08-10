"use client";

import { useEffect, useRef } from "react";

/**
 * ParallaxImage - הזזה עדינה של התמונה בזמן גלילה.
 *
 * למה קומפוננטה נפרדת: פרלקס מחייב מאזין גלילה, כלומר "use client".
 * עטיפה של התמונה בלבד שומרת על KitchenPage כ-server component
 * במקום להפוך את כל העמוד ל-client.
 *
 * הילדים כוללים גם את הנקודות החמות ולא רק את התמונה - אחרת
 * הנקודות היו נשארות במקום בזמן שהתמונה זזה מתחתן, והתווית
 * "תאורה מדויקת" הייתה מחליקה מהמנורה.
 *
 * מכובה לגמרי במסכי מגע ותחת prefers-reduced-motion.
 */
export default function ParallaxImage({
  children,
  /** כמה להזיז, כשבר מגובה המסגרת */
  amount = 0.12,
}: {
  children: React.ReactNode;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // פרלקס במגע מרגיש שבור ועולה בביצועים - לא מפעילים שם
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // ‎-1 כשהאלמנט נכנס מלמטה, 0 במרכז המסך, 1 כשהוא יוצא למעלה
      const progress =
        (rect.top + rect.height / 2 - viewport / 2) /
        (viewport / 2 + rect.height / 2);
      const shift = -progress * amount * rect.height;
      el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      // מאחדים ריבוי אירועי גלילה לפריים אחד
      if (!frame) frame = requestAnimationFrame(update);
    };

    // מאזינים רק כשהסקשן על המסך
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        } else {
          window.removeEventListener("scroll", onScroll);
        }
      },
      { rootMargin: "150px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [amount]);

  return (
    <div ref={ref} className="kparallax">
      {children}
    </div>
  );
}
