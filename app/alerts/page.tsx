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
import { AlertCard } from "@/components/alerts/AlertCard";
import { useForensicStream } from "@/hooks/use-forensic-stream";
import type { Alert } from "@/types/forensic";
import { cn } from "@/lib/utils";

const SEVERITY_FILTERS = [
  { value: "all", label: "Todas las Severidades" },
  { value: "critical", label: "Crítico" },
  { value: "high", label: "Alto" },
  { value: "medium", label: "Medio" },
  { value: "low", label: "Bajo" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Todos los Estados" },
  { value: "active", label: "Activa" },
  { value: "acknowledged", label: "Reconocida" },
  { value: "resolved", label: "Resuelta" },
];

const TYPE_FILTERS = [
  { value: "all", label: "Todos los Tipos" },
  { value: "sqli", label: "Inyección SQL" },
  { value: "command_injection", label: "Inyección de Comandos" },
  { value: "brute_force", label: "Fuerza Bruta" },
  { value: "file_inclusion", label: "Inclusión de Archivos" },
];

export default function AlertsPage() {
  // Keep the stream going so we get new alerts
  useForensicStream();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (severity !== "all") params.set("severity", severity);
      if (status !== "all") params.set("status", status);
      if (type !== "all") params.set("type", type);

      const res = await fetch(`/api/alerts?${params.toString()}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch {
      // ignore
    }
  }, [severity, status, type]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleAcknowledge = async (id: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "acknowledged" }),
    });
    fetchAlerts();
  };

  const handleResolve = async (id: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    fetchAlerts();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    fetchAlerts();
  };

  // Severity summary counts
  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Alertas
        </h1>
        <p className="text-sm text-muted-foreground">
          Alertas de seguridad generadas por el análisis de detección de ataques
        </p>
      </div>

      {/* Summary badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: "Todas", style: "bg-accent text-foreground" },
          {
            key: "critical",
            label: "Crítico",
            style: "bg-severity-critical/20 text-severity-critical",
          },
          {
            key: "high",
            label: "Alto",
            style: "bg-severity-high/20 text-severity-high",
          },
          {
            key: "medium",
            label: "Medio",
            style: "bg-severity-medium/20 text-severity-medium",
          },
          {
            key: "low",
            label: "Bajo",
            style: "bg-severity-low/20 text-severity-low",
          },
        ].map((item) => (
          <Button
            key={item.key}
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs",
              severity === item.key && item.style
            )}
            onClick={() => setSeverity(item.key)}
          >
            {item.label}
            <span className="ml-1 rounded-full bg-background/50 px-1.5 text-[10px]">
              {counts[item.key as keyof typeof counts] ?? 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-44 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No hay alertas que coincidan con tus filtros. Las alertas
              aparecerán a medida que se detecten ataques.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
