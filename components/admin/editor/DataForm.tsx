"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { Switch } from "@/components/admin/ui/switch";
import { Button } from "@/components/admin/ui/button";
import ImageField from "@/components/admin/fields/ImageField";

/**
 * טופס לתוכן של רכיב נעול - שלב 6ג. נבנה מהצורה של הנתונים עצמם:
 * מחרוזת → שדה, תמונה → בוחר תמונה, מספר → שדה מספר, כן/לא → מתג,
 * רשימה → שורות עם הוספה, מחיקה וסדר. השרת מקבל רק את אותה צורה
 * (cleanDataLike ב-lib/admin/sanitizeDoc.ts).
 */

/* שמות בעברית לשדות הנפוצים. שדה שלא כאן מוצג בשם הטכני שלו */
const LABELS: Record<string, string> = {
  title: "כותרת",
  titleBold: "כותרת (מודגש)",
  titleLight: "כותרת (רגיל)",
  subtitle: "כותרת משנה",
  intro: "פתיח",
  lead: "פסקת פתיחה",
  eyebrow: "שורה מעל הכותרת",
  text: "טקסט",
  body: "טקסט",
  description: "תיאור",
  label: "תווית",
  name: "שם",
  href: "קישור",
  image: "תמונה",
  logo: "לוגו",
  alt: "תיאור תמונה",
  imageAlt: "תיאור תמונה",
  ctaText: "טקסט הכפתור",
  submitLabel: "טקסט הכפתור",
  source: "מקור הפנייה (במייל)",
  slides: "שקופיות",
  items: "פריטים",
  cards: "כרטיסים",
  logos: "לוגואים",
  points: "נקודות",
  nav: "פריטי התפריט",
  children: "תת-תפריט",
  social: "רשתות חברתיות",
  quickDial: "כפתור חיוג",
  featuredImage: "תמונה בתפריט הנפתח",
  note: "הערה",
  displaySeconds: "שניות לכל תמונה",
  transitionSeconds: "שניות למעבר",
  x: "מיקום אופקי (%)",
  y: "מיקום אנכי (%)",
  pos: "כיוון התווית (top/bottom)",
  tall: "מסגרת גבוהה",
  withForm: "עם טופס",
  enabled: "מוצג",
  scrollIndicator: "סימן הגלילה",
  heading: "כותרת",
  paragraphs: "פסקאות",
};
/* שדות טכניים שלא מוצגים */
const HIDDEN = new Set(["id", "_key", "_type", "variant", "size", "targetId"]);
const IMAGE_KEY = /^(image|src|logo|poster|img|photo|featuredImage)$/i;

const labelFor = (key: string) => LABELS[key] ?? key;

function ItemTitle(v: unknown, i: number) {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const t = o.title ?? o.label ?? o.name ?? o.alt;
    if (typeof t === "string" && t) return `${i + 1}. ${t.slice(0, 30)}`;
  }
  return `${i + 1}`;
}

function Value({ k, value, onChange, depth }: { k: string; value: unknown; onChange: (v: unknown) => void; depth: number }) {
  const id = `df-${depth}-${k}`;
  if (typeof value === "string") {
    if (IMAGE_KEY.test(k)) {
      return (
        <div className="grid gap-1.5">
          <Label className="text-xs">{labelFor(k)}</Label>
          <ImageField id={id} value={value} onChange={onChange} />
        </div>
      );
    }
    const long = value.length > 50;
    return (
      <div className="grid gap-1.5">
        <Label htmlFor={id} className="text-xs">{labelFor(k)}</Label>
        {long ? (
          <Textarea id={id} rows={Math.min(6, Math.ceil(value.length / 40))} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input id={id} value={value} dir={/href|url/i.test(k) ? "ltr" : undefined} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }
  if (typeof value === "number") {
    return (
      <div className="grid gap-1.5">
        <Label htmlFor={id} className="text-xs">{labelFor(k)}</Label>
        <Input id={id} type="number" dir="ltr" className="w-28" value={value} onChange={(e) => onChange(e.target.value === "" ? value : Number(e.target.value))} />
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs">{labelFor(k)}</Label>
        <Switch id={id} dir="rtl" checked={value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (Array.isArray(value)) {
    const move = (i: number, d: -1 | 1) => {
      const next = [...value];
      const [x] = next.splice(i, 1);
      next.splice(i + d, 0, x);
      onChange(next);
    };
    return (
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-xs font-medium">{labelFor(k)}</legend>
        {value.map((item, i) => (
          <div key={i} className="grid gap-3 rounded-md border bg-card p-3">
            <div className="flex items-center gap-1">
              <span className="flex-1 truncate text-xs font-medium">{ItemTitle(item, i)}</span>
              <Button type="button" variant="ghost" size="icon" className="size-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="למעלה"><ArrowUp className="size-3.5" /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-7" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="למטה"><ArrowDown className="size-3.5" /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="מחיקה"><Trash2 className="size-3.5" /></Button>
            </div>
            <Value k={k} value={item} depth={depth + 1} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
          </div>
        ))}
        {value.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            /* פריט חדש = עותק של האחרון; השרת מאשר רק את אותה צורה */
            onClick={() => onChange([...value, structuredClone(value[value.length - 1])])}
          >
            <Plus className="size-4" /> הוספה
          </Button>
        )}
      </fieldset>
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([kk]) => !HIDDEN.has(kk));
    return (
      <div className="grid gap-3">
        {entries.map(([kk, vv]) => (
          <Value key={kk} k={kk} value={vv} depth={depth + 1} onChange={(v) => onChange({ ...(value as object), [kk]: v })} />
        ))}
      </div>
    );
  }
  return null;
}

export default function DataForm({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return <Value k="" value={data} depth={0} onChange={(v) => onChange(v as Record<string, unknown>)} />;
}
