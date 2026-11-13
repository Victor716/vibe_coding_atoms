"use client";

import { useState } from "react";

/**
 * 工具连接条：紧贴输入卡底部，展示可集成的第三方工具。
 * 关闭按钮隐藏后不再显示。
 */
const INTEGRATIONS = [
  { name: "Figma", bg: "#000", fg: "#F24E1E", letter: "F" },
  { name: "Notion", bg: "#fff", fg: "#000", letter: "N" },
  { name: "GitHub", bg: "#18181b", fg: "#fff", letter: "G" },
  { name: "Google Drive", bg: "#fff", fg: "#1a73e8", letter: "D" },
  { name: "Slack", bg: "#4A154B", fg: "#fff", letter: "S" },
  { name: "Analytics", bg: "#fff", fg: "#f9ab00", letter: "A" },
];

export function ToolConnectionBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-border-light bg-muted/50 px-5 py-3 text-sm text-muted-foreground">
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
      </svg>
      <span className="truncate">将你的工具连接到 Atoms</span>

      <div className="ml-auto flex items-center gap-1.5">
        {INTEGRATIONS.map((it) => (
          <span
            key={it.name}
            title={it.name}
            className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold"
            style={{ backgroundColor: it.bg, color: it.fg, borderColor: "rgba(12,12,12,0.08)" }}
          >
            {it.letter}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground"
          aria-label="关闭"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
