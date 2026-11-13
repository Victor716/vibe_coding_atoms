"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, createBuild } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Mode } from "@/types/build";

interface Props {
  value: string;
  onChange: (next: string) => void;
}

/**
 * 首页输入卡：textarea + 底部工具条。
 * 布局对齐 Atoms：`+` 圆按钮 · spacer · `构建 ▾` pill · 声波 · 灰色圆形 ↑ 发送。
 */
export function PromptInput({ value, onChange }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { id } = await createBuild(value.trim(), mode);
      router.push(`/build/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "连接失败，请检查后端");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="请Alex生成你的Link"
        className="w-full resize-none bg-transparent px-1 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground"
      />

      {/* Bottom toolbar */}
      <div className="flex items-center gap-2">
        {/* + attach: 圆形描边 */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="添加附件"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <div className="flex-1" />

        {/* Mode: 构建 ▾ pill */}
        <label className="flex cursor-pointer items-center gap-1 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="appearance-none border-0 bg-transparent text-sm font-medium outline-none"
          >
            <option value="standard">构建</option>
            <option value="plan">规划</option>
          </select>
          <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </label>

        {/* Waveform */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="语音输入"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 12v-3M10 12v-6M14 12v-6M18 12v-3" />
            <path strokeLinecap="round" d="M6 12v3M10 12v6M14 12v6M18 12v3" opacity="0.4" />
          </svg>
        </button>

        {/* Send: 灰色圆形 ↑ */}
        <button
          type="submit"
          disabled={isSubmitting || !value.trim()}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition",
            value.trim()
              ? "bg-foreground text-background hover:opacity-90"
              : "bg-gray-300 text-white dark:bg-gray-600",
            "disabled:cursor-not-allowed",
          )}
          aria-label="开始构建"
        >
          {isSubmitting ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>

      {error && <p className="px-1 text-xs text-destructive">{error}</p>}
    </form>
  );
}
