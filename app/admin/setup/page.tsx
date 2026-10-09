import type { Metadata } from "next";
import AuthCard from "@/components/admin/AuthCard";
import SetupForm from "./SetupForm";

export const metadata: Metadata = { title: "הגדרת סיסמה" };

/** הקישור החד-פעמי מגיע לכאן. הטוקן נקרא מה-# בדפדפן (SetupForm) */
export default function SetupPage() {
  return (
    <AuthCard
      title="ברוכים הבאים"
      description="בחרו סיסמה. אחרי השמירה תיכנסו ישר למערכת, והקישור יפסיק לעבוד."
    >
      <SetupForm />
    </AuthCard>
  );
}
