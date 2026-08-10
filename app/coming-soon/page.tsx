import type { Metadata } from "next";
import Image from "next/image";
import { site, comingSoon } from "@/lib/content";
import ComingSoonForm from "@/components/ComingSoonForm";

export const metadata: Metadata = {
  title: `${site.name} | בקרוב`,
  description: comingSoon.paragraphs[0],
  // עמוד זמני - אין סיבה שיאונדקס ויתחרה באתר החי
  robots: { index: false, follow: false },
};

/**
 * עמוד "בקרוב" - עומד בפני עצמו.
 *
 * יושב מחוץ לקבוצת (site) ולכן לא מקבל הדר, פוטר או כפתור צף.
 * אין בו ולו קישור פנימי אחד: הדרישה היא שלקוח שמקבל את הלינק
 * לא יוכל להגיע לאתר שעדיין נבנה.
 */
export default function ComingSoonPage() {
  const telHref = `tel:${site.phone1.replace(/-/g, "")}`;

  return (
    <main className="soon">
      <Image
        src={comingSoon.image}
        alt={comingSoon.imageAlt}
        fill
        priority
        quality={85}
        sizes="100vw"
        className="soon__bg"
      />

      <div className="soon__panel">
        <Image
          src="/logo.png"
          alt={site.name}
          width={1640}
          height={460}
          className="soon__logo"
          priority
        />

        <h1 className="soon__title">{comingSoon.title}</h1>

        {comingSoon.paragraphs.map((text) => (
          <p className="soon__text" key={text.slice(0, 20)}>
            {text}
          </p>
        ))}

        <p className="soon__tagline">{comingSoon.tagline}</p>

        <ComingSoonForm />

        <div className="soon__contact">
          <a href={telHref} className="soon__call">
            {comingSoon.callLabel} · {site.phone1}
          </a>
          <p className="soon__address">{site.address}</p>
        </div>
      </div>
    </main>
  );
}
