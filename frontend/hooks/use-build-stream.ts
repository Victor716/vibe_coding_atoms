"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createParser, type EventSourceMessage } from "eventsource-parser";

import { streamUrl } from "@/lib/api";
import { parseEvent, type SseFrame } from "@/lib/events";
import {
  applyFrameForTiming,
  initialStageTimes,
  type StageTimes,
} from "@/lib/stage-timing";
import type { BuildEvent, Stage } from "@/types/build";

interface UseBuildStreamResult {
  events: BuildEvent[];
  stage: Stage | null;
  isStreaming: boolean;
  hasError: boolean;
  /** 三段计时表；由 status / done / error 事件驱动。 */
  stageTimes: StageTimes;
  /** true → 当前连接走 ?force=true 分支（真跑），false → 后端可能返回 done 回放。 */
  isForce: boolean;
  /** 手动断开当前 SSE；后台 pipeline 由 sse-starlette disconnect 传播取消。 */
  abort: () => void;
  /** 强制重跑：清空 events、带 ?force=true 重连。 */
  restart: () => void;
}

/** 唯一 SSE 消费 Hook：fetch + AbortController + eventsource-parser。 */
export function useBuildStream(sessionId: string): UseBuildStreamResult {
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [stage, setStage] = useState<Stage | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [stageTimes, setStageTimes] = useState<StageTimes>(initialStageTimes);
  const [nonce, setNonce] = useState(0);
  const [force, setForce] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);
    setHasError(false);

    const onFrame = (frame: SseFrame) => {
      const parsed = parseEvent(frame);
      if (!parsed) return;
      const now = Date.now();
      if (parsed.type === "status") setStage(parsed.stage);
      if (parsed.type === "error") setHasError(true);
      if (parsed.type === "done") setIsStreaming(false);
      setEvents((prev) => [...prev, parsed]);
      setStageTimes((prev) => applyFrameForTiming(prev, parsed, now));
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
        const res = await fetch(streamUrl(sessionId, { force }), {
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
  }, [sessionId, nonce, force]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    // 手动停止时把仍在 in-flight 的 stage 收尾，避免 UI 永远 pulse。
    const now = Date.now();
    setStageTimes((prev) => applyFrameForTiming(prev, { type: "done" }, now));
  }, []);

  const restart = useCallback(() => {
    abortRef.current?.abort();
    setEvents([]);
    setStage(null);
    setHasError(false);
    setIsStreaming(false);
    setStageTimes(initialStageTimes());
    setForce(true);
    setNonce((n) => n + 1);
  }, []);

  return {
    events,
    stage,
    isStreaming,
    hasError,
    stageTimes,
    isForce: force,
    abort,
    restart,
  };
}
