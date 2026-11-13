"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** 精确匹配 or 前缀匹配；`/build/*` 也想点亮"首页"就靠前缀。 */
  exact?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/", label: "首页", exact: true },
  { href: "/history", label: "历史" },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** 顶部导航：logo + 主链接 + 右侧状态。client 组件用于 usePathname 高亮。 */
export function NavBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground"
          >
            A
          </span>
          <span>Atoms 复刻</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden text-xs text-muted-foreground hover:text-foreground md:inline"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </header>
  );
}
