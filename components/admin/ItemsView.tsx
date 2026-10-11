"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, ImageIcon, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { Label } from "@/components/admin/ui/label";
import { Card } from "@/components/admin/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/admin/ui/dropdown-menu";
import { adminApi } from "@/lib/admin/api";
import { cn } from "@/lib/admin/cn";
import type { ContentType, Field } from "@/lib/admin/schema";
import type { EntrySummary } from "@/lib/admin/entries";
import StatusBadge from "./StatusBadge";
import EmptyView from "./EmptyView";

/**
 * רשימה של סוג תוכן - המפרט §6-7.
 *
 * - גריד של 4 כרטיסים בשורה במחשב: תמונה, שם, תגיות, ⋯.
 * - פילטרים בשורה אחת: חיפוש, סוג/סגנון, ומתג "סל המיחזור".
 * - סדר ידני בגרירה (ADMIN-SPEC §1). ⚠️ רק כשאין חיפוש ופילטר:
 *   גרירה בתוך רשימה מסוננת לא אומרת איפה הפריט נוחת ביחס
 *   לפריטים שמוסתרים.
 * - מחיקה: toast עם "בטל", ומעבר לסל עם שחזור.
 */

export const ENTRIES_CHANGED = "abk-entries-changed";

function Thumb({ src }: { src: string }) {
  return src ? (
    /* eslint-disable-next-line @next/next/no-img-element -- תצוגה במערכת */
    <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-t-xl object-cover" />
  ) : (
    <div className="grid aspect-[4/3] w-full place-items-center rounded-t-xl bg-muted text-muted-foreground">
      <ImageIcon className="size-6" />
    </div>
  );
}

