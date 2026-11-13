export default function SlidesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">幻灯片</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          输入主题，AI 自动生成结构化演示文稿。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "季度业绩汇报", pages: 12, theme: "商务" },
          { title: "产品发布会 Keynote", pages: 24, theme: "科技" },
          { title: "教育课件 · 机器学习入门", pages: 18, theme: "教育" },
        ].map((s) => (
          <div key={s.title} className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition hover:shadow-sm">
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
              <svg className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM12 16v3M8 21h8" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium">{s.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.pages} 页 · {s.theme}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
