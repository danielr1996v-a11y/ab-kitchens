import { getSettings } from "@/lib/admin/settings";
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
/* שלב 7: הטלפון והוואטסאפ מההגדרות במערכת */
export default async function FloatingActions() {
  const site = await getSettings();
  const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`שלום, אשמח לקבל פרטים על מטבח מ${site.name}`)}`;
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
