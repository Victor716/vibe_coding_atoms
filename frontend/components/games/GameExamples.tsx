"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { GAME_CATEGORIES, type GameCategory, type GameItem } from "@/lib/mock/games";

interface Props {
  items: GameItem[];
}

/**
 * 游戏示例区：分类 tab + 卡片网格。
 */
export function GameExamples({ items }: Props) {
  const [active, setActive] = useState<GameCategory>("全部");

  const filtered = useMemo(
    () => (active === "全部" ? items : items.filter((i) => i.category === active)),
    [items, active],
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl font-medium text-foreground">游戏示例</h2>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {GAME_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              active === c
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/40 py-12 text-center text-sm text-muted-foreground">
          该分类暂无示例，试试其它分类
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((g, idx) => (
            <GameCard key={g.id} item={g} index={idx} />
          ))}
        </div>
      )}
    </section>
  );
}

function GameCard({ item, index }: { item: GameItem; index: number }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ animation: `fade-in 0.35s ease-out both`, animationDelay: `${index * 40}ms` }}
    >
      {/* Cover */}
      <div
        className={cn(
          "relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br",
          item.gradient,
        )}
      >
        <span className="text-5xl drop-shadow-md transition-transform group-hover:scale-110" aria-hidden>
          {item.emoji}
        </span>
        <span className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {item.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
          <span className="truncate">@{item.author}</span>
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatPlays(item.plays)}
          </span>
        </div>
      </div>
    </article>
  );
}

function formatPlays(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
