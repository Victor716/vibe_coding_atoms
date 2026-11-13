import type { Metadata } from "next";

import { ThemeProvider } from "@/hooks/use-theme";

import "./globals.css";

export const metadata: Metadata = {
  title: "vibe_coding · AI 应用构建平台",
  description: "自然语言 → AI 生成 → 沙箱运行 → 实时预览",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
