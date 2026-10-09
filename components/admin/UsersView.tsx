"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/admin/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { adminApi } from "@/lib/admin/api";
import { ROLES, roleInfo, type Role } from "@/lib/admin/roles";
import type { UserRow } from "@/lib/admin/users";
import { cn } from "@/lib/admin/cn";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("he-IL", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

/** הסטטוס כתגית - ⚠️ תגית היא לא כפתור (המפרט §6) */
function StatusBadge({ u }: { u: UserRow }) {
  if (!u.active) return <Badge variant="outline" className="text-muted-foreground">מושבת</Badge>;
  if (!u.hasPassword) return <Badge variant="secondary" className="bg-amber-100 text-amber-900">ממתין לכניסה ראשונה</Badge>;
  return <Badge variant="secondary" className="bg-emerald-100 text-emerald-900">פעיל</Badge>;
}

/** הקישור מוצג פעם אחת בלבד - הוא לא נשמר בשום מקום */
function LinkDialog({ link, onClose }: { link: { url: string; expires: string; who: string } | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={!!link} onOpenChange={(o) => !o && (onClose(), setCopied(false))}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>קישור כניסה עבור {link?.who}</DialogTitle>
          <DialogDescription>
            שלחו את הקישור בוואטסאפ או במייל. בפתיחה בוחרים סיסמה, והקישור מפסיק לעבוד.
            תקף עד {link && fmtDate(link.expires)}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={link?.url ?? ""} dir="ltr" className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(link?.url ?? "");
              setCopied(true);
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "הועתק" : "העתקה"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          ⚠️ הקישור לא יוצג שוב. אם הלך לאיבוד - יוצרים חדש מתפריט ⋯ של המשתמש.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function RolePicker({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div role="radiogroup" aria-label="תפקיד" className="grid gap-2">
      {ROLES.map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={value === r}
          onClick={() => onChange(r)}
          className={cn(
            "grid gap-1 rounded-md border p-3 text-start transition-colors",
            value === r ? "border-primary bg-primary/5" : "hover:bg-accent",
          )}
        >
          <span className="text-sm font-medium">{roleInfo[r].label}</span>
          <span className="text-xs text-muted-foreground">{roleInfo[r].explain}</span>
        </button>
      ))}
    </div>
  );
}

export default function UsersView({ me }: { me: string }) {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [link, setLink] = useState<{ url: string; expires: string; who: string } | null>(null);
  const [confirm, setConfirm] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers((await adminApi<{ users: UserRow[] }>("users")).users);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- טעינה ראשונית מהשרת
    load();
  }, [load]);

  const patch = async (u: UserRow, body: Record<string, unknown>, done: string) => {
    try {
      await adminApi(`users/${encodeURIComponent(u.email)}`, { method: "PATCH", body });
      toast.success(done);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const newLink = async (u: UserRow) => {
    try {
      const r = await adminApi<{ link: string; expires: string }>(`user-link/${encodeURIComponent(u.email)}`, { body: {} });
      setLink({ url: r.link, expires: r.expires, who: u.name || u.email });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  /* minmax(0,1fr): בלי זה פריט גריד לא מתכווץ מתחת לרוחב הטבלה,
     והעמוד כולו נמתח בטלפון (נמדד: 510px במסך של 390) */
  return (
    <div className="grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">מי יכול להיכנס למערכת, ומה כל אחד רשאי לעשות.</p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" /> משתמש חדש
        </Button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">שם</TableHead>
                <TableHead className="hidden text-start md:table-cell">מייל</TableHead>
                <TableHead className="text-start">תפקיד</TableHead>
                <TableHead className="text-start">סטטוס</TableHead>
                <TableHead className="w-12"><span className="sr-only">פעולות</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users === null && !error && (
                <TableRow><TableCell colSpan={5} className="text-muted-foreground">טוען…</TableCell></TableRow>
              )}
              {users?.map((u) => {
                const self = u.email === me;
                return (
                  <TableRow key={u.email}>
                    <TableCell className="font-medium">
                      {u.name || "—"} {self && <span className="text-xs text-muted-foreground">(את/ה)</span>}
                      {/* בטלפון המייל יורד מתחת לשם במקום עמודה משלו */}
                      <span dir="ltr" className="block truncate text-end text-xs font-normal text-muted-foreground md:hidden">{u.email}</span>
                    </TableCell>
                    <TableCell dir="ltr" className="hidden text-end text-muted-foreground md:table-cell">{u.email}</TableCell>
                    <TableCell>{roleInfo[u.role].label}</TableCell>
                    <TableCell><StatusBadge u={u} /></TableCell>
                    <TableCell>
                      <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`פעולות עבור ${u.name || u.email}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onSelect={() => newLink(u)}>
                            {u.hasPassword ? "קישור לאיפוס סיסמה" : "קישור כניסה חדש"}
                          </DropdownMenuItem>
                          {!self && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-xs text-muted-foreground">תפקיד</DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={u.role}
                                onValueChange={(r) => r !== u.role && patch(u, { role: r }, "התפקיד עודכן")}
                              >
                                {ROLES.map((r) => (
                                  <DropdownMenuRadioItem key={r} value={r}>{roleInfo[r].label}</DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                              <DropdownMenuSeparator />
                              {u.active ? (
                                <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(u)}>השבתה</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onSelect={() => patch(u, { active: true }, "המשתמש הופעל מחדש")}>הפעלה מחדש</DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <section aria-labelledby="roles-title" className="grid gap-3">
        <h2 id="roles-title" className="text-sm font-semibold">מה כל תפקיד רשאי</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {ROLES.map((r) => (
            <Card key={r} className="py-4">
              <CardContent className="grid gap-1 px-4">
                <p className="text-sm font-medium">{roleInfo[r].label}</p>
                <p className="text-sm text-muted-foreground">{roleInfo[r].explain}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CreateUserSheet
        open={creating}
        onOpenChange={setCreating}
        onCreated={(l) => {
          setCreating(false);
          setLink(l);
          load();
        }}
      />
      <LinkDialog link={link} onClose={() => setLink(null)} />

      {/* פעולה מסוכנת: modal (המפרט §6) */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>להשבית את {confirm?.name || confirm?.email}?</DialogTitle>
            <DialogDescription>
              הכניסה תיחסם מיד, גם אם הוא מחובר עכשיו. אפשר להפעיל מחדש בכל רגע, ושום תוכן לא נמחק.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm) patch(confirm, { active: false }, "המשתמש הושבת");
                setConfirm(null);
              }}
            >
              השבתה
            </Button>
            <Button variant="outline" onClick={() => setConfirm(null)}>ביטול</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** יצירה: מגירה (המפרט §6 - יצירה ועריכה בינונית) */
function CreateUserSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (link: { url: string; expires: string; who: string }) => void;
}) {
  const [role, setRole] = useState<Role>("content");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /* ⚠️ נשמר לפני ה-await: אחרי המתנה currentTarget כבר null */
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const r = await adminApi<{ link: string; expires: string }>("users", {
        body: { name: f.get("name"), email: f.get("email"), role },
      });
      onCreated({ url: r.link, expires: r.expires, who: String(f.get("name") || f.get("email")) });
      form.reset();
      setRole("content");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full gap-0 sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle>משתמש חדש</SheetTitle>
          <SheetDescription>אחרי השמירה יוצג קישור כניסה חד-פעמי לשליחה.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="grid gap-5 px-4">
          <div className="grid gap-2">
            <Label htmlFor="nu-name">שם</Label>
            <Input id="nu-name" name="name" autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nu-email">מייל</Label>
            <Input id="nu-email" name="email" type="email" dir="ltr" required autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <Label>תפקיד</Label>
            <RolePicker value={role} onChange={setRole} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? "יוצרים…" : "יצירה וקבלת קישור"}</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
