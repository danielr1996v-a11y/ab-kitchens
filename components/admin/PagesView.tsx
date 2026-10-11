"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, PanelsTopLeft, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { adminApi } from "@/lib/admin/api";
import type { PageSummary } from "@/lib/admin/pageDocs";
import StatusBadge from "./StatusBadge";

/**
 * רשימת העמודים / החלקים המשותפים - כל שורה פותחת את העורך הוויזואלי.
 * kind="page": כל עמודי האתר · kind="part": התפריט העליון והפוטר.
 */
export default function PagesView({ kind }: { kind: "page" | "part" }) {
  const [pages, setPages] = useState<PageSummary[] | null>(null);

  useEffect(() => {
    adminApi<{ pages: PageSummary[] }>("pages")
      .then((r) => setPages(r.pages.filter((p) => p.type === kind)))
      .catch((e) => (toast.error((e as Error).message), setPages([])));
  }, [kind]);

  if (pages === null) return <p className="text-sm text-muted-foreground">טוען…</p>;

  return (
    <div className="grid max-w-4xl gap-4">
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
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/edit?id=${encodeURIComponent(p.id)}${kind === "part" ? "&back=shared" : ""}`}>
                  <PencilLine className="size-4" /> עריכה
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
