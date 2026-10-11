"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, Heading, Image as ImageIcon, Link2, Lock, Square, SquareDashed, Type, Shapes, Code } from "lucide-react";
import type { NodeType, SiteNode } from "@/lib/site/tree";
import { cn } from "@/lib/admin/cn";
import { nodeLabel, pathTo } from "./treeOps";

/**
 * לשונית "מבנה" - העמוד כרשימה מקוננת (המפרט §8). לחיצה בוחרת את
 * האלמנט ומגלגלת אליו בעמוד. עלי טקסט לא מוצגים - הם נערכים מתוך
 * האלמנט שמחזיק אותם.
 */

const ICON: Record<NodeType, typeof Square> = {
  section: Square,
  container: SquareDashed,
  heading: Heading,
  text: Type,
  link: Link2,
  image: ImageIcon,
  icon: Shapes,
  html: Code,
  widget: Lock,
};

const visible = (n: SiteNode) => !(n.type === "text" && !n.tag) && n.type !== "html";

function Row({ node, depth, selectedId, open, toggle, onSelect }: { node: SiteNode; depth: number; selectedId: string | null; open: Set<string>; toggle: (id: string) => void; onSelect: (id: string) => void }) {
  const kids = (node.children ?? []).filter(visible);
  const expandable = kids.length > 0 && node.type !== "widget" && node.type !== "icon";
  const isOpen = open.has(node.id);
  const Icon = ICON[node.type];
  return (
    <li>
      <div
        className={cn(
          "flex h-8 items-center gap-1 rounded-md pe-2 text-sm",
          selectedId === node.id ? "bg-primary/10 font-medium text-brand-ink" : "hover:bg-accent",
        )}
        style={{ paddingInlineStart: `${depth * 14 + 4}px` }}
      >
        {expandable ? (
          <button type="button" className="grid size-5 place-items-center text-muted-foreground" onClick={() => toggle(node.id)} aria-label={isOpen ? "סגירה" : "פתיחה"} aria-expanded={isOpen}>
            {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </button>
        ) : (
          <span className="size-5" />
        )}
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-start" onClick={() => onSelect(node.id)}>
          <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <span className="truncate">{nodeLabel(node)}</span>
          {node.hide && Object.values(node.hide).some(Boolean) && <span className="ms-auto shrink-0 text-xs text-muted-foreground">מוסתר</span>}
        </button>
      </div>
      {expandable && isOpen && (
        <ul>
          {kids.map((k) => (
            <Row key={k.id} node={k} depth={depth + 1} selectedId={selectedId} open={open} toggle={toggle} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function StructurePanel({ nodes, selectedId, onSelect }: { nodes: SiteNode[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [closed, setClosed] = useState<Set<string>>(new Set());
  /* האלמנט שנבחר בעמוד - הענפים שמעליו נפתחים לבד, אלא אם סגרו אותם ידנית */
  const trail = selectedId ? pathTo(nodes, selectedId) : null;
  const effective = new Set(open);
  trail?.slice(0, -1).forEach((n) => !closed.has(n.id) && effective.add(n.id));
  const toggle = (id: string) => {
    const wasOpen = effective.has(id);
    setOpen((prev) => {
      const next = new Set(prev);
      if (wasOpen) next.delete(id);
      else next.add(id);
      return next;
    });
    setClosed((prev) => {
      const next = new Set(prev);
      if (wasOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  return (
    <ul className="p-2" aria-label="מבנה העמוד">
      {nodes.filter(visible).map((n) => (
        <Row key={n.id} node={n} depth={0} selectedId={selectedId} open={effective} toggle={toggle} onSelect={onSelect} />
      ))}
    </ul>
  );
}
