import Link from "next/link";

/**
 * 首页底部快捷入口：幻灯片 / 游戏 / 视频。
 * Server Component，纯链接 + 图标。
 */
const ACTIONS = [
  { href: "/slides", label: "幻灯片", icon: <SlidesIcon /> },
  { href: "/games", label: "游戏", icon: <GamepadIcon /> },
  { href: "/videos", label: "视频", icon: <VideoIcon /> },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {ACTIONS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="text-muted-foreground">{a.icon}</span>
          {a.label}
        </Link>
      ))}
    </div>
  );
}

function SlidesIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 6a2 2 0 012-2h12a2 2 0 012 2M4 6v10a2 2 0 002 2h12a2 2 0 002-2V6M9 20l3-3 3 3" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11h4M8 9v4M16 12h.01M18 10h.01M4 8h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.28A1 1 0 0121 8.56v6.88a1 1 0 01-1.45.84L15 14M3 7a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}
