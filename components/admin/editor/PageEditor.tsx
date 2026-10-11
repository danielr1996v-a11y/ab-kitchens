"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Loader2, Monitor, MoreHorizontal, Redo2, Smartphone, Tablet, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/admin/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/admin/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { adminApi } from "@/lib/admin/api";
import { cn } from "@/lib/admin/cn";
import { nodeCss } from "@/lib/site/nodeCss";
import type { SiteNode } from "@/lib/site/tree";
import type { EntryFull } from "@/lib/admin/entries";
import type { Seo } from "@/lib/admin/schema";
import StatusBadge from "@/components/admin/StatusBadge";
import SeoPanel from "@/components/admin/fields/SeoPanel";
import ElementPanel, { type ElementEdit } from "./ElementPanel";
import StructurePanel from "./StructurePanel";
import { findNode, isSimpleText, pathTo, updateNode } from "./treeOps";
import LayoutPanel from "./LayoutPanel";
import AddPanel from "./AddPanel";
import { canMove, deleteNode, duplicateNode, insertAfter, makeNode, moveNode, setStyle, toggleHide, type AddKind } from "./ops";
import { brandColors } from "@/lib/tokens";

/**
 * העורך הוויזואלי - המפרט §8, שלב 6א.
 *
 * סרגל עליון: חזרה · שם וסטטוס · מכשיר · בטל/החזר · שמירה · פרסום.
 * במרכז: העמוד האמיתי ב-iframe, במצב עריכה (הטיוטה, עם סימון לבחירה).
 * בצד: מבנה / אלמנט / עמוד. ("הוספה" - שלב 6ב.)
 *
 * ⚠️ שמירה אוטומטית לטיוטה. האתר לא משתנה עד "פרסום".
 */

type Device = "desktop" | "tablet" | "mobile";
/* רוחבי התצוגה - ADMIN-SPEC §4: נקודות השבירה של האתר הן 900 ו-700 */
const WIDTH: Record<Device, number> = { desktop: 1440, tablet: 900, mobile: 390 };
const DEVICE_LABEL: Record<Device, string> = { desktop: "מחשב", tablet: "טאבלט", mobile: "טלפון" };
const AUTOSAVE_MS = 1000;
/* הקלדה רצופה = צעד אחד בביטול, ולא צעד לכל אות */
const UNDO_GROUP_MS = 800;
/* מחוץ לרכיב: נקרא רק מתוך פעולות משתמש, לא ברינדור */
const clock = () => Date.now();

