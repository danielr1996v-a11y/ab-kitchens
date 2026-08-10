import Link from "next/link";
import Image from "next/image";
import { about } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * About - נבנה לפי הפיגמה (node 2002:3521).
 *
 * שתי עמודות. ב-RTL הראשונה היא הימנית:
 *   ימין (476px) - לוגו + כותרת ראשית
 *   שמאל (447px) - שתי פסקאות + קישור בזהב
 * המידות נלקחו ישירות מהפיגמה ומתורגמות ליחסי fr, כך שהפרופורציה
 * נשמרת בכל רוחב מסך ולא רק ב-1325px של הקנבס.
 */

export type AboutProps = { content?: typeof about };

export default function About({ content = about }: AboutProps = {}) {
  const [titleLine1, titleLine2] = content.title.split("\n");

  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="about__inner">
        {/* עמודה ימנית - לוגו וכותרת.
            הכותרת נחשפת בעליית מסכה, אותה אנימציה כמו בשאר כותרות האתר.
            כל שורה במסכה משלה, כדי שהן יעלו בזו אחר זו. */}
        <Reveal className="about__head">
          <Image
            src={content.logo}
            alt={content.logoAlt}
            width={1640}
            height={460}
            className="about__logo"
          />
          <h2 className="about__title" id="about-title">
            <span className="reveal-mask">
              <span className="reveal-mask__inner">{titleLine1}</span>
            </span>
            <span className="reveal-mask">
              <span className="reveal-mask__inner about__title-line2">
                {titleLine2}
              </span>
            </span>
          </h2>
        </Reveal>

        {/* עמודה שמאלית - טקסט וקישור */}
        <div className="about__body">
          {content.paragraphs.map((text) => (
            <p className="about__paragraph" key={text.slice(0, 24)}>
              {text}
            </p>
          ))}

          <Link href={content.ctaHref} className="about__cta">
            {content.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
