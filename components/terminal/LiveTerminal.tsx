"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal as TerminalIcon, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalLine {
  type: "info" | "stdout" | "stderr" | "error" | "exit";
  text: string;
  timestamp: Date;
}

interface LiveTerminalProps {
  isRunning: boolean;
  onClose?: () => void;
}

export function LiveTerminal({ isRunning, onClose }: LiveTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (isRunning && !eventSourceRef.current) {
      // Start the test execution
      fetch("/api/tests/run", { method: "POST" })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to start tests");
          }
          return res.body;
        })
        .then((body) => {
          if (!body) return;
          
          const reader = body.getReader();
          const decoder = new TextDecoder();

          const readStream = async () => {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    setLines((prev) => [
                      ...prev,
                      {
                        type: data.type,
                        text: data.text,
                        timestamp: new Date(),
                      },
                    ]);
                  } catch (e) {
                    console.error("Error parsing SSE data:", e);
                  }
                }
              }
            }
          };

          readStream();
        })
        .catch((error) => {
          setLines((prev) => [
            ...prev,
            {
              type: "error",
              text: `Error: ${error.message}\n`,
              timestamp: new Date(),
            },
          ]);
        });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "info":
        return "text-blue-400";
      case "stdout":
        return "text-green-400";
      case "stderr":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "exit":
        return "text-cyan-400";
      default:
        return "text-gray-300";
    }
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 bg-slate-900 border-slate-700 shadow-2xl z-50">
        <div className="flex items-center justify-between p-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-slate-300">Terminal</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-800"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-3 w-3 text-slate-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-800"
              onClick={onClose}
            >
              <X className="h-3 w-3 text-slate-400" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[600px] h-[400px] bg-slate-900 border-slate-700 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-green-400" />
          <span className="text-xs font-medium text-slate-300">
            Terminal - Ejecutando Tests
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-700"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-3 w-3 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-700"
            onClick={onClose}
          >
            <X className="h-3 w-3 text-slate-400" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs bg-slate-950"
      >
        {lines.length === 0 ? (
          <div className="text-slate-500">Iniciando terminal...</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
              {line.text}
            </div>
          ))
        )}
        
        {isRunning && (
          <div className="flex items-center gap-2 mt-2 text-slate-500">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Ejecutando...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
