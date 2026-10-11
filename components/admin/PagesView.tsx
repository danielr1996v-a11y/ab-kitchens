"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, PanelsTopLeft, PencilLine, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { adminApi } from "@/lib/admin/api";
import type { PageSummary } from "@/lib/admin/pageDocs";
import StatusBadge from "./StatusBadge";

/**
 * רשימת העמודים / החלקים המשותפים - כל שורה פותחת את העורך הוויזואלי.
 * kind="page": כל עמודי האתר · kind="part": התפריט העליון והפוטר.
 */
export default function PagesView({ kind, canLayout = false }: { kind: "page" | "part"; canLayout?: boolean }) {
  const router = useRouter();
  const [pages, setPages] = useState<PageSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    adminApi<{ pages: PageSummary[] }>("pages")
      .then((r) => setPages(r.pages.filter((p) => p.type === kind)))
      .catch((e) => (toast.error((e as Error).message), setPages([])));
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const { id } = await adminApi<{ id: string }>("page-new", { body: { title: f.get("title"), path: f.get("path") } });
      router.push(`/admin/edit?id=${encodeURIComponent(id)}`);
    } catch (err) {
      toast.error((err as Error).message);
      setBusy(false);
    }
  };

  const trash = async (p: PageSummary) => {
    try {
      await adminApi(`page-status/${encodeURIComponent(p.id)}`, { body: { action: "trash" } });
      toast.success(`״${p.title}״ הועבר לסל המיחזור`, {
        action: { label: "בטל", onClick: () => adminApi(`page-status/${encodeURIComponent(p.id)}`, { body: { action: "untrash" } }).then(load) },
      });
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (pages === null) return <p className="text-sm text-muted-foreground">טוען…</p>;

  return (
    <div className="grid max-w-4xl gap-4">
      {kind === "page" && canLayout && (
        <Button className="w-fit" onClick={() => setCreating(true)}>
          <Plus className="size-4" /> עמוד חדש
        </Button>
      )}
      <p className="text-sm text-muted-foreground">
        {kind === "page"
          ? "לחצו על עמוד כדי לערוך אותו על העמוד עצמו. השינויים נשמרים כטיוטה, והאתר משתנה רק בפרסום."
          : "התפריט העליון והפוטר מופיעים בכל עמוד באתר. שינוי כאן משנה את כל העמודים יחד."}
      </p>
      <Card className="gap-0 py-0">
        <ul className="divide-y">
          {pages.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <PanelsTopLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <div className="grid min-w-0 flex-1 gap-0.5">
                <Link href={`/admin/edit?id=${encodeURIComponent(p.id)}${kind === "part" ? "&back=shared" : ""}`} className="truncate text-sm font-medium hover:underline">
                  {p.title}
                </Link>
                {p.path && <span className="truncate text-xs text-muted-foreground" dir="ltr">{p.path}</span>}
              </div>
              <StatusBadge status={p.status as "publish" | "draft"} hasDraft={p.hasDraft} />
              {p.path && (
                <Button asChild variant="ghost" size="icon" aria-label={`פתיחת ${p.title} באתר`}>
                  <a href={p.path} target="_blank" rel="noopener"><ExternalLink className="size-4" /></a>
                </Button>
              )}
              {canLayout && p.id.startsWith("page-") && (
                <Button variant="ghost" size="icon" aria-label={`העברת ${p.title} לסל המיחזור`} onClick={() => trash(p)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/edit?id=${encodeURIComponent(p.id)}${kind === "part" ? "&back=shared" : ""}`}>
                  <PencilLine className="size-4" /> עריכה
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עמוד חדש</DialogTitle>
            <DialogDescription>העמוד נפתח ריק, עם התפריט והפוטר. הוא לא יופיע באתר עד שתפרסמו אותו.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="np-title">שם העמוד</Label>
              <Input id="np-title" name="title" required autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="np-path">כתובת</Label>
              <Input id="np-path" name="path" placeholder="למשל /מטבחים-לדירות-קטנות" />
              <p className="text-xs text-muted-foreground">ריק = לפי שם העמוד. מילים בעברית, עם מקפים במקום רווחים.</p>
            </div>
            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" disabled={busy}>{busy ? "יוצרים…" : "יצירה ופתיחה בעורך"}</Button>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>ביטול</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
