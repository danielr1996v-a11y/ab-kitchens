/**
 * עמוד = עץ אלמנטים - המפרט §3, ADMIN-SPEC §2.
 *
 * ⚠️ העץ שומר את ה-markup הקיים **כמו שהוא**: אותן תגיות, אותן
 * מחלקות BEM ואותם מאפיינים. ה-CSS של האתר לא משתנה בכלל - הוא
 * ממשיך לעצב את אותו HTML. זה מה שמבטיח שהמראה לא זז בהעברה.
 *
 * הקובץ משותף לשרת ולדפדפן (העורך בשלב 6).
 */

export type NodeType =
  | "section" //   אזור ברוחב מלא: section, article, header, footer, nav, aside
  | "container" // כל עוטף אחר: div, ul, li...
  | "heading" //   h1-h6
  | "text" //      פסקה, תווית, או - בלי tag - רצף טקסט בתוך אלמנט
  | "link" //      a
  | "image" //     img
  | "icon" //      svg - נעול, נשמר כמו שהוא
  | "html" //      JSON-LD בלבד
  | "widget"; //   רכיב מיוחד נעול (ADMIN-SPEC §2.3) - React קיים

export type SiteNode = {
  id: string;
  type: NodeType;
  /** תגית HTML. חסר בעלה טקסטואלי (type "text" בלי tag) */
  tag?: string;
  classes?: string[];
  props?: {
    /** טקסט של עלה טקסטואלי */
    text?: string;
    /** מאפייני HTML כמו שהם (href, alt, aria-*, data-*, style...) */
    attrs?: Record<string, string>;
    /** icon: התוכן הפנימי של ה-svg */
    svg?: string;
    /** html: תוכן הסקריפט (JSON-LD) */
    json?: string;
  };
  settings?: {
    /** widget: שם הרכיב ברשימה (components/site/widgets.tsx) */
    widget?: string;
    /** widget: ה-props שלו */
    data?: Record<string, unknown>;
    /** עוטף <ViewTransition name> - מעבר משותף בין עמודים */
    viewTransition?: string;
    /** עוטף Reveal - כניסה למסך (נשמר הסף, אם שונה מברירת המחדל) */
    reveal?: { threshold?: number };
  };
  /** הסתרה בלי מחיקה, לפי מכשיר (שלב 6) */
  hide?: { desktop?: boolean; tablet?: boolean; mobile?: boolean };
  /**
   * עיצוב מהעורך, לפי מכשיר (המפרט §3). הירושה: מחשב ← טאבלט ← טלפון.
   * מרונדר כ-CSS על .n-<id> (lib/site/nodeCss.ts). רק תכונות מהרשימה
   * הסגורה ב-lib/admin/sanitizeDoc.ts.
   */
  style?: { base: { desktop?: Record<string, string>; tablet?: Record<string, string>; mobile?: Record<string, string> } };
  children?: SiteNode[];
};

export type SiteDoc = {
  id: string;
  kind: "page" | "header" | "footer" | "block";
  nodes: SiteNode[];
};

let seq = 0;
/** מזהה קצר ויציב בתוך עמוד. לא חייב להיות ייחודי בין עמודים */
export const nodeId = () => `n${(++seq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
