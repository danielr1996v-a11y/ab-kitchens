import { redirect } from "next/navigation";
import { currentUser } from "@/lib/admin/session";
import { can, permissionsOf, roleInfo } from "@/lib/admin/roles";
import { findView } from "@/lib/admin/nav";
import AdminShell from "@/components/admin/AdminShell";
import EmptyView from "@/components/admin/EmptyView";
import UsersView from "@/components/admin/UsersView";
import ItemsView from "@/components/admin/ItemsView";
import PagesView from "@/components/admin/PagesView";
import DashboardView from "@/components/admin/DashboardView";
import LeadsView from "@/components/admin/LeadsView";
import SettingsView from "@/components/admin/SettingsView";
import ItemEditor from "@/components/admin/ItemEditor";
import { typeByView } from "@/lib/admin/schema";

/**
 * המסך הראשי של מערכת הניהול. הניווט ב-URL (?view=), כך שרענון
 * וחזרה אחורה נשארים באותו מסך (המפרט §6).
 */
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; item?: string }>;
}) {
  const user = await currentUser();
  if (!user) {
    const { view } = await searchParams;
    redirect(`/admin/login${view ? `?next=${encodeURIComponent(`/admin?view=${view}`)}` : ""}`);
  }

  const params = await searchParams;
  const view = findView(params.view);
  const contentType = typeByView(view.id);
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
      ) : view.id === "dashboard" ? (
        <DashboardView canLeads={can(user.role, "leads.view")} />
      ) : view.id === "leads" ? (
        <LeadsView canDelete={can(user.role, "leads.delete")} />
      ) : view.id === "settings" ? (
        <SettingsView />
      ) : view.id === "pages" ? (
        <PagesView kind="page" canLayout={can(user.role, "pages.layout")} />
      ) : view.id === "shared" ? (
        <PagesView kind="part" />
      ) : contentType && params.item ? (
        /* key: מעבר בין פריטים בונה את העורך מחדש, בלי מצב שנשאר מהקודם */
        <ItemEditor key={params.item} type={contentType} id={params.item} backHref={`/admin?view=${view.id}`} />
      ) : contentType ? (
        <ItemsView type={contentType} />
      ) : (
        <EmptyView
          text={view.about}
        />
      )}
    </AdminShell>
  );
}
