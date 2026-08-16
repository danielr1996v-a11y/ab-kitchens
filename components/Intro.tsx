"use client";

import { useEffect } from "react";
import Image from "next/image";

/**
 * Intro - אנימציית פתיחה: הסימן נבנה מלמטה למעלה, שם המותג נכנס
 * אחריו, ואז "תריס" אנכי נפתח וחושף את האתר.
 *
 * הבנייה מלמטה למעלה נבחרה כי הסימן הוא בית - וזה בדיוק מה שאברהם
 * עושה. הסימן והשם הם חיתוכים מקובץ הלוגו עצמו ולא הקלדה מחדש,
 * כדי שהלוקאפ יישאר בדיוק כפי שעוצב.
 *
 * ⚠️ ברירת המחדל היא אתר בלי שכבה. ה-CSS חל רק אחרי ש-JS הוסיף
 * has-intro ל-<html> - כלומר רק כשידוע שיש מי שיסיר אותה.
 * הסקריפט המוקדם יושב ב-app/(site)/layout.tsx.
 */
export default function Intro() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("has-intro")) {
      root.classList.add("intro-done");
      window.dispatchEvent(new Event("intro:done"));
      return;
    }

    /* נכתב לפני הרצף: אם הרצף יקרוס, רענון לא ילכוד את המשתמש שוב */
    try {
      sessionStorage.setItem("ab-intro-seen", "1");
    } catch {}

    /* 4 בנייד, 7 בדסקטופ - סרגל צר מדי נקרא כרעש ולא כתריס */
    const slats = window.innerWidth < 768 ? 4 : 7;
    const blinds = document.getElementById("introBlinds");
    if (blinds && !blinds.childElementCount) {
      for (let i = 0; i < slats; i++) {
        const s = document.createElement("span");
        s.className = "intro__slat";
        s.style.transitionDelay = `${i * 90}ms`;
        blinds.appendChild(s);
      }
    }

    let finished = false;
    const finish = () => {
      if (finished) return; // הרצף והרשת עלולים לסיים יחד
      finished = true;

      root.classList.remove("intro-scrolllock");
      /* instant ולא auto: ל-html יש scroll-behavior: smooth,
         ובלעדיו העמוד היה מתגלגל למעלה מול העיניים */
      const hash = location.hash && document.querySelector(location.hash);
      if (hash) hash.scrollIntoView({ behavior: "instant", block: "start" });
      else window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      root.classList.add("intro-done");
      /* Lenis ממתין לאירוע הזה - אתחול שלו בזמן שה-body קפוא
         היה גורם לו למדוד עמוד בגובה מסך אחד */
      window.dispatchEvent(new Event("intro:done"));
    };

    const safety = window.setTimeout(finish, 6000); // מה שלא יקרה, השכבה יורדת

    /* setTimeout ולא rAF: rAF קפוא בטאב לא-פעיל,
       ואז הרצף לא היה מתחיל בכלל */
    const t1 = window.setTimeout(() => root.classList.add("intro-lock"), 30);
    const t2 = window.setTimeout(() => root.classList.add("intro-open"), 3200);
    const t3 = window.setTimeout(() => {
      clearTimeout(safety);
      finish();
    }, 3200 + 1250 + slats * 90);

    return () => [safety, t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className="intro" id="intro" aria-hidden="true">
      <div className="intro__lockup">
        <span className="intro__mark">
          <Image
            src="/intro/mark.png"
            alt=""
            width={358}
            height={361}
            priority
            sizes="(max-width: 768px) 34vw, 12vw"
          />
        </span>
        <span className="intro__word">
          <Image
            src="/intro/wordmark.png"
            alt=""
            width={1077}
            height={239}
            priority
            sizes="(max-width: 768px) 62vw, 24vw"
          />
        </span>
        <span className="intro__rule" />
      </div>
      <div className="intro__blinds" id="introBlinds" />
    </div>
  );
}
