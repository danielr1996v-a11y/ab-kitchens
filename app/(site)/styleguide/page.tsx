import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  brandColors,
  systemColors,
  fontSizes,
  fontWeights,
  spaces,
  layout,
  radii,
  shadows,
  textShadows,
  motion,
  type Token,
} from "@/lib/tokens";
import { articles } from "@/lib/articles";
import { kitchenPages } from "@/lib/content";
import TokenValue from "@/components/TokenValue";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import LeadForm from "@/components/LeadForm";
import Faq from "@/components/Faq";
import Testimonials from "@/components/Testimonials";
import DesignerCta from "@/components/DesignerCta";
import LeadBanner from "@/components/LeadBanner";

/**
 * עמוד הדוגמה של השפה הגרפית - שלב 2 של מערכת הניהול.
 *
 * כל המשתנים, וכל רכיב שקיים כרכיב עצמאי, במקום אחד. זה העמוד
 * שמולו נבדק שהעורך הוויזואלי לא שינה כלום.
 *
 * ⛔ לא קיים ב-production: כלי עבודה, לא עמוד באתר. ובכל מקרה
 * noindex, כמו כל דיפלוי שאינו production.
 */
export const metadata: Metadata = {
  title: "שפה גרפית",
  robots: { index: false, follow: false },
};

function Row({ t, children }: { t: Token; children?: React.ReactNode }) {
  return (
    <li className="sg__row">
      {children}
      <span className="sg__label">{t.label}</span>
      <code className="sg__name" dir="ltr">
        {t.name}
      </code>
      <TokenValue name={t.name} />
      {t.use && <span className="sg__use">{t.use}</span>}
    </li>
  );
}

export default function StyleguidePage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  const classic = kitchenPages.classic;

  return (
    <div className="sg">
      <header className="sg__head">
        <h1 className="sg__title">שפה גרפית</h1>
        <p className="sg__lead">
          כל המשתנים של האתר וכל רכיב עצמאי. הערכים נקראים חיים מהדפדפן.
        </p>
      </header>

      <section className="sg__block" aria-labelledby="sg-brand">
        <h2 className="sg__h2" id="sg-brand">צבעי המותג · בבוחר של העורך</h2>
        <ul className="sg__swatches">
          {brandColors.map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__swatch" style={{ background: `var(${t.name})` }} />
            </Row>
          ))}
        </ul>
      </section>

      <section className="sg__block" aria-labelledby="sg-system">
        <h2 className="sg__h2" id="sg-system">צבעי מערכת · לא בבוחר</h2>
        <ul className="sg__swatches">
          {systemColors.map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__swatch" style={{ background: `var(${t.name})` }} />
            </Row>
          ))}
        </ul>
      </section>

      <section className="sg__block" aria-labelledby="sg-type">
        <h2 className="sg__h2" id="sg-type">טיפוגרפיה · Polin</h2>
        <ul className="sg__list">
          {fontSizes.map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__type" style={{ fontSize: `var(${t.name})` }}>
                מטבח שנבנה אצלנו
              </span>
            </Row>
          ))}
        </ul>
        <ul className="sg__weights">
          {fontWeights.map((w) => (
            <li key={w.value} style={{ fontWeight: w.value }}>
              {w.value} · {w.label} · אנחנו המפעל
            </li>
          ))}
        </ul>
      </section>

      <section className="sg__block" aria-labelledby="sg-space">
        <h2 className="sg__h2" id="sg-space">ריווח</h2>
        <ul className="sg__list">
          {[...spaces, ...layout].map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__bar" style={{ width: `var(${t.name})` }} />
            </Row>
          ))}
        </ul>
      </section>

      <section className="sg__block" aria-labelledby="sg-radius">
        <h2 className="sg__h2" id="sg-radius">פינות</h2>
        <ul className="sg__tiles">
          {radii.map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__tile" style={{ borderRadius: `var(${t.name})` }} />
            </Row>
          ))}
        </ul>
      </section>

      <section className="sg__block" aria-labelledby="sg-shadow">
        <h2 className="sg__h2" id="sg-shadow">צללים</h2>
        <ul className="sg__tiles">
          {shadows.map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__tile sg__tile--shadow" style={{ boxShadow: `var(${t.name})` }} />
            </Row>
          ))}
        </ul>
        <ul className="sg__tiles sg__tiles--photo">
          {textShadows.map((t) => (
            <Row t={t} key={t.name}>
              <span className="sg__photo-text" style={{ textShadow: `var(${t.name})` }}>
                מטבח קלאסי
              </span>
            </Row>
          ))}
        </ul>
      </section>

      <section className="sg__block" aria-labelledby="sg-motion">
        <h2 className="sg__h2" id="sg-motion">תנועה</h2>
        <ul className="sg__list">
          {motion.map((t) => (
            <Row t={t} key={t.name} />
          ))}
        </ul>
      </section>

      <section className="sg__block sg__block--bleed" aria-labelledby="sg-components">
        <h2 className="sg__h2" id="sg-components">רכיבים</h2>

        <h3 className="sg__h3">פירורי לחם</h3>
        <Breadcrumbs trail={[{ label: "דף הבית", href: "/" }, { label: "שפה גרפית" }]} />

        <h3 className="sg__h3">טופס פנייה · כהה ובהיר</h3>
        <div className="sg__pair">
          <div className="sg__dark">
            <LeadForm source="עמוד דוגמה" submitLabel="שליחה" variant="dark" />
          </div>
          <div className="sg__light">
            <LeadForm source="עמוד דוגמה" submitLabel="שליחה" variant="light" />
          </div>
        </div>

        <h3 className="sg__h3">כרטיס מאמר</h3>
        <ul className="sg__cards">
          {articles.slice(0, 3).map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} />
            </li>
          ))}
        </ul>
      </section>

      <Faq title={classic.faqTitle} items={classic.faq.slice(0, 3)} />
      <Testimonials showMore={false} />
      <DesignerCta />
      <LeadBanner withForm />
    </div>
  );
}
