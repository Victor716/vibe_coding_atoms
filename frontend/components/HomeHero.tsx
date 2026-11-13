"use client";

import { useState } from "react";

import { PromptInput } from "@/components/PromptInput";

/**
 * 首页 hero：仅保留 prompt 输入。
 * 快捷示例已按截图移除，页面底部改用「幻灯片 / 游戏 / 视频」快捷入口。
 */
export function HomeHero() {
  const [prompt, setPrompt] = useState("");
  return <PromptInput value={prompt} onChange={setPrompt} />;
}
