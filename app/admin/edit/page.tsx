import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/admin/session";
import { can } from "@/lib/admin/roles";
import PageEditor from "@/components/admin/editor/PageEditor";

export const metadata: Metadata = { title: "עורך" };
export const dynamic = "force-dynamic";

/**
 * העורך הוויזואלי - מסך מלא, בלי הסיידבר של המערכת (המפרט §8).
 * ההרשאות נבדקות כאן ושוב בשרת בכל שמירה (lib/admin/pageDocs.ts).
 */
export default async function EditPage({ searchParams }: { searchParams: Promise<{ id?: string; back?: string }> }) {
  const { id, back } = await searchParams;
  const user = await currentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(`/admin/edit?id=${id ?? ""}`)}`);
  if (!id || !can(user.role, "pages.text")) redirect("/admin?view=pages");
  const backHref = back === "shared" ? "/admin?view=shared" : "/admin?view=pages";
  return <PageEditor id={id} canLayout={can(user.role, "pages.layout")} backHref={backHref} />;
}
