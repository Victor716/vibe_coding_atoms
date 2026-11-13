import { AgentStrip } from "@/components/AgentStrip";
import { HomeHero } from "@/components/HomeHero";
import { QuickActions } from "@/components/QuickActions";
import { ToolConnectionBar } from "@/components/ToolConnectionBar";

/**
 * 首页：Editorial Minimal —— 米灰打底，衬线定调，一蓝点睛。
 * 布局对齐 atoms.dev 首页：
 *   右上积分徽章 → Agent 头像条 → 大号衬线标题 → 输入卡 → 工具连接条 → 快捷入口。
 */
export default function HomePage() {
  return (
    <div className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 px-4">
      {/* 积分徽章（右上角） */}
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium shadow-sm">
          <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.946a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>302.35</span>
        </span>
      </div>

      {/* Agent 头像 */}
      <AgentStrip />

      {/* 衬线大标题 —— Atoms 的灵魂 */}
      <h1 className="max-w-3xl text-center font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl lg:text-5xl lg:leading-tight">
        你的下一个产品从这里开始，Victor。
      </h1>

      {/* 输入卡片：rounded-card + 细边框 + 极轻阴影 */}
      <section className="w-full max-w-3xl rounded-card border bg-card p-5 shadow-sm md:p-6">
        <HomeHero />
      </section>

      {/* 工具连接条 */}
      <ToolConnectionBar />

      {/* 快捷入口：幻灯片 / 游戏 / 视频 */}
      <div className="mt-2">
        <QuickActions />
      </div>
    </div>
  );
}
