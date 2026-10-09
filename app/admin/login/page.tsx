import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/admin/session";
import AuthCard from "@/components/admin/AuthCard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "כניסה" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  /* ⚠️ רק נתיב פנימי של מערכת הניהול - אחרת ?next= הופך לכלי
     להפניית משתמשים לאתר זר אחרי כניסה */
  const target = next?.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  if (await currentUser()) redirect(target);
  return (
    <AuthCard title="כניסה" description="מייל וסיסמה">
      <LoginForm next={target} />
    </AuthCard>
  );
}
