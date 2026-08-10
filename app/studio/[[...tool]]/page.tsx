import type { Metadata } from "next";
import { isConfigured } from "@/sanity/env";
import StudioClient from "./studio-client";

/**
 * /studio - פאנל הניהול.
 *
 * מחוץ ל-route group ‏(site) ולכן בלי Header/Footer של האתר -
 * זו אפליקציית ניהול, לא עמוד תוכן.
 *
 * noindex + nofollow: הפאנל לא אמור להופיע בגוגל. ההגנה בפועל
 * היא ההתחברות של Sanity - מי שלא מוזמן לפרויקט רואה מסך כניסה.
 */
export const metadata: Metadata = {
  title: "ניהול | א. בית המטבחים",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default function StudioPage() {
  // לפני שדניאל יצר חשבון: הסבר קצר במקום מסך שבור
  if (!isConfigured) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "system-ui", direction: "rtl", padding: "2rem", textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", marginBottom: ".5rem" }}>מערכת הניהול עוד לא חוברה</h1>
          <p style={{ color: "#767676", maxWidth: "28rem" }}>
            חסר NEXT_PUBLIC_SANITY_PROJECT_ID. אחרי יצירת הפרויקט ב-sanity.io
            והזנת המשתנים, העמוד הזה יהפוך לפאנל.
          </p>
        </div>
      </div>
    );
  }
  return <StudioClient />;
}
