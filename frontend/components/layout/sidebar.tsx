"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { listBuilds } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { BuildSession } from "@/types/build";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "工作区", icon: "◇", exact: true },
  { href: "/discover", label: "发现", icon: "◎" },
  { href: "/templates", label: "模板", icon: "▣" },
  { href: "/history", label: "最近", icon: "◷" },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * 侧边栏（Client）：导航 + 最近项目 + 底部主题切换。
 * 宽度 w-60，与内容区 flex 并列；小屏可折叠。
 */
export function Sidebar() {
  const pathname = usePathname();
  const [recent, setRecent] = useState<BuildSession[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  // 拉最近 5 条
  useEffect(() => {
    let cancelled = false;
    listBuilds(5)
      .then((items) => {
        if (!cancelled) setRecent(items);
      })
      .catch(() => {/* 静默失败 */});
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* 移动端遮罩 */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden
        />
      )}

      {/* 折叠时的展开按钮 */}
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
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          collapsed && "-translate-x-full lg:hidden",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            A
          </span>
          <span className="text-sm font-semibold">Atoms 复刻</span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="ml-auto rounded p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="收起侧边栏"
          >
            ✕
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span aria-hidden className="text-xs">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* 最近项目 */}
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
                      className="block truncate rounded px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
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

        {/* Footer：主题切换 + 版本 */}
        <div className="flex shrink-0 items-center justify-between border-t px-4 py-3">
          <ThemeToggle />
          <span className="text-[10px] text-muted-foreground">v0.1.0</span>
        </div>
      </aside>
    </>
  );
}
