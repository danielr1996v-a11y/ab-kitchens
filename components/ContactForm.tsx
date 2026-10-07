"use client";

import { useState } from "react";
import { site, contactPage, leadCopy } from "@/lib/content";
import { isValidPhone, leadWhatsappUrl, sendLead } from "@/lib/lead";

/**
 * טופס יצירת קשר.
 *
 * ⚠️ **עד 7.10 השליחה הייתה mailto** - נפתחה תוכנת המייל של
 * הגולש, ומי שאין לו אחת (רוב הטלפונים) פשוט נתקע. עכשיו
 * השליחה דרך /api/lead, אותה נקודה כמו כל שאר הטפסים, עם
 * ההודעה החופשית בנוסף לשם ולטלפון.
 *
 * וואטסאפ נשאר ככפתור משני: במובייל הוא ממיר הרבה יותר טוב.
 * ובכישלון שליחה הוא מוצע כרשת ביטחון, עם הפרטים כבר בפנים.
 */
export default function ContactForm() {
  const [values, setValues] = useState<Record<string, string>>({});

  const set = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "invalid" | "failed"
  >("idle");

  const name = values.name ?? "";
  const phone = values.phone ?? "";
  const message = values.message ?? "";

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isValidPhone(phone)) {
      setState("invalid");
      return;
    }
    setState("sending");
    const res = await sendLead({
      name,
      phone,
      message,
      source: "עמוד יצירת קשר",
      company: values.company ?? "",
    });
    setState(res.ok ? "sent" : res.error === "invalid" ? "invalid" : "failed");
  };

  const sendWhatsApp = () =>
    window.open(
      leadWhatsappUrl({ name, phone, message }),
      "_blank",
      "noopener,noreferrer",
    );

  if (state === "sent") {
    return (
      <p className="cform cform__done" role="status">
        {leadCopy.success.replace("{name}", name.trim().split(/\s+/)[0])}
      </p>
    );
  }

  return (
    <form className="cform" onSubmit={send} noValidate>
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

      {/* מלכודת לבוטים - מוסתרת מהעין ומקורא המסך */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="lform__trap"
        value={values.company ?? ""}
        onChange={(e) => set("company", e.target.value)}
      />

      <div className="cform__actions">
        <button
          type="submit"
          className="cform__submit"
          disabled={state === "sending"}
        >
          {state === "sending" ? leadCopy.sending : contactPage.submitLabel}
        </button>
        <button type="button" className="cform__alt" onClick={sendWhatsApp}>
          {contactPage.altLabel}
        </button>
      </div>

      {state === "invalid" && (
        <p className="lform__msg" role="alert">
          {leadCopy.invalid}
        </p>
      )}
      {state === "failed" && (
        <div className="lform__msg" role="alert">
          <p>{leadCopy.failed}</p>
          <p className="lform__fallback">
            <a
              href={leadWhatsappUrl({ name, phone, message })}
              target="_blank"
              rel="noopener noreferrer"
            >
              {leadCopy.failedWhatsapp}
            </a>
            {" · "}
            <a href={`tel:${site.phone1.replace(/\D/g, "")}`} dir="ltr">
              {site.phone1}
            </a>
          </p>
        </div>
      )}
    </form>
  );
}
