import { AppShell } from "@/components/layout/app-shell";

/**
 * (dashboard) Route Group 统一布局：
 * 侧边栏 + 内容区。所有业务页面共享此壳。
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl p-4 md:p-6">{children}</div>
    </AppShell>
  );
}
