import { getSettings } from "@/lib/admin/settings";
import Icon from "./Icon";

/**
 * שני כפתורי פעולה צפים בצד שמאל - חיוג ווואטסאפ.
 *
 * החליף את WhatsAppButton שהיה בצד ימין. שני כפתורי וואטסאפ
 * באתר אחד הם באג, ולכן הימני הוסר ולא נשאר במקביל.
 *
 * שמאל ולא ימין: בעברית הטקסט זורם ימינה, וכפתור צף בימין
 * נופל בדיוק על סוף השורות. משמאל הוא לא מתחרה בקריאה.
 */
/* שלב 7: הטלפון והוואטסאפ מההגדרות במערכת */
export default async function FloatingActions() {
  const site = await getSettings();
  const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`שלום, אשמח לקבל פרטים על מטבח מ${site.name}`)}`;
  return (
    <div className="fab">
      <a
        href={`tel:${site.phone1.replace(/-/g, "")}`}
        className="fab__btn"
        aria-label={`חיוג ל${site.phone1}`}
      >
        <Icon id="phone" />
      </a>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fab__btn"
        aria-label="שליחת הודעת וואטסאפ"
      >
        <Icon id="whatsapp" />
      </a>
    </div>
  );
}
