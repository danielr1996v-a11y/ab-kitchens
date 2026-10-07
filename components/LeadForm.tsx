"use client";

import { useId, useState } from "react";
import { site, leadCopy } from "@/lib/content";
import { isValidPhone, leadWhatsappUrl, sendLead } from "@/lib/lead";

/**
 * טופס פנייה אחיד - שם וטלפון, שולח מייל לאברהם.
 *
 * ⚠️ **טופס אחד לכל האתר (7.10).** עד עכשיו היו שלושה טפסים
 * שונים, אף אחד מהם לא שלח בפועל, ובכרטיס "פגישה עם המעצב/ת"
 * הטופס הסתתר מאחורי כפתור שפתח חלון. דניאל ביקש טופס ישיר
 * בכל כרטיס. אותו רכיב עכשיו בכרטיס המעצבת, בבאנר הלידים
 * ובסוף כל מאמר.
 *
 * ⚠️ **שליחה שנכשלה לא נעלמת.** כל כישלון - מפתח חסר, שרת
 * שנפל, אין רשת - מציג לגולש וואטסאפ לאברהם עם הפרטים שכבר
 * מילא, וטלפון. פנייה לא יכולה ללכת לאיבוד בשקט.
 *
 * variant: dark על כרטיס פחם, light על רקע לבן.
 */
export default function LeadForm({
  source,
  submitLabel,
  variant = "dark",
}: {
  /** מופיע בנושא המייל - מאיפה הגיעה הפנייה */
  source: string;
  submitLabel: string;
  variant?: "dark" | "light";
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "invalid" | "failed"
  >("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isValidPhone(phone)) {
      setState("invalid");
      return;
    }
    setState("sending");
    const res = await sendLead({ name, phone, source, company: trap });
    setState(res.ok ? "sent" : res.error === "invalid" ? "invalid" : "failed");
  };

  const cls = `lform lform--${variant}`;

  if (state === "sent") {
    return (
      <p className={`${cls} lform__done`} role="status">
        {leadCopy.success.replace("{name}", name.trim().split(/\s+/)[0])}
      </p>
    );
  }

  return (
    <form className={cls} onSubmit={submit} noValidate>
      <div className="lform__row">
        <div className="lform__field">
          <label className="lform__label" htmlFor={`${uid}-name`}>
            {leadCopy.nameLabel}
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            className="lform__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="lform__field">
          <label className="lform__label" htmlFor={`${uid}-phone`}>
            {leadCopy.phoneLabel}
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            /* ⚠️ dir=ltr: מספר טלפון נקרא משמאל לימין גם בעברית */
            dir="ltr"
            className="lform__input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* מלכודת לבוטים - מוסתרת מהעין ומקורא המסך */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="lform__trap"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
      />

      <button
        type="submit"
        className="lform__submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? leadCopy.sending : submitLabel}
      </button>

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
              href={leadWhatsappUrl({ name, phone })}
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
