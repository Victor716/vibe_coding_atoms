"use client";

interface Props {
  previewUrl: string | null;
  /** L2 降级：无 previewUrl 时用 code 字段做 srcDoc 直渲。 */
  code: string | null;
}

export function PreviewFrame({ previewUrl, code }: Props) {
  // key=url 确保仅在 URL 变更时重载 iframe，避免流式期间反复闪烁（前端规范 §流式渲染）
  if (previewUrl) {
    return (
      <section className="flex flex-col gap-2 rounded-lg border bg-card p-3">
        <h3 className="text-xs font-semibold text-muted-foreground">预览（沙箱）</h3>
        <iframe
          key={previewUrl}
          src={previewUrl}
          title="preview"
          className="h-96 w-full rounded border border-border"
        />
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground underline"
        >
          在新窗口打开
        </a>
      </section>
    );
  }

  if (code) {
    return (
      <section className="flex flex-col gap-2 rounded-lg border bg-card p-3">
        <h3 className="text-xs font-semibold text-muted-foreground">预览（L2 · srcDoc 降级）</h3>
        <iframe
          key={code.length}
          srcDoc={code}
          title="preview-srcdoc"
          sandbox="allow-scripts"
          className="h-96 w-full rounded border border-border"
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <h3 className="text-xs font-semibold text-muted-foreground">预览</h3>
      <div className="flex h-96 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
        等待沙箱 preview_url…
      </div>
    </section>
  );
}
