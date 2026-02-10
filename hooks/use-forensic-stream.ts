"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { LogEntry, DetectionResult } from "@/types/forensic";

interface StreamEvent {
  type: "log";
  logEntry: LogEntry | null;
  detections: DetectionResult[];
  timestamp: string;
}

interface UseForensicStreamReturn {
  logs: LogEntry[];
  recentDetections: DetectionResult[];
  isStreaming: boolean;
  isPaused: boolean;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  clearLogs: () => void;
}

export function useForensicStream(maxLogs = 10000): UseForensicStreamReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [recentDetections, setRecentDetections] = useState<DetectionResult[]>(
    []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pausedRef = useRef(false);

  const start = useCallback(() => {
    if (eventSourceRef.current) return;

    const es = new EventSource("/api/docker/logs/stream");
    eventSourceRef.current = es;
    setIsStreaming(true);

    es.onmessage = (event) => {
      if (pausedRef.current) return;

      try {
        const data: StreamEvent = JSON.parse(event.data);

        if (data.logEntry) {
          setLogs((prev) => {
            const next = [...prev, data.logEntry!];
            return next.length > maxLogs ? next.slice(-maxLogs) : next;
          });
        }

        if (data.detections.length > 0) {
          setRecentDetections((prev) => {
            const next = [...data.detections, ...prev];
            return next.slice(0, 50);
          });
        }
      } catch {
        // skip bad JSON
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
      // Auto-reconnect after 2s
      setTimeout(() => {
        if (!pausedRef.current) start();
      }, 2000);
    };
  }, [maxLogs]);

  const stop = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsStreaming(false);
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setRecentDetections([]);
  }, []);

  // Load historical logs on mount
  useEffect(() => {
    fetch("/api/docker/logs?limit=10000")
      .then((res) => res.json())
      .then((data) => {
        if (data.logs && data.logs.length > 0) {
          setLogs(data.logs);
        }
      })
      .catch((err) => {
        console.error("Failed to load historical logs:", err);
      });
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    // Try to connect to DVWA container
    fetch("/api/docker/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ containerId: "dvwa-test" }),
    })
      .then((res) => {
        if (res.ok) {
          start();
        } else {
          console.warn("Failed to auto-connect to container");
        }
      })
      .catch((err) => {
        console.error("Auto-connect error:", err);
      });

    return () => {
      stop();
    };
  }, [start, stop]);

  return {
    logs,
    recentDetections,
    isStreaming,
    isPaused,
    start,
    stop,
    pause,
    resume,
    clearLogs,
  };
}
