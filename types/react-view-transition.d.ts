/**
 * הצהרת טיפוס ל-<ViewTransition>.
 *
 * למה זה נדרש: Next 16 מחליף את react ב-App Router בגרסה המהודרת
 * שלו, וזו כן מייצאת ViewTransition. אבל @types/react שמותקן כאן
 * הוא של react 19.2.4 היציב, שבו הרכיב עדיין לא קיים - ולכן
 * TypeScript נכשל למרות שבזמן ריצה הכל תקין.
 *
 * כשהרכיב ייכנס ל-react היציב אפשר יהיה למחוק את הקובץ הזה.
 */
import "react";

declare module "react" {
  interface ViewTransitionProps {
    children?: React.ReactNode;
    /** שם משותף לשני הצדדים, כדי שהאלמנט ימורף במעבר */
    name?: string;
    default?: string;
    enter?: string;
    exit?: string;
    update?: string;
    share?: string;
  }

  export const ViewTransition: React.FC<ViewTransitionProps>;
}
