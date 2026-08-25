/**
 * בניית תמונת התצוגה המקדימה לשיתוף (וואטספ, פייסבוק, טוויטר).
 *
 * הרצה:  npx tsx scripts/build-og-image.ts
 *
 * ⚠️ למה אין כאן טקסט בכלל:
 * וואטספ מציג את og:title ואת og:description כטקסט **מתחת**
 * לתמונה. הכיתוב כבר קיים ותקין ב-app/layout.tsx, ולכן אין
 * שום סיבה לרנדר אותו גם בתוך התמונה - וזה חוסך את החלק
 * השביר ביותר: רינדור עברית לתמונה, שיוצא שבור בקלות.
 *
 * ⚠️ למה שני קבצים ולא אחד:
 * twitter-image **אינו** נגזר אוטומטית מ-opengraph-image.
 * אומת ב-node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/01-metadata/opengraph-image.md.
 * בלי הקובץ השני, twitter:card=summary_large_image שכבר מוגדר
 * נשאר בלי תמונה.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

/* 1200×630 הוא היחס שפייסבוק ווואטספ מרנדרים בו תצוגה
   רחבה. קטן מזה מקבל תמונה ממוזערת ריבועית קטנה במקום. */
const W = 1200;
const H = 630;

/* הלוגו הכהה על רקע לבן - בחירת דניאל, וזהה לבר העליון באתר. */
const LOGO = "public/logo-dark.png";
const LOGO_WIDTH = 720; // 60% מהרוחב. משאיר אוויר מסביב

const ALT = "א. בית המטבחים - מטבחים ושיש בהתאמה אישית";

async function main() {
  const logo = await sharp(LOGO)
    .resize({ width: LOGO_WIDTH, fit: "inside" })
    .toBuffer();

  const card = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();

  for (const name of ["opengraph-image", "twitter-image"]) {
    writeFileSync(`app/${name}.png`, card);
    writeFileSync(`app/${name}.alt.txt`, ALT);
  }

  const meta = await sharp(card).metadata();
  console.log(
    `✅ ${meta.width}×${meta.height}  ${Math.round(card.length / 1024)}KB  ×2 קבצים`,
  );
}

main();
