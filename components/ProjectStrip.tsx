import Image from "next/image";
import Link from "next/link";
import { aboutProjects } from "@/lib/content";
import { renderHighlight } from "@/lib/richText";
import Reveal from "./Reveal";

/**
 * ProjectStrip - רצועת הפרויקטים בראש עמוד האודות.
 *
 * server component: אין כאן מצב. התנועה היא CSS בלבד, על אותה
 * מכניקה של מרקיזת הלוגואים - שתי קבוצות זהות, כל אחת
 * min-width: 100%, ו-translateX אינסופי. כשקבוצה אחת יוצאת
 * השנייה כבר במקומה, ולכן הלולאה נראית רציפה בלי JS.
 *
 * שתי החלטות שקל לפספס:
 * - הקבוצה השנייה היא aria-hidden. היא כפילות ויזואלית בלבד,
 *   וקורא מסך שיקריא את כל 32 הכרטיסים הוא באג.
 * - הכרטיס הוא קישור לגלריה של אותו סוג. ריחוף שמגלה "מטבח
 *   קלאסי" ולא מוביל לקלאסי הוא החמצה.
 */

function Card({
  item,
  duplicate = false,
}: {
  item: (typeof aboutProjects.items)[number];
  duplicate?: boolean;
}) {
  return (
    <li className="pstrip__item">
      <Link
        href={item.href}
        className="pstrip__card"
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
             ומוריד תמונה ענקית לכרטיס של 340px */
          sizes="(max-width: 700px) 78vw, 22vw"
          className="pstrip__img"
        />
        <span className="pstrip__veil" aria-hidden="true" />
        <span className="pstrip__label">{item.label}</span>
      </Link>
    </li>
  );
}

export default function ProjectStrip() {
  const items = aboutProjects.items;

  return (
    <section className="pstrip" aria-labelledby="projects-title">
      <Reveal className="pstrip__head">
        <p className="pstrip__eyebrow">{aboutProjects.eyebrow}</p>
        <h2 className="pstrip__title" id="projects-title">
          {renderHighlight(aboutProjects.title)}
        </h2>
        <p className="pstrip__intro">{aboutProjects.intro}</p>
      </Reveal>

      <div className="pstrip__track">
        <ul className="pstrip__group">
          {items.map((it) => (
            <Card key={it.id} item={it} />
          ))}
        </ul>
        {/* עותק שני - מה שמייצר את הלולאה הרציפה */}
        <ul className="pstrip__group" aria-hidden="true">
          {items.map((it) => (
            <Card key={`${it.id}-dup`} item={it} duplicate />
          ))}
        </ul>
      </div>
    </section>
  );
}
