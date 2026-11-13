import { HomeHero } from "@/components/HomeHero";

/**
 * 工作区（仪表盘）：居中 prompt 输入 + 示例芯片。
 * "最近构建"已移至侧边栏 mini-list，页面聚焦输入体验。
 */
export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="relative flex w-full max-w-2xl flex-col gap-5 overflow-hidden rounded-lg border bg-card p-8 shadow-sm md:p-10">
        {/* 微渐变装饰层 */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-muted/20"
          aria-hidden
        />
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            描述你想构建的应用
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            提交后进入构建会话页，实时观察 PM → Engineer → Sandbox 流式输出与预览。
          </p>
        </div>
        <div className="relative">
          <HomeHero />
        </div>
      </section>
    </div>
  );
}
