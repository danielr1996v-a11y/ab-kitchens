import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import { articles, articleHref } from "@/lib/articles";

/* ⚠️ ב-Next 16 params הוא Promise וחייב await.
   אומת ב-node_modules/next/dist/docs/.../generate-static-params.md */
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) return {};
  const url = articleHref(a.slug);
  return {
    title: `${a.title} | א. בית המטבחים`,
    description: a.excerpt,
    alternates: { canonical: url },
    openGraph: { title: a.title, description: a.excerpt, url, type: "article" },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <article className="apage">
      <Breadcrumbs
        trail={[
          { label: "דף הבית", href: "/" },
          { label: "מאמרים", href: "/מאמרים-וטיפים" },
          { label: article.title },
        ]}
      />

      <Reveal className="apage__head">
        <h1 className="apage__title">{article.title}</h1>
      </Reveal>

      <div className="apage__media">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 900px) 100vw, 80vw"
          priority
          className="apage__img"
        />
      </div>

      {/* גוף המאמר. הרוחב מוגבל ב-CSS ל-65ch - בקשה מפורשת
          של דניאל שהשורות לא יהיו ארוכות מדי. */}
      <div className="apage__body">
        {article.blocks.map((block, i) => (
          <section className="apage__block" key={block.heading ?? i}>
            {block.heading && (
              <h2 className="apage__heading">{block.heading}</h2>
            )}
            {block.paragraphs.map((p) => (
              <p className="apage__p" key={p.slice(0, 28)}>
                {p}
              </p>
            ))}
          </section>
        ))}

        <Link href="/contact" className="apage__cta">
          לתיאום פגישה ללא עלות
        </Link>
      </div>

    </article>
  );
}
