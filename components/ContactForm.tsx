"use client";

import { useState } from "react";
import { site, contactPage } from "@/lib/content";

/**
 * טופס יצירת קשר.
 *
 * ⚠️ אין endpoint בפרויקט, ולכן השליחה היא mailto: - נפתחת
 * תוכנת המייל של הגולש עם הנושא והגוף ממולאים, והוא רק לוחץ שלח.
 * זה עובד בכל דפדפן בלי שרת ובלי שירות חיצוני.
 *
 * לשליחה אמיתית מהשרת (בלי לפתוח תוכנת מייל) נדרש מפתח של
 * Formspree או Resend. אז מחליפים את handleSubmit בקריאת fetch
 * ל-Route Handler - שאר הקומפוננטה לא משתנה.
 *
 * וואטסאפ נשאר ככפתור משני: במובייל הוא ממיר הרבה יותר טוב.
 */
export default function ContactForm() {
  const [values, setValues] = useState<Record<string, string>>({});

  const set = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const body = () =>
    [
      `שם: ${values.name || ""}`,
      `טלפון: ${values.phone || ""}`,
      values.message ? `\n${values.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const sendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `פנייה מהאתר${values.name ? ` - ${values.name}` : ""}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body())}`;
  };

  const sendWhatsApp = () => {
    window.open(
      `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
        `שלום, הגעתי מהאתר.\n${body()}`
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <form className="cform" onSubmit={sendMail}>
      <p className="cform__title">{contactPage.formTitle}</p>

      <div className="cform__row">
        {contactPage.fields.map((f) => (
          <div className="cform__field" key={f.id}>
            <label className="cform__label" htmlFor={`c-${f.id}`}>
              {f.label}
            </label>
            <input
              id={`c-${f.id}`}
              name={f.id}
              type={f.type}
              autoComplete={f.autoComplete}
              required
              className="cform__input"
              value={values[f.id] ?? ""}
              onChange={(e) => set(f.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="cform__field">
        <label className="cform__label" htmlFor="c-message">
          {contactPage.messageLabel}
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={3}
          className="cform__input cform__input--area"
          value={values.message ?? ""}
          onChange={(e) => set("message", e.target.value)}
        />
      </div>

      <div className="cform__actions">
        <button type="submit" className="cform__submit">
          {contactPage.submitLabel}
        </button>
        <button type="button" className="cform__alt" onClick={sendWhatsApp}>
          {contactPage.altLabel}
        </button>
      </div>
    </form>
  );
}
