"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  videoCategories,
  videosPage,
  type ChannelVideo,
  type VideoCategory,
} from "@/lib/channel";

/**
 * הסרטונים של אברהם - שתי קטגוריות, רשת, ונגן במקום.
 *
 * ⚠️ **שני כפתורים, לא שתי רשימות זו מתחת לזו.** דניאל: "מחולק
 * ל-2 קטגוריות... ובלחיצת כפתור מופיעים כל הסרטונים". הקטגוריה
 * נבחרת בכפתור, ובתוכה מוצגים 8 ראשונים עם "לכל הסרטונים" -
 * 30 נגנים בבת אחת היו עמוד כבד וגלילה אינסופית בטלפון.
 *
 * ⚠️ **הנגן נטען רק בלחיצה**, כמו בעמוד ההמלצות: עד אז רק סטילס
 * ששמור אצלנו, ו-youtube-nocookie נכנס רק כשהגולש בחר לצפות.
 * סרטון אחד פתוח בכל רגע.
 *
 * ⚠️ סרטון חדש מהפיד (w=0) עוד אין לו סטילס אצלנו, ולכן התמונה
 * שלו נמשכת מ-i.ytimg.com - המקום היחיד בעמוד שפונה לגוגל לפני
 * לחיצה. נעלם ברגע שמוסיפים לו סטילס מקומי.
 *
 * נגישות: תבנית tabs מלאה - role, aria-selected, וחיצי מקלדת.
 */
export default function ChannelVideos({ videos }: { videos: ChannelVideo[] }) {
  const [cat, setCat] = useState<VideoCategory>(videoCategories[0].id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const list = videos.filter((v) => v.cat === cat);
  const all = expanded[cat] ?? false;
  const shown = all ? list : list.slice(0, videosPage.initial);

  const pick = (next: VideoCategory) => {
    setCat(next);
    /* נגן פתוח בקטגוריה אחרת נעלם מהמסך אבל ממשיך להשמיע */
    setOpenId(null);
  };

  /* חיצים בין הלשוניות. ⚠️ ב-RTL ימינה = הקודם */
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = videoCategories.length;
    const step = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const j = (i + step + n) % n;
    pick(videoCategories[j].id);
    tabs.current[j]?.focus();
  };

  return (
    <div className="chv">
      <div className="chv__tabs" role="tablist" aria-label={videosPage.title}>
        {videoCategories.map((c, i) => {
          const count = videos.filter((v) => v.cat === c.id).length;
          const on = c.id === cat;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`chv-tab-${c.id}`}
              aria-selected={on}
              aria-controls="chv-panel"
              tabIndex={on ? 0 : -1}
              className={`chv__tab${on ? " chv__tab--on" : ""}`}
              onClick={() => pick(c.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {c.label}
              <span className="chv__count">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        id="chv-panel"
        role="tabpanel"
        aria-labelledby={`chv-tab-${cat}`}
        className="chv__panel"
      >
        <ul className="chv__grid">
          {shown.map((v) => (
            <li className="chv__item" key={v.id}>
              {openId === v.id ? (
                <iframe
                  className="vcard__frame"
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="vcard__btn"
                  onClick={() => setOpenId(v.id)}
                  aria-label={`${videosPage.playLabel}: ${v.title}`}
                >
                  {v.w ? (
                    <Image
                      src={`/images/videos/${v.id}.webp`}
                      alt=""
                      width={v.w}
                      height={v.h}
                      className="vcard__poster"
                      sizes="(max-width: 700px) 45vw, (max-width: 1100px) 30vw, 22vw"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://i.ytimg.com/vi/${v.id}/oardefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="vcard__poster"
                    />
                  )}
                  <span className="vcard__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5.14v13.72L19 12z" />
                    </svg>
                  </span>
                </button>
              )}
              <p className="chv__title">{v.title}</p>
            </li>
          ))}
        </ul>

        {!all && list.length > videosPage.initial && (
          <div className="chv__more">
            <button
              type="button"
              className="chv__more-btn"
              onClick={() => setExpanded((p) => ({ ...p, [cat]: true }))}
            >
              {videosPage.showAll} ({list.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
