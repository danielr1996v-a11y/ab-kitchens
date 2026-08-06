"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal - עוטף שמוסיף `is-visible` כשהתוכן נכנס למסך.
 *
 * קיים כדי שסקשנים שאינם client components יוכלו להשתמש
 * באנימציות שכבר בנויות באתר (reveal-mask וכדומה) בלי שכל אחד
 * מהם יממש IntersectionObserver משלו.
 *
 * ה-observer מתנתק אחרי ההפעלה - האנימציה רצה פעם אחת בלבד,
 * ולא חוזרת בכל גלילה למעלה ולמטה.
 */
export default function Reveal({
  children,
  className = "",
  threshold = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // אם המשתמש ביקש להפחית תנועה - מציגים מיד, בלי אנימציה
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`${className}${visible ? " is-visible" : ""}`}>
      {children}
    </div>
  );
}
