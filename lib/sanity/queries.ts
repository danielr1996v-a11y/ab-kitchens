import { defineQuery } from "next-sanity";
import type { Section } from "@/lib/sections";
import {
  heroSlideshow,
  about,
  styleSection,
  values,
  trustedBy,
  leadBanner,
  testimonials,
} from "@/lib/content";
import { urlFor } from "./image";

/**
 * השאילתה והאדפטר של דף הבית.
 *
 * העיקרון: תוכן מהענן, החלטות עיצוב מהקוד.
 * דניאל עורך טקסטים ותמונות; זמני אנימציה, יעדי קישורים, גדלי
 * כרטיסים וכיווני מרקיזה נשארים כאן - הם עיצוב, לא תוכן.
 *
 * לכן האדפטר ממזג: לוקח את ברירות המחדל מ-lib/content.ts ודורס
 * רק את מה שנערך ב-Studio. אף קומפוננטה לא יודעת מאיפה הגיע
 * התוכן - היא מקבלת בדיוק את הצורה שקיבלה תמיד.
 */

export const homeQuery = defineQuery(`*[_id == "homePage"][0]{
  sections[]{
    _type, _key,
    _type == "hero" => { slides[]{ ..., alt } },
    _type == "about" => { title, paragraphs, ctaText },
    _type == "styleGrid" => { title, cards[]{ _key, title, image } },
    _type == "values" => { title, intro, items[]{ _key, title, description, image } },
    _type == "trustedBy" => { title, groups[]{ _key, label, logos[]{ ..., name } } },
    _type == "leadBanner" => { titleBold, titleLight, subtitle, ctaText, slides[]{ ..., alt } },
    _type == "testimonials" => { reviews[]{ _key, name, text, rating } }
  }
}`);

/* התוצאה של GROQ לא מוקלדת אוטומטית - טיפוס רופף במכוון, והאדפטר
   הוא הגבול שממנו והלאה הכל מוקלד חזק (Section[]). */
type SanityImage = { asset?: { _ref?: string }; alt?: string; name?: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any;

const src = (img: SanityImage | undefined, fallback: string) =>
  img?.asset?._ref ? urlFor(img).url() : fallback;

export function adaptHome(data: Raw): Section[] | null {
  const sections: Raw[] = data?.sections;
  if (!Array.isArray(sections) || sections.length === 0) return null;

  return sections
    .map((s): Section | null => {
      switch (s._type) {
        case "hero":
          return {
            _key: s._key, _type: "hero",
            slideshow: {
              ...heroSlideshow, // זמנים וסימן גלילה - עיצוב
              slides: (s.slides ?? []).map((sl: SanityImage, i: number) => ({
                image: src(sl, heroSlideshow.slides[i]?.image ?? ""),
                alt: sl.alt ?? heroSlideshow.slides[i]?.alt ?? "",
              })),
            },
          };
        case "about":
          return {
            _key: s._key, _type: "about",
            content: {
              ...about, // הלוגו וה-href - עיצוב
              title: s.title ?? about.title,
              paragraphs: s.paragraphs ?? about.paragraphs,
              ctaText: s.ctaText ?? about.ctaText,
            },
          };
        case "styleGrid":
          return {
            _key: s._key, _type: "styleGrid",
            content: {
              title: s.title ?? styleSection.title,
              cards: styleSection.cards.map((card, i) => ({
                ...card, // id, href, size, enabled - עיצוב וניווט
                title: s.cards?.[i]?.title ?? card.title,
                image: src(s.cards?.[i]?.image, card.image),
                alt: s.cards?.[i]?.image?.alt ?? card.alt,
              })),
            },
          };
        case "values":
          return {
            _key: s._key, _type: "values",
            content: {
              title: s.title ?? values.title,
              intro: s.intro ?? values.intro,
              items: values.items.map((item, i) => ({
                ...item, // id ו-enabled
                title: s.items?.[i]?.title ?? item.title,
                description: s.items?.[i]?.description ?? item.description,
                image: src(s.items?.[i]?.image, item.image),
                alt: s.items?.[i]?.image?.alt ?? item.alt,
              })),
            },
          };
        case "trustedBy":
          return {
            _key: s._key, _type: "trustedBy",
            content: {
              title: s.title ?? trustedBy.title,
              groups: trustedBy.groups.map((g, i) => ({
                ...g, // direction - עיצוב
                label: s.groups?.[i]?.label ?? g.label,
                logos: g.logos.map((logo, j) => ({
                  src: src(s.groups?.[i]?.logos?.[j], logo.src),
                  name: s.groups?.[i]?.logos?.[j]?.name ?? logo.name,
                })),
              })),
            },
          };
        case "leadBanner":
          return {
            _key: s._key, _type: "leadBanner",
            content: {
              ...leadBanner, // זמני רוטציה ו-href
              titleBold: s.titleBold ?? leadBanner.titleBold,
              titleLight: s.titleLight ?? leadBanner.titleLight,
              subtitle: s.subtitle ?? leadBanner.subtitle,
              ctaText: s.ctaText ?? leadBanner.ctaText,
              slides: (s.slides ?? []).map((sl: SanityImage, i: number) => ({
                image: src(sl, leadBanner.slides[i]?.image ?? ""),
                alt: sl.alt ?? leadBanner.slides[i]?.alt ?? "",
              })),
            },
          };
        case "testimonials":
          return {
            _key: s._key, _type: "testimonials",
            reviews: (s.reviews ?? []).map((r: Raw, i: number) => ({
              id: r._key ?? `r${i}`,
              name: r.name ?? "",
              text: r.text ?? "",
              rating: r.rating ?? 5,
            })),
          };
        default:
          return null; // סוג לא מוכר - מדלגים במקום להפיל את העמוד
      }
    })
    .filter((s): s is Section => s !== null);
}
