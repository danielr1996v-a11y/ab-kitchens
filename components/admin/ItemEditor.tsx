"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/admin/ui/dropdown-menu";
import { adminApi } from "@/lib/admin/api";
import { displayTitle, type ContentType, type Seo } from "@/lib/admin/schema";
import { missingRequired } from "@/lib/admin/sanitize";
import type { EntryFull } from "@/lib/admin/entries";
import { FieldList, addKeys, stripKeys } from "./fields/FieldInput";
import SeoPanel from "./fields/SeoPanel";
import StatusBadge from "./StatusBadge";
import { ENTRIES_CHANGED } from "./ItemsView";

/**
 * עורך פריט - מסך מלא (המפרט §6: "תוכן עשיר: מסך מלא").
 *
 * ⚠️ שמירה אוטומטית לטיוטה, שנייה אחרי שמפסיקים להקליד, עם "✓ נשמר".
 * האתר לא משתנה עד "פרסום". כך אברהם לא יכול לשבור את האתר תוך כדי
 * עבודה, וגם לא לאבד עבודה כי שכח לשמור.
 */

type Values = Record<string, unknown>;
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 1000;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("he-IL", { day: "numeric", month: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function ItemEditor({ type, id, backHref }: { type: ContentType; id: string; backHref: string }) {
  const router = useRouter();
  const [entry, setEntry] = useState<EntryFull | null>(null);
  const [loadError, setLoadError] = useState("");
  const [values, setValues] = useState<Values>({});
  const [path, setPath] = useState("");
  const [seo, setSeo] = useState<Seo>({});
  const [save, setSave] = useState<SaveState>("idle");
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<null | "unpublish" | { revisionId: number; when: string }>(null);
  const [tab, setTab] = useState("general");
  /* מספר הגרסה שהשרת מכיר - נשלח בכל שמירה (בדיקת התנגשות) */
  const revision = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<Promise<void> | null>(null);
  /* הערכים העדכניים לשמירה שתרוץ אחרי השהיה - ref ולא state, כדי
     שהשמירה לא תשלח ערכים ישנים שנסגרו בתוך הטיימר */
  const latest = useRef({ values, path, seo });
  useLayoutEffect(() => {
    latest.current = { values, path, seo };
  }, [values, path, seo]);

  const load = useCallback(async () => {
    try {
      const { entry } = await adminApi<{ entry: EntryFull }>(`entry/${id}`);
      revision.current = entry.revision;
      setEntry(entry);
      setValues(addKeys(entry.data.fields));
      setPath(entry.data.path ?? "");
      setSeo(entry.data.seo ?? {});
      setSave("idle");
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- טעינה ראשונית מהשרת
    load();
  }, [load]);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inflight.current) await inflight.current;
    const { values, path, seo } = latest.current;
    const run = (async () => {
      setSave("saving");
      try {
        const res = await adminApi<{ revision: number; updatedAt: string }>(`draft/${id}`, {
          body: { revision: revision.current, data: { fields: stripKeys(values), path, seo } },
        });
        revision.current = res.revision;
        setEntry((e) => (e ? { ...e, revision: res.revision, hasDraft: e.status === "publish", updatedAt: res.updatedAt } : e));
        setSave("saved");
      } catch (e) {
        setSave("error");
        toast.error((e as Error).message);
        throw e;
      }
    })();
    inflight.current = run.catch(() => {}).finally(() => (inflight.current = null));
    return run;
  }, [id]);

  const schedule = () => {
    setSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush().catch(() => {}), AUTOSAVE_MS);
  };

  /* אזהרה לפני יציאה עם שינויים שלא נשמרו (המפרט §6) */
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save === "dirty" || save === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  if (loadError) {
    return (
      <Card className="max-w-xl">
        <CardContent className="grid gap-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button asChild variant="outline" className="w-fit"><Link href={backHref}>חזרה לרשימה</Link></Button>
        </CardContent>
      </Card>
    );
  }
  if (!entry) return <p className="text-sm text-muted-foreground">טוען…</p>;

  const plainValues = stripKeys(values);
  const title = displayTitle(type, plainValues);
  const excerpt = typeof plainValues.excerpt === "string" ? plainValues.excerpt : "";

  const publish = async () => {
    const missing = missingRequired(type.fields, plainValues);
    if (type.hasPage && !path.trim()) missing.push("כתובת העמוד");
    if (missing.length) {
      setErrors(new Set(missing));
      toast.error(`חסר כדי לפרסם: ${missing.join(" · ")}`);
      if (missing.includes("כתובת העמוד") && missing.length === 1) setTab("seo");
      return;
    }
    setErrors(new Set());
    try {
      await flush();
      const res = await adminApi<{ revision: number; redirectedFrom: string }>(`publish/${id}`, { body: { revision: revision.current } });
      revision.current = res.revision;
      toast.success(res.redirectedFrom ? `פורסם. הכתובת הקודמת מפנה לחדשה` : "פורסם באתר");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const setStatus = async (action: "unpublish" | "trash") => {
    try {
      await flush();
      await adminApi(`status/${id}`, { body: { action } });
      if (action === "trash") {
        /* ניווט בתוך האפליקציה ולא טעינה מחדש: ה-toast עם "בטל"
           צריך לשרוד את המעבר לרשימה */
        toast.success(`${type.singular} ${type.feminine ? "הועברה" : "הועבר"} לסל המיחזור`, {
          action: {
            label: "בטל",
            onClick: () =>
              adminApi(`status/${id}`, { body: { action: "untrash" } }).then(() => window.dispatchEvent(new Event(ENTRIES_CHANGED))),
          },
        });
        router.push(backHref);
        return;
      }
      toast.success("הפרסום בוטל. הפריט נשמר כטיוטה");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const restore = async (revisionId: number) => {
    try {
      await flush();
      await adminApi(`restore/${id}`, { body: { revisionId, revision: revision.current } });
      toast.success("הגרסה שוחזרה לטיוטה. בדקו ולחצו פרסום");
      setTab("general");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const unpublished = entry.status === "draft";
  const changesPending = entry.hasDraft || (unpublished && save !== "idle");

  return (
    <div className="grid max-w-4xl gap-6">
      {/* שורת שמירה דביקה - מסך ארוך (המפרט §6) */}
      <div className="sticky top-14 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <Button asChild variant="ghost" size="icon" aria-label="חזרה לרשימה">
          <Link href={backHref}><ArrowRight className="size-4" /></Link>
        </Button>
        <div className="grid min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge status={entry.status} hasDraft={entry.hasDraft} />
            <span aria-live="polite">
              {save === "saving" && <><Loader2 className="inline size-3 animate-spin" /> שומר…</>}
              {save === "saved" && <><Check className="inline size-3" /> נשמר כטיוטה</>}
              {save === "dirty" && "שינויים לא שמורים"}
              {save === "error" && <span className="text-destructive">השמירה נכשלה</span>}
            </span>
          </div>
        </div>
        {type.hasPage && entry.status === "publish" && (
          <Button asChild variant="ghost" size="sm">
            <a href={entry.publishedPath} target="_blank" rel="noopener"><ExternalLink className="size-4" /> צפייה באתר</a>
          </Button>
        )}
        <Button onClick={publish} disabled={save === "saving" || (!changesPending && !unpublished)}>
          {unpublished ? "פרסום" : "פרסום השינויים"}
        </Button>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="עוד פעולות"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {entry.status === "publish" && <DropdownMenuItem onSelect={() => setConfirm("unpublish")}>ביטול פרסום</DropdownMenuItem>}
            <DropdownMenuItem variant="destructive" onSelect={() => setStatus("trash")}>העברה לסל המיחזור</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={tab} onValueChange={setTab} dir="rtl">
        <TabsList>
          <TabsTrigger value="general">הגדרות כלליות</TabsTrigger>
          {type.hasPage && <TabsTrigger value="seo">כתובת וגוגל</TabsTrigger>}
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="pt-4">
          <Card>
            <CardContent>
              <FieldList
                fields={type.fields}
                values={values}
                errors={errors}
                onChange={(next) => {
                  setValues(next);
                  schedule();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {type.hasPage && (
          <TabsContent value="seo" className="pt-4">
            <Card>
              <CardContent>
                <SeoPanel
                  path={path}
                  publishedPath={entry.publishedPath}
                  seo={seo}
                  fallbackTitle={title}
                  fallbackDescription={excerpt}
                  onPath={(p) => {
                    setPath(p);
                    schedule();
                  }}
                  onSeo={(s) => {
                    setSeo(s);
                    schedule();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="history" className="pt-4">
          <History id={id} live={entry.status === "publish"} onRestore={(revisionId, when) => setConfirm({ revisionId, when })} refreshKey={entry.revision} />
        </TabsContent>
      </Tabs>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent dir="rtl">
          {confirm === "unpublish" ? (
            <DialogHeader>
              <DialogTitle>לבטל את הפרסום?</DialogTitle>
              <DialogDescription>{type.feminine ? "היא תיעלם מהאתר מיד, אבל לא תימחק" : "הוא ייעלם מהאתר מיד, אבל לא יימחק"}. אפשר לפרסם שוב בכל רגע.</DialogDescription>
            </DialogHeader>
          ) : (
            <DialogHeader>
              <DialogTitle>לשחזר את הגרסה מ-{confirm && fmt(confirm.when)}?</DialogTitle>
              <DialogDescription>הגרסה תיכנס לטיוטה. האתר לא ישתנה עד שתלחצו ״פרסום״.</DialogDescription>
            </DialogHeader>
          )}
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              variant={confirm === "unpublish" ? "destructive" : "default"}
              onClick={() => {
                const c = confirm;
                setConfirm(null);
                if (c === "unpublish") setStatus("unpublish");
                else if (c) restore(c.revisionId);
              }}
            >
              {confirm === "unpublish" ? "ביטול פרסום" : "שחזור לטיוטה"}
            </Button>
            <Button variant="outline" onClick={() => setConfirm(null)}>חזרה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function History({ id, live, onRestore, refreshKey }: { id: string; live: boolean; onRestore: (revisionId: number, when: string) => void; refreshKey: number }) {
  const [rows, setRows] = useState<{ id: number; author: string; createdAt: string; title: string }[] | null>(null);
  useEffect(() => {
    adminApi<{ revisions: typeof rows }>(`history/${id}`).then((r) => setRows(r.revisions)).catch(() => setRows([]));
  }, [id, refreshKey]);

  if (rows === null) return <p className="text-sm text-muted-foreground">טוען…</p>;
  if (!rows.length) return <p className="text-sm text-muted-foreground">עוד לא פורסם. כל פרסום נשמר כאן כגרסה, ואפשר לחזור אליה.</p>;
  return (
    <Card className="py-0">
      <CardContent className="px-0">
        <ol className="divide-y">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <div className="grid flex-1 gap-0.5">
                <span className="text-sm">{fmt(r.createdAt)} {i === 0 && live && <span className="text-xs text-muted-foreground">· באתר עכשיו</span>}</span>
                <span className="text-xs text-muted-foreground">{r.author} · {r.title}</span>
              </div>
              {(i > 0 || !live) && <Button variant="outline" size="sm" onClick={() => onRestore(r.id, r.createdAt)}>שחזור</Button>}
            </li>
          ))}
        </ol>
        <p className="border-t px-4 py-3 text-xs text-muted-foreground">נשמרות 20 הגרסאות האחרונות.</p>
      </CardContent>
    </Card>
  );
}
