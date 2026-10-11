"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { adminApi } from "@/lib/admin/api";
import type { Lead } from "@/lib/admin/leads";

/**
 * לוח הבקרה - המפרט §7, שלב 7.
 *
 * - פניות חדשות, ו-30 הימים האחרונים מול 30 שלפניהם
 * - גרף עמודות יומי בזהב (#b0832e - עבר את בדיקת dataviz: בהירות,
 *   כרומה וניגוד 3:1; זהב הלוגו עצמו נכשל בכרומה ונקרא כאפור),
 *   סדרה אחת (בלי מקרא - הכותרת אומרת מה זה),
 *   עמודה ≤24px עם קצה מעוגל 4px ובסיס ישר, רווח 2px, ריחוף עם
 *   מספר ותאריך, וטבלה נגישה מוסתרת (dataviz skill)
 * - "נשמר ועדיין לא פורסם", ופניות אחרונות
 */

type Stats = { newCount: number; recent: { day: string; n: number }[]; total30: number; totalPrev30: number };
type Draft = { id: string; kind: string; title: string; at: string; status: string };

const KIND: Record<string, { label: string; href: (id: string) => string }> = {
  page: { label: "עמוד", href: (id) => `/admin/edit?id=${encodeURIComponent(id)}` },
  part: { label: "חלק משותף", href: (id) => `/admin/edit?id=${encodeURIComponent(id)}&back=shared` },
  article: { label: "מאמר", href: (id) => `/admin?view=articles&item=${id}` },
  testimonial: { label: "המלצה", href: (id) => `/admin?view=testimonials&item=${id}` },
  video: { label: "סרטון", href: (id) => `/admin?view=videos&item=${id}` },
  project: { label: "פרויקט", href: (id) => `/admin?view=projects&item=${id}` },
};

const dayLabel = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("he-IL", { day: "numeric", month: "numeric" });
const when = (iso: string) => new Date(iso).toLocaleString("he-IL", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

function Trend({ now, before }: { now: number; before: number }) {
  if (now === before) return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="size-3" /> כמו 30 הימים שלפני</span>;
  const up = now > before;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3" /> {up ? "יותר" : "פחות"} מ-30 הימים שלפני ({before})
    </span>
  );
}

/* ===== הגרף ===== */

const H = 140;
const BAR_MAX = 24;
const GAP = 2;

function LeadsChart({ data }: { data: { day: string; n: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.n));
  /* קנה מידה "עגול" - קווי רשת בשלמים */
  const top = max <= 4 ? max : Math.ceil(max / 2) * 2;
  const W = 600;
  const slot = W / data.length;
  const bar = Math.min(BAR_MAX, slot - GAP);
  const y = (n: number) => H - (n / top) * H;

  return (
    <figure className="grid gap-2">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label="פניות לפי יום ב-30 הימים האחרונים. הנתונים המלאים בטבלה שמתחת.">
          {/* קו בסיס וקו עליון - שיער, אפור, לא מקווקו */}
          <line x1={0} x2={W} y1={H} y2={H} stroke="var(--border)" strokeWidth={1} />
          <line x1={0} x2={W} y1={0} y2={0} stroke="var(--border)" strokeWidth={1} opacity={0.6} />
          {data.map((d, i) => {
            /* RTL: הזמן זורם מימין לשמאל - הישן בימין, היום בשמאל */
            const xi = data.length - 1 - i;
            const x = xi * slot + (slot - bar) / 2;
            const h = H - y(d.n);
            const r = Math.min(4, h);
            return (
              <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* יעד ריחוף בגובה מלא - גדול מהעמודה */}
                <rect x={xi * slot} y={0} width={slot} height={H} fill="transparent" />
                {d.n > 0 && (
                  <path
                    /* קצה מעוגל 4px, בסיס ישר על קו האפס */
                    d={`M${x},${H} V${H - h + r} Q${x},${H - h} ${x + r},${H - h} H${x + bar - r} Q${x + bar},${H - h} ${x + bar},${H - h + r} V${H} Z`}
                    fill="var(--chart)"
                    opacity={hover === null || hover === i ? 1 : 0.45}
                  />
                )}
              </g>
            );
          })}
          {/* תוויות ציר: התחלה וסוף בלבד */}
          <text x={W} y={H + 16} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">{dayLabel(data[0].day)}</text>
          <text x={0} y={H + 16} textAnchor="start" fontSize={11} fill="var(--muted-foreground)">{dayLabel(data[data.length - 1].day)}</text>
          <text x={W} y={10} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">{top}</text>
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs shadow-sm"
            style={{ left: `${((data.length - 1 - hover + 0.5) / data.length) * 100}%`, top: 0 }}
            role="status"
          >
            <span className="font-medium">{data[hover].n}</span> <span className="text-muted-foreground">· {dayLabel(data[hover].day)}</span>
          </div>
        )}
      </div>
      {/* טבלה נגישה - אותם נתונים, לקוראי מסך */}
      <table className="sr-only">
        <caption>פניות לפי יום</caption>
        <thead><tr><th>תאריך</th><th>פניות</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.day}><td>{dayLabel(d.day)}</td><td>{d.n}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

