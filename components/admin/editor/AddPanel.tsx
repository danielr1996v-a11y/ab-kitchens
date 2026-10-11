"use client";

import { useState } from "react";
import { Heading, Image as ImageIcon, MousePointerClick, Pilcrow, Square } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Label } from "@/components/admin/ui/label";
import { Input } from "@/components/admin/ui/input";
import ImageField from "@/components/admin/fields/ImageField";
import type { AddKind } from "./ops";

/**
 * לשונית "הוספה" - שלב 6ב, מנהל בלבד. אלמנט חדש נכנס **אחרי האלמנט
 * שנבחר** (או בסוף העמוד), רק מהסוגים הפשוטים שהשרת מקבל.
 */

const KINDS: { kind: AddKind; label: string; hint: string; icon: typeof Square }[] = [
  { kind: "section", label: "אזור חדש", hint: "סקשן ברוחב מלא עם כותרת", icon: Square },
  { kind: "heading", label: "כותרת", hint: "כותרת משנה", icon: Heading },
  { kind: "paragraph", label: "פסקה", hint: "טקסט רגיל", icon: Pilcrow },
  { kind: "button", label: "כפתור", hint: "בזהב של האתר, מוביל לעמוד", icon: MousePointerClick },
  { kind: "image", label: "תמונה", hint: "מהספרייה או העלאה", icon: ImageIcon },
];

export default function AddPanel({ onAdd, hasSelection }: { onAdd: (kind: AddKind, image?: { src: string; alt: string }) => void; hasSelection: boolean }) {
  const [imageMode, setImageMode] = useState(false);
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");

  return (
    <div className="grid gap-3 p-4">
      <p className="text-xs text-muted-foreground">{hasSelection ? "האלמנט החדש ייכנס אחרי האלמנט שנבחר." : "לא נבחר אלמנט - האלמנט החדש ייכנס בסוף העמוד."}</p>
      {KINDS.map((k) => (
        <button
          key={k.kind}
          type="button"
          onClick={() => (k.kind === "image" ? setImageMode(true) : onAdd(k.kind))}
          className="flex items-center gap-3 rounded-md border p-3 text-start hover:border-brand-ink hover:bg-primary/10"
        >
          <k.icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
          <span className="grid">
            <span className="text-sm font-medium">{k.label}</span>
            <span className="text-xs text-muted-foreground">{k.hint}</span>
          </span>
        </button>
      ))}
      {imageMode && (
        <div className="grid gap-3 rounded-md border bg-muted/40 p-3">
          <ImageField id="add-image" value={src} onChange={setSrc} />
          <div className="grid gap-1.5">
            <Label htmlFor="add-alt">תיאור התמונה</Label>
            <Input id="add-alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" disabled={!src} onClick={() => (onAdd("image", { src, alt }), setImageMode(false), setSrc(""), setAlt(""))}>הוספה</Button>
            <Button size="sm" variant="ghost" onClick={() => setImageMode(false)}>ביטול</Button>
          </div>
        </div>
      )}
    </div>
  );
}
