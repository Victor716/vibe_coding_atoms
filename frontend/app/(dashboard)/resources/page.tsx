export default function ResourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">资源</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          素材库、组件模板、设计资源一站式管理。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "图标集 · Linear", count: 240, type: "SVG" },
          { title: "配色方案 · Tailwind", count: 58, type: "CSS" },
          { title: "字体组合 · 中英文", count: 12, type: "TTF" },
          { title: "背景纹理库", count: 86, type: "PNG" },
          { title: "UI 组件片段", count: 34, type: "React" },
          { title: "3D 模型 · GLB", count: 8, type: "3D" },
        ].map((r) => (
          <div key={r.title} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
              {r.type}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="truncate text-sm font-medium">{r.title}</h3>
              <p className="text-xs text-muted-foreground">{r.count} 项资源</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