export default function DashboardView({ canLeads }: { canLeads: boolean }) {
  const [data, setData] = useState<{ stats: Stats | null; drafts: Draft[]; recentLeads: Lead[] } | null>(null);

  useEffect(() => {
    adminApi<{ stats: Stats | null; drafts: Draft[]; recentLeads: Lead[] }>("dashboard").then(setData).catch(() => setData({ stats: null, drafts: [], recentLeads: [] }));
  }, []);

  if (!data) return <p className="text-sm text-muted-foreground">טוען…</p>;
  const { stats, drafts, recentLeads } = data;

  return (
    <div className="grid max-w-5xl gap-6">
      {canLeads && stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="gap-2">
            <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">פניות חדשות</CardTitle></CardHeader>
            <CardContent className="grid gap-1">
              <span className="text-3xl font-bold tabular-nums">{stats.newCount}</span>
              <Link href="/admin?view=leads" className="text-xs text-brand-ink hover:underline">לכל הפניות ←</Link>
            </CardContent>
          </Card>
          <Card className="gap-2 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-baseline justify-between text-sm font-medium text-muted-foreground">
                <span>פניות ב-30 הימים האחרונים</span>
                <span className="text-2xl font-bold tabular-nums text-foreground">{stats.total30}</span>
              </CardTitle>
              <Trend now={stats.total30} before={stats.totalPrev30} />
            </CardHeader>
            <CardContent>
              <LeadsChart data={stats.recent} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-3">
          <CardHeader><CardTitle className="text-sm">נשמר ועדיין לא פורסם</CardTitle></CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">הכל מפורסם. שינוי שנשמר כטיוטה יופיע כאן עד שיפורסם.</p>
            ) : (
              <ul className="divide-y">
                {drafts.slice(0, 8).map((d) => (
                  <li key={d.id} className="flex items-center gap-2 py-2 text-sm">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">{KIND[d.kind]?.label ?? d.kind}</span>
                    <Link href={KIND[d.kind]?.href(d.id) ?? "/admin"} className="min-w-0 flex-1 truncate hover:underline">{d.title || "ללא שם"}</Link>
                    <span className="shrink-0 text-xs text-muted-foreground">{when(d.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {canLeads && (
          <Card className="gap-3">
            <CardHeader><CardTitle className="text-sm">פניות אחרונות</CardTitle></CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">עוד אין פניות. כל מי שממלא טופס באתר יופיע כאן.</p>
              ) : (
                <ul className="divide-y">
                  {recentLeads.map((l) => (
                    <li key={l.id} className="flex items-center gap-2 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">{l.name}</span>
                      <a href={`tel:${l.phone}`} dir="ltr" className="shrink-0 text-xs text-brand-ink hover:underline">{l.phone}</a>
                      <span className="shrink-0 text-xs text-muted-foreground">{when(l.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
