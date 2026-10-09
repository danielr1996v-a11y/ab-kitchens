"use client";

import { useId } from "react";
import { GripVertical, Minus, Plus, Trash2 } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import { Switch } from "@/components/admin/ui/switch";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/admin/cn";
import { isVisible, youtubeId, type Field } from "@/lib/admin/schema";
import ImageField from "./ImageField";

/**
 * שדה אחד, לפי הסוג שלו בסכמה (lib/admin/schema.ts). כל טופס במערכת
 * נבנה מכאן - אין טופס שכתוב ביד לסוג תוכן מסוים.
 *
 * הפקדים לפי טבלת המפרט (§א3): בחירה מ-2-5 = כפתורים, כן/לא = מתג,
 * מספר = stepper, רשימה חוזרת = הוספה וגרירה.
 */

type Values = Record<string, unknown>;

export function FieldList({
  fields,
  values,
  onChange,
  errors,
}: {
  fields: Field[];
  values: Values;
  onChange: (next: Values) => void;
  errors?: Set<string>;
}) {
  return (
    <div className="grid gap-6">
      {fields
        .filter((f) => isVisible(f, values))
        .map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            value={values[f.key]}
            invalid={errors?.has(f.label)}
            onChange={(v) => onChange({ ...values, [f.key]: v })}
          />
        ))}
    </div>
  );
}

function Shell({ field, id, invalid, children, inline }: { field: Field; id: string; invalid?: boolean; children: React.ReactNode; inline?: boolean }) {
  return (
    <div className={cn("grid gap-2", inline && "flex items-center justify-between gap-4")}>
      <div className="grid gap-1">
        <Label htmlFor={id} className={cn(invalid && "text-destructive")}>
          {field.label}
          {field.required && <span className="text-muted-foreground"> *</span>}
        </Label>
        {field.help && inline && <p className="text-xs text-muted-foreground">{field.help}</p>}
      </div>
      {children}
      {field.help && !inline && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {invalid && <p className="text-xs text-destructive">חובה לפני פרסום</p>}
    </div>
  );
}

export function FieldInput({
  field,
  value,
  onChange,
  invalid,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  invalid?: boolean;
}) {
  const id = useId();
  const str = typeof value === "string" ? value : "";

  switch (field.kind) {
    case "text":
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <Input id={id} value={str} maxLength={field.max} dir={field.dir} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} />
        </Shell>
      );

    case "textarea":
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <Textarea id={id} value={str} maxLength={field.max} rows={field.rows ?? 3} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)} />
          {field.max && <p className="text-end text-xs text-muted-foreground">{str.length}/{field.max}</p>}
        </Shell>
      );

    case "paragraphs": {
      /* פסקה לכל שורה ריקה. **מודגש** נשמר כמו שהוא - כך האתר מציג
         הדגשה, בלי HTML */
      const text = Array.isArray(value) ? (value as string[]).join("\n\n") : "";
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <Textarea
            id={id}
            defaultValue={text}
            rows={Math.min(14, Math.max(4, text.split("\n").length + 1))}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean))}
          />
          <p className="text-xs text-muted-foreground">שורה ריקה = פסקה חדשה. **מילים בין כוכביות** יוצגו מודגשות.</p>
        </Shell>
      );
    }

    case "stepper": {
      const n = typeof value === "number" ? value : null;
      const set = (v: number) => onChange(Math.min(field.max, Math.max(field.min, v)));
      return (
        <Shell field={field} id={id} invalid={invalid} inline>
          <div className="flex items-center gap-1" role="group" aria-labelledby={id}>
            <Button type="button" variant="outline" size="icon" aria-label="פחות" onClick={() => set((n ?? field.min) - 1)}>
              <Minus className="size-4" />
            </Button>
            <span id={id} className="w-10 text-center tabular-nums" aria-live="polite">{n ?? "—"}</span>
            <Button type="button" variant="outline" size="icon" aria-label="יותר" onClick={() => set((n ?? field.min - 1) + 1)}>
              <Plus className="size-4" />
            </Button>
          </div>
        </Shell>
      );
    }

    case "toggle":
      return (
        <Shell field={field} id={id} invalid={invalid} inline>
          <Switch id={id} checked={value === true} onCheckedChange={(c) => onChange(c)} dir="rtl" />
        </Shell>
      );

    case "segmented":
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <div id={id} role="radiogroup" aria-label={field.label} className="inline-flex w-fit flex-wrap gap-1 rounded-md bg-muted p-1">
            {field.options.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={value === o.value}
                onClick={() => onChange(o.value)}
                className={cn(
                  "rounded px-3 py-1.5 text-sm transition-colors",
                  value === o.value ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Shell>
      );

    case "date":
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <Input id={id} type="date" value={str} className="w-fit" dir="ltr" onChange={(e) => onChange(e.target.value)} />
        </Shell>
      );

    case "image":
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <ImageField id={id} value={str} onChange={onChange} />
        </Shell>
      );

    case "youtube": {
      const ytId = str ? youtubeId(str) : null;
      return (
        <Shell field={field} id={id} invalid={invalid}>
          <Input id={id} value={str} dir="ltr" placeholder="https://youtube.com/shorts/…" onChange={(e) => onChange(youtubeId(e.target.value) ?? e.target.value)} />
          {str && !ytId && <p className="text-xs text-destructive">זה לא נראה כמו קישור יוטיוב</p>}
          {ytId && (
            /* eslint-disable-next-line @next/next/no-img-element -- תצוגה מקדימה במערכת, לא באתר */
            <img src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-48 rounded border" />
          )}
        </Shell>
      );
    }

    case "repeater":
      return <Repeater field={field} value={value} onChange={onChange} invalid={invalid} />;
  }
}

