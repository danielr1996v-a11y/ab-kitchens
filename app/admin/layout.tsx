import type { Metadata } from "next";
import "./admin.css";
import { TooltipProvider } from "@/components/admin/ui/tooltip";
import { Toaster } from "@/components/admin/ui/sonner";

/**
 * מערכת הניהול - /admin.
 *
 * ⚠️ לא בתוך (site): בלי הדר, פוטר, Lenis, הפיקסל של פייסבוק,
 * ובלי ה-CSS של האתר. רק admin.css הניטרלי.
 */
export const metadata: Metadata = {
  title: { default: "ניהול", template: "%s · ניהול א. בית המטבחים" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background text-foreground">{children}</div>
      <Toaster position="bottom-left" />
    </TooltipProvider>
  );
}
