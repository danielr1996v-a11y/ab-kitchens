import type { ReactNode } from "react";
import type { SiteNode } from "@/lib/site/tree";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import ContactForm from "@/components/ContactForm";
import DesignerCta from "@/components/DesignerCta";
import LeadBanner from "@/components/LeadBanner";
import Hero from "@/components/Hero";
import Values from "@/components/Values";
import TrustedBy from "@/components/TrustedBy";
import StyleGrid from "@/components/StyleGrid";
import ProjectStrip from "@/components/ProjectStrip";
import Hotspots from "@/components/Hotspots";
import Placeholder from "@/components/Placeholder";
import ChannelVideos from "@/components/ChannelVideos";
import { getVideos } from "@/lib/site/data";
import {
  ArticleGrid,
  FaqSchema,
  GoogleReviews,
  HomeTestimonials,
  ProjectGallery,
  RelatedArticles,
  ReviewsSchema,
  TestimonialWallSection,
  VideoSliderSection,
} from "./blocks";

/**
 * רשימת הרכיבים הנעולים בעץ - ADMIN-SPEC §2.3 (החלטת דניאל 11.10.26:
 * רכיבי ה-React הקיימים נשארים כמו שהם).
 *
 * רכיב נכנס לכאן כשיש לו אחד מאלה:
 *   - התנהגות (סליידר, גרירה, טופס, לשוניות)
 *   - תוכן שנגזר מהמסד (רשימות)
 *   - פלט שנגזר מהתוכן ויתיישן אם יישמר כמו שהוא (JSON-LD)
 *   - סקשן שחוזר בכמה עמודים ושצריך להישאר מקור אחד (כרטיס מעצבת)
 * כל השאר נשאר צמתים רגילים בעץ, כדי שאפשר יהיה לערוך אותו.
 *
 * ⚠️ widget לא מוכר מרונדר כלום ולא מפיל את העמוד.
 */

/** הקשר הרינדור - העמוד כולו, בשביל רכיבים שנגזרים מתוכן העמוד */
export type RenderContext = { nodes: SiteNode[] };

type D = Record<string, unknown>;
type Renderer = (data: D, ctx: RenderContext) => ReactNode;

/* ===== גזירת שאלות ותשובות מהעץ ===== */

function textOf(n: SiteNode): string {
  if (n.type === "text" && !n.tag) return n.props?.text ?? "";
  return (n.children ?? []).map(textOf).join("");
}

function findAll(nodes: SiteNode[], cls: string, out: SiteNode[] = []): SiteNode[] {
  for (const n of nodes) {
    if (n.classes?.includes(cls)) out.push(n);
    if (n.children) findAll(n.children, cls, out);
  }
  return out;
}

/** השאלות שמוצגות בעמוד עצמו - כך ה-JSON-LD לא נפרד מהתוכן */
function faqFromTree(nodes: SiteNode[]) {
  return findAll(nodes, "kfaq__item").map((item) => ({
    q: textOf(findAll(item.children ?? [], "kfaq__q")[0] ?? item).trim(),
    a: textOf(findAll(item.children ?? [], "kfaq__a")[0] ?? item).trim(),
  }));
}

async function ChannelVideosBlock() {
  return <ChannelVideos videos={(await getVideos()).channel} />;
}

const registry: Record<string, Renderer> = {
  breadcrumbs: (d) => <Breadcrumbs trail={(d.trail as Crumb[]) ?? []} className={(d.className as string) ?? ""} />,
  leadForm: (d) => (
    <LeadForm source={String(d.source ?? "")} submitLabel={String(d.submitLabel ?? "")} variant={d.variant === "light" ? "light" : "dark"} />
  ),
  contactForm: () => <ContactForm />,
  designerCta: () => <DesignerCta />,
  leadBanner: (d) => <LeadBanner withForm={d.withForm === true} />,
  /* התוכן של אלה הגיע מ-Sanity ונשמר בעץ כמו שהוא */
  hero: (d) => <Hero slideshow={d.slideshow as never} />,
  values: (d) => <Values content={d.content as never} />,
  trustedBy: (d) => <TrustedBy content={d.content as never} note={(d.note as string) ?? undefined} />,
  styleGrid: (d) => <StyleGrid content={d.content as never} />,
  hotspots: (d) => <Hotspots {...(d as unknown as Parameters<typeof Hotspots>[0])} />,
  placeholder: (d) => <Placeholder {...(d as unknown as Parameters<typeof Placeholder>[0])} />,
  /* מהמסד */
  testimonials: (d) => <HomeTestimonials showMore={d.showMore as boolean} plain={d.plain as boolean} videoSlot={d.videoSlot as boolean} />,
  googleReviews: () => <GoogleReviews />,
  testimonialWall: () => <TestimonialWallSection />,
  videoSlider: () => <VideoSliderSection />,
  channelVideos: () => <ChannelVideosBlock />,
  projectStrip: () => <ProjectStrip />,
  projectGallery: (d) => <ProjectGallery style={String(d.style)} />,
  relatedArticles: (d) => <RelatedArticles style={String(d.style)} />,
  articleGrid: () => <ArticleGrid />,
  reviewsSchema: () => <ReviewsSchema />,
  faqSchema: (_d, ctx) => <FaqSchema items={faqFromTree(ctx.nodes)} />,
};

export const widgetNames = Object.keys(registry);

export function renderWidget(node: SiteNode, ctx: RenderContext): ReactNode {
  const r = registry[node.settings?.widget ?? ""];
  return r ? r(node.settings?.data ?? {}, ctx) : null;
}
