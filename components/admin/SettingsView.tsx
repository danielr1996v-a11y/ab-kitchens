"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { Switch } from "@/components/admin/ui/switch";
import { adminApi } from "@/lib/admin/api";
import type { SiteSettings } from "@/lib/admin/settings";

/**
 * הגדרות - המפרט §7, שלב 7: שם ותיאור, פרטי קשר, "להסתיר מגוגל"
 * ומזהה הפיקסל. נשמר מיד (מסך קצר, שינוי מכוון - לא שמירה אוטומטית).
 */

function Row({ id, label, help, children }: { id: string; label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

export default function SettingsView() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi<{ settings: SiteSettings }>("settings").then((r) => setS(r.settings)).catch((e) => toast.error((e as Error).message));
  }, []);

  if (!s) return <p className="text-sm text-muted-foreground">טוען…</p>;
  const set = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const r = await adminApi<{ settings: SiteSettings }>("settings", { body: s });
      setS(r.settings);
      toast.success("ההגדרות נשמרו ומופיעות באתר");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid max-w-2xl gap-5">
      <Card>
        <CardHeader><CardTitle className="text-base">גוגל</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <Label htmlFor="st-hide">להסתיר את האתר מגוגל</Label>
              <p className="text-xs text-muted-foreground">
                כל עוד זה דלוק, גוגל לא מכניס את האתר לתוצאות. דלוק עד ההשקה - האתר הישן עדיין באוויר. בהשקה מכבים.
              </p>
            </div>
            <Switch id="st-hide" dir="rtl" checked={s.hideFromGoogle} onCheckedChange={(c) => setS({ ...s, hideFromGoogle: c })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">פרטי העסק</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Row id="st-name" label="שם העסק"><Input id="st-name" value={s.name} onChange={set("name")} /></Row>
          <Row id="st-desc" label="תיאור קצר" help="מופיע בגוגל ובשיתוף בוואטסאפ, כשלעמוד אין תיאור משלו."><Textarea id="st-desc" rows={2} value={s.description} onChange={set("description")} /></Row>
          <div className="grid gap-4 sm:grid-cols-2">
            <Row id="st-p1" label="טלפון ראשי" help="בכפתור הצף ובסימון לגוגל"><Input id="st-p1" dir="ltr" value={s.phone1} onChange={set("phone1")} /></Row>
            <Row id="st-p2" label="טלפון נוסף"><Input id="st-p2" dir="ltr" value={s.phone2} onChange={set("phone2")} /></Row>
            <Row id="st-wa" label="וואטסאפ" help="בפורמט בינלאומי, בלי 0 ובלי +. למשל 972552775488"><Input id="st-wa" dir="ltr" value={s.whatsapp} onChange={set("whatsapp")} /></Row>
            <Row id="st-mail" label="מייל העסק"><Input id="st-mail" dir="ltr" type="email" value={s.email} onChange={set("email")} /></Row>
          </div>
          <Row id="st-addr" label="כתובת"><Input id="st-addr" value={s.address} onChange={set("address")} /></Row>
          <p className="text-xs text-muted-foreground">⚠️ הטלפונים שכתובים בתוך התפריט, בפוטר ובעמוד יצירת קשר הם חלק מהתוכן שלהם - משנים אותם שם, בעורך.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">פניות ומדידה</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Row id="st-lead" label="לאן לשלוח פניות במייל" help="ריק = למייל העסק. הפניות נשמרות במסך 'פניות' בכל מקרה."><Input id="st-lead" dir="ltr" type="email" value={s.leadEmail} onChange={set("leadEmail")} /></Row>
          <Row id="st-px" label="מזהה הפיקסל של פייסבוק" help="ספרות בלבד. ריק = בלי פיקסל באתר."><Input id="st-px" dir="ltr" inputMode="numeric" value={s.pixelId} onChange={set("pixelId")} /></Row>
        </CardContent>
      </Card>

      <Button className="w-fit" onClick={save} disabled={busy}>{busy ? "שומרים…" : "שמירת ההגדרות"}</Button>
    </div>
  );
}
