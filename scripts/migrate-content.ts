/**
 * מיגרציה חד-פעמית: lib/content.ts → מסמכי Sanity.
 *
 * הרצה:  npx tsx scripts/migrate-content.ts
 * דרישות: NEXT_PUBLIC_SANITY_PROJECT_ID + SANITY_API_TOKEN ב-.env.local
 *
 * ניתן להרצה חוזרת: המסמך נכתב עם _id קבוע (homePage) דרך
 * createOrReplace, והתמונות מזוהות לפי שם הקובץ - הרצה שנייה
 * מחליפה, לא מכפילה.
 *
 * ⚠️ המזהה חייב להיות בלי נקודה. ה-ACL הציבורי של Sanity הוא
 * filter: _id in path("*"), ו-"*" מתאים רק למקטע אחד - כך Sanity
 * מחריג טיוטות (drafts.foo). מזהה כמו "page.home" נופל מחוץ לכלל
 * הציבורי, והאתר מקבל null בקריאה אנונימית.
 *
 * הסקריפט קורא את התוכן מ-lib/content.ts עצמו - לא העתקה ידנית -
 * כך שאם התוכן השתנה מאז, המיגרציה לוקחת את העדכני.
 */
import { createClient } from "next-sanity";
import { readFileSync } from "node:fs";
import { resolve, basename } from "node:path";

// טוענים .env.local ידנית - הסקריפט רץ מחוץ ל-Next
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  /* אין .env.local - הערכים יגיעו מהסביבה */
}

import {
  heroSlideshow,
  about,
  styleSection,
  values,
  trustedBy,
  leadBanner,
  testimonials,
} from "../lib/content";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) {
  console.error("חסרים NEXT_PUBLIC_SANITY_PROJECT_ID או SANITY_API_TOKEN ב-.env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-08-01",
  token,
  useCdn: false,
});

/** מעלה תמונה מ-public/ ומחזיר הפניה. מזהה כפילויות לפי שם קובץ */
const uploaded = new Map<string, string>();
async function img(publicPath: string, alt: string) {
  const file = resolve(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const name = basename(file);
  if (!uploaded.has(name)) {
    process.stdout.write(`  ⬆ ${name}... `);
    const asset = await client.assets.upload("image", readFileSync(file), { filename: name });
    uploaded.set(name, asset._id);
    console.log("✓");
  }
  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: uploaded.get(name)! },
    alt,
  };
}

async function main() {
  console.log(`מיגרציה אל ${projectId}/${process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"}\n`);

  console.log("תמונות ההירו:");
  const heroSlides = [];
  for (const s of heroSlideshow.slides) heroSlides.push(await img(s.image, s.alt));

  console.log("כרטיסי הסגנון:");
  const styleCards = [];
  for (const c of styleSection.cards) {
    styleCards.push({
      _key: c.id,
      title: c.title,
      image: await img(c.image, c.alt),
    });
  }

  console.log("העקרונות:");
  const valueItems = [];
  for (const v of values.items) {
    valueItems.push({
      _key: v.id,
      title: v.title,
      description: v.description,
      image: await img(v.image, v.alt),
    });
  }

  console.log("לוגואים:");
  const groups = [];
  for (const g of trustedBy.groups) {
    const logos = [];
    for (const l of g.logos) logos.push({ ...(await img(l.src, l.name)), _key: basename(l.src), name: l.name });
    groups.push({ _key: g.id, label: g.label, logos });
  }

  console.log("תמונות הבאנר:");
  const leadSlides = [];
  for (const s of leadBanner.slides) leadSlides.push({ ...(await img(s.image, s.alt)), _key: basename(s.image) });

  const doc = {
    _id: "homePage",
    _type: "page",
    title: "דף הבית",
    slug: { _type: "slug", current: "/" },
    sections: [
      { _key: "hero", _type: "hero", slides: heroSlides.map((s, i) => ({ ...s, _key: `slide-${i}` })) },
      {
        _key: "about", _type: "about",
        title: about.title,
        paragraphs: about.paragraphs,
        ctaText: about.ctaText,
      },
      { _key: "styleGrid", _type: "styleGrid", title: styleSection.title, cards: styleCards },
      { _key: "values", _type: "values", title: values.title, intro: values.intro, items: valueItems },
      { _key: "trustedBy", _type: "trustedBy", title: trustedBy.title, groups },
      {
        _key: "leadBanner", _type: "leadBanner",
        titleBold: leadBanner.titleBold,
        titleLight: leadBanner.titleLight,
        subtitle: leadBanner.subtitle,
        ctaText: leadBanner.ctaText,
        slides: leadSlides,
      },
      {
        _key: "testimonials", _type: "testimonials",
        reviews: testimonials.map((t) => ({ _key: t.id, name: t.name, text: t.text, rating: t.rating })),
      },
    ],
  };

  console.log("\nכותב את מסמך דף הבית...");
  await client.createOrReplace(doc);
  console.log(`✅ הסתיים. ${uploaded.size} תמונות, מסמך אחד (homePage).`);
}

main().catch((e) => {
  console.error("\n❌ המיגרציה נכשלה:", e.message);
  process.exit(1);
});
