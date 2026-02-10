"use client";

import { useEffect, useState, useCallback } from "react";
import { ContainerStatus } from "@/components/dashboard/ContainerStatus";
import { AttackStatistics } from "@/components/dashboard/AttackStatistics";
import { LogActivity } from "@/components/dashboard/LogActivity";
import { AlertSummary } from "@/components/dashboard/AlertSummary";
import { AttackDistribution } from "@/components/dashboard/AttackDistribution";
import { RecentTimeline } from "@/components/dashboard/RecentTimeline";
import { TopIPs } from "@/components/dashboard/TopIPs";
import { ResetButton } from "@/components/dashboard/ResetButton";
import { useForensicStream } from "@/hooks/use-forensic-stream";
import type {
  ContainerStats,
  DashboardStats,
  TimelineEvent,
} from "@/types/forensic";

export default function DashboardPage() {
  const { isStreaming } = useForensicStream();
  const [containerStats, setContainerStats] =
    useState<ContainerStats | null>(null);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [containerName, setContainerName] = useState("dvwa");

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, statsRes, timelineRes] = await Promise.all([
        fetch("/api/docker/status"),
        fetch("/api/stats"),
        fetch("/api/timeline"),
      ]);
      const statusData = await statusRes.json();
      const statsData = await statsRes.json();
      const timelineData = await timelineRes.json();

      if (statusData.stats) setContainerStats(statusData.stats);
      if (statusData.containerName) setContainerName(statusData.containerName);
      if (statsData.stats) setDashStats(statsData.stats);
      if (timelineData.timeline) setTimeline(timelineData.timeline);
    } catch {
      // ignore fetch errors
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Panel Forense
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoreo en tiempo real y detección de ataques para contenedor DVWA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResetButton />
          {isStreaming && (
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-primary">
                Monitoreo en vivo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ContainerStatus
          stats={containerStats}
          containerName={containerName}
        />
        <AttackStatistics stats={dashStats} />
        <LogActivity stats={dashStats} />
        <AlertSummary stats={dashStats} />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AttackDistribution stats={dashStats} />
        <TopIPs stats={dashStats} />
        <RecentTimeline events={timeline} />
      </div>
    </div>
  );
}
