"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { cn } from "@/lib/admin/cn";
import type { MediaItem } from "@/lib/admin/media";

/**
 * בוחר תמונה עם העלאה (המפרט §6).
 *
 * ⚠️ התמונה מוקטנת **בדפדפן** לפני ההעלאה: צילום מטלפון הוא 4-12MB,
 * ו-Vercel דוחה בקשה מעל 4.5MB. 2400px ב-JPEG 90% יוצא 1-2MB, והשרת
 * ממיר אחר כך ל-WebP ומוריד את המטא-דאטה.
 */

const MAX_SIDE = 2400;

async function shrink(file: File): Promise<Blob> {
  if (file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    return blob ?? file;
  } catch {
    /* דפדפן שלא יודע לפענח (למשל HEIC בכרום) - נשלח כמו שהוא,
       והשרת יחזיר הודעה ברורה */
    return file;
  }
}

export async function uploadFile(file: File): Promise<MediaItem> {
  const body = new FormData();
  body.append("file", await shrink(file), file.name);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "ההעלאה נכשלה. נסו שוב");
  return data.item;
}

function MediaPicker({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || items) return;
    fetch("/api/admin/media", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.media ?? []))
      .catch(() => setItems([]));
  }, [open, items]);

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const item = await uploadFile(file);
      toast.success("התמונה הועלתה");
      onPick(item.url);
      onOpenChange(false);
      setItems((prev) => (prev ? [item, ...prev] : prev));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const shown = (items ?? []).filter((m) => !q || m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[85vh] grid-rows-[auto_auto_1fr] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>בחירת תמונה</DialogTitle>
          <DialogDescription>מהספרייה, או העלאה של תמונה חדשה מהמחשב או מהטלפון.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-40 flex-1">
            <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם קובץ" className="pr-9" />
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {busy ? "מעלה…" : "העלאה"}
          </Button>
        </div>
        <div className="overflow-y-auto">
          {items === null ? (
            <p className="py-8 text-center text-sm text-muted-foreground">טוען…</p>
          ) : shown.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{q ? "לא נמצאה תמונה בשם הזה" : "עוד אין תמונות. העלו את הראשונה"}</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {shown.map((m) => (
                <li key={m.url}>
                  <button
                    type="button"
                    onClick={() => (onPick(m.url), onOpenChange(false))}
                    className="group grid w-full gap-1 rounded-md p-1 text-start hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- תצוגה במערכת */}
                    <img src={m.url} alt="" loading="lazy" className="aspect-square w-full rounded object-cover" />
                    <span className="truncate text-xs text-muted-foreground" dir="ltr">{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ImageField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "grid size-28 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted text-muted-foreground",
          "hover:border-primary focus-visible:outline-2 focus-visible:outline-ring",
        )}
        aria-label={value ? "החלפת התמונה" : "בחירת תמונה"}
      >
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element -- תצוגה במערכת */
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-6" />
        )}
      </button>
      <div className="grid gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "החלפה" : "בחירת תמונה"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange("")}>
            <X className="size-4" /> הסרה
          </Button>
        )}
      </div>
      <MediaPicker open={open} onOpenChange={setOpen} onPick={onChange} />
    </div>
  );
}
