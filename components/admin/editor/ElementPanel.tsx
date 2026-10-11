"use client";

import { Lock, MousePointerClick } from "lucide-react";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";
import { Label } from "@/components/admin/ui/label";
import ImageField from "@/components/admin/fields/ImageField";
import type { SiteNode } from "@/lib/site/tree";
import { nodeLabel, pathTo, textLeaves, TYPE_LABEL, WIDGET_LABEL } from "./treeOps";
import DataForm from "./DataForm";
import Link from "next/link";

/**
 * לשונית "אלמנט" - מה שנבחר בעמוד (המפרט §8).
 *
 * שלב 6א: טקסט, תמונה וקישור - מה שגם עורך/ת תוכן רשאי לשנות.
 * עיצוב ופריסה (שלב 6ב) יופיעו כאן רק למי שיש לו הרשאה.
 */

export type ElementEdit =
  | { kind: "text"; leafId: string; text: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "href"; href: string };

export default function ElementPanel({
  nodes,
  selectedId,
  onEdit,
  onSelect,
  onWidgetData,
  layoutSlot,
}: {
  nodes: SiteNode[];
  selectedId: string | null;
  onEdit: (id: string, edit: ElementEdit) => void;
  onSelect: (id: string) => void;
  /** תוכן של רכיב נעול (שלב 6ג) */
  onWidgetData: (id: string, data: Record<string, unknown>) => void;
  /** עיצוב ופריסה - רק למנהל (שלב 6ב) */
  layoutSlot?: React.ReactNode;
}) {
  if (!selectedId) {
    return (
      <div className="grid justify-items-center gap-3 px-6 py-12 text-center text-sm text-muted-foreground">
        <MousePointerClick className="size-6" />
        <p>לחצו על כותרת, טקסט או תמונה בעמוד כדי לערוך אותם.</p>
      </div>
    );
  }

  const trail = pathTo(nodes, selectedId);
  if (!trail) {
    return (
      <div className="grid gap-2 px-4 py-6 text-sm">
        <p className="font-medium">זה חלק מהתפריט העליון או מהפוטר</p>
        <p className="text-muted-foreground">הם משותפים לכל האתר, ונערכים במסך &quot;תפריט עליון ופוטר&quot;.</p>
      </div>
    );
  }
  const node = trail[trail.length - 1];

  return (
    <div className="grid gap-5 p-4">
      {/* פירורי לחם - איפה האלמנט בתוך העמוד. לחיצה בוחרת את ההורה */}
      <nav aria-label="מיקום האלמנט" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {trail.map((n, i) => (
          <span key={n.id} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>‹</span>}
            <button type="button" className="rounded px-1 hover:bg-accent hover:text-foreground" onClick={() => onSelect(n.id)}>
              {n.type === "widget" ? WIDGET_LABEL[n.settings?.widget ?? ""] ?? "רכיב" : TYPE_LABEL[n.type]}
            </button>
          </span>
        ))}
      </nav>

      <h3 className="text-sm font-bold">{nodeLabel(node)}</h3>

      {node.type === "widget" ? (
        <WidgetContent node={node} onChange={(d) => onWidgetData(node.id, d)} />
      ) : (
        <ContentFields node={node} onEdit={(e) => onEdit(node.id, e)} />
      )}

      {layoutSlot}
    </div>
  );
}

/* רכיבים שהתוכן שלהם נערך כאן, בטופס שנבנה מהנתונים */
const EDITABLE = new Set(["hero", "values", "trustedBy", "styleGrid", "hotspots", "leadForm", "header", "designerCta", "leadBanner"]);
/* משותפים לכמה עמודים - בעמוד רגיל נערכים בחלק המשותף */
const SHARED: Record<string, string> = { designerCta: "part-designerCta", leadBanner: "part-leadBanner" };

