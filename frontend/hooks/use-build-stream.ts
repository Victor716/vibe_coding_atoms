"use client";

import { useEffect, useRef, useState } from "react";
import { createParser, type EventSourceMessage } from "eventsource-parser";

import { streamUrl } from "@/lib/api";
import { parseEvent, type SseFrame } from "@/lib/events";
import type { BuildEvent, Stage } from "@/types/build";

interface UseBuildStreamResult {
  events: BuildEvent[];
  stage: Stage | null;
  isStreaming: boolean;
  hasError: boolean;
}

/** 唯一 SSE 消费 Hook：fetch + AbortController + eventsource-parser。 */
export function useBuildStream(sessionId: string): UseBuildStreamResult {
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);

    const onFrame = (frame: SseFrame) => {
      const parsed = parseEvent(frame);
      if (!parsed) return;
      if (parsed.type === "status") setStage(parsed.stage);
      if (parsed.type === "error") setHasError(true);
      if (parsed.type === "done") setIsStreaming(false);
      setEvents((prev) => [...prev, parsed]);
    };

    const parser = createParser({
      onEvent: (ev: EventSourceMessage) => {
        onFrame({ event: ev.event || "message", data: ev.data });
      },
      onError: (err) => {
        // 忽略未知字段（后端注释/心跳帧），只让致命解析错误上抛
        if (err.type !== "unknown-field") {
          setHasError(true);
        }
      },
    });

    (async () => {
      try {
        const res = await fetch(streamUrl(sessionId), {
          signal: ctrl.signal,
          headers: { Accept: "text/event-stream" },
        });
        if (!res.ok || !res.body) throw new Error(`SSE connect failed: ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(decoder.decode(value, { stream: true }));
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setHasError(true);
        setIsStreaming(false);
        onFrame({
          event: "error",
          data: JSON.stringify({ message: (err as Error).message }),
        });
      }
    })();

    return () => {
      ctrl.abort();
      setIsStreaming(false);
    };
  }, [sessionId]);

  return { events, stage, isStreaming, hasError };
}