/* ===== רשימה חוזרת: הוספה, מחיקה וגרירה (המפרט §א3) ===== */

type Row = Values & { _k: string };

function SortableRow({ id, index, label, children, onRemove }: { id: string; index: number; label: string; children: React.ReactNode; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("grid gap-4 rounded-md border bg-card p-4", isDragging && "relative z-10 shadow-lg")}
    >
      <div className="flex items-center gap-2">
        <button type="button" className="cursor-grab touch-none text-muted-foreground" aria-label={`גרירת ${label} ${index + 1}`} {...attributes} {...listeners}>
          <GripVertical className="size-4" />
        </button>
        <span className="flex-1 text-sm font-medium">{label} {index + 1}</span>
        <Button type="button" variant="ghost" size="icon" aria-label={`מחיקת ${label} ${index + 1}`} onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      {children}
    </li>
  );
}

let keySeq = 0;
const withKeys = (arr: Values[]): Row[] => arr.map((v) => ("_k" in v ? (v as Row) : { ...v, _k: `r${keySeq++}` }));
/* המפתח פנימי לגרירה - לא נשלח לשרת (והשרת היה זורק אותו בכל מקרה) */
const strip = (rows: Row[]) => rows.map(({ _k, ...rest }) => (void _k, rest));

function Repeater({ field, value, onChange, invalid }: { field: Extract<Field, { kind: "repeater" }>; value: unknown; onChange: (v: unknown) => void; invalid?: boolean }) {
  const rows = withKeys(Array.isArray(value) ? (value as Values[]) : []);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const emit = (next: Row[]) => onChange(next);

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = rows.findIndex((r) => r._k === e.active.id);
    const to = rows.findIndex((r) => r._k === e.over!.id);
    emit(arrayMove(rows, from, to));
  };

  return (
    <fieldset className="grid gap-3">
      <legend className={cn("mb-2 text-sm font-medium", invalid && "text-destructive")}>
        {field.label}
        {field.required && <span className="text-muted-foreground"> *</span>}
      </legend>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r._k)} strategy={verticalListSortingStrategy}>
          <ol className="grid gap-3">
            {rows.map((row, i) => (
              <SortableRow key={row._k} id={row._k} index={i} label={field.itemLabel} onRemove={() => emit(rows.filter((r) => r._k !== row._k))}>
                <FieldList fields={field.fields} values={row} onChange={(next) => emit(rows.map((r) => (r._k === row._k ? (next as Row) : r)))} />
              </SortableRow>
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" className="w-fit" onClick={() => emit([...rows, { _k: `r${keySeq++}` }])}>
        <Plus className="size-4" /> {field.itemLabel} נוסף
      </Button>
      {invalid && <p className="text-xs text-destructive">חובה לפני פרסום</p>}
    </fieldset>
  );
}

/** בטעינה לעורך: מפתח קבוע לכל שורה ברשימה, פעם אחת. ⚠️ בלי זה
    כל רינדור היה ממציא מפתחות חדשים, והשדות היו נבנים מחדש תוך כדי
    הקלדה - הסמן קופץ והטקסט נעלם */
export function addKeys(values: Values): Values {
  const out: Values = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = Array.isArray(v) && v.length && typeof v[0] === "object" && v[0] !== null ? withKeys((v as Values[]).map(addKeys)) : v;
  }
  return out;
}

/** לפני שליחה לשרת: מוריד את מפתחות הגרירה מכל הרשימות */
export function stripKeys(values: Values): Values {
  const out: Values = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = Array.isArray(v) && v.length && typeof v[0] === "object" && v[0] !== null ? strip(withKeys(v as Values[])).map(stripKeys) : v;
  }
  return out;
}
