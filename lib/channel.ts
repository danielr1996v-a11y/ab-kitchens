/**
 * הסרטונים מערוץ היוטיוב של אברהם - עמוד /סרטונים.
 *
 * ⚠️ **הערוץ של אברהם, לא הערוץ של סרטוני ההמלצות.** סרטוני
 * ההמלצות (lib/videos.ts) הועלו לערוץ נפרד; כאן זה הערוץ העסקי
 * שלו, @א.ביתהמטבחים - 60 סרטוני Shorts נכון ל-7.10.
 *
 * ⚠️ **מחובר לערוץ.** הרשימה כאן היא הבסיס, והעמוד מושך את
 * פיד ה-RSS של הערוץ פעם ביום (getChannelVideos). סרטון חדש
 * שאברהם מעלה מופיע לבד, ממוין לקטגוריה לפי מילות מפתח בכותרת.
 * ⚠️ הפיד מחזיר רק את 15 האחרונים - מספיק לתפוס כל חדש, לא
 * מספיק כדי לבנות ממנו את כל הרשימה. לכן הבסיס כאן.
 *
 * ⚠️ **החלוקה לנגרות ושיש נעשתה לפי הכותרת וגם לפי מה שרואים
 * בפריים**, כי כעשר כותרות לא אומרות כלום לבד ("אזל במלאי").
 * שיש = לוחות, סוגי אבן, קנטים, כיורים, ומה שמוטמע במשטח
 * (אינדוקציה מתחת לשיש, שקע פופ-אפ, מטען אלחוטי). נגרות =
 * ארונות, אחסון, פרזול, איים ותכנון.
 *
 * ⚠️ **הכותרות של אברהם, עם תיקוני כתיב בלבד:** "למטבחיםואצלנו"
 * ← "למטבחים, ואצלנו" · "שמתא חן" ← "שמוצא חן" · "אינטגלית" ←
 * "אינטגרלית" · "בנינו" ← "בינינו". הוסרו האשטגים ואימוג'ים.
 * שום מילה לא נוסחה מחדש.
 *
 * ⚠️ **הסטילס שמורים אצלנו** (public/images/videos), כמו בסרטוני
 * ההמלצות: אין מגע עם גוגל עד שלוחצים נגן. 41 מהם במקור 9:16;
 * ל-19 יוטיוב מחזיר רק 16:9 עם פסים שחורים, והם נחתכו למרכז.
 */

export const CHANNEL_ID = "UCYOkvrUc4UPtikyXbkXM6LQ";
export const CHANNEL_URL =
  "https://www.youtube.com/@%D7%90.%D7%91%D7%99%D7%AA%D7%94%D7%9E%D7%98%D7%91%D7%97%D7%99%D7%9D";

export type VideoCategory = "carpentry" | "stone";

export type ChannelVideo = {
  id: string;
  cat: VideoCategory;
  title: string;
  /** מידות הסטילס. 0 = סרטון חדש מהפיד, בלי סטילס מקומי */
  w: number;
  h: number;
};

export const videoCategories: { id: VideoCategory; label: string }[] = [
  { id: "carpentry", label: "נגרות" },
  { id: "stone", label: "שיש" },
];

export const videosPage = {
  title: "סרטונים",
  /* כמה מוצגים בכל קטגוריה לפני "לכל הסרטונים" - שהעמוד לא ייטען כבד */
  initial: 8,
  showAll: "לכל הסרטונים",
  playLabel: "הפעלת הסרטון",
};

