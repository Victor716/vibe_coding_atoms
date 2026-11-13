import type { DiscoverItem } from "@/lib/mock/discover";

function formatLikes(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

/**
 * 发现页作品卡片（Server 可用）。
 * 点击跳转 /build/{id}，保持 SSR + prefetch。
 */
export function DiscoverCard({ item }: { item: DiscoverItem }) {
  return (
    <a
      href={`/build/${item.id}`}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition hover:border-foreground/20 hover:shadow-sm"
    >
      {/* 缩略图占位（有 preview_image 时显示真实图） */}
      {item.preview_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.preview_image}
          alt=""
          className="aspect-video w-full rounded-md object-cover transition group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-2xl text-muted-foreground/40">
          ◇
        </div>
      )}

      {/* 标题 */}
      <p className="line-clamp-2 text-sm font-medium text-card-foreground">{item.title}</p>

      {/* 底部信息行 */}
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span className="truncate">{item.author}</span>
        <span>·</span>
        <span className="flex items-center gap-0.5">
          <span aria-hidden>♥</span> {formatLikes(item.likes)}
        </span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px]">
          {item.category}
        </span>
      </div>
    </a>
  );
}
