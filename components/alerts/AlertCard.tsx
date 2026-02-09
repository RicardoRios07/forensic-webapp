"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, Trash2, Clock } from "lucide-react";
import type { Alert } from "@/types/forensic";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
}

const SEVERITY_STYLES: Record<
  string,
  { badge: string; border: string; label: string }
> = {
  critical: {
    badge: "bg-severity-critical text-foreground",
    border: "border-l-severity-critical",
    label: "CR\u00cdTICO",
  },
  high: {
    badge: "bg-severity-high text-foreground",
    border: "border-l-severity-high",
    label: "ALTO",
  },
  medium: {
    badge: "bg-severity-medium text-background",
    border: "border-l-severity-medium",
    label: "MEDIO",
  },
  low: {
    badge: "bg-severity-low text-foreground",
    border: "border-l-severity-low",
    label: "BAJO",
  },
};

const ATTACK_LABELS: Record<string, string> = {
  sqli: "Inyecci\u00f3n SQL",
  command_injection: "Inyecci\u00f3n de Comandos",
  brute_force: "Fuerza Bruta",
  file_inclusion: "Inclusi\u00f3n de Archivos",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-severity-high/20 text-severity-high",
  acknowledged: "bg-severity-medium/20 text-severity-medium",
  resolved: "bg-severity-info/20 text-severity-info",
};

export function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onDelete,
}: AlertCardProps) {
  const severity = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low;
  const attackLabel =
    ATTACK_LABELS[alert.attackType] || alert.attackType;
  const timeAgo = getTimeAgo(new Date(alert.timestamp));

  return (
    <Card
      className={cn(
        "border-l-4 border-border bg-card p-4 transition-colors hover:bg-accent/20",
        severity.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase",
              severity.badge
            )}
          >
            {severity.label}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {attackLabel}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
              STATUS_STYLES[alert.status]
            )}
          >
            {alert.status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            IP:{" "}
            <span className="font-mono font-semibold text-severity-low">
              {alert.source}
            </span>
          </span>
          <span className="text-muted-foreground">
            Objetivo:{" "}
            <span className="font-mono text-foreground">{alert.target}</span>
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Carga \u00fatil:{" "}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-severity-high">
            {decodeURIComponent(alert.payload).slice(0, 120)}
            {alert.payload.length > 120 ? "..." : ""}
          </code>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {alert.status === "active" && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs bg-transparent"
            onClick={() => onAcknowledge(alert.id)}
          >
            <Eye className="h-3 w-3" />
            Reconocer
          </Button>
        )}
        {alert.status !== "resolved" && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs bg-transparent"
            onClick={() => onResolve(alert.id)}
          >
            <CheckCircle className="h-3 w-3" />
            Resolver
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 gap-1 text-xs text-muted-foreground hover:text-severity-critical"
          onClick={() => onDelete(alert.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours}h`;
}
