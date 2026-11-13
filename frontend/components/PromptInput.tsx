"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, createBuild } from "@/lib/api";
import type { Mode } from "@/types/build";

interface Props {
  /** 受控 value；父层持有以便 examples 芯片能填充。 */
  value: string;
  onChange: (next: string) => void;
}

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="例如：帮我做一个贪吃蛇小游戏"
        className="w-full resize-y rounded-md border bg-card p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs">
          模式
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="rounded border bg-card px-2 py-1 text-xs text-foreground"
          >
            <option value="standard">standard</option>
            <option value="plan">plan</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={isSubmitting || !value.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? "提交中…" : "开始构建"}
        </button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}
