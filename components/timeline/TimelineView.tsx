"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { TimelineEvent } from "@/types/forensic";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Globe,
  Terminal,
  FileWarning,
  KeyRound,
  Database,
} from "lucide-react";

interface TimelineViewProps {
  events: TimelineEvent[];
}

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-severity-critical shadow-severity-critical/40",
  high: "bg-severity-high shadow-severity-high/40",
  medium: "bg-severity-medium shadow-severity-medium/40",
  low: "bg-severity-low shadow-severity-low/40",
  info: "bg-severity-info",
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: "text-severity-critical",
  high: "text-severity-high",
  medium: "text-severity-medium",
  low: "text-severity-low",
  info: "text-severity-info",
};

const ATTACK_ICONS: Record<string, typeof ShieldAlert> = {
  sqli: Database,
  command_injection: Terminal,
  brute_force: KeyRound,
  file_inclusion: FileWarning,
};

const ATTACK_LABELS: Record<string, string> = {
  sqli: "SQL Injection",
  command_injection: "Command Injection",
  brute_force: "Brute Force",
  file_inclusion: "File Inclusion",
};

export function TimelineView({ events }: TimelineViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null
  );

  if (events.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Timeline events will appear here as monitoring progresses...
        </p>
      </div>
    );
  }

  const reversed = [...events].reverse();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Timeline list */}
      <div className="lg:col-span-2">
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 h-full w-px bg-border" />

          {reversed.map((event) => {
            const Icon =
              event.attackType
                ? ATTACK_ICONS[event.attackType] || ShieldAlert
                : Globe;
            const isSelected = selectedEvent?.id === event.id;

            return (
              <button
                type="button"
                key={event.id}
                className={cn(
                  "relative flex w-full items-start gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-accent/30",
                  isSelected && "bg-accent/40"
                )}
                onClick={() => setSelectedEvent(event)}
              >
                {/* Dot */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      SEVERITY_DOT[event.severity]
                    )}
                  >
                    <Icon className="h-3 w-3 text-foreground" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {event.attackType && (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          SEVERITY_TEXT[event.severity]
                        )}
                      >
                        {ATTACK_LABELS[event.attackType] || event.attackType}
                      </span>
                    )}
                    {event.type === "access" && (
                      <span className="text-xs font-medium text-severity-info">
                        Normal Access
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {event.description}
                  </p>
                  {event.details.ip && (
                    <span className="mt-1 inline-block font-mono text-[10px] text-severity-low">
                      {event.details.ip}
                    </span>
                  )}
                </div>

                {/* Severity badge */}
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                    event.severity === "critical" &&
                      "bg-severity-critical/20 text-severity-critical",
                    event.severity === "high" &&
                      "bg-severity-high/20 text-severity-high",
                    event.severity === "medium" &&
                      "bg-severity-medium/20 text-severity-medium",
                    event.severity === "low" &&
                      "bg-severity-low/20 text-severity-low",
                    event.severity === "info" &&
                      "bg-severity-info/20 text-severity-info"
                  )}
                >
                  {event.severity}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-20">
          {selectedEvent ? (
            <Card className="border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    SEVERITY_DOT[selectedEvent.severity]
                  )}
                />
                <h3 className="text-sm font-bold text-foreground">
                  {selectedEvent.attackType
                    ? ATTACK_LABELS[selectedEvent.attackType]
                    : "Access Event"}
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow
                  label="Time"
                  value={new Date(
                    selectedEvent.timestamp
                  ).toLocaleString()}
                />
                <DetailRow label="Severity" value={selectedEvent.severity} />
                <DetailRow label="Type" value={selectedEvent.type} />
                {selectedEvent.details.ip && (
                  <DetailRow label="Source IP" value={selectedEvent.details.ip} mono />
                )}
                {selectedEvent.details.endpoint && (
                  <DetailRow
                    label="Endpoint"
                    value={selectedEvent.details.endpoint}
                    mono
                  />
                )}
                {selectedEvent.details.method && (
                  <DetailRow label="Method" value={selectedEvent.details.method} />
                )}
                {selectedEvent.details.statusCode && (
                  <DetailRow
                    label="Status"
                    value={String(selectedEvent.details.statusCode)}
                  />
                )}
                {selectedEvent.details.payload && (
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Payload
                    </span>
                    <code className="mt-1 block rounded bg-background px-3 py-2 font-mono text-xs text-severity-high break-all">
                      {decodeURIComponent(selectedEvent.details.payload)}
                    </code>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                {selectedEvent.description}
              </p>
            </Card>
          ) : (
            <Card className="border-border bg-card p-8 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Select an event to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <p
        className={cn(
          "text-xs text-foreground",
          mono && "font-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
}
