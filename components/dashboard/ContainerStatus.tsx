"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Cpu, HardDrive, ArrowUpDown } from "lucide-react";
import type { ContainerStats } from "@/types/forensic";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface ContainerStatusProps {
  stats: ContainerStats | null;
  containerName: string;
}

export function ContainerStatus({ stats, containerName }: ContainerStatusProps) {
  const isRunning = stats?.running ?? false;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Container Status
        </CardTitle>
        <Server className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${isRunning ? "bg-state-running" : "bg-state-stopped"}`}
          />
          <span className="text-2xl font-bold text-foreground">
            {isRunning ? "Running" : "Stopped"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {containerName} - {stats?.uptime ?? "N/A"}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-md bg-accent/50 px-2 py-1.5">
            <Cpu className="mb-1 h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              {stats?.cpuPercent ?? 0}%
            </span>
            <span className="text-[10px] text-muted-foreground">CPU</span>
          </div>
          <div className="flex flex-col items-center rounded-md bg-accent/50 px-2 py-1.5">
            <HardDrive className="mb-1 h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              {stats ? formatBytes(stats.memoryUsage) : "0 MB"}
            </span>
            <span className="text-[10px] text-muted-foreground">Memory</span>
          </div>
          <div className="flex flex-col items-center rounded-md bg-accent/50 px-2 py-1.5">
            <ArrowUpDown className="mb-1 h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              {stats ? formatBytes(stats.networkIn) : "0 KB"}
            </span>
            <span className="text-[10px] text-muted-foreground">Net I/O</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
