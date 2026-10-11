"use client";

import { ArrowDown, ArrowUp, Copy, EyeOff, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/admin/cn";
import { brandColors, fontSizes, spaces } from "@/lib/tokens";
import type { SiteNode } from "@/lib/site/tree";
import { effectiveStyle, type Device } from "./ops";

/**
 * עיצוב ופריסה של האלמנט שנבחר - שלב 6ב. **מנהל בלבד** (ADMIN-SPEC §5).
 *
 * כל ערך נשמר למכשיר שנבחר בסרגל העליון. ערך שעובר בירושה ממכשיר
 * גדול יותר מוצג באפור עם "יורש מ…", ו-↺ מחזיר לירושה (המפרט §6:
 * "ערך יורש באפור עם שינוי").
 *
 * הערכים מהשפה של האתר בלבד (lib/tokens.ts) - כך אי אפשר לבחור
 * צבע או גודל שלא קיימים באתר.
 */

const DEVICE_NAME: Record<Device, string> = { desktop: "מחשב", tablet: "טאבלט", mobile: "טלפון" };

const WEIGHTS = [
  { v: "300", l: "דק" },
  { v: "400", l: "רגיל" },
  { v: "700", l: "מודגש" },
];
const ALIGN = [
  { v: "right", l: "ימין" },
  { v: "center", l: "מרכז" },
  { v: "left", l: "שמאל" },
];
const RADII = [
  { v: "0", l: "בלי" },
  { v: "var(--radius-8)", l: "קטנה" },
  { v: "var(--radius-16)", l: "בינונית" },
  { v: "var(--radius-32)", l: "גדולה" },
];
const SPACE_OPTIONS = [{ v: "0", l: "0" }, ...spaces.map((s, i) => ({ v: `var(${s.name})`, l: String(i + 1) }))];

type Props = {
  node: SiteNode;
  device: Device;
  onStyle: (prop: string, value: string | null) => void;
  onHide: (device: Device) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** ערכי צבעי המותג כפי שהם באתר - שם משתנה → צבע */
  palette: Record<string, string>;
};

function Field({ label, prop, node, device, onReset, children }: { label: string; prop: string; node: SiteNode; device: Device; onReset: () => void; children: React.ReactNode }) {
  const { value, from } = effectiveStyle(node, device, prop);
  const inherited = value && from !== device;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {value && !inherited && (
          <button type="button" onClick={onReset} className="text-muted-foreground hover:text-foreground" aria-label={`איפוס ${label}`} title="חזרה לברירת המחדל">
            <RotateCcw className="size-3" />
          </button>
        )}
        {inherited && <span className="text-[11px] text-muted-foreground">יורש מ{DEVICE_NAME[from!]}</span>}
      </div>
      {children}
    </div>
  );
}

