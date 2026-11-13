"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { listBuilds } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { BuildSession } from "@/types/build";

/* ─── SVG Icons ──────────────────────────────────────────── */

const IconHome = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5H16V15h-8v6.5H4.5A1.5 1.5 0 013 20v-9.5z" />
  </svg>
);
const IconGame = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h4M8 10v4M15 11h.01M18 13h.01M6.5 8h11a4.5 4.5 0 014.32 5.68l-1.04 4.16A3 3 0 0117.9 19.5H6.1a3 3 0 01-2.88-1.66L2.18 13.68A4.5 4.5 0 016.5 8z" />
  </svg>
);
const IconVideo = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);
const IconSlides = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM12 16v3M8 21h8M10 9l3 2-3 2V9z" />
  </svg>
);
const IconResource = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M15.5 8.5l-2 5.5-5.5 2 2-5.5z" />
  </svg>
);
const IconProject = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 6a2 2 0 01-2-2V3h20v1a2 2 0 01-2 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M9 11h6M9 15h4" />
  </svg>
);
const IconClock = () => (
  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

/* ─── Nav config ──────────────────────────────────────────── */

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "首页", icon: <IconHome />, exact: true },
  { href: "/games", label: "游戏", icon: <IconGame /> },
  { href: "/videos", label: "视频", icon: <IconVideo /> },
  { href: "/slides", label: "幻灯片", icon: <IconSlides /> },
  { href: "/resources", label: "资源", icon: <IconResource /> },
  { href: "/projects", label: "项目", icon: <IconProject /> },
  { href: "/scheduled", label: "定时任务", icon: <IconClock /> },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/* ─── Workspace mock ──────────────────────────────────────── */

const WORKSPACE = { name: "Victor's Atoms", initial: "V" };

/* ─── Component ───────────────────────────────────────────── */

/**
 * 侧边栏（Client）：
 * - 工作区选择器（顶部）
 * - 导航 + 最近项目
 * - 底部积分 / 设置 / 用户条
 */
export function Sidebar() {
  const pathname = usePathname();
  const [recent, setRecent] = useState<BuildSession[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listBuilds(5)
      .then((items) => { if (!cancelled) setRecent(items); })
      .catch(() => {/* 静默 */});
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden
        />
      )}

      {/* Mobile toggle button */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="fixed left-2 top-2 z-30 rounded-md border bg-card p-1.5 text-xs shadow-sm lg:hidden"
          aria-label="展开侧边栏"
        >
          ☰
        </button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[300px] flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          collapsed && "-translate-x-full lg:hidden",
        )}
      >
        {/* ── Logo row ── */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
            A
          </span>
          <span className="text-sm font-medium text-foreground">Atoms</span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="ml-auto rounded p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="收起侧边栏"
          >
            ✕
          </button>
        </div>

        {/* ── Workspace selector ── */}
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            {WORKSPACE.initial}
          </span>
          <span className="truncate font-medium text-foreground">{WORKSPACE.name}</span>
          <svg className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
          </svg>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                    )}
                  >
                    <span aria-hidden className="shrink-0">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Recent builds */}
          {recent.length > 0 && (
            <div className="mt-6 px-3">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                最近构建
              </h3>
              <ul className="mt-2 flex flex-col gap-1">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/build/${r.id}`}
                      className="block truncate rounded-md px-2 py-1.5 text-xs text-muted-foreground transition hover:bg-card hover:text-foreground"
                      title={r.prompt}
                    >
                      {r.prompt.length > 30 ? `${r.prompt.slice(0, 29)}…` : r.prompt}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* ── Bottom: credits + settings + user ── */}
        <div className="shrink-0 border-t border-border px-3 py-3">
          {/* Credits bar */}
          <div className="mb-2 flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs">
            <span className="text-muted-foreground">积分额度</span>
            <span className="font-semibold text-foreground">∞ 内测</span>
          </div>
          {/* User row */}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
              {WORKSPACE.initial}
            </span>
            <span className="flex-1 truncate text-xs font-medium text-foreground">{WORKSPACE.name}</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
