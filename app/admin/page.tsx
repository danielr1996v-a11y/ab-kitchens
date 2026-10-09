import { redirect } from "next/navigation";
import { currentUser } from "@/lib/admin/session";
import { can, permissionsOf, roleInfo } from "@/lib/admin/roles";
import { findView } from "@/lib/admin/nav";
import AdminShell from "@/components/admin/AdminShell";
import EmptyView from "@/components/admin/EmptyView";
import UsersView from "@/components/admin/UsersView";

/**
 * המסך הראשי של מערכת הניהול. הניווט ב-URL (?view=), כך שרענון
 * וחזרה אחורה נשארים באותו מסך (המפרט §6).
 */
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    const { view } = await searchParams;
    redirect(`/admin/login${view ? `?next=${encodeURIComponent(`/admin?view=${view}`)}` : ""}`);
  }

  const view = findView((await searchParams).view);
  /* ⚠️ חסימה בשרת, לא רק הסתרה בסיידבר: מי שמקליד ?view=users
     בלי הרשאה מקבל הודעה ולא את המסך */
  const allowed = !view.permission || can(user.role, view.permission);

  return (
    <AdminShell
      user={{ ...user, roleLabel: roleInfo[user.role].label }}
      permissions={[...permissionsOf(user.role)]}
      current={view.id}
    >
      {!allowed ? (
        <EmptyView title="אין לך גישה למסך הזה" text="המסך שמור למנהלי המערכת. אם צריך גישה - דברו עם דניאל." />
      ) : view.id === "users" ? (
        <UsersView me={user.email} />
      ) : (
        <EmptyView
          text={view.about}
          note={view.stage ? `המסך הזה נבנה בשלב ${view.stage} של הפרויקט.` : undefined}
        />
      )}
    </AdminShell>
  );
}