function Chips({ options, value, onPick }: { options: { v: string; l: string }[]; value?: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onPick(o.v)}
          aria-pressed={value === o.v}
          className={cn("min-w-8 rounded border px-2 py-1 text-xs", value === o.v ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent")}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

/* הצבעים נקראים מהעמוד עצמו (ה-iframe) - המערכת לא טוענת את ה-CSS של
   האתר, ושכפול הערכים כאן היה נפרד מהאתר בשינוי הבא */
function Swatches({ value, onPick, palette }: { value?: string; onPick: (v: string) => void; palette: Record<string, string> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {brandColors.map((c) => {
        const v = `var(${c.name})`;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onPick(v)}
            title={`${c.label}${c.use ? ` - ${c.use}` : ""}`}
            aria-label={c.label}
            aria-pressed={value === v}
            className={cn("size-7 rounded-full border shadow-sm", value === v && "ring-2 ring-primary ring-offset-1")}
            style={{ background: palette[c.name] || "#ccc" }}
          />
        );
      })}
    </div>
  );
}

export default function LayoutPanel({ node, device, onStyle, onHide, onMove, onDuplicate, onDelete, canMoveUp, canMoveDown, palette }: Props) {
  const eff = (p: string) => effectiveStyle(node, device, p).value;
  /* רכיב נעול: אין לו עוטף משלו באתר, ולכן אין על מה להחיל עיצוב או
     הסתרה - רק הזזה, שכפול ומחיקה */
  const locked = node.type === "widget";
  const textual = ["heading", "text", "link"].includes(node.type);
  const set = (p: string) => (v: string) => onStyle(p, v);
  const reset = (p: string) => () => onStyle(p, null);

  return (
    <div className="grid gap-5 border-t pt-4">
      {/* פעולות */}
      <div className="flex flex-wrap gap-1">
        <Button variant="outline" size="sm" onClick={() => onMove(-1)} disabled={!canMoveUp} aria-label="הזזה למעלה"><ArrowUp className="size-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onMove(1)} disabled={!canMoveDown} aria-label="הזזה למטה"><ArrowDown className="size-4" /></Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}><Copy className="size-4" /> שכפול</Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}><Trash2 className="size-4" /> מחיקה</Button>
      </div>

      {!locked && (<>
      <p className="rounded bg-muted px-2 py-1.5 text-xs text-muted-foreground">
        העיצוב כאן חל על <strong className="text-foreground">{DEVICE_NAME[device]}</strong>
        {device !== "desktop" && " - וגובר על המחשב רק במכשיר הזה"}. מחליפים מכשיר בסרגל העליון.
      </p>

      {/* הסתרה */}
      <div className="grid gap-1.5">
        <Label className="text-xs">הסתרה</Label>
        <div className="flex gap-1">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onHide(d)}
              aria-pressed={!!node.hide?.[d]}
              className={cn("flex items-center gap-1 rounded border px-2 py-1 text-xs", node.hide?.[d] ? "border-amber-500 bg-amber-50 text-amber-900" : "hover:bg-accent")}
            >
              {node.hide?.[d] && <EyeOff className="size-3" />} {DEVICE_NAME[d]}
            </button>
          ))}
        </div>
      </div>

      {textual && (
        <>
          <Field label="גודל טקסט" prop="font-size" node={node} device={device} onReset={reset("font-size")}>
            <Chips options={fontSizes.map((f) => ({ v: `var(${f.name})`, l: f.label }))} value={eff("font-size")} onPick={set("font-size")} />
          </Field>
          <Field label="משקל" prop="font-weight" node={node} device={device} onReset={reset("font-weight")}>
            <Chips options={WEIGHTS.map((w) => ({ v: w.v, l: w.l }))} value={eff("font-weight")} onPick={set("font-weight")} />
          </Field>
          <Field label="צבע טקסט" prop="color" node={node} device={device} onReset={reset("color")}>
            <Swatches value={eff("color")} onPick={set("color")} palette={palette} />
          </Field>
          <Field label="יישור" prop="text-align" node={node} device={device} onReset={reset("text-align")}>
            <Chips options={ALIGN} value={eff("text-align")} onPick={set("text-align")} />
          </Field>
        </>
      )}

      <Field label="רקע" prop="background-color" node={node} device={device} onReset={reset("background-color")}>
        <Swatches value={eff("background-color")} onPick={set("background-color")} palette={palette} />
      </Field>

      {(["padding-top", "padding-bottom", "margin-top", "margin-bottom"] as const).map((p) => (
        <Field key={p} label={{ "padding-top": "ריווח פנימי למעלה", "padding-bottom": "ריווח פנימי למטה", "margin-top": "מרווח מעל", "margin-bottom": "מרווח מתחת" }[p]} prop={p} node={node} device={device} onReset={reset(p)}>
          <Chips options={SPACE_OPTIONS} value={eff(p)} onPick={set(p)} />
        </Field>
      ))}

      <Field label="פינות" prop="border-radius" node={node} device={device} onReset={reset("border-radius")}>
        <Chips options={RADII} value={eff("border-radius")} onPick={set("border-radius")} />
      </Field>

      <Field label="רוחב מקסימלי" prop="max-width" node={node} device={device} onReset={reset("max-width")}>
        <Input
          dir="ltr"
          placeholder="למשל 40rem או 60%"
          defaultValue={eff("max-width") ?? ""}
          key={`${node.id}-${device}`}
          onBlur={(e) => onStyle("max-width", e.target.value.trim() || null)}
        />
      </Field>
      </>)}
    </div>
  );
}