type PageData = { title: string; path?: string; seo?: Seo; doc: { id: string; kind: string; nodes: SiteNode[] } };
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export default function PageEditor({ id, canLayout, backHref }: { id: string; canLayout: boolean; backHref: string }) {
  const [entry, setEntry] = useState<EntryFull | null>(null);
  const [nodes, setNodes] = useState<SiteNode[]>([]);
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [seo, setSeo] = useState<Seo>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("element");
  const [device, setDevice] = useState<Device>("desktop");
  const [save, setSave] = useState<SaveState>("idle");
  const [frameKey, setFrameKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [past, setPast] = useState<SiteNode[][]>([]);
  /* צבעי המותג כפי שהם באתר - נקראים מה-iframe (LayoutPanel) */
  const [palette, setPalette] = useState<Record<string, string>>({});
  const [future, setFuture] = useState<SiteNode[][]>([]);

  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 1000, h: 700 });
  const revision = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEdit = useRef(0);
  /* שינוי שאי אפשר להראות חי (טקסט עם הדגשה בתוכו, ביטול) - טעינה מחדש אחרי השמירה */
  const needsReload = useRef(false);
  const scrollY = useRef(0);
  const isPartRef = useRef(false);
  const latest = useRef({ nodes, title, path, seo });
  useLayoutEffect(() => {
    latest.current = { nodes, title, path, seo };
  }, [nodes, title, path, seo]);

  /* ===== טעינה ===== */

  const load = useCallback(async () => {
    const { entry } = await adminApi<{ entry: EntryFull }>(`page/${id}`);
    const d = entry.data as unknown as PageData;
    revision.current = entry.revision;
    setEntry(entry);
    setNodes(d.doc.nodes);
    setTitle(d.title);
    setPath(d.path ?? "");
    setSeo(d.seo ?? {});
  }, [id]);

  useEffect(() => {
    /* מצב עריכה קודם, ורק אחריו העמוד - אחרת ה-iframe נטען בלי הטיוטה */
    adminApi("edit-mode", { body: { on: true } })
      .then(load)
      .then(() => setReady(true))
      .catch((e) => toast.error((e as Error).message));
  }, [load]);

  /* גודל הבמה - כדי להקטין את העמוד כשהוא רחב ממנה.
     ⚠️ תלוי ב-entry: עד שהוא נטען הבמה לא קיימת (מסך "טוען"), ומדידה
     שרצה פעם אחת בהתחלה נשארה על ברירת המחדל - נמדד: 968px במקום 1088 */
  const loaded = entry !== null;
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStageSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [loaded]);

  /* ===== הודעות מהעמוד ===== */

  const post = useCallback((m: object) => frame.current?.contentWindow?.postMessage({ source: "abk-editor", ...m }, location.origin), []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.source !== "abk-page") return;
      if (e.data.type === "select") {
        /* בעריכת חלק משותף (כרטיס, באנר): הלחיצה בעמוד פוגעת ברכיב של
           העמוד ולא של החלק - בוחרים את החלק עצמו */
        const own = latest.current.nodes;
        const hit = e.data.id && findNode(own, e.data.id);
        setSelected(hit || !isPartRef.current ? e.data.id : own[0]?.id ?? null);
        setTab("element");
      } else if (e.data.type === "ready") {
        try {
          const cs = getComputedStyle(frame.current!.contentDocument!.documentElement);
          setPalette(Object.fromEntries(brandColors.map((c) => [c.name, cs.getPropertyValue(c.name).trim()])));
        } catch {}
        /* אחרי טעינה מחדש - חזרה לאותו מקום בעמוד ולאותה בחירה */
        post({ type: "scroll", y: scrollY.current });
        if (selected) post({ type: "select", id: selected, quiet: true });
      } else if (e.data.type === "scroll") {
        scrollY.current = e.data.y;
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [post, selected]);

  /* ===== שמירה ===== */

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const { nodes, title, path, seo } = latest.current;
    setSave("saving");
    try {
      const res = await adminApi<{ revision: number; updatedAt: string }>(`page-draft/${id}`, {
        body: { revision: revision.current, nodes, title, path, seo },
      });
      revision.current = res.revision;
      setEntry((e) => (e ? { ...e, revision: res.revision, hasDraft: true } : e));
      setSave("saved");
      if (needsReload.current) {
        needsReload.current = false;
        setFrameKey((k) => k + 1);
      }
    } catch (e) {
      setSave("error");
      toast.error((e as Error).message);
      throw e;
    }
  }, [id]);

  const schedule = useCallback(() => {
    setSave("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush().catch(() => {}), AUTOSAVE_MS);
  }, [flush]);

  /* אזהרה לפני יציאה עם שינויים שלא נשמרו (המפרט §6) */
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save === "dirty" || save === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  /* ===== עריכה ===== */

  /* reload: שינוי מבנה - העמוד נטען מחדש אחרי השמירה */
  const commit = (next: SiteNode[], reload = false) => {
    const now = clock();
    if (reload) needsReload.current = true;
    if (reload || now - lastEdit.current > UNDO_GROUP_MS) {
      setPast((p) => [...p.slice(-49), nodes]);
      setFuture([]);
    }
    lastEdit.current = now;
    setNodes(next);
    schedule();
  };

  const onEdit = (nodeId: string, edit: ElementEdit) => {
    if (edit.kind === "text") {
      const next = updateNode(nodes, edit.leafId, (n) => ({ ...n, props: { ...n.props, text: edit.text } }));
      /* הורה עם עלה טקסט יחיד - מעדכנים בעמוד מיד. אחרת אחרי השמירה */
      const trail = pathTo(next, edit.leafId);
      const parent = trail?.[trail.length - 2];
      if (parent && isSimpleText(parent)) post({ type: "text", id: parent.id, text: edit.text });
      else needsReload.current = true;
      commit(next);
    } else if (edit.kind === "image") {
      post({ type: "image", id: nodeId, src: edit.src, alt: edit.alt });
      commit(updateNode(nodes, nodeId, (n) => ({ ...n, props: { ...n.props, attrs: { ...n.props?.attrs, src: edit.src, alt: edit.alt } } })));
    } else {
      commit(updateNode(nodes, nodeId, (n) => ({ ...n, props: { ...n.props, attrs: { ...n.props?.attrs, href: edit.href } } })));
    }
  };

  /* ===== מבנה ועיצוב (שלב 6ב, מנהל בלבד) ===== */

  const onStyle = (nodeId: string, prop: string, value: string | null) => commit(setStyle(nodes, nodeId, device, prop, value));
  const onHide = (nodeId: string, d: "desktop" | "tablet" | "mobile") => commit(toggleHide(nodes, nodeId, d));
  const onMove = (nodeId: string, dir: -1 | 1) => commit(moveNode(nodes, nodeId, dir), true);
  const onDuplicate = (nodeId: string) => {
    const r = duplicateNode(nodes, nodeId);
    commit(r.nodes, true);
    if (r.newId) setSelected(r.newId);
  };
  const onDelete = (nodeId: string) => {
    commit(deleteNode(nodes, nodeId), true);
    setSelected(null);
    toast("האלמנט נמחק", { action: { label: "בטל", onClick: () => undoRef.current() } });
  };
  const onAdd = (kind: AddKind, image?: { src: string; alt: string }) => {
    const node = makeNode(kind, image);
    commit(insertAfter(nodes, selected, node), true);
    setSelected(node.id);
    setTab("element");
  };

  const select = (nodeId: string) => {
    setSelected(nodeId);
    post({ type: "select", id: nodeId });
  };

  const undoRef = useRef<() => void>(() => {});
  const undo = () => {
    if (!past.length) return;
    setFuture((f) => [nodes, ...f]);
    setNodes(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    lastEdit.current = 0;
    needsReload.current = true;
    schedule();
  };
  const redo = () => {
    if (!future.length) return;
    setPast((p) => [...p, nodes]);
    setNodes(future[0]);
    setFuture((f) => f.slice(1));
    lastEdit.current = 0;
    needsReload.current = true;
    schedule();
  };

  useLayoutEffect(() => {
    undoRef.current = undo;
    isPartRef.current = entry?.type === "part";
  });

  /* קיצורי מקלדת: Cmd/Ctrl+Z ביטול, Shift+Cmd/Ctrl+Z החזרה - מחוץ לשדות */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const field = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if (field || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* העיצוב מהעורך - נשלח לעמוד חי (שלב 6ב משתמש בזה) */
  useEffect(() => {
    if (!ready) return;
    /* אלמנטים שקיבלו עיצוב עכשיו עוד אין להם מחלקת n-<id> בעמוד - הגשר
       מוסיף אותה, כדי שהעיצוב ייראה מיד בלי טעינה מחדש */
    const ids: string[] = [];
    const walk = (l: SiteNode[]) => l.forEach((n) => ((n.style || n.hide) && ids.push(n.id), n.children && walk(n.children)));
    walk(nodes);
    post({ type: "css", css: nodeCss(nodes), ids });
  }, [nodes, ready, post]);

  /* ===== פרסום ===== */

  const publish = async () => {
    try {
      if (save === "dirty" || timer.current) await flush();
      const res = await adminApi<{ revision: number }>(`page-publish/${id}`, { body: { revision: revision.current } });
      revision.current = res.revision;
      toast.success("פורסם באתר");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const discard = async () => {
    try {
      if (timer.current) clearTimeout(timer.current);
      await adminApi(`page-discard/${id}`, { body: {} });
      await load();
      setPast([]);
      setFuture([]);
      setSave("idle");
      setFrameKey((k) => k + 1);
      toast.success("הטיוטה בוטלה. העמוד חזר לגרסה שבאתר");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!entry) {
    return <div className="grid h-screen place-items-center text-sm text-muted-foreground">טוען את העורך…</div>;
  }

  const isPart = entry.type === "part";
  /* חלק משותף מוצג על עמוד אמיתי שבו הוא מופיע */
  const PART_PREVIEW: Record<string, string> = { "part-designerCta": "/designers", "part-leadBanner": "/גלריה/כפרי" };
  const previewPath = isPart ? PART_PREVIEW[id] ?? "/contact" : entry.publishedPath || path || "/";
  const width = WIDTH[device];
  const scale = Math.min(1, (stageSize.w - 32) / width);
  const pending = entry.hasDraft || entry.status === "draft";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ===== סרגל עליון ===== */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3">
        <Button asChild variant="ghost" size="icon" aria-label="חזרה לרשימת העמודים">
          <Link href={backHref}><ArrowRight className="size-4" /></Link>
        </Button>
        <div className="grid min-w-0">
          <h1 className="truncate text-sm font-bold">{title}</h1>
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

        <div className="flex-1" />

        {/* בורר מכשיר */}
        <div role="radiogroup" aria-label="תצוגה לפי מכשיר" className="flex rounded-md bg-muted p-1">
          {(Object.keys(WIDTH) as Device[]).map((d) => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            return (
              <Tooltip key={d}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={device === d}
                    aria-label={DEVICE_LABEL[d]}
                    onClick={() => setDevice(d)}
                    className={cn("grid size-8 place-items-center rounded", device === d ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Icon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{DEVICE_LABEL[d]} · {WIDTH[d]}px</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex-1" />

        <Button variant="ghost" size="icon" onClick={undo} disabled={!past.length} aria-label="ביטול">
          <Undo2 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!future.length} aria-label="החזרה">
          <Redo2 className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => flush().catch(() => {})} disabled={save !== "dirty"}>
          שמירה
        </Button>
        <Button size="sm" onClick={publish} disabled={!pending && save === "idle"}>
          פרסום
        </Button>
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="עוד פעולות"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={previewPath} target="_blank" rel="noopener"><ExternalLink className="size-4" /> העמוד באתר</a>
            </DropdownMenuItem>
            {entry.hasDraft && (
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDiscard(true)}>ביטול כל השינויים שלא פורסמו</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ===== פאנל צד ===== */}
        <aside className="flex w-80 shrink-0 flex-col border-l bg-background">
          <Tabs value={tab} onValueChange={setTab} dir="rtl" className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList className={cn("m-2 grid", canLayout ? "grid-cols-4" : "grid-cols-3")}>
              <TabsTrigger value="structure">מבנה</TabsTrigger>
              {canLayout && <TabsTrigger value="add">הוספה</TabsTrigger>}
              <TabsTrigger value="element">אלמנט</TabsTrigger>
              <TabsTrigger value="page">עמוד</TabsTrigger>
            </TabsList>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <TabsContent value="structure">
                <StructurePanel nodes={nodes} selectedId={selected} onSelect={select} />
              </TabsContent>
              {canLayout && (
                <TabsContent value="add">
                  <AddPanel onAdd={onAdd} hasSelection={!!selected && !!findNode(nodes, selected)} />
                </TabsContent>
              )}
              <TabsContent value="element">
                <ElementPanel
                  nodes={nodes}
                  selectedId={selected}
                  onEdit={onEdit}
                  onSelect={select}
                  onWidgetData={(nid, data) => commit(updateNode(nodes, nid, (n) => ({ ...n, settings: { ...n.settings, data } })), true)}
                  layoutSlot={(() => {
                    const node = selected ? findNode(nodes, selected) : null;
                    if (!canLayout || !node) return null;
                    return (
                      <LayoutPanel
                        node={node}
                        device={device}
                        palette={palette}
                        onStyle={(p, v) => onStyle(node.id, p, v)}
                        onHide={(d) => onHide(node.id, d)}
                        onMove={(dir) => onMove(node.id, dir)}
                        onDuplicate={() => onDuplicate(node.id)}
                        onDelete={() => onDelete(node.id)}
                        canMoveUp={canMove(nodes, node.id, -1)}
                        canMoveDown={canMove(nodes, node.id, 1)}
                      />
                    );
                  })()}
                />
              </TabsContent>
              <TabsContent value="page" className="grid gap-6 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="page-title">שם העמוד במערכת</Label>
                  <Input id="page-title" value={title} disabled={!canLayout} onChange={(e) => (setTitle(e.target.value), schedule())} />
                </div>
                {!isPart && canLayout && (
                  <SeoPanel
                    path={path}
                    publishedPath={entry.publishedPath}
                    seo={seo}
                    fallbackTitle={title}
                    fallbackDescription=""
                    onPath={(p) => (path === "/" ? undefined : (setPath(p), schedule()))}
                    onSeo={(s) => (setSeo(s), schedule())}
                  />
                )}
                {!canLayout && <p className="text-sm text-muted-foreground">כתובת העמוד והגדרות גוגל - דרך דניאל.</p>}
              </TabsContent>
            </div>
          </Tabs>
        </aside>

        {/* ===== הבמה: העמוד האמיתי ===== */}
        <main ref={stage} className="relative min-w-0 flex-1 overflow-hidden bg-muted/60">
          {ready && (
            <div
              className="absolute top-4 origin-top bg-white shadow-sm"
              style={{
                width,
                height: (stageSize.h - 32) / scale,
                insetInlineStart: "50%",
                transform: `translateX(50%) scale(${scale})`,
              }}
            >
              <iframe
                key={frameKey}
                ref={frame}
                src={previewPath}
                title={`תצוגת עריכה: ${title}`}
                className="size-full border-0"
              />
            </div>
          )}
        </main>
      </div>

      <Dialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>לבטל את כל השינויים שלא פורסמו?</DialogTitle>
            <DialogDescription>העמוד בעורך יחזור להיות בדיוק כמו באתר עכשיו. אי אפשר לשחזר את הטיוטה אחרי זה.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="destructive" onClick={() => (setConfirmDiscard(false), discard())}>ביטול השינויים</Button>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>חזרה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
