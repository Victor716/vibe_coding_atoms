import { DiscoverContent } from "@/components/discover/discover-content";
import { MOCK_DISCOVER_ITEMS } from "@/lib/mock/discover";

// 模板页复用同一组件，仅取部分 mock 数据作为"模板"
const TEMPLATE_ITEMS = MOCK_DISCOVER_ITEMS.filter((i) =>
  ["生产力", "工具", "网站"].includes(i.category),
);

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold">模板</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          一键 fork 现成模板，快速开始你的项目。
        </p>
      </header>
      <DiscoverContent items={TEMPLATE_ITEMS} />
    </div>
  );
}
