"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** 可关闭促销横幅；periwinkle 浅蓝紫底 + 深色文字 + 品牌蓝 CTA 胶囊。 */
export function PromoBanner() {
  const [hidden, setHidden] = useState(true);
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
    <div className="flex h-11 items-center justify-center gap-3 bg-[var(--promo-bg)] px-4 text-sm text-foreground">
      <span className="font-medium">沙箱部署已上线，一键生成可预览的应用</span>
      <Link
        href="/"
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-brand px-3 text-xs font-medium text-white transition hover:bg-brand-dark"
      >
        开始使用
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="关闭横幅"
        className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-foreground/50 transition hover:bg-black/5 hover:text-foreground"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
