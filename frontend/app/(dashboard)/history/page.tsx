import { BuildList } from "@/components/BuildList";
import { listBuilds } from "@/lib/api";
import type { BuildSession } from "@/types/build";

export const dynamic = "force-dynamic";

async function safeList(limit: number): Promise<BuildSession[] | null> {
  try {
    return await listBuilds(limit);
  } catch {
    return null;
  }
}

export default async function HistoryPage() {
  const items = await safeList(50);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold">历史构建</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            最多展示最近 50 条；点击任意条目进入回放（LLM 不会被再次调用）。
          </p>
        </div>
        {items && (
          <span className="text-xs tabular-nums text-muted-foreground">
            共 {items.length} 条
          </span>
        )}
      </header>
      {items === null ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          无法连接后端 API，请确认 <code>http://localhost:8000</code> 已启动。
        </p>
      ) : (
        <BuildList items={items} emptyText="还没有任何构建，回首页开始第一次吧" />
      )}
    </div>
  );
}
