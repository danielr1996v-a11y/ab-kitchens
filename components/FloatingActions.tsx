import { whatsappHref } from "@/lib/content";
import Icon from "./Icon";

/**
 * כפתור צף אחד בצד שמאל - וואטסאפ.
 *
 * ⚠️ 19.10: כפתור החיוג הוסר לבקשת הלקוח - שני עיגולים ירוקים
 * יצרו עומס והסתירו טקסט. חיוג נשאר בהדר ("לחיוג מהיר") ובפוטר.
 *
 * החליף את WhatsAppButton שהיה בצד ימין. שני כפתורי וואטסאפ
 * באתר אחד הם באג, ולכן הימני הוסר ולא נשאר במקביל.
 *
 * שמאל ולא ימין: בעברית הטקסט זורם ימינה, וכפתור צף בימין
 * נופל בדיוק על סוף השורות. משמאל הוא לא מתחרה בקריאה.
 */
export default function FloatingActions() {
  return (
    <div className="fab">
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