export const channelVideos: ChannelVideo[] = [
  {
    id: "S-jrNn9Tsoc",
    cat: "stone",
    w: 480,
    h: 853,
    title: "למטבח העתידי שלך: מהי פלטת B I A? הסבר בסרטון!",
  },
  {
    id: "1ghDZYdmTTg",
    cat: "stone",
    w: 480,
    h: 853,
    title: "העיצוב המבוקש הבא למטבחים, ואצלנו - תמיד במלאי",
  },
  {
    id: "-J0QbvGIVfs",
    cat: "stone",
    w: 480,
    h: 853,
    title:
      '"אוי אזל במלאי /יש משהו דומה/ תרצה להתפשר?" לקום וללכת למקום שבו לא יתפשרו על הבחירה שלכם!',
  },
  {
    id: "Gf_1YJpS9Lw",
    cat: "stone",
    w: 480,
    h: 853,
    title: "תפנקו את עצמכם בהשתדרגות המטבח מבלי להתפשר",
  },
  {
    id: "xhDYLKxp9jk",
    cat: "stone",
    w: 480,
    h: 853,
    title: 'מצאתם את העיצוב שמוצא חן בעיניכם? אצלנו אין דבר כזה "אין במלאי".',
  },
  {
    id: "uM7JNfQcNdM",
    cat: "carpentry",
    w: 480,
    h: 853,
    title:
      "כשהמטבח הוא הפנים של הבית - לא מתפשרים עליו, בסוף זה החדר בו המשפחה מתאחדת",
  },
  {
    id: "UsIn1VTl8Xs",
    cat: "carpentry",
    w: 480,
    h: 853,
    title:
      "על מנת שהמטבח באמת יעמוד כמו שצריך ושלא יהיה רק יפה — צריך לתכנן נכון",
  },
  {
    id: "PMyxYVO7J78",
    cat: "carpentry",
    w: 480,
    h: 853,
    title:
      "ההתאמה של המטבח – אליכם אפיון מטבח לצורך האישי שלכם ולמצב המשפחתי שלכם",
  },
  {
    id: "QOHIT4elk9o",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "המטבח החדש שלכם מתחיל אצלכם בבית",
  },
  {
    id: "v9SmCBI-1f8",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "מטבח שמתאים בדיוק לאורח החיים שלכם",
  },
  {
    id: "W8BPvfF4Ug4",
    cat: "stone",
    w: 480,
    h: 853,
    title: "פתרון מושלם במקום פלטת שבת!",
  },
  {
    id: "kmiX49OvHJg",
    cat: "stone",
    w: 480,
    h: 853,
    title: "תשכחו מפלטת השבת, המוצר הזה הולך לשנות לכם את החיים",
  },
  {
    id: "joQEr7mpSAY",
    cat: "stone",
    w: 405,
    h: 720,
    title: "תכנון משטח משרדי",
  },
  {
    id: "yG3l4PG3WHo",
    cat: "carpentry",
    w: 405,
    h: 720,
    title: "תכנון מטבח משרדי",
  },
  { id: "xfdL6RYMA_M", cat: "stone", w: 480, h: 853, title: "אינדוקציה כהלכה" },
  {
    id: "jny6igy4TNY",
    cat: "stone",
    w: 405,
    h: 720,
    title: "תשלחו את הסרטון הזה למישהו שחייב את זה אצלו בבית",
  },
  {
    id: "flj6puK5bbI",
    cat: "stone",
    w: 405,
    h: 720,
    title: "היום אפשר לבשל גם בלי כירת גז מעל השיש",
  },
  {
    id: "bJG4UhW71KE",
    cat: "stone",
    w: 480,
    h: 853,
    title:
      "אינדוקציה כהלכה - מוטמע מתחת לשיש לנוחות מקסימלית וחסכון מטורף בנקיונות..",
  },
  {
    id: "kMVUcBOiYLs",
    cat: "stone",
    w: 405,
    h: 720,
    title: "אינדוקציה כהלכה - נוחות מקסימלית במטבח",
  },
  {
    id: "q4bTxxwet-g",
    cat: "carpentry",
    w: 405,
    h: 720,
    title: "תכנון מטבח משרדי",
  },
  {
    id: "IxIw7G_TC4A",
    cat: "stone",
    w: 480,
    h: 853,
    title: "שקע פופ אפ לטעינה",
  },
  {
    id: "6eJKJJNUvr4",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "מזווים במטבח",
  },
  {
    id: "9v_SrOLFbCQ",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "פינה נסתרת במטבח",
  },
  {
    id: "vZTJ6vJwD_Y",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "אי במטבח עם פינת ישיבה נשלפת",
  },
  { id: "a7FqYefdJhA", cat: "carpentry", w: 480, h: 853, title: "פח אינטגרלי" },
  {
    id: "-Wjmrcxzh58",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "פרזול דומיסיל - פתרונות למטבח",
  },
  {
    id: "BalKm364sV0",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "פתרון לכלי ניקוי",
  },
  { id: "r5rNiZlcQkQ", cat: "stone", w: 405, h: 720, title: "שיש עמיד לחום" },
  { id: "KrtHGchbqf0", cat: "stone", w: 405, h: 720, title: "אבנים טבעיות" },
  {
    id: "-gZ1MVC0Xrc",
    cat: "stone",
    w: 405,
    h: 720,
    title: "אבן הקריסטלו בצבע ורוד",
  },
  { id: "isVDfuRpxzs", cat: "stone", w: 405, h: 720, title: "אבן טבעית" },
  { id: "67DTpLZdp6k", cat: "stone", w: 405, h: 720, title: "הקוורציט הטבעית" },
  {
    id: "mdmPSOJIf3U",
    cat: "stone",
    w: 405,
    h: 720,
    title: "פתרון חדשני של שקע טעינה אלחוטי",
  },
  {
    id: "ybQvQzt5pys",
    cat: "stone",
    w: 405,
    h: 720,
    title: "פלטות שיש מיוחדות",
  },
  { id: "1hkj1zAft2Y", cat: "stone", w: 405, h: 720, title: "פלטה של שיש" },
  { id: "afIu8z7p8_E", cat: "stone", w: 405, h: 720, title: "בחירת מטבח שחור" },
  { id: "PDqFdBubg1s", cat: "stone", w: 405, h: 720, title: "רגל מעוגלת משיש" },
  {
    id: "2Thc-_0lVP0",
    cat: "carpentry",
    w: 405,
    h: 720,
    title: "בוצ׳ר מעץ במטבח",
  },
  {
    id: "qKTlQMrlCGA",
    cat: "carpentry",
    w: 405,
    h: 720,
    title: "איך להגיע מוכנים לפגישת תכנון מטבח פנים",
  },
  {
    id: "Jpvpun_D5FY",
    cat: "carpentry",
    w: 405,
    h: 720,
    title: "ידית אינטגרלית במטבח",
  },
  {
    id: "eQ3oUjdwj4Q",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "תוספת מושלמת למטבח כפרי",
  },
  {
    id: "HWALBS-Hfc0",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "נוחות במטבח | פתרונות אחסון למטבח",
  },
  {
    id: "HFpdGeapLYw",
    cat: "stone",
    w: 480,
    h: 853,
    title: "הצצה למפעל השיש, איך מגיעות הפלטות של השיש?",
  },
  {
    id: "2LbilnwKJgM",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "פתרונות אחסון למטבח",
  },
  {
    id: "PfeSVprmFjM",
    cat: "stone",
    w: 480,
    h: 853,
    title: "כיור מטבח מגרניט, למה הוא כל כך מומלץ?",
  },
  {
    id: "M5EWEU-tqhA",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "מה ההבדל בינינו לבין חברות מטבחים גדולות יותר?",
  },
  {
    id: "YM2CX6JiIzQ",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "שילוב צבעים במטבח",
  },
  {
    id: "mb2XQG9JZw8",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "טעויות בהתקנת אי במטבח",
  },
  {
    id: "MBPk8nYs8Qs",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "רגע לפני שאתם מתכננים אי במטבח",
  },
  {
    id: "sUFZHfJc-ZI",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "ניצול פינה במטבח",
  },
  {
    id: "11_O_M1dMbE",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "התאמה אישית של מטבח למשפחה של גבוהים:)",
  },
  {
    id: "OJ1Qv3IYQEY",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "המלצה מדהימה מלקוחה שלנו שביצענו לנו מהפך במטבח!",
  },
  {
    id: "FxxzZ-blgKM",
    cat: "carpentry",
    w: 480,
    h: 853,
    title: "ככה נראה ניצול מקסימלי של שטח המטבח!",
  },
  {
    id: "xDP0AbM4b2Y",
    cat: "carpentry",
    w: 480,
    h: 853,
    title:
      "התאמה אישית של המטבח לכל בית, לכל משפחה. זה חלק בלתי נפרד בתכנון המטבח שלכם.",
  },
  {
    id: "yRBIKAqMRQc",
    cat: "stone",
    w: 480,
    h: 853,
    title: "שיש הוא חלק גדול מהמטבח, חשוב לדעת לעשות בחירה נכונה.",
  },
  {
    id: "KI6jMKANlf8",
    cat: "carpentry",
    w: 480,
    h: 853,
    title:
      "כן, שמעתם נכון! אצלנו בא. בית המטבחים אנחנו נתקין לכם את המטבח תוך חודש בבית!",
  },
  {
    id: "cxb3AcqAppU",
    cat: "stone",
    w: 480,
    h: 853,
    title: "החלטנו לעשות לכם סרטון ולהציג לכם את ההבדלים בין סוגי הקנטים במטבח",
  },
  {
    id: "5anK7v0nObs",
    cat: "stone",
    w: 480,
    h: 853,
    title: "הקוורצים vs הפורצלן מה אתם מעדיפים? תכתבו לנו בתגובות",
  },
  {
    id: "ivxxp_CER3c",
    cat: "stone",
    w: 480,
    h: 853,
    title:
      "הסבר שכל מי שמתכנן מטבח חייב לשמוע, ואני בטוח שעוד לא ראיתם כזה הסבר באף מקום",
  },
  {
    id: "l_Iflul6ZAQ",
    cat: "carpentry",
    w: 480,
    h: 853,
    title:
      "מטבח זה הלב של הבית שלנו, לפני שאתם רוכשים מטבח חשוב שתתאימו אותו לצרכים שלכם ולרצונות שלכם",
  },
];

