import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";

/**
 * ArticleCard - תמונה, שם המאמר מתחתיה ותקציר קצר.
 *
 * אותו רכיב משמש בשני מקומות: ברשת הליסטינג, וכ"קובייה" בודדת
 * בתחתית עמוד המטבח. לכן אין לו כאן שום מידות - הרוחב נקבע
 * על ידי הרשת שעוטפת אותו.
 *
 * server component - אין מצב, רק תצוגה.
 */
/* ⚠️ שלב 5א: הכתובת מגיעה עם המאמר (path מהמערכת), ולא נגזרת
   מטבלה בקוד - כך מאמר חדש מהמערכת מקבל קישור נכון לבד */
type CardArticle = Pick<Article, "title" | "excerpt" | "image" | "imageAlt"> & { path: string };

export default function ArticleCard({ article }: { article: CardArticle }) {
  return (
    <article className="acard">
      <Link href={article.path} className="acard__link">
        {/* ⏸ בלי תמונה (ממתין לצילום מדניאל): משטח פחם עם הלוגו
            הבהיר, באותו יחס 16/9 - כך הרשת נשארת מיושרת. */}
        <span
          className={`acard__media${article.image ? "" : " acard__media--empty"}`}
        >
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt ?? ""}
              fill
              sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
              className="acard__img"
            />
          ) : (
            <Image
              src="/logo.png"
              alt=""
              width={1640}
              height={460}
              className="acard__logo"
            />
          )}
        </span>

        <h3 className="acard__title">{article.title}</h3>
        <p className="acard__excerpt">{article.excerpt}</p>
        <span className="acard__more" aria-hidden="true">
          לקריאה
        </span>
      </Link>
    </article>
  );
}
