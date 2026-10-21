import ChannelVideos from "@/components/ChannelVideos";
import { getChannelVideos, videosPage } from "@/lib/channel";

/**
 * סרטונים בדף הבית, אחרי ההמלצות (21.10, לבקשת דניאל): אותן שתי
 * לשוניות של עמוד הסרטונים, 4 מכל סוג, ו"לכל הסרטונים" מוביל לעמוד.
 *
 * ⚠️ סקשן קבוע ולא בלוק CMS - כמו DesignerCta, כדי שלא ייעלם כשדף
 * הבית מגיע מ-Sanity בלי הבלוק הזה.
 */
export default async function HomeVideos() {
  const videos = await getChannelVideos();

  return (
    <section className="hvideos" aria-labelledby="hvideos-title">
      <div className="tvideos__head">
        <h2 className="tvideos__title" id="hvideos-title">
          {videosPage.title}
        </h2>
      </div>
      <div className="tvideos__body">
        <ChannelVideos videos={videos} initial={4} moreHref="/סרטונים" />
      </div>
    </section>
  );
}
