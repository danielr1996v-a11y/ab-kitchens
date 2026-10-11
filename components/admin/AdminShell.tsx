"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  Clapperboard,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  PanelRightClose,
  PanelRightOpen,
  PanelsTopLeft,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/admin/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/admin/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import { cn } from "@/lib/admin/cn";
import { adminApi } from "@/lib/admin/api";
import { navGroups, findView, type IconName, type ViewId } from "@/lib/admin/nav";
import type { Permission } from "@/lib/admin/roles";

const ICONS: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  FileText,
  MessageSquareQuote,
  Clapperboard,
  Images,
  PanelsTopLeft,
  Menu,
  Inbox,
  Users,
  Settings,
};

/* ===== סיידבר מקופל - נזכר בין ביקורים, לכל משתמש בדפדפן שלו ===== */
const KEY = "abk-admin-collapsed";
const EVT = "abk-admin-collapsed";
const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb);
  return () => window.removeEventListener(EVT, cb);
};
const readCollapsed = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const setCollapsed = (v: boolean) => {
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(EVT));
};

type ShellUser = { email: string; name: string; roleLabel: string };

function NavList({
  permissions,
  current,
  collapsed,
  onNavigate,
}: {
  permissions: Permission[];
  current: ViewId;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="ניווט במערכת" className="grid gap-5">
      {navGroups.map((group, gi) => {
        const views = group.views.filter((v) => !v.permission || permissions.includes(v.permission));
        if (!views.length) return null;
        return (
          <div key={gi} className="grid gap-1">
            {group.label && !collapsed && (
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{group.label}</p>
            )}
            {views.map((v) => {
              const Icon = ICONS[v.icon];
              const active = v.id === current;
              const link = (
                <Link
                  href={v.id === "dashboard" ? "/admin" : `/admin?view=${v.id}`}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? v.label : undefined}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                    "hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-ring",
                    active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  {!collapsed && <span className="truncate">{v.label}</span>}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={v.id}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="left">{v.label}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={v.id}>{link}</div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  user,
  permissions,
  current,
  children,
}: {
  user: ShellUser;
  permissions: Permission[];
  current: ViewId;
  children: React.ReactNode;
}) {
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const view = findView(current);

  const logout = async () => {
    await adminApi("logout", { body: {} }).catch(() => {});
    window.location.href = "/admin/login";
  };

  const brand = (
    <Link href="/admin" className="block truncate px-3 text-sm font-semibold" onClick={() => setMobileOpen(false)}>
      {collapsed ? "א." : "א. בית המטבחים"}
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* ===== סיידבר, מחשב: בצד ימין (תחילת השורה ב-RTL) ===== */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col gap-6 border-l bg-sidebar py-4 md:flex",
          collapsed ? "w-16 px-2" : "w-60 px-3",
        )}
      >
        {brand}
        <div className="flex-1 overflow-y-auto">
          <NavList permissions={permissions} current={current} collapsed={collapsed} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn("justify-start gap-3 text-muted-foreground", collapsed && "justify-center")}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "הרחבת התפריט" : "צמצום התפריט"}
        >
          {collapsed ? <PanelRightOpen className="size-4" /> : <PanelRightClose className="size-4" />}
          {!collapsed && "צמצום"}
        </Button>
      </aside>

      {/* ===== טלפון: מגירה שנסגרת אחרי בחירה ===== */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 gap-6 bg-sidebar px-3 py-4">
          <SheetTitle className="sr-only">ניווט</SheetTitle>
          {/* pr-10: כפתור הסגירה של המגירה יושב בפינה הימנית העליונה,
              ובלי המרווח הוא מכסה את תחילת השם (נראה בצילום 390) */}
          <div className="pr-10">{brand}</div>
          <NavList
            permissions={permissions}
            current={current}
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="פתיחת התפריט"
          >
            <Menu className="size-5" />
          </Button>
          <nav aria-label="מיקום" className="min-w-0 flex-1 truncate text-sm">
            {/* קו תחתון: קישור בתוך שורת טקסט חייב להיראות קישור גם בלי צבע (axe) */}
            <Link href="/admin" className="text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 hover:text-foreground">
              ניהול
            </Link>
            {view.id !== "dashboard" && (
              <>
                <span className="px-2 text-muted-foreground">/</span>
                <span className="font-medium">{view.label}</span>
              </>
            )}
          </nav>
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="max-w-48 truncate">
                {user.name || user.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="grid gap-0.5">
                <span className="truncate">{user.name || user.email}</span>
                <span className="truncate text-xs font-normal text-muted-foreground" dir="ltr">
                  {user.email}
                </span>
                <span className="text-xs font-normal text-muted-foreground">{user.roleLabel}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/" target="_blank" rel="noopener">
                  <ExternalLink className="size-4" /> צפייה באתר
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="size-4" /> יציאה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <h1 className="mb-6 text-2xl font-semibold">{view.label}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
