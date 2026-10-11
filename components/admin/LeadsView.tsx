"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, MessageSquare, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Switch } from "@/components/admin/ui/switch";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { adminApi } from "@/lib/admin/api";
import { cn } from "@/lib/admin/cn";
import type { Lead, LeadStatus } from "@/lib/admin/leads";
import EmptyView from "./EmptyView";

/**
 * פניות - המפרט §7, שלב 7. טבלה עם סטטוס (חדשה / בטיפול / טופלה),
 * הערה, סל מיחזור, וייצוא לאקסל.
 */

const STATUS: { v: Exclude<LeadStatus, "trash">; l: string; cls: string }[] = [
  { v: "new", l: "חדשה", cls: "bg-sky-100 text-sky-900" },
  { v: "in_progress", l: "בטיפול", cls: "bg-amber-100 text-amber-900" },
  { v: "done", l: "טופלה", cls: "bg-emerald-100 text-emerald-900" },
];

const when = (iso: string) => new Date(iso).toLocaleString("he-IL", { day: "numeric", month: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function LeadsView({ canDelete }: { canDelete: boolean }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [trash, setTrash] = useState(false);
  const [filter, setFilter] = useState<LeadStatus | "">("");
  const [open, setOpen] = useState<Lead | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(() => {
    adminApi<{ leads: Lead[] }>(`leads${trash ? "?trash=1" : ""}`)
      .then((r) => setLeads(r.leads))
      .catch((e) => (toast.error((e as Error).message), setLeads([])));
  }, [trash]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (l: Lead, body: { status?: LeadStatus; note?: string }, msg?: string, undo?: () => void) => {
    try {
      await adminApi(`lead/${l.id}`, { method: "PATCH", body });
      if (msg) toast.success(msg, undo ? { action: { label: "בטל", onClick: undo } } : undefined);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const shown = (leads ?? []).filter((l) => !filter || l.status === filter);

  return (
    <div className="grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {!trash && (
          <div role="radiogroup" aria-label="סינון לפי סטטוס" className="inline-flex gap-1 rounded-md bg-muted p-1">
            {[{ v: "" as const, l: "הכל" }, ...STATUS].map((s) => (
              <button key={s.v} type="button" role="radio" aria-checked={filter === s.v} onClick={() => setFilter(s.v)} className={cn("rounded px-3 py-1 text-sm", filter === s.v ? "bg-background font-medium shadow-sm" : "text-muted-foreground")}>
                {s.l}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Switch id="lead-trash" dir="rtl" checked={trash} onCheckedChange={(c) => (setTrash(c), setLeads(null))} />
          <Label htmlFor="lead-trash" className="font-normal">סל המיחזור</Label>
        </div>
        <div className="flex-1" />
        {!trash && (
          <Button asChild variant="outline" size="sm">
            <a href="/api/admin/leads.csv"><Download className="size-4" /> ייצוא לאקסל</a>
          </Button>
        )}
      </div>

      {leads === null ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : shown.length === 0 ? (
        <EmptyView text={trash ? "הסל ריק." : leads.length ? "אין פניות בסטטוס הזה." : "עוד אין פניות. כל מי שממלא טופס באתר יופיע כאן, גם אם המייל לא נשלח."} />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">מתי</TableHead>
                  <TableHead className="text-start">שם</TableHead>
                  <TableHead className="text-start">טלפון</TableHead>
                  <TableHead className="hidden text-start md:table-cell">מאיפה</TableHead>
                  <TableHead className="text-start">סטטוס</TableHead>
                  <TableHead className="w-24"><span className="sr-only">פעולות</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((l) => (
                  <TableRow key={l.id} className={cn(l.status === "new" && "font-medium")}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{when(l.createdAt)}</TableCell>
                    <TableCell>
                      {l.name}
                      {(l.message || l.note) && <MessageSquare className="ms-1 inline size-3 text-muted-foreground" aria-label="יש הודעה או הערה" />}
                    </TableCell>
                    <TableCell><a href={`tel:${l.phone}`} dir="ltr" className="text-brand-ink hover:underline">{l.phone}</a></TableCell>
                    <TableCell className="hidden max-w-48 truncate text-xs text-muted-foreground md:table-cell">{l.source}{!l.emailed && <span title="המייל לא נשלח - הפנייה שמורה כאן"> · בלי מייל</span>}</TableCell>
                    <TableCell>
                      {trash ? (
                        <span className="text-xs text-muted-foreground">בסל</span>
                      ) : (
                        <select
                          aria-label={`סטטוס של ${l.name}`}
                          value={l.status}
                          onChange={(e) => patch(l, { status: e.target.value as LeadStatus })}
                          className={cn("rounded-md border-0 px-2 py-1 text-xs", STATUS.find((s) => s.v === l.status)?.cls)}
                        >
                          {STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                        </select>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => (setOpen(l), setNote(l.note))}>פרטים</Button>
                        {trash ? (
                          <>
                            <Button variant="ghost" size="icon" aria-label="שחזור" onClick={() => patch(l, { status: "new" }, "הפנייה שוחזרה")}><Undo2 className="size-4" /></Button>
                            {canDelete && (
                              <Button variant="ghost" size="icon" aria-label="מחיקה לצמיתות" className="text-destructive" onClick={() => adminApi(`lead-delete/${l.id}`, { body: {} }).then(() => (toast.success("נמחקה לצמיתות"), load())).catch((e) => toast.error((e as Error).message))}>
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button variant="ghost" size="icon" aria-label="העברה לסל" onClick={() => patch(l, { status: "trash" }, "הפנייה הועברה לסל", () => patch(l, { status: l.status }))}>
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* פרטי פנייה + הערה */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{open?.name}</DialogTitle>
            <DialogDescription>
              {open && when(open.createdAt)} · {open?.source}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <a href={`tel:${open?.phone}`} dir="ltr" className="w-fit text-brand-ink hover:underline">{open?.phone}</a>
            {open?.message && <p className="whitespace-pre-wrap rounded-md bg-muted p-3">{open.message}</p>}
            <div className="grid gap-1.5">
              <Label htmlFor="lead-note">הערה פנימית</Label>
              <Textarea id="lead-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="למשל: חזרתי אליו, קבענו פגישה ביום שלישי" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button onClick={() => open && patch(open, { note }, "ההערה נשמרה").then(() => setOpen(null))}>שמירה</Button>
            <Button variant="outline" onClick={() => setOpen(null)}>סגירה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
