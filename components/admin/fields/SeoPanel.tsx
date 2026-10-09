"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { Switch } from "@/components/admin/ui/switch";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/admin/cn";
import { SEO_DESC_MAX, SEO_TITLE_MAX, type Seo } from "@/lib/admin/schema";
import ImageField from "./ImageField";

/**
 * "קידום בגוגל ושיתוף" - המפרט §7.
 *
 * - מונה עד 60 לכותרת ועד 155 לתיאור. מעבר לזה גוגל חותך.
 * - שדה ריק משאיר את ברירת המחדל, וה-placeholder מראה מה היא.
 * - תצוגה מקדימה שמתעדכנת בזמן הקלדה.
 */

const SITE = "ab-kitchens.co.il";
const SUFFIX = " | א. בית המטבחים";

function Counter({ n, max }: { n: number; max: number }) {
  return (
    <span className={cn("text-xs tabular-nums", n > max ? "font-medium text-destructive" : "text-muted-foreground")}>
      {n}/{max}
    </span>
  );
}

export default function SeoPanel({
  path,
  publishedPath,
  seo,
  fallbackTitle,
  fallbackDescription,
  onPath,
  onSeo,
}: {
  path: string;
  publishedPath: string;
  seo: Seo;
  fallbackTitle: string;
  fallbackDescription: string;
  onPath: (p: string) => void;
  onSeo: (s: Seo) => void;
}) {
  /* ערך מוצג כטקסט עם "שינוי", לא כשדה פתוח מראש (המפרט §7):
     שינוי כתובת הוא החלטה, לא הקלדה אגבית */
  const [editPath, setEditPath] = useState(false);
  const title = seo.title || fallbackTitle;
  const desc = seo.description || fallbackDescription;
  /* כמו באתר: "<כותרת> | א. בית המטבחים". ארוך מדי - נחתך, כמו בגוגל */
  const shownTitle = title + SUFFIX;

  return (
    <div className="grid gap-8">
      <section className="grid gap-2" aria-labelledby="seo-path">
        <h3 id="seo-path" className="text-sm font-medium">כתובת העמוד</h3>
        {editPath ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground" dir="ltr">{SITE}</span>
            <Input value={path} dir="rtl" className="max-w-sm" autoFocus onChange={(e) => onPath(e.target.value)} />
            <Button type="button" variant="outline" size="sm" onClick={() => setEditPath(false)}>סיום</Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm" dir="ltr">{SITE}{path || "/…"}</span>
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setEditPath(true)}>שינוי</Button>
          </div>
        )}
        {publishedPath && path && publishedPath !== path && (
          <p className="text-xs text-muted-foreground">
            בפרסום, הכתובת הקודמת ({publishedPath}) תפנה אוטומטית לחדשה - כדי לא לאבד את הדירוג בגוגל.
          </p>
        )}
      </section>

      <section className="grid gap-5" aria-labelledby="seo-google">
        <h3 id="seo-google" className="text-sm font-medium">איך זה ייראה בגוגל</h3>

        {/* תצוגה מקדימה - קירוב של תוצאת חיפוש, לא העתק מדויק */}
        <div className="max-w-xl rounded-md border bg-card p-4" aria-hidden="true">
          <p className="truncate text-xs text-muted-foreground" dir="ltr">{SITE}{path}</p>
          <p className="truncate text-lg text-[#1a0dab]">{shownTitle}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{desc.slice(0, SEO_DESC_MAX + 5)}</p>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-title">כותרת לגוגל</Label>
            <Counter n={(seo.title ?? "").length} max={SEO_TITLE_MAX} />
          </div>
          <Input id="seo-title" value={seo.title ?? ""} placeholder={fallbackTitle} onChange={(e) => onSeo({ ...seo, title: e.target.value })} />
          <p className="text-xs text-muted-foreground">ריק = הכותרת של המאמר.</p>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-desc">תיאור לגוגל</Label>
            <Counter n={(seo.description ?? "").length} max={SEO_DESC_MAX} />
          </div>
          <Textarea id="seo-desc" rows={3} value={seo.description ?? ""} placeholder={fallbackDescription} onChange={(e) => onSeo({ ...seo, description: e.target.value })} />
          <p className="text-xs text-muted-foreground">ריק = התקציר.</p>
        </div>

        <div className="grid gap-2">
          <Label>תמונה לשיתוף (וואטסאפ, פייסבוק)</Label>
          <ImageField id="seo-image" value={seo.image ?? ""} onChange={(v) => onSeo({ ...seo, image: v })} />
          <p className="text-xs text-muted-foreground">ריק = התמונה הראשית.</p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border p-3">
          <div className="grid gap-1">
            <Label htmlFor="seo-noindex">להסתיר מגוגל</Label>
            <p className="text-xs text-muted-foreground">העמוד יישאר באתר, אבל גוגל לא יציג אותו בתוצאות. מתאים לעמוד זמני.</p>
          </div>
          <Switch id="seo-noindex" dir="rtl" checked={seo.noindex === true} onCheckedChange={(c) => onSeo({ ...seo, noindex: c })} />
        </div>
      </section>
    </div>
  );
}
