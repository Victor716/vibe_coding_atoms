import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vibe_coding · AI 应用构建平台",
  description: "自然语言 → AI 生成 → 沙箱运行 → 实时预览",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <header className="border-b bg-white px-6 py-3 text-sm font-medium">
          vibe_coding · AI 应用构建平台（Atoms 复刻）
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
      </body>
    </html>
  );
}
