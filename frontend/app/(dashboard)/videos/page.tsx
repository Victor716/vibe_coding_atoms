export default function VideosPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">视频</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          用 AI 生成短视频和动画，支持脚本 → 分镜 → 渲染全流程。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "产品介绍动画", desc: "30 秒 SaaS 产品演示", duration: "0:30" },
          { title: "教程视频", desc: "自动化步骤讲解", duration: "2:15" },
          { title: "数据可视化动画", desc: "图表动态展示", duration: "0:45" },
        ].map((v) => (
          <div key={v.title} className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition hover:shadow-sm">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
              <svg className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">{v.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{v.desc}</p>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{v.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
