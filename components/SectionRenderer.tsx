import type { Section } from "@/lib/sections";
import Hero from "./Hero";
import About from "./About";
import StyleGrid from "./StyleGrid";
import Values from "./Values";
import TrustedBy from "./TrustedBy";
import LeadBanner from "./LeadBanner";
import Testimonials from "./Testimonials";

/**
 * SectionRenderer - הופך מערך בלוקים לעמוד.
 *
 * זו הנקודה היחידה שיודעת איזה `_type` מתאים לאיזו קומפוננטה.
 * הקומפוננטות עצמן לא יודעות שהן חלק ממערכת בלוקים, ולכן אפשר
 * להשתמש בהן גם ישירות (LeadBanner בעמודי המטבחים, למשל).
 *
 * ה-switch מוחזר ב-`never` בסוף: אם יתווסף סוג בלוק לטיפוס ולא
 * יטופל כאן, TypeScript ייכשל בזמן בילד במקום להשתיק את הסקשן.
 */
export default function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => {
        if (section.hidden) return null;
        return <Block key={section._key} section={section} />;
      })}
    </>
  );
}

function Block({ section }: { section: Section }) {
  switch (section._type) {
    case "hero":
      return <Hero slideshow={section.slideshow} />;
    case "about":
      return <About content={section.content} />;
    case "styleGrid":
      return <StyleGrid content={section.content} />;
    case "values":
      return <Values content={section.content} />;
    case "trustedBy":
      return <TrustedBy content={section.content} />;
    case "leadBanner":
      return <LeadBanner withForm={section.withForm} />;
    case "testimonials":
      return <Testimonials reviews={section.reviews} />;
    default: {
      // סוג בלוק שנוסף לטיפוס אך לא טופל כאן - שגיאת בילד, לא סקשן חסר
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}
