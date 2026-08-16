import Image from "next/image";
import { aboutStory } from "@/lib/content";
import { renderHighlight } from "@/lib/richText";
import Reveal from "./Reveal";

/**
 * AboutStory - סיפור משפחת ביטון, הסקשן השני בעמוד אודות.
 *
 * הסקשן הזה נבנה סביב מה שדף הבית **לא** אומר. סקשן הערכים שם
 * כבר מוכר יכולת - "אנחנו הספק לא מתווך", "הכל תחת קורת גג
 * אחת", "דור שני". אם נחזור על זה כאן בניסוח אחר, העמוד מיותר.
 * מה שדף הבית מעולם לא אמר הוא **השם**: משפחת ביטון. זה הפער
 * שהסקשן ממלא.
 *
 * טיפוגרפיה נושאת אותו. אין צילומים של המשפחה או של הנגרייה,
 * ולכן הכותרת והמרקר הם כל הכובד הוויזואלי - והמבנה בנוי כך
 * שצילום שיגיע בעתיד ייכנס לצד הטקסט בלי לפרק כלום.
 *
 * server component - אין מצב, רק תצוגה.
 */
export default function AboutStory() {
  return (
    <section className="astory" aria-labelledby="story-title">
      <div className="astory__inner">
        <Reveal className="astory__head">
          <p className="astory__eyebrow">{aboutStory.eyebrow}</p>
          <h2 className="astory__title" id="story-title">
            {/* \n בתוכן שובר את הכותרת לשתי שורות במכוון.
                white-space: pre-line ב-CSS הוא שמכבד אותו. */}
            {aboutStory.title}
          </h2>
        </Reveal>

        <Reveal className="astory__body" threshold={0.15}>
          {aboutStory.paragraphs.map((p, i) => (
            <p className="astory__p" key={i}>
              {renderHighlight(p)}
            </p>
          ))}
        </Reveal>
      </div>

      {/* מילת הרקע הענקית שהתמונה יושבת עליה, כמו ברפרנס.
          aria-hidden: זו טקסטורה ויזואלית ולא תוכן - קורא מסך
          שיקריא "משפחת ביטון" באמצע הסקשן רק יבלבל. */}
      <div className="astory__stage">
        <p className="astory__watermark" aria-hidden="true">
          {aboutStory.watermark}
        </p>
        <div className="astory__shot">
          <Image
            src={aboutStory.image}
            alt={aboutStory.imageAlt}
            fill
            sizes="(max-width: 900px) 92vw, 58vw"
            className="astory__img"
          />
        </div>
      </div>
    </section>
  );
}
