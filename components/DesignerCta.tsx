"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { site, designerCta, whatsappHref } from "@/lib/content";

/**
 * סקשן CTA אחרי ההמלצות + הפופאפ שנפתח ממנו.
 * לפי הרפרנס: כרטיס עם מרווח מהצדדים (לא רוחב מלא), צילום
 * מטבח עם שכבת פחם מעליו, טקסט בצד וקו אנכי מבדיל.
 *
 * הפופאפ הוא <dialog> מקורי ולא div: הדפדפן נותן בחינם נעילת
 * פוקוס בפנים, סגירה ב-Escape, ורקע חוסם - במקום לממש הכל ביד.
 *
 * ⚠️ אין endpoint בפרויקט. השליחה היא mailto, בדיוק כמו
 * ContactForm. פנייה במובייל אצל מי שאין לו אפליקציית מייל
 * עלולה להיעלם - זה מתועד וממתין להחלטה.
 */
export default function DesignerCta() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const { modal } = designerCta;

  const set = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const body = () =>
    [`שם: ${values.name || ""}`, `טלפון: ${values.phone || ""}`].join("\n");

  const sendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `בקשה לפגישה עם מעצב/ת${
      values.name ? ` - ${values.name}` : ""
    }`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body())}`;
  };

  const sendWhatsApp = () =>
    window.open(
      `${whatsappHref}%0A${encodeURIComponent(body())}`,
      "_blank",
      "noopener,noreferrer"
    );

  return (
    <section className="dcta">
      <div className="dcta__card">
        <Image
          src={designerCta.image}
          alt={designerCta.imageAlt}
          fill
          quality={90}
          sizes="90vw"
          className="dcta__img"
        />

        <div className="dcta__body">
          <div className="dcta__text">
            <p className="dcta__eyebrow">{designerCta.eyebrow}</p>
            <h2 className="dcta__title">{designerCta.title}</h2>
            <p className="dcta__lead">{designerCta.lead}</p>
          </div>

          <button
            type="button"
            className="dcta__btn"
            onClick={() => dialogRef.current?.showModal()}
          >
            {designerCta.ctaText}
          </button>
        </div>
      </div>

      {/* ===== הפופאפ ===== */}
      <dialog ref={dialogRef} className="dmodal" aria-labelledby="dmodal-title">
        <button
          type="button"
          className="dmodal__close"
          aria-label={modal.closeLabel}
          onClick={() => dialogRef.current?.close()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <p className="dmodal__eyebrow">{modal.eyebrow}</p>
        <h3 className="dmodal__title" id="dmodal-title">
          {modal.title}
        </h3>
        <p className="dmodal__lead">{modal.lead}</p>

        <form className="dmodal__form" onSubmit={sendMail}>
          {modal.fields.map((f) => (
            <div className="dmodal__field" key={f.id}>
              <label className="dmodal__label" htmlFor={`d-${f.id}`}>
                {f.label}
              </label>
              <input
                id={`d-${f.id}`}
                name={f.id}
                type={f.type}
                autoComplete={f.autoComplete}
                required
                className="dmodal__input"
                value={values[f.id] ?? ""}
                onChange={(e) => set(f.id, e.target.value)}
              />
            </div>
          ))}

          {/* שורה משלה ברוחב מלא, כדי שהכפתור יישב בפינה
              השמאלית התחתונה כמו ברפרנס */}
          <div className="dmodal__actions">
            <button type="button" className="dmodal__alt" onClick={sendWhatsApp}>
              {modal.altLabel}
            </button>
            <button type="submit" className="dmodal__submit">
              {modal.submitLabel}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
