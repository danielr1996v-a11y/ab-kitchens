import type { Metadata } from "next";
import Image from "next/image";
import { site, contactPage } from "@/lib/content";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "יצירת קשר | א. בית המטבחים",
  description:
    "פגישה עם מעצב/ת ללא עלות. אולם התצוגה בבית ישראל 2, ירושלים. טלפון 055-2775488.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "יצירת קשר | א. בית המטבחים",
    description: "פגישה עם מעצב/ת ללא עלות. אולם התצוגה בבית ישראל 2, ירושלים.",
    url: "/contact",
  },
};

/**
 * עמוד יצירת קשר.
 *
 * פיצול לשתי עמודות באותה שפה של LeadBanner: תוכן מימין,
 * צילום אמיתי משמאל. הצילום הוא של אברהם, לא מלאי.
 */
export default function ContactPage() {
  const telHref = `tel:${site.phone1.replace(/-/g, "")}`;
  const tel2Href = `tel:${site.phone2.replace(/-/g, "")}`;

  return (
    <section className="contact">
      {/* ===== פאנל - ימין ב-RTL ===== */}
      <div className="contact__panel">
        <div className="contact__inner">
          <p className="contact__eyebrow">{contactPage.eyebrow}</p>
          <h1 className="contact__title">{contactPage.title}</h1>
          <p className="contact__lead">{contactPage.lead}</p>

          <ContactForm />

          <div className="contact__details">
            <p className="contact__details-title">{contactPage.detailsTitle}</p>
            <ul className="contact__list">
              <li>
                <a href={telHref} className="contact__link">
                  <Icon id="phone" />
                  <span>{site.phone1}</span>
                </a>
              </li>
              <li>
                <a href={tel2Href} className="contact__link">
                  <Icon id="phone" />
                  <span>{site.phone2}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="contact__link">
                  <Icon id="mail" />
                  <span>{site.email}</span>
                </a>
              </li>
              <li className="contact__link contact__link--static">
                <Icon id="pin" />
                <span>{site.address}</span>
              </li>
            </ul>

            <p className="contact__hours">
              {site.hours[0].days} · {site.hours[0].time}
            </p>
          </div>
        </div>
      </div>

      {/* ===== צילום - שמאל ב-RTL ===== */}
      <div className="contact__media">
        <Image
          src={contactPage.image}
          alt={contactPage.imageAlt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className="contact__img"
        />
      </div>
    </section>
  );
}
