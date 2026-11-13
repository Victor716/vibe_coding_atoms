import { DiscoverCard } from "./discover-card";
import type { DiscoverItem } from "@/lib/mock/discover";

/** 卡片流容器（Server Component）。 */
export function DiscoverGrid({ items }: { items: DiscoverItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        暂无内容
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <DiscoverCard key={item.id} item={item} />
      ))}
    </div>
  );
}
