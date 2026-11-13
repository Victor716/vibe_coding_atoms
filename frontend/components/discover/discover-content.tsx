"use client";

import { useMemo, useState } from "react";

import { CategoryChips } from "./category-chips";
import { DiscoverCard } from "./discover-card";
import { CATEGORIES, type DiscoverItem } from "@/lib/mock/discover";

interface Props {
  items: DiscoverItem[];
}

/**
 * 发现/模板页可交互区域（Client）：
 * 分类筛选 + 卡片流。Server page 把全量 mock 传进来，此处本地过滤。
 */
export function DiscoverContent({ items }: Props) {
  const [category, setCategory] = useState<string>("全部");

  const filtered = useMemo(
    () => (category === "全部" ? items : items.filter((i) => i.category === category)),
    [items, category],
  );

  return (
    <>
      <CategoryChips categories={CATEGORIES} active={category} onChange={setCategory} />
      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          该分类暂无内容
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <DiscoverCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