function WidgetContent({ node, onChange }: { node: SiteNode; onChange: (d: Record<string, unknown>) => void }) {
  const name = node.settings?.widget ?? "";
  const data = (node.settings?.data ?? {}) as Record<string, unknown>;
  if (SHARED[name] && !data.content) {
    return (
      <div className="grid gap-2 rounded-md border bg-muted/50 p-3 text-sm">
        <p>הסקשן הזה משותף לכמה עמודים. שינוי בו מתעדכן בכולם.</p>
        <Link className="font-medium text-brand-ink hover:underline" href={`/admin/edit?id=${SHARED[name]}&back=shared`}>
          עריכת {WIDGET_LABEL[name]} ←
        </Link>
      </div>
    );
  }
  if (EDITABLE.has(name) && Object.keys(data).length) {
    return (
      <div className="grid gap-3">
        <p className="text-xs text-muted-foreground">הרכיב עצמו נעול - העיצוב וההתנהגות שלו נשארים. התוכן נערך כאן, והעמוד מתעדכן אחרי השמירה.</p>
        <DataForm data={data} onChange={onChange} />
      </div>
    );
  }
  return (
    <div className="flex gap-3 rounded-md border bg-muted/50 p-3 text-sm">
      <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="grid gap-1">
        <p>רכיב עם התנהגות משלו, שנשאר כמו שהוא.</p>
        <p className="text-muted-foreground">{lockedHint(name)}</p>
      </div>
    </div>
  );
}

/** איפה עורכים את התוכן של רכיב נעול */
function lockedHint(name?: string) {
  if (!name) return "";
  if (["testimonials", "googleReviews", "testimonialWall", "reviewsSchema"].includes(name)) return "התוכן שלו נערך במסך \"המלצות\".";
  if (["videoSlider", "channelVideos"].includes(name)) return "התוכן שלו נערך במסך \"סרטונים\".";
  if (["projectStrip", "projectGallery"].includes(name)) return "התמונות שלו נערכות במסך \"פרויקטים\".";
  if (["relatedArticles", "articleGrid"].includes(name)) return "המאמרים נערכים במסך \"מאמרים\".";
  if (name === "faqSchema") return "נבנה לבד מהשאלות שבעמוד - מספיק לערוך אותן.";
  return "עריכת התוכן שלו תיפתח בהמשך.";
}

function ContentFields({ node, onEdit }: { node: SiteNode; onEdit: (e: ElementEdit) => void }) {
  const leaves = textLeaves(node);
  const attrs = node.props?.attrs ?? {};
  return (
    <div className="grid gap-4">
      {node.type === "image" && (
        <>
          <div className="grid gap-2">
            <Label>תמונה</Label>
            <ImageField id="el-image" value={attrs.src ?? ""} onChange={(src) => src && onEdit({ kind: "image", src, alt: attrs.alt ?? "" })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="el-alt">תיאור התמונה</Label>
            <Input id="el-alt" value={attrs.alt ?? ""} onChange={(e) => onEdit({ kind: "image", src: attrs.src ?? "", alt: e.target.value })} />
            <p className="text-xs text-muted-foreground">מה רואים בתמונה - לקוראי מסך ולגוגל. ריק = קישוט.</p>
          </div>
        </>
      )}

      {node.type === "link" && (
        <div className="grid gap-2">
          <Label htmlFor="el-href">לאן הקישור מוביל</Label>
          <Input id="el-href" dir="ltr" value={attrs.href ?? ""} onChange={(e) => onEdit({ kind: "href", href: e.target.value })} />
          <p className="text-xs text-muted-foreground">עמוד באתר (/contact), אתר אחר (https://…), טלפון (tel:…) או מייל (mailto:…).</p>
        </div>
      )}

      {leaves.slice(0, 30).map((leaf, i) => {
        const text = leaf.props?.text ?? "";
        const long = text.length > 60 || node.tag === "p";
        return (
          <div className="grid gap-2" key={leaf.id}>
            <Label htmlFor={`leaf-${leaf.id}`}>{leaves.length > 1 ? `טקסט ${i + 1}` : "טקסט"}</Label>
            {long ? (
              <Textarea id={`leaf-${leaf.id}`} rows={Math.min(10, Math.ceil(text.length / 45) + 1)} value={text} onChange={(e) => onEdit({ kind: "text", leafId: leaf.id, text: e.target.value })} />
            ) : (
              <Input id={`leaf-${leaf.id}`} value={text} onChange={(e) => onEdit({ kind: "text", leafId: leaf.id, text: e.target.value })} />
            )}
          </div>
        );
      })}

      {!leaves.length && node.type !== "image" && node.type !== "link" && (
        <p className="text-sm text-muted-foreground">אין כאן טקסט לעריכה. בחרו אלמנט בתוכו, ברשימת המבנה או בעמוד.</p>
      )}
    </div>
  );
}
