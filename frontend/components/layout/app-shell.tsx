import { PromoBanner } from "./promo-banner";
import { Sidebar } from "./sidebar";

/**
 * App Shell：促销横幅 + 左侧固定侧边栏 + 右侧可滚动内容区。
 * Server Component —— 壳层无状态，交互全部下沉到子组件。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
