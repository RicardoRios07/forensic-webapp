"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pause, Play, Trash2, Download, Search } from "lucide-react";
import { useForensicStream } from "@/hooks/use-forensic-stream";
import { LogViewer } from "@/components/logs/LogViewer";

export default function LogsPage() {
  const { logs, isStreaming, isPaused, pause, resume, clearLogs } =
    useForensicStream();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);

  const handleExport = () => {
    const content = logs
      .map(
        (l) =>
          `${new Date(l.timestamp).toISOString()} ${l.ip} ${l.method} ${l.endpoint}${l.params ? `?${l.params}` : ""} ${l.statusCode} ${l.size}`
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forensic-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Visor de Registros
          </h1>
          <p className="text-sm text-muted-foreground">
            Flujo de registros en tiempo real con resaltado de sintaxis y detecci\u00f3n de ataques
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-running opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-state-running" />
              </span>
              {logs.length.toLocaleString()} l\u00edneas
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar registros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm bg-background"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue placeholder="Filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Registros</SelectItem>
            <SelectItem value="attacks">Solo Ataques</SelectItem>
            <SelectItem value="normal">Solo Normal</SelectItem>
            <SelectItem value="sqli">Inyecci\u00f3n SQL</SelectItem>
            <SelectItem value="cmdi">Inyecci\u00f3n de Comandos</SelectItem>
            <SelectItem value="brute">Fuerza Bruta</SelectItem>
            <SelectItem value="fi">Inclusi\u00f3n de Archivos</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={isPaused ? "default" : "outline"}
          size="sm"
          className="h-9 gap-1.5 text-xs"
          onClick={isPaused ? resume : pause}
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5" /> Reanudar
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" /> Pausar
            </>
          )}
        </Button>

        <Button
          variant={autoScroll ? "default" : "outline"}
          size="sm"
          className="h-9 text-xs"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          Auto-scroll {autoScroll ? "ACT" : "DES"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs bg-transparent"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs text-severity-high hover:text-severity-critical bg-transparent"
          onClick={clearLogs}
        >
          <Trash2 className="h-3.5 w-3.5" /> Limpiar
        </Button>
      </div>

      {/* Log Viewer */}
      <LogViewer
        logs={logs}
        autoScroll={autoScroll}
        searchQuery={searchQuery}
        filterType={filterType}
      />
    </div>
  );
}
