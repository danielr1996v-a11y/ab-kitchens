import { whatsappHref } from "@/lib/content";
import Icon from "./Icon";

/**
 * כפתור צף אחד בצד ימין - וואטסאפ.
 *
 * ⚠️ 19.10: כפתור החיוג הוסר לבקשת הלקוח - שני עיגולים ירוקים
 * יצרו עומס והסתירו טקסט. חיוג נשאר בהדר ("לחיוג מהיר") ובפוטר.
 *
 * ⚠️ 9.11: עבר משמאל לימין לבקשת דניאל, כדי לפנות את השמאל
 * לתפריט הנגישות (AccessibilityMenu). שני העיגולים באותה פינה
 * היו נערמים זה על זה.
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
