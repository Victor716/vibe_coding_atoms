"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, createBuild } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * 游戏页 Hero：像素底纹 + Agent 头像 + 衬线标题 + 游戏输入卡。
 * 参考 atoms.dev/zh/game 首页视觉。
 */
export function GameHero() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!value.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const prompt = `帮我做一个游戏：${value.trim()}`;
      const { id } = await createBuild(prompt, "standard");
      router.push(`/build/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "连接失败，请检查后端");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl">
      {/* 像素底纹 */}
      <PixelPattern />

      {/* 顶部 HUD */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-brand" />
            评分 0
          </span>
          <span className="flex items-center gap-0.5 text-red-500">
            <HeartIcon />
            <HeartIcon />
            <HeartIcon />
          </span>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground"
          aria-label="关闭"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 中央：Agent 头像 + 标题 */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-4 pt-4 pb-8">
        <AgentRow />
        <h1 className="text-center font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
          你想创建什么游戏？
        </h1>
      </div>

      {/* 吉祥物 */}
      <div className="relative z-10 mx-4 flex items-end">
        <MascotIcon />
        <div className="mb-2 ml-2 h-[1px] flex-1 bg-border" />
      </div>

      {/* 输入卡片 */}
      <div className="relative z-10 mx-4 mt-3 rounded-card border bg-card p-4 shadow-sm md:mx-8 md:p-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder="描述你想构建的游戏，或浏览下方的游戏示例"
          className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex items-center gap-2">
          {/* + */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="添加附件"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {/* 游戏 chip */}
          <span className="flex items-center gap-1.5 rounded-full bg-brand-alpha8 px-3 py-1.5 text-xs font-medium text-brand">
            <GamepadIcon />
            游戏
          </span>

          <div className="flex-1" />

          {/* waveform */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="语音输入"
          >
            <WaveformIcon />
          </button>
          {/* send */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !value.trim()}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition",
              value.trim()
                ? "bg-foreground text-background hover:opacity-90"
                : "bg-gray-300 text-white dark:bg-gray-600",
              "disabled:cursor-not-allowed",
            )}
            aria-label="开始构建"
          >
            {isSubmitting ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      {/* 底部留白 */}
      <div className="relative z-10 h-4" />
    </section>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

/** 像素底纹：SVG pattern 平铺，浅蓝灰色调。 */
function PixelPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-70"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
            <g fill='%23c7d2fe' fill-opacity='0.35'>
              <rect x='8' y='8' width='10' height='4'/>
              <rect x='10' y='4' width='6' height='12'/>
              <rect x='48' y='24' width='14' height='4'/>
              <rect x='52' y='20' width='6' height='12'/>
              <rect x='88' y='12' width='10' height='4'/>
              <rect x='90' y='8' width='6' height='12'/>
              <rect x='24' y='60' width='14' height='4'/>
              <rect x='28' y='56' width='6' height='12'/>
              <rect x='72' y='72' width='10' height='4'/>
              <rect x='74' y='68' width='6' height='12'/>
              <rect x='104' y='96' width='10' height='4'/>
              <rect x='106' y='92' width='6' height='12'/>
              <rect x='40' y='100' width='14' height='4'/>
              <rect x='44' y='96' width='6' height='12'/>
            </g>
            <g fill='%23a5b4fc' fill-opacity='0.25'>
              <rect x='60' y='40' width='4' height='4'/>
              <rect x='16' y='88' width='4' height='4'/>
              <rect x='96' y='60' width='4' height='4'/>
            </g>
          </svg>`,
        )}")`,
        backgroundSize: "240px 240px",
      }}
      aria-hidden
    />
  );
}

/** 8 个 Agent 卡通头像重叠条（游戏页专用，比首页稍大）。 */
function AgentRow() {
  const emojis = ["🐯", "🐥", "🐸", "🐷", "🐼", "🐙", "🐢", "🦄"];
  const colors = [
    "#FBBF24",
    "#FDE68A",
    "#A7F3D0",
    "#FBCFE8",
    "#E5E7EB",
    "#BAE6FD",
    "#BBF7D0",
    "#DDD6FE",
  ];
  return (
    <div className="flex items-center justify-center">
      {emojis.map((e, i) => (
        <span
          key={i}
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-sm ring-2 ring-background"
          style={{
            backgroundColor: colors[i],
            marginLeft: i === 0 ? 0 : "-14px",
            zIndex: emojis.length - i,
          }}
          aria-hidden
        >
          {e}
        </span>
      ))}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  );
}

function GamepadIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 11h4M8 9v4M16 12h.01M18 10h.01M4 8h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2z" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 12v-2M8 12v-4M12 12v-6M16 12v-4M20 12v-2" />
      <path strokeLinecap="round" d="M4 14v2M8 14v4M12 14v6M16 14v4M20 14v2" opacity="0.4" />
    </svg>
  );
}

function MascotIcon() {
  return (
    <svg className="h-10 w-10 text-foreground" viewBox="0 0 40 40" fill="currentColor" aria-hidden>
      {/* 简化的熊猫/游戏手柄混合吉祥物 */}
      <circle cx="14" cy="14" r="4" />
      <circle cx="26" cy="14" r="4" />
      <ellipse cx="20" cy="24" rx="10" ry="9" />
      <circle cx="17" cy="23" r="1.5" fill="white" />
      <circle cx="23" cy="23" r="1.5" fill="white" />
    </svg>
  );
}
