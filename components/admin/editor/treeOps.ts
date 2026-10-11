import type { NodeType, SiteNode } from "@/lib/site/tree";

/** פעולות על העץ בעורך. בלי מצב - כל פעולה מחזירה עץ חדש */

export function findNode(nodes: SiteNode[], id: string): SiteNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findNode(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

/** השרשרת מהשורש עד האלמנט - לפירורי הלחם בפאנל */
export function pathTo(nodes: SiteNode[], id: string, trail: SiteNode[] = []): SiteNode[] | null {
  for (const n of nodes) {
    if (n.id === id) return [...trail, n];
    if (n.children) {
      const p = pathTo(n.children, id, [...trail, n]);
      if (p) return p;
    }
  }
  return null;
}

export function updateNode(nodes: SiteNode[], id: string, fn: (n: SiteNode) => SiteNode): SiteNode[] {
  return nodes.map((n) => {
    if (n.id === id) return fn(n);
    if (n.children) return { ...n, children: updateNode(n.children, id, fn) };
    return n;
  });
}

/** עלי הטקסט שמתחת לאלמנט, בסדר הופעתם. לא נכנס לרכיבים נעולים ול-svg */
export function textLeaves(node: SiteNode): SiteNode[] {
  if (node.type === "text" && !node.tag) return [node];
  if (node.type === "widget" || node.type === "icon" || node.type === "html") return [];
  return (node.children ?? []).flatMap(textLeaves);
}

/** האלמנט מחזיק עלה טקסט אחד ישירות - אפשר לעדכן אותו חי בעמוד */
export const isSimpleText = (n: SiteNode) => n.children?.length === 1 && n.children[0].type === "text" && !n.children[0].tag;

export const TYPE_LABEL: Record<NodeType, string> = {
  section: "אזור",
  container: "מיכל",
  heading: "כותרת",
  text: "טקסט",
  link: "קישור",
  image: "תמונה",
  icon: "אייקון",
  html: "סימון לגוגל",
  widget: "רכיב נעול",
};

export const WIDGET_LABEL: Record<string, string> = {
  header: "תפריט עליון",
  breadcrumbs: "פירורי לחם",
  leadForm: "טופס פנייה",
  contactForm: "טופס צור קשר",
  designerCta: "כרטיס פגישה עם המעצבת",
  leadBanner: "באנר לידים",
  hero: "סליידר ראשי",
  values: "הערכים שלנו",
  trustedBy: "לוגואים של לקוחות",
  styleGrid: "גריד סגנונות",
  hotspots: "תמונה עם נקודות",
  placeholder: "ממתין לתוכן",
  testimonials: "המלצות",
  googleReviews: "ביקורות גוגל",
  testimonialWall: "קיר ההמלצות",
  videoSlider: "סרטוני לקוחות",
  channelVideos: "סרטוני הערוץ",
  projectStrip: "רצועת פרויקטים",
  projectGallery: "גלריית הסגנון",
  relatedArticles: "מאמרים קשורים",
  articleGrid: "רשימת המאמרים",
  reviewsSchema: "סימון המלצות לגוגל",
  faqSchema: "סימון שאלות לגוגל",
};

/** שם קריא לאלמנט ברשימת המבנה */
export function nodeLabel(n: SiteNode): string {
  if (n.type === "widget") return WIDGET_LABEL[n.settings?.widget ?? ""] ?? "רכיב נעול";
  const text = textLeaves(n).map((l) => l.props?.text ?? "").join(" ").trim();
  const base = TYPE_LABEL[n.type] ?? n.type;
  if (n.type === "image") return `${base}${n.props?.attrs?.alt ? ` · ${n.props.attrs.alt}` : ""}`;
  return text ? `${base} · ${text.slice(0, 40)}${text.length > 40 ? "…" : ""}` : base;
}
