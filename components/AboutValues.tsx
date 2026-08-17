import Image from "next/image";
import { aboutValues } from "@/lib/content";
import Icon from "./Icon";
import Reveal from "./Reveal";

/**
 * AboutValues - "הערכים שמובילים אותנו", לפי הרפרנס שדניאל שלח.
 *
 * המבנה: תמונת מטבח ברקע, הכותרת עליה, וחמישה כרטיסים כהים
 * שיושבים **חצי על התמונה וחצי מתחתיה**. לכל כרטיס ריבוע
 * אייקון זהב שגם הוא חצי בפנים וחצי בחוץ.
 *
 * ⚠️ הערכים כאן מדברים על **איך אנחנו עובדים**, בעוד שסקשן
 * הערכים בדף הבית מוכר **מה אנחנו** (מפעל, מורשים, דור שני).
 * זווית שונה במכוון - אחרת העמוד חוזר על דף הבית.
 *
 * server component - אין מצב, רק תצוגה.
 */
export default function AboutValues() {
  return (
    <section className="avals" aria-labelledby="values-title">
      {/* התמונה היא רקע ויזואלי: היא נושאת את הכותרת ואת החצי
          העליון של הכרטיסים */}
      <div className="avals__stage">
        <Image
          src={aboutValues.image}
          alt={aboutValues.imageAlt}
          fill
          sizes="100vw"
          className="avals__bg"
        />
        <span className="avals__scrim" aria-hidden="true" />

        <Reveal className="avals__head">
          <p className="avals__eyebrow">{aboutValues.eyebrow}</p>
          <h2 className="avals__title" id="values-title">
            {aboutValues.title}
          </h2>
        </Reveal>
      </div>

      {/* הרשימה נדחפת כלפי מעלה ב-CSS כך שראשה נכנס לתוך
          התמונה. זה כל האפקט. */}
      <ul className="avals__grid">
        {aboutValues.items.map((it) => (
          <li className="aval" key={it.id}>
            <span className="aval__badge" aria-hidden="true">
              <Icon id={it.icon} />
            </span>
            <h3 className="aval__title">{it.title}</h3>
            <p className="aval__text">{it.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
