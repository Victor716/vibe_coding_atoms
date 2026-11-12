import { PromptInput } from "@/components/PromptInput";

export default function HomePage() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">描述你想构建的应用</h1>
        <p className="mt-1 text-sm text-neutral-500">
          提交后进入构建会话页，实时观察 PM / Engineer 两节点流式输出与沙箱预览。
        </p>
      </div>
      <PromptInput />
    </section>
  );
}
