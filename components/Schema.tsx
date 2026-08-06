import { site } from "@/lib/content";

/**
 * Structured Data - LocalBusiness.
 * לא היה קיים באתר הישן כלל, ולכן זו הזדמנות לשיפור ולא רק לשימור.
 * הנתונים אומתו מול פרופיל Google Business של העסק.
 */
export default function Schema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.ab-kitchens.co.il/#business",
    name: site.name,
    description:
      "תכנון, ייצור והתקנה של מטבחים ושיש בהתאמה אישית. המפעל והספק הישיר, ללא מתווכים.",
    image: "https://www.ab-kitchens.co.il/logo.png",
    logo: "https://www.ab-kitchens.co.il/logo.png",
    url: "https://www.ab-kitchens.co.il",
    telephone: "+972-55-277-5488",
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
