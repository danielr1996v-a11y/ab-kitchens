import Image from "next/image";
import Link from "next/link";
import { aboutProjects } from "@/lib/content";
import { renderHighlight } from "@/lib/richText";
import Reveal from "./Reveal";

/**
 * ProjectStrip - הסקשן הפותח של עמוד אודות.
 *
 * לפי הרפרנס שדניאל שלח: הטקסט במרכז, ובשני הצדדים עמודות
 * פרויקטים שנעות אוטומטית - כל צד עם פרויקטים אחרים.
 *
 * המכניקה זהה למרקיזת הלוגואים שכבר עובדת באתר, רק על ציר Y:
 * שתי קבוצות זהות בכל עמודה, כל אחת בגובה מלא, ו-translateY
 * אינסופי. כשקבוצה יוצאת מלמעלה השנייה כבר במקומה. אפס JS.
 *
 * שתי העמודות נעות בכיוונים הפוכים. כשהן נעות יחד העין קוראת
 * את זה כגלילה של העמוד עצמו ולא כאנימציה.
 *
 * server component - התנועה היא CSS בלבד.
 */

function Card({
  item,
  duplicate = false,
}: {
  item: (typeof aboutProjects.columns)[number][number];
  duplicate?: boolean;
}) {
  return (
    <li className="pcol__item">
      <Link
        href={item.href}
        className="pcol__card"
        /* הכפילות מוסתרת מהנגישות ומהמקלדת - אחרת אותו יעד
           מופיע פעמיים ברצף הטאב */
        tabIndex={duplicate ? -1 : undefined}
        aria-hidden={duplicate || undefined}
      >
        <Image
          src={item.src}
          alt={duplicate ? "" : item.alt}
          fill
          /* sizes חובה: בלי זה הדפדפן מבקש את הרוחב המקסימלי
             ומוריד תמונה ענקית לכרטיס צר */
          sizes="(max-width: 900px) 45vw, 22vw"
          /* ⚠️ eager ולא lazy, וזה תיקון של באג ולא אופטימיזציה.
             נמדד: 27 מתוך 32 התמונות לא התחילו להיטען בכלל,
             והכרטיסים נכנסו למסך אפורים - זה מה שדניאל ראה
             כ"דף ריק".
             הסיבה: הכרטיסים מוזזים ב-transform בתוך מרקיזה,
             ולכן מבחינת חישוב הטעינה העצלה הם יושבים אלפי
             פיקסלים מחוץ למסך, והיא לא מספיקה לפני שהכרטיס
             כבר נראה בפועל.
             גם הכפילות eager: היא **נראית לעין** (aria-hidden
             מסתיר מקוראי מסך בלבד), ואלה אותן 16 כתובות בדיוק -
             כלומר אפס בקשות רשת נוספות. */
          loading="eager"
          /* מיידי אך לא דוחק: כך זה לא מתחרה על הרוחב פס
             עם הכותרת והגופנים בראש העמוד. */
          fetchPriority="low"
          className="pcol__img"
        />
        <span className="pcol__veil" aria-hidden="true" />
        <span className="pcol__label">{item.label}</span>
      </Link>
    </li>
  );
}

function Column({ items, dir }: { items: typeof aboutProjects.columns[number]; dir: "up" | "down" }) {
  return (
    <div className={`pcol pcol--${dir}`} aria-label="פרויקטים">
      <ul className="pcol__group">
        {items.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </ul>
      {/* עותק שני - מה שמייצר את הלולאה הרציפה */}
      <ul className="pcol__group" aria-hidden="true">
        {items.map((it) => (
          <Card key={`${it.id}-dup`} item={it} duplicate />
        ))}
      </ul>
    </div>
  );
}

export default function ProjectStrip() {
  const [right, left] = aboutProjects.columns;

  return (
    <section className="pstrip" aria-labelledby="projects-title">
      {/* ב-RTL הראשון ב-DOM הוא הימני */}
      <Column items={right} dir="up" />

      <Reveal className="pstrip__head">
        <p className="pstrip__eyebrow">{aboutProjects.eyebrow}</p>
        <h2 className="pstrip__title" id="projects-title">
          {aboutProjects.title}
        </h2>
        {aboutProjects.paragraphs.map((p, i) => (
          <p className="pstrip__p" key={i}>
            {renderHighlight(p)}
          </p>
        ))}
      </Reveal>

      <Column items={left} dir="down" />
    </section>
  );
}
