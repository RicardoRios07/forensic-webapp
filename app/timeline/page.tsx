"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { TimelineView } from "@/components/timeline/TimelineView";
import { useForensicStream } from "@/hooks/use-forensic-stream";
import type { TimelineEvent } from "@/types/forensic";
import { cn } from "@/lib/utils";

const TIME_RANGES = [
  { value: "5m", label: "Last 5 min", ms: 5 * 60 * 1000 },
  { value: "1h", label: "Last 1 hour", ms: 60 * 60 * 1000 },
  { value: "24h", label: "Last 24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "all", label: "All", ms: 0 },
];

export default function TimelinePage() {
  useForensicStream();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [timeRange, setTimeRange] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const fetchTimeline = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (timeRange !== "all") {
        const range = TIME_RANGES.find((r) => r.value === timeRange);
        if (range) {
          params.set("from", new Date(Date.now() - range.ms).toISOString());
        }
      }
      if (filterType !== "all") {
        params.set("type", filterType);
      }

      const res = await fetch(`/api/timeline?${params.toString()}`);
      const data = await res.json();
      setEvents(data.timeline || []);
    } catch {
      // ignore
    }
  }, [timeRange, filterType]);

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 2000);
    return () => clearInterval(interval);
  }, [fetchTimeline]);

  const handleExport = () => {
    const content = JSON.stringify(events, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timeline-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const attackEvents = events.filter((e) => e.type === "attack").length;
  const normalEvents = events.filter((e) => e.type === "access").length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Incident Timeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Chronological view of all security events and access patterns
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs bg-transparent"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export Timeline
        </Button>
      </div>

      {/* Filters and Stats */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 text-xs",
                timeRange === range.value &&
                  "bg-primary/10 text-primary"
              )}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="attack">Attacks</SelectItem>
            <SelectItem value="access">Normal Access</SelectItem>
            <SelectItem value="sqli">SQL Injection</SelectItem>
            <SelectItem value="command_injection">Command Injection</SelectItem>
            <SelectItem value="brute_force">Brute Force</SelectItem>
            <SelectItem value="file_inclusion">File Inclusion</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Total:{" "}
            <span className="font-semibold text-foreground">
              {events.length}
            </span>
          </span>
          <span>
            Attacks:{" "}
            <span className="font-semibold text-severity-high">
              {attackEvents}
            </span>
          </span>
          <span>
            Normal:{" "}
            <span className="font-semibold text-severity-info">
              {normalEvents}
            </span>
          </span>
        </div>
      </div>

      <TimelineView events={events} />
    </div>
  );
}
