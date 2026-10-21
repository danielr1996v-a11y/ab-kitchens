"use client";

import { useState } from "react";
import Image from "next/image";
import { clientVideos, videosSection } from "@/lib/videos";

/**
 * סרטוני הלקוחות בעמוד ההמלצות - רשת, כמו עמוד הסרטונים.
 *
 * ⚠️ **החליף את הסליידר (21.10), לבקשת דניאל:** "שהצורה של
 * הווידאואים תהיה כמו בעמוד סרטונים ולא סליידר". אותן מחלקות
 * רשת (.chv__grid) ואותו כרטיס (.vcard__btn), כך ששני העמודים
 * נראים אותו דבר ומשתנים יחד.
 *
 * בלי כותרת מתחת לכרטיס: לסרטוני ההמלצות אין כותרות, רק תיאור
 * נגיש, ולא ממציאים טקסט.
 *
 * הנגן נטען רק בלחיצה - עד אז סטילס ששמור אצלנו, בלי מגע עם
 * יוטיוב. סרטון אחד פתוח בכל רגע.
 */
export default function ClientVideos() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="chv__grid">
      {clientVideos.map((v) => (
        <li className="chv__item" key={v.id}>
          {openId === v.id ? (
            <iframe
              className="vcard__frame"
              src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
              title={v.alt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="vcard__btn"
              onClick={() => setOpenId(v.id)}
              aria-label={`${videosSection.playLabel}: ${v.alt}`}
            >
              <Image
                src={`/images/testimonials/video/${v.id}.webp`}
                alt=""
                width={v.w}
                height={v.h}
                className="vcard__poster"
                sizes="(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 22vw"
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
