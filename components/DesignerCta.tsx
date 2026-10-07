import Image from "next/image";
import { designerCta } from "@/lib/content";
import LeadForm from "@/components/LeadForm";

/**
 * סקשן "פגישה עם המעצב/ת" - כרטיס עם טופס ישיר.
 * לפי הרפרנס: כרטיס עם מרווח מהצדדים (לא רוחב מלא), צילום
 * מטבח עם שכבת פחם מעליו, טקסט בצד וקו אנכי מבדיל.
 *
 * ⚠️ **הכפתור והחלון הקופץ הוסרו (7.10), לבקשת דניאל.** הטופס
 * הסתתר מאחורי לחיצה נוספת; עכשיו שם וטלפון ממלאים ישר
 * בכרטיס. LeadForm שולח מייל לאברהם, ובכישלון מציע וואטסאפ.
 *
 * server component - כל המצב יושב בתוך LeadForm.
 */
export default function DesignerCta() {
  return (
    /* ⚠️ ה-id הוא יעד עוגן: הכפתור בבלוק ההמלצות בדף הבית
       מפנה לכאן במקום להחזיק טופס משלו. */
    <section className="dcta" id="designer-cta">
      <div className="dcta__card">
        <Image
          src={designerCta.image}
          alt={designerCta.imageAlt}
          fill
          sizes="90vw"
          className="dcta__img"
        />

        <div className="dcta__body">
          <div className="dcta__text">
            <p className="dcta__eyebrow">{designerCta.eyebrow}</p>
            <h2 className="dcta__title">{designerCta.title}</h2>
            <p className="dcta__lead">{designerCta.lead}</p>

            <LeadForm
              source="כרטיס פגישה עם המעצב/ת"
              submitLabel={designerCta.ctaText}
              variant="dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
