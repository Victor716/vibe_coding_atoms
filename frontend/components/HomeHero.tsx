"use client";

import { useState } from "react";

import { PromptExamples } from "@/components/PromptExamples";
import { PromptInput } from "@/components/PromptInput";

/**
 * 首页 hero：preset 芯片 + prompt 输入。
 * 用 client component 是因为 PromptInput 需要 useState + useRouter；
 * page.tsx 保持 server 方便直接 await listBuilds。
 */
export function HomeHero() {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <PromptExamples onPick={setPrompt} />
      <PromptInput value={prompt} onChange={setPrompt} />
    </div>
  );
}
