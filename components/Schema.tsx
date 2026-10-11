import { getSettings } from "@/lib/admin/settings";
import { jsonLd } from "@/lib/site/jsonLd";

const intl = (p: string) => {
  const d = p.replace(/\D/g, "").replace(/^0/, "");
  return d.length === 9 ? `+972-${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}` : `+972-${d}`;
};

/**
 * Structured Data - LocalBusiness.
 * לא היה קיים באתר הישן כלל, ולכן זו הזדמנות לשיפור ולא רק לשימור.
 * הנתונים אומתו מול פרופיל Google Business של העסק.
 */
/* שלב 7: שם, תיאור, טלפון ומייל מההגדרות במערכת */
export default async function Schema() {
  const site = await getSettings();
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.ab-kitchens.co.il/#business",
    name: site.name,
    description: site.description,
    image: "https://www.ab-kitchens.co.il/logo.png",
    logo: "https://www.ab-kitchens.co.il/logo.png",
    url: "https://www.ab-kitchens.co.il",
    /* פורמט בינלאומי: 055-2775488 → +972-55-277-5488 */
    telephone: intl(site.phone1),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "בית ישראל 2",
      addressLocality: "ירושלים",
      addressCountry: "IL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.7880669,
      longitude: 35.2236634,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/profile.php?id=100066265492507",
      "https://www.instagram.com/ab_kitchen_design",
    ],
    areaServed: { "@type": "Country", name: "ישראל" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
