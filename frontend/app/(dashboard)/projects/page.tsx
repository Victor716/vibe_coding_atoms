import { BuildList } from "@/components/BuildList";
import { listBuilds } from "@/lib/api";
import type { BuildSession } from "@/types/build";

async function safeList(limit: number): Promise<BuildSession[] | null> {
  try {
    return await listBuilds(limit);
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const items = await safeList(50);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">项目</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          你创建的所有构建会话，点击任意条目可回放完整流程。
        </p>
      </header>

      {items === null ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          无法连接后端，请确认服务已启动。
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          还没有项目，回到首页输入 prompt 开始构建吧。
        </p>
      ) : (
        <BuildList items={items} />
      )}
    </div>
  );
}
