import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import { articles, articlesPage } from "@/lib/articles";

export const metadata: Metadata = {
  title: "מאמרים על מטבחים ושיש | א. בית המטבחים",
  description: articlesPage.lead,
  alternates: { canonical: "/מאמרים-וטיפים" },
  openGraph: {
    title: "מאמרים על מטבחים ושיש | א. בית המטבחים",
    description: articlesPage.lead,
    url: "/מאמרים-וטיפים",
  },
};

/**
 * ליסטינג המאמרים.
 *
 * ⚠️ הנתיב הציבורי הוא /מאמרים-וטיפים - הכתובת שהייתה באתר
 * הישן. היא הופנתה זמנית לדף הבית כשהעמוד ירד, וההפניה הוסרה
 * כשהעמוד חזר עם תוכן אמיתי.
 */
export default function Page() {
  return (
    <section className="alist" aria-labelledby="articles-title">
      <Reveal className="alist__head">
        <h1 className="alist__title" id="articles-title">
          {articlesPage.title}
        </h1>
        <p className="alist__lead">{articlesPage.lead}</p>
      </Reveal>

      <ul className="alist__grid">
        {articles.map((a) => (
          <li key={a.slug}>
            <ArticleCard article={a} />
          </li>
        ))}
      </ul>

      <Breadcrumbs
        trail={[
          { label: "דף הבית", href: "/" },
          { label: articlesPage.title },
        ]}
      />
    </section>
  );
}
