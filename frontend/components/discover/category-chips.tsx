"use client";

import { cn } from "@/lib/utils";

interface Props {
  categories: readonly string[];
  active: string;
  onChange: (cat: string) => void;
}

/** 横向滚动分类标签条（Client）；选中项高亮。 */
export function CategoryChips({ categories, active, onChange }: Props) {
  return (
    <div className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
            cat === active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
