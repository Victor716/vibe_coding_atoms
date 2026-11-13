/**
 * (build) Route Group 布局：无侧边栏，全宽分屏。
 * 构建会话是沉浸式体验，侧边栏会干扰左右分屏。
 */
export default function BuildLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