function ItemCard({
  item,
  href,
  filterLabel,
  sortable,
  onAction,
}: {
  item: EntrySummary;
  href: string;
  filterLabel: string;
  sortable: boolean;
  onAction: (a: "unpublish" | "trash" | "untrash") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: !sortable });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "relative z-10")}>
      <Card className={cn("h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md", isDragging && "shadow-lg")}>
        {/* התמונה מקשרת לאותו מקום כמו השם - מחוץ לסדר הטאב, עם שם לקורא מסך */}
        <Link href={href} tabIndex={-1} aria-label={item.title} className="focus-visible:outline-2 focus-visible:outline-ring">
          <Thumb src={item.image} />
        </Link>
        {/* שורה 1: שם ו-⋯ · שורה 2: תגיות וגרירה. בטלפון הכרטיס
            ברוחב 170px - בשורה אחת ה-⋯ נחתך מחוץ לכרטיס (נמדד ב-390) */}
        <div className="grid gap-2 p-3">
          <div className="flex items-start gap-1">
            <Link href={href} className="line-clamp-2 flex-1 text-sm font-medium hover:underline">{item.title}</Link>
            {/* תפריט ⋯ במקום קבוע (המפרט §6) */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mt-1 size-7 shrink-0" aria-label={`פעולות: ${item.title}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {item.status === "trash" ? (
                  <DropdownMenuItem onSelect={() => onAction("untrash")}>שחזור מהסל</DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild><Link href={href}>עריכה</Link></DropdownMenuItem>
                    {item.status === "publish" && <DropdownMenuItem onSelect={() => onAction("unpublish")}>ביטול פרסום</DropdownMenuItem>}
                    <DropdownMenuItem variant="destructive" onSelect={() => onAction("trash")}>העברה לסל המיחזור</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-end gap-1">
            <div className="flex flex-1 flex-wrap gap-1">
              <StatusBadge status={item.status} hasDraft={item.hasDraft} />
              {filterLabel && <span className="rounded-md border px-1.5 py-0.5 text-xs text-muted-foreground">{filterLabel}</span>}
            </div>
            {sortable && (
              <button type="button" className="cursor-grab touch-none p-1 text-muted-foreground" aria-label={`גרירה: ${item.title}`} {...attributes} {...listeners}>
                <GripVertical className="size-4" />
              </button>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}

export default function ItemsView({ type }: { type: ContentType }) {
  const router = useRouter();
  const [items, setItems] = useState<EntrySummary[] | null>(null);
  const [trash, setTrash] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState<EntrySummary | null>(null);

  const filterField = type.fields.find((f) => f.key === type.filterField) as Extract<Field, { kind: "segmented" }> | undefined;
  const optionLabel = (v: string) => filterField?.options.find((o) => o.value === v)?.label ?? "";
  const editHref = (id: string) => `/admin?view=${type.view}&item=${id}`;

  const load = useCallback(async () => {
    try {
      const r = await adminApi<{ items: EntrySummary[] }>(`entries?type=${type.id}${trash ? "&trash=1" : ""}`);
      setItems(r.items);
    } catch (e) {
      toast.error((e as Error).message);
      setItems([]);
    }
  }, [type.id, trash]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- טעינה מהשרת בכל החלפת סל/רשימה
    load();
    window.addEventListener(ENTRIES_CHANGED, load);
    return () => window.removeEventListener(ENTRIES_CHANGED, load);
  }, [load]);

  const shown = useMemo(
    () =>
      (items ?? []).filter(
        (i) => (!filter || i.filter === filter) && (!q || i.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [items, filter, q],
  );
  const sortable = !trash && !q && !filter;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    if (!items || !e.over || e.active.id === e.over.id) return;
    const next = arrayMove(items, items.findIndex((i) => i.id === e.active.id), items.findIndex((i) => i.id === e.over!.id));
    setItems(next);
    try {
      await adminApi("reorder", { body: { type: type.id, ids: next.map((i) => i.id) } });
      toast.success("הסדר נשמר");
    } catch (err) {
      toast.error((err as Error).message);
      load();
    }
  };

  const act = async (item: EntrySummary, action: "unpublish" | "trash" | "untrash") => {
    if (action === "unpublish" && !confirmUnpublish) {
      setConfirmUnpublish(item);
      return;
    }
    try {
      await adminApi(`status/${item.id}`, { body: { action } });
      if (action === "trash") {
        toast.success(`״${item.title}״ ${type.feminine ? "הועברה" : "הועבר"} לסל המיחזור`, {
          action: { label: "בטל", onClick: () => adminApi(`status/${item.id}`, { body: { action: "untrash" } }).then(load) },
        });
      } else if (action === "untrash") {
        toast.success("שוחזר מהסל");
      } else {
        toast.success("הפרסום בוטל. הפריט נשמר כטיוטה");
      }
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const create = async () => {
    setCreating(true);
    try {
      const { id } = await adminApi<{ id: string }>("entries", { body: { type: type.id } });
      router.push(editHref(id));
    } catch (e) {
      toast.error((e as Error).message);
      setCreating(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש" aria-label={`חיפוש ${type.plural}`} className="pr-9" />
        </div>
        {filterField && (
          <div role="radiogroup" aria-label={filterField.label} className="inline-flex flex-wrap gap-1 rounded-md bg-muted p-1">
            {[{ value: "", label: "הכל" }, ...filterField.options].map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={filter === o.value}
                onClick={() => setFilter(o.value)}
                className={cn("rounded px-3 py-1 text-sm", filter === o.value ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Switch id="trash" dir="rtl" checked={trash} onCheckedChange={(c) => (setTrash(c), setItems(null))} />
          <Label htmlFor="trash" className="font-normal">סל המיחזור</Label>
        </div>
        <div className="flex-1" />
        {!trash && (
          <Button onClick={create} disabled={creating}>
            <Plus className="size-4" /> {type.singular} {type.feminine ? "חדשה" : "חדש"}
          </Button>
        )}
      </div>

      {items === null ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : shown.length === 0 ? (
        trash ? (
          <EmptyView text="הסל ריק. פריט שנמחק מגיע לכאן, ואפשר לשחזר אותו." />
        ) : items.length === 0 ? (
          <EmptyView
            text={`עוד אין ${type.plural}.`}
            action={<Button onClick={create} disabled={creating}><Plus className="size-4" /> {type.singular} {type.feminine ? "ראשונה" : "ראשון"}</Button>}
          />
        ) : (
          <EmptyView text="לא נמצא פריט שמתאים לחיפוש." action={<Button variant="outline" onClick={() => (setQ(""), setFilter(""))}>ניקוי החיפוש</Button>} />
        )
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {shown.length} {type.plural}
            {sortable && shown.length > 1 && " · גררו כרטיס כדי לשנות את הסדר באתר"}
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={shown.map((i) => i.id)} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {shown.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    href={editHref(item.id)}
                    filterLabel={filter ? "" : optionLabel(item.filter)}
                    sortable={sortable}
                    onAction={(a) => act(item, a)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}

      <Dialog open={!!confirmUnpublish} onOpenChange={(o) => !o && setConfirmUnpublish(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>לבטל את הפרסום של ״{confirmUnpublish?.title}״?</DialogTitle>
            <DialogDescription>הוא ייעלם מהאתר מיד, אבל לא יימחק. אפשר לפרסם שוב בכל רגע.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="destructive"
              onClick={() => {
                const item = confirmUnpublish!;
                act(item, "unpublish").finally(() => setConfirmUnpublish(null));
              }}
            >
              ביטול פרסום
            </Button>
            <Button variant="outline" onClick={() => setConfirmUnpublish(null)}>חזרה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
