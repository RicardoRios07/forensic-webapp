"use client";

import React from "react"

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/types/forensic";
import { cn } from "@/lib/utils";

interface LogViewerProps {
  logs: LogEntry[];
  autoScroll: boolean;
  searchQuery: string;
  filterType: string;
}

// Attack detection patterns for highlighting
const SQLI_PATTERN =
  /('|%27).*(OR|UNION|SELECT|DROP|INSERT|UPDATE|DELETE|SLEEP|BENCHMARK)/i;
const CMDI_PATTERN =
  /(;|\||`|\$\().*(ls|cat|whoami|pwd|id|uname|bash|sh|passwd|shadow)/i;
const FI_PATTERN = /(\.\.\/(\.\.\/)*|\/etc\/(passwd|shadow)|php:\/\/|page=http)/i;
const BRUTE_PATTERN = /POST.*(login|auth|session)/i;

function getLineHighlight(log: LogEntry): {
  type: string;
  color: string;
} | null {
  const text = `${log.method} ${log.endpoint} ${log.params}`;
  if (SQLI_PATTERN.test(text))
    return { type: "Inyecci\u00f3n SQL", color: "border-l-attack-sqli" };
  if (CMDI_PATTERN.test(text))
    return { type: "Inyecci\u00f3n Cmd", color: "border-l-attack-cmdi" };
  if (FI_PATTERN.test(text))
    return { type: "Inclusi\u00f3n Arch.", color: "border-l-attack-fi" };
  if (BRUTE_PATTERN.test(text) && log.statusCode === 302)
    return { type: "Fuerza Bruta", color: "border-l-attack-brute" };
  return null;
}

function getStatusColor(code: number): string {
  if (code >= 500) return "text-severity-critical";
  if (code >= 400) return "text-severity-high";
  if (code >= 300) return "text-severity-medium";
  if (code >= 200) return "text-state-running";
  return "text-muted-foreground";
}

function highlightParts(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Highlight IPs
  const ipRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const tempText = text;
  ipRegex.lastIndex = 0;

  while ((match = ipRegex.exec(tempText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(tempText.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={`ip-${match.index}`} className="text-severity-low font-semibold">
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < tempText.length) {
    parts.push(tempText.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function LogViewer({
  logs,
  autoScroll,
  searchQuery,
  filterType,
}: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const text =
        `${log.ip} ${log.method} ${log.endpoint} ${log.params} ${log.statusCode}`.toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    if (filterType && filterType !== "all") {
      const highlight = getLineHighlight(log);
      if (filterType === "attacks" && !highlight) return false;
      if (filterType === "normal" && highlight) return false;
      if (
        filterType === "sqli" &&
        highlight?.type !== "Inyecci\u00f3n SQL"
      )
        return false;
      if (
        filterType === "cmdi" &&
        highlight?.type !== "Inyecci\u00f3n Cmd"
      )
        return false;
      if (
        filterType === "brute" &&
        highlight?.type !== "Fuerza Bruta"
      )
        return false;
      if (
        filterType === "fi" &&
        highlight?.type !== "Inclusi\u00f3n Arch."
      )
        return false;
    }
    return true;
  });

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-220px)] overflow-y-auto rounded-lg border border-border bg-background font-mono text-xs"
      role="log"
      aria-label="Visor de registros"
      aria-live="polite"
    >
      {filteredLogs.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Esperando datos de registros...
          </p>
        </div>
      ) : (
        <table className="w-full">
          <tbody>
            {filteredLogs.map((log) => {
              const highlight = getLineHighlight(log);
              return (
                <tr
                  key={log.id}
                  className={cn(
                    "border-b border-border/30 transition-colors hover:bg-accent/30",
                    highlight && "border-l-2",
                    highlight?.color
                  )}
                >
                  <td className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    {highlightParts(log.ip)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-semibold",
                        log.method === "POST"
                          ? "bg-severity-medium/20 text-severity-medium"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="max-w-[500px] truncate px-2 py-1.5 text-foreground">
                    {decodeURIComponent(
                      log.params
                        ? `${log.endpoint}?${log.params}`
                        : log.endpoint
                    )}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap px-2 py-1.5 font-semibold",
                      getStatusColor(log.statusCode)
                    )}
                  >
                    {log.statusCode}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">
                    {log.size > 0 ? `${log.size}B` : "-"}
                  </td>
                  <td className="px-2 py-1.5">
                    {highlight && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          highlight.type === "Inyecci\u00f3n SQL" &&
                            "bg-attack-sqli/20 text-attack-sqli",
                          highlight.type === "Inyecci\u00f3n Cmd" &&
                            "bg-attack-cmdi/20 text-attack-cmdi",
                          highlight.type === "Fuerza Bruta" &&
                            "bg-attack-brute/20 text-attack-brute",
                          highlight.type === "Inclusi\u00f3n Arch." &&
                            "bg-attack-fi/20 text-attack-fi"
                        )}
                      >
                        {highlight.type}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
