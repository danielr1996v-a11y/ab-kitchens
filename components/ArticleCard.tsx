import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { articleHref } from "@/lib/articles";

/**
 * ArticleCard - תמונה, שם המאמר מתחתיה ותקציר קצר.
 *
 * אותו רכיב משמש בשני מקומות: ברשת הליסטינג, וכ"קובייה" בודדת
 * בתחתית עמוד המטבח. לכן אין לו כאן שום מידות - הרוחב נקבע
 * על ידי הרשת שעוטפת אותו.
 *
 * server component - אין מצב, רק תצוגה.
 */
export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="acard">
      <Link href={articleHref(article.slug)} className="acard__link">
        <span className="acard__media">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
            className="acard__img"
          />
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
