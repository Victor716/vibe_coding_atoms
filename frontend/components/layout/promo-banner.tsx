"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** 可关闭促销横幅；状态存 localStorage("promo-hidden")。 */
export function PromoBanner() {
  const [hidden, setHidden] = useState(true); // 默认隐藏避免 SSR hydration flash
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("promo-hidden");
    if (stored !== "true") setVisible(true);
    setHidden(false);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("promo-hidden", "true");
  };

  if (hidden || !visible) return null;

  return (
    <div className={cn("flex h-10 items-center justify-center gap-2 bg-accent px-4 text-xs text-accent-foreground")}>
      <span>🎉 沙箱部署已上线，试试输入 prompt 一键生成可预览的应用</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="关闭横幅"
        className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium hover:bg-accent-foreground/20"
      >
        ✕
      </button>
    </div>
  );
}
