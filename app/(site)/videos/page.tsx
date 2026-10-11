import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChannelVideos from "@/components/ChannelVideos";
import DesignerCta from "@/components/DesignerCta";
import { videosPage } from "@/lib/channel";
import { getVideos } from "@/lib/site/data";

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
 * ⚠️ שלב 5א: הרשימה מהמערכת (סרטונים מסוג "ערוץ", מפורסמים).
 * סרטון חדש בערוץ נכנס פעם ביום כ**טיוטה** (app/api/cron/youtube),
 * ומופיע כאן רק אחרי שמאשרים אותו במערכת - ADMIN-SPEC החלטה 1.
 *
 * ⚠️ בלי משפט פתיחה מתחת לכותרת, במכוון. דניאל ביקש עמוד
 * סרטונים, לא טקסט - ולא מוסיפים מלל שלא התבקש.
 */
export default async function Page() {
  const videos = (await getVideos()).channel;

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