/** מיון של סרטון חדש מהפיד. כל מה שלא מדבר על אבן או משטח - נגרות */
export const guessCategory = (title: string): VideoCategory =>
  /שיש|אבן|קוורץ|קוורציט|גרניט|פורצלן|פלט|משטח|כיור|קנט|אינדוקציה/.test(title)
    ? "stone"
    : "carpentry";

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/**
 * הבסיס + כל סרטון חדש מפיד ה-RSS של הערוץ.
 * ⚠️ נכשל בשקט: אם יוטיוב לא עונה, העמוד מוצג מהבסיס. עדיף
 * רשימה של אתמול מאשר עמוד שבור.
 */
export async function getChannelVideos(): Promise<ChannelVideo[]> {
  const known = new Set(channelVideos.map((v) => v.id));
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return channelVideos;
    const xml = await res.text();
    const fresh: ChannelVideo[] = [];
    for (const entry of xml.split("<entry>").slice(1)) {
      const id = entry.match(/<yt:videoId>([^<]+)</)?.[1];
      const raw = entry.match(/<title>([^<]+)</)?.[1] ?? "";
      if (!id || known.has(id)) continue;
      const title = decode(raw)
        .replace(/#[^\s#]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      fresh.push({ id, cat: guessCategory(title), title, w: 0, h: 0 });
    }
    /* החדשים קודם - הפיד ממוין מהחדש לישן, וכך גם העמוד */
    return [...fresh, ...channelVideos];
  } catch {
    return channelVideos;
  }
}
