export default function ScheduledPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">定时任务</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          设置周期性自动构建，让 AI 按计划为你生成内容。
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {/* Empty state */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
          </svg>
          <p className="text-sm font-medium text-muted-foreground">暂无定时任务</p>
          <p className="text-xs text-muted-foreground/70">
            创建定时任务后，系统会按计划自动执行构建并通知你。
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            新建定时任务
          </button>
        </div>
      </div>
    </div>
  );
}
