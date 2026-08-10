"use client";

import { useState } from "react";
import { site, comingSoon } from "@/lib/content";

/**
 * טופס עמוד "בקרוב".
 *
 * אין endpoint בפרויקט, ולכן במקום טופס שפנייה ממנו נעלמת -
 * הכפתור בונה הודעת וואטסאפ עם הפרטים שהוקלדו ופותח אותה.
 * אברהם מקבל התראה לטלפון מיד, בלי שרת ובלי שירות חיצוני.
 */
export default function ComingSoonForm() {
  const [values, setValues] = useState<Record<string, string>>({});

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `שלום, הגעתי מהאתר.
שם: ${values.name || ""}
טלפון: ${values.phone || ""}`;
    window.open(
      `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <form className="soon__form" onSubmit={send}>
      <p className="soon__form-title">{comingSoon.formTitle}</p>

      <div className="soon__fields">
        {comingSoon.fields.map((f) => (
          <div className="soon__field" key={f.id}>
            <label className="soon__label" htmlFor={`cs-${f.id}`}>
              {f.label}
            </label>
            <input
              id={`cs-${f.id}`}
              name={f.id}
              type={f.type}
              autoComplete={f.autoComplete}
              required
              className="soon__input"
              value={values[f.id] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.id]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <button type="submit" className="soon__submit">
        {comingSoon.submitLabel}
      </button>
    </form>
  );
}
