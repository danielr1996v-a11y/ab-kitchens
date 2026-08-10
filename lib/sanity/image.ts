import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";
import { client } from "./client";

/**
 * בונה כתובות תמונה מ-Sanity.
 *
 * ה-hotspot שדניאל מסמן ב-Studio נשמר על התמונה, וכל בקשת חיתוך
 * (למשל להירו במובייל) תישאר סביב הנקודה שהוא בחר - זה הפתרון
 * לבעיית ה"הירו חותך 76% מהתמונה" שנמדדה.
 */
const builder = client ? imageUrlBuilder(client) : null;

export function urlFor(source: SanityImageSource) {
  if (!builder) throw new Error("Sanity לא מוגדר - אין NEXT_PUBLIC_SANITY_PROJECT_ID");
  return builder.image(source).auto("format");
}
