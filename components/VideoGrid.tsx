"use client";

import { useState } from "react";
import Image from "next/image";
import { clientVideos, videosSection } from "@/lib/videos";

/**
 * גריד סרטוני הלקוחות.
 *
 * ⚠️ **הנגן נטען רק בלחיצה.** 17 iframe של יוטיוב בעמוד אחד
 * מושכים מגה-בייטים של סקריפטים ומשתקים את זמן הטעינה. מה
 * שנטען בהתחלה הוא סטילס של ~20KB ששמור אצלנו; ה-iframe נכנס
 * רק כשהמבקר בחר לצפות.
 *
 * ⚠️ זה גם מה שמונע עוגיות צד-שלישי: `youtube-nocookie` ורק
 * אחרי לחיצה. עד אז גוגל לא יודעת שהמבקר קיים.
 *
 * ⚠️ `columns` ולא `grid`: כרגע כל הסטילס 9:16, אבל ארבעת
 * הקבצים הגדולים בדרייב עשויים להיות אופקיים. ב-grid אחיד
 * הייתי חייב לחתוך אותם, וחיתוך סרטון מטבח הורס אותו.
 */
export default function VideoGrid() {
  /* איזה סרטון כבר נפתח. Set ולא boolean - כמה יכולים לרוץ */
  const [playing, setPlaying] = useState<Set<string>>(new Set());

  const play = (id: string) =>
    setPlaying((prev) => new Set(prev).add(id));

  if (clientVideos.length === 0) return null;

  return (
    <ul className="vgrid">
      {clientVideos.map((v) => (
        <li className="vcard" key={v.id}>
          {playing.has(v.id) ? (
            <iframe
              className="vcard__frame"
              style={{ aspectRatio: `${v.w} / ${v.h}` }}
              src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
              title={v.alt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="vcard__btn"
              onClick={() => play(v.id)}
              aria-label={`${videosSection.playLabel}: ${v.alt}`}
            >
              <Image
                src={`/images/testimonials/video/${v.id}.webp`}
                alt={v.alt}
                width={v.w}
                height={v.h}
                className="vcard__poster"
                sizes="(max-width: 560px) 45vw, (max-width: 1100px) 30vw, 23vw"
              />
              <span className="vcard__play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v13.72L19 12z" />
                </svg>
              </span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
