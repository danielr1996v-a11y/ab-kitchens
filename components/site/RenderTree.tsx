import { createElement, Fragment, ViewTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { SiteNode } from "@/lib/site/tree";
import { renderWidget, type RenderContext } from "./widgets";

/**
 * מרנדר עץ אלמנטים ל-HTML - המפרט §1: "האתר הציבורי מרונדר כ-HTML
 * בצד השרת, מעץ אלמנטים". server component.
 *
 * ⚠️ התוצר חייב להיות **זהה** ל-HTML שהעמוד הוציא לפני ההעברה
 * (נבדק בהשוואה, שלב 5ד). לכן כל מה שהיה רכיב React - קישור פנימי,
 * תמונה, כניסה למסך, מעבר משותף - חוזר להיות אותו רכיב, ולא תגית
 * HTML פשוטה שנראית אותו דבר אבל מתנהגת אחרת.
 */

/* ===== HTML → React: שמות מאפיינים ===== */

const RENAME: Record<string, string> = {
  for: "htmlFor",
  tabindex: "tabIndex",
  srcset: "srcSet",
  fetchpriority: "fetchPriority",
  crossorigin: "crossOrigin",
  autocomplete: "autoComplete",
  inputmode: "inputMode",
  maxlength: "maxLength",
  minlength: "minLength",
  readonly: "readOnly",
  novalidate: "noValidate",
  datetime: "dateTime",
  referrerpolicy: "referrerPolicy",
  allowfullscreen: "allowFullScreen",
  frameborder: "frameBorder",
  enterkeyhint: "enterKeyHint",
  spellcheck: "spellCheck",
  colspan: "colSpan",
  rowspan: "rowSpan",
  /* SVG - React כותב אותם camelCase ומוציא אותם במקף */
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "stop-color": "stopColor",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
};

/* מאפיינים בוליאניים: ב-HTML הם "" או השם עצמו */
const BOOLEAN = new Set(["hidden", "open", "disabled", "required", "noValidate", "readOnly", "autoPlay", "muted", "loop", "playsInline", "allowFullScreen", "checked", "multiple", "selected"]);

function styleObject(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop) continue;
    /* משתני CSS (--x) נשארים כמו שהם; השאר camelCase */
    out[prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return out;
}

export function reactProps(node: SiteNode): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const className = node.classes?.length ? node.classes.join(" ") : undefined;
  const attrs = node.props?.attrs ?? {};
  /* class במקום שבו הוא הופיע במקור (סימון ריק ב-attrs), אחרת ראשון */
  if (className && !("class" in attrs)) props.className = className;
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") {
      if (className) props.className = className;
      continue;
    }
    if (k === "style") {
      props.style = styleObject(v);
      continue;
    }
    const name = RENAME[k] ?? k;
    props[name] = BOOLEAN.has(name) ? true : v;
  }
  return props;
}

/* ===== הרינדור ===== */

function renderNode(node: SiteNode, ctx: RenderContext): ReactNode {
  /* עלה טקסטואלי - טקסט נקי, בלי עוטף */
  if (node.type === "text" && !node.tag) return node.props?.text ?? "";

  let el: ReactNode;
  const props = reactProps(node);
  const kids = node.children?.length ? node.children.map((c) => <Fragment key={c.id}>{renderNode(c, ctx)}</Fragment>) : undefined;

  if (node.type === "widget") {
    el = renderWidget(node, ctx);
  } else if (node.type === "html") {
    el = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: node.props?.json ?? "" }} />;
  } else if (node.type === "icon") {
    el = createElement("svg", { ...props, dangerouslySetInnerHTML: { __html: node.props?.svg ?? "" } });
  } else if (node.type === "image" && node.props?.attrs?.["data-nimg"]) {
    el = <NextImage node={node} />;
  } else if (node.tag === "a" && isInternal(node.props?.attrs?.href)) {
    const { href, ...rest } = props as { href: string };
    el = (
      <Link href={href} {...rest}>
        {kids}
      </Link>
    );
  } else if (node.settings?.reveal && node.tag === "div") {
    el = (
      <Reveal className={(props.className as string) ?? ""} threshold={node.settings.reveal.threshold}>
        {kids}
      </Reveal>
    );
  } else {
    el = createElement(node.tag ?? "div", props, kids);
  }

  if (node.settings?.viewTransition) {
    el = <ViewTransition name={node.settings.viewTransition}>{el}</ViewTransition>;
  }
  return el;
}

const isInternal = (href?: string) => !!href && href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/api/");

/** תמונה של next/image - חוזרת להיות next/image, כולל fill ו-priority */
function NextImage({ node }: { node: SiteNode }) {
  const a = node.props?.attrs ?? {};
  const fill = a["data-nimg"] === "fill";
  /* ⚠️ תמונה עם priority לא נושאת ב-HTML של Next 16 שום סימן משלה -
     הסימן הוא **היעדר** loading. תמונה רגילה תמיד מקבלת loading="lazy",
     ו-eager מופיע במפורש. (נמצא בהשוואה: בלי זה ההירו נטען עצל.)
     fetchPriority נכתב ב-camelCase גם ב-HTML */
  const fp = a.fetchPriority ?? a.fetchpriority;
  const priority = fp === "high" || !a.loading;
  return (
    <Image
      src={a.src}
      alt={a.alt ?? ""}
      className={node.classes?.join(" ") || undefined}
      sizes={a.sizes}
      {...(fill ? { fill: true } : { width: Number(a.width), height: Number(a.height) })}
      {...(priority ? { priority: true } : a.loading === "eager" ? { loading: "eager" as const } : {})}
      {...(!priority && (fp === "low" || fp === "auto") ? { fetchPriority: fp } : {})}
      {...(a["aria-hidden"] ? { "aria-hidden": a["aria-hidden"] as "true" } : {})}
    />
  );
}

export default function RenderTree({ nodes }: { nodes: SiteNode[] }) {
  const ctx: RenderContext = { nodes };
  return (
    <>
      {nodes.map((n) => (
        <Fragment key={n.id}>{renderNode(n, ctx)}</Fragment>
      ))}
    </>
  );
}
