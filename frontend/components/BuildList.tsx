import Link from "next/link";

import { relativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { BuildSession, Status } from "@/types/build";

const STATUS_STYLE: Record<Status, string> = {
  pending: "border-border bg-muted text-muted-foreground",
  running: "border-warning/30 bg-warning/10 text-warning",
  done: "border-success/30 bg-success/10 text-success",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "排队",
  running: "构建中",
  done: "已完成",
  failed: "失败",
};

function truncate(text: string, max = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

interface Props {
  item: BuildSession;
}

/** 单条会话行：prompt + status 徽章 + mode + 相对时间；整行可点。 */
export function BuildListItem({ item }: Props) {
  return (
    <li>
      <Link
        href={`/build/${item.id}`}
        className="flex flex-col gap-1.5 rounded-md border bg-card p-3 text-sm transition hover:border-foreground/20 hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-2 flex-1 text-card-foreground">{truncate(item.prompt, 120)}</p>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              STATUS_STYLE[item.status],
            )}
          >
            {STATUS_LABEL[item.status]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span>模式 · {item.mode}</span>
          {item.preview_url && (
            <a
              href={item.preview_url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="text-foreground underline-offset-2 hover:underline"
            >
              预览 ↗
            </a>
          )}
          <span className="ml-auto tabular-nums">{relativeTime(item.created_at)}</span>
        </div>
      </Link>
    </li>
  );
}

interface ListProps {
  items: BuildSession[];
  emptyText?: string;
  className?: string;
}

/** 通用会话列表容器；空态友好提示。 */
export function BuildList({ items, emptyText = "还没有构建记录", className }: ListProps) {
  if (items.length === 0) {
    return (
      <p className={cn("rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground", className)}>
        {emptyText}
      </p>
    );
  }
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((it, i) => (
        <div key={it.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
          <BuildListItem item={it} />
        </div>
      ))}
    </ul>
  );
}
