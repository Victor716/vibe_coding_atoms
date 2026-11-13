import { DiscoverContent } from "@/components/discover/discover-content";
import { MOCK_DISCOVER_ITEMS } from "@/lib/mock/discover";

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">发现</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          浏览社区精选作品；点击任意卡片可查看详情和源码。
        </p>
      </header>
      <DiscoverContent items={MOCK_DISCOVER_ITEMS} />
    </div>
  );
}
