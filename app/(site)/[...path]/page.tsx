import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import { notFound, permanentRedirect } from "next/navigation";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getArticles, getRedirect } from "@/lib/site/data";

/**
 * כל כתובת שאין לה עמוד קבוע - שלב 5א.
 *
 * 1. מאמר שהכתובת שלו (path מהמערכת) תואמת - מוצג.
 * 2. כתובת ישנה של מאמר ששונתה בפרסום - הפניה קבועה (308) לחדשה,
 *    כדי לא לאבד דירוג (ADMIN-SPEC §0).
 * 3. אחרת - 404.
 *
 * ⚠️ עמודים קבועים (/אודותינו, /גלריה/...) לא מגיעים לכאן: ה-rewrites
 * ב-next.config רצים לפני נתיבים דינמיים. עד שלב 5א גם כתובות
 * המאמרים היו שם, ולכן מאמר חדש מהמערכת לא היה יכול לקבל כתובת.
 */

type Props = { params: Promise<{ path: string[] }> };

/* ⚠️ פרמטר בעברית יכול להגיע מקודד (%D7...) או מפוענח, תלוי
   בשכבה. מפענחים בזהירות - פענוח כפול של % לגיטימי היה זורק */
const toPath = (segments: string[]) =>
  "/" +
  segments
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .join("/");

async function findArticle(segments: string[]) {
  const path = toPath(segments);
  return (await getArticles()).find((a) => a.path === path);
}

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ path: a.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await findArticle((await params).path);
  if (!a) return {};
  const title = a.seo?.title || a.title;
  const description = a.seo?.description || a.excerpt;
  const image = a.seo?.image || a.image;
  return {
    title: `${title} | א. בית המטבחים`,
    description,
    alternates: { canonical: a.path },
    openGraph: { title, description, url: a.path, type: "article", ...(image ? { images: [image] } : {}) },
    ...(a.seo?.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ params }: Props) {
  const segments = (await params).path;
  const article = await findArticle(segments);
  if (!article) {
    const to = await getRedirect(toPath(segments));
    if (to) permanentRedirect(encodeURI(to));
    notFound();
  }

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

      {/* ⏸ בלי תמונה - בלי באנר. מאמר נקרא טוב גם בלעדיו */}
      {article.image && (
        <div className="apage__media">
          <Image
            src={article.image}
            alt={article.imageAlt ?? ""}
            fill
            sizes="(max-width: 900px) 100vw, 80vw"
            priority
            className="apage__img"
          />
        </div>
      )}

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

        {/* ⚠️ עד 7.10 כאן היה כפתור שהוביל לעמוד יצירת קשר נפרד.
            דניאל ביקש טופס ישיר במקום - מי שסיים לקרוא משאיר
            פרטים בלי לעזוב את המאמר. */}
        <div className="apage__lead">
          <p className="apage__lead-title">לתיאום פגישה ללא עלות</p>
          <LeadForm
            source={`מאמר: ${article.title}`}
            submitLabel="שלחו פרטים"
            variant="light"
          />
        </div>
      </div>
    </article>
  );
}
