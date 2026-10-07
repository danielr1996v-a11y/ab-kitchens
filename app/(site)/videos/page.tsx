import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChannelVideos from "@/components/ChannelVideos";
import DesignerCta from "@/components/DesignerCta";
import { getChannelVideos, videosPage } from "@/lib/channel";

export const metadata: Metadata = {
  title: "סרטונים - נגרות ושיש | א. בית המטבחים",
  description:
    "אברהם מסביר על נגרות ושיש למטבח: סוגי אבן, לוחות, אחסון, פרזול ותכנון - בסרטונים קצרים מהמפעל ומהאולם.",
  alternates: { canonical: "/סרטונים" },
  openGraph: {
    title: "סרטונים - נגרות ושיש | א. בית המטבחים",
    url: "/סרטונים",
  },
};

/**
 * עמוד הסרטונים - מערוץ היוטיוב של אברהם.
 *
 * ⚠️ הרשימה מתרעננת פעם ביום מפיד הערוץ (lib/channel.ts), ולכן
 * העמוד נבנה מחדש לכל היותר פעם ביום ולא בכל בקשה.
 *
 * ⚠️ בלי משפט פתיחה מתחת לכותרת, במכוון. דניאל ביקש עמוד
 * סרטונים, לא טקסט - ולא מוסיפים מלל שלא התבקש.
 */
export const revalidate = 86400;

export default async function Page() {
  const videos = await getChannelVideos();

  return (
    <>
      {/* ⚠️ אותו באנר של עמוד ההמלצות, כדי ששני עמודי התוכן ידברו
          באותה שפה. hero-3 כהה, ולכן הכותרת הלבנה בתחתית נשארת
          קריאה גם בלי להקשיח את הגראדיינט. */}
      <section className="tbanner">
        <Image
          src="/images/hero-3.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="tbanner__img"
        />
        <span className="tbanner__scrim" aria-hidden="true" />
        <h1 className="tbanner__title">{videosPage.title}</h1>
      </section>

      <Breadcrumbs
        trail={[{ label: "דף הבית", href: "/" }, { label: videosPage.title }]}
      />

      <section className="chv-section" aria-label={videosPage.title}>
        <ChannelVideos videos={videos} />
      </section>

      <DesignerCta />
    </>
  );
}
