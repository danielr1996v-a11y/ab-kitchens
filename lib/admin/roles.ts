/**
 * תפקידים והרשאות - ADMIN-SPEC §5.
 *
 * שני תפקידים, לא שלושה: באתר הזה עובדים רק דניאל ואברהם, ותפקיד
 * "עורך/ת אתר" של המפרט לא שייך לאף אחד מהם. אם יצטרף מישהו,
 * מוסיפים כאן שורה - כל השאר נגזר מהטבלה.
 *
 * ⚠️ הקובץ הזה הוא מקור האמת להרשאות. הממשק מסתיר כפתורים לפיו,
 * אבל **השרת בודק אותו בכל פעולה** (lib/admin/session.ts) - הסתרת
 * כפתור היא נוחות, לא אבטחה.
 */

export const ROLES = ["admin", "content"] as const;
export type Role = (typeof ROLES)[number];

export type Permission =
  | "items.edit" //       מאמרים, המלצות, סרטונים, פרויקטים: עריכה ופרסום
  | "pages.text" //       טקסט ותמונה בעמודים, בלי פריסה ועיצוב
  | "pages.layout" //     מבנה, פריסה ועיצוב של עמודים
  | "shared.edit" //      הדר, פוטר ותפריטים
  | "leads.view" //       צפייה בפניות וסימון סטטוס
  | "leads.delete" //     מחיקה סופית של פניות
  | "users.manage" //     משתמשים וקישורי כניסה
  | "settings.edit"; //   פרטי האתר, "להסתיר מגוגל", אנליטיקס

const GRANTS: Record<Role, readonly Permission[]> = {
  admin: [
    "items.edit",
    "pages.text",
    "pages.layout",
    "shared.edit",
    "leads.view",
    "leads.delete",
    "users.manage",
    "settings.edit",
  ],
  content: ["items.edit", "pages.text", "leads.view"],
};

/** ההרשאות של תפקיד - נשלחות לממשק כדי להסתיר את מה שאסור */
export const permissionsOf = (role: Role): readonly Permission[] => GRANTS[role];

export function can(role: Role, permission: Permission): boolean {
  return GRANTS[role].includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** מוצג במסך המשתמשים - כל תפקיד מוסבר במילים (המפרט §5) */
export const roleInfo: Record<Role, { label: string; explain: string }> = {
  admin: {
    label: "מנהל/ת",
    explain:
      "הכל: תוכן, עיצוב ופריסה של עמודים, תפריט ופוטר, הגדרות, משתמשים ומחיקת פניות.",
  },
  content: {
    label: "עורך/ת תוכן",
    explain:
      "מאמרים, המלצות, סרטונים ופרויקטים: הוספה, עריכה ופרסום. בעמודים: טקסט ותמונות בלבד. פניות: צפייה וסימון. בלי עיצוב, בלי הגדרות ובלי משתמשים.",
  },
};
