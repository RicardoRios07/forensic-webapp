"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import type { DashboardStats } from "@/types/forensic";

interface AlertSummaryProps {
  stats: DashboardStats | null;
}

const SEVERITY_CONFIG = [
  { key: "critical", label: "Critical", className: "bg-severity-critical text-foreground" },
  { key: "high", label: "High", className: "bg-severity-high text-foreground" },
  { key: "medium", label: "Medium", className: "bg-severity-medium text-background" },
  { key: "low", label: "Low", className: "bg-severity-low text-foreground" },
] as const;

export function AlertSummary({ stats }: AlertSummaryProps) {
  const activeAlerts = stats?.alertsByStatus.active ?? 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Active Alerts
        </CardTitle>
        <Bell className="h-4 w-4 text-severity-critical" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{activeAlerts}</div>
        <p className="mt-1 text-xs text-muted-foreground">alerts require attention</p>

        <div className="mt-4 space-y-2">
          {SEVERITY_CONFIG.map((s) => {
            const count =
              stats?.alertsBySeverity[s.key as keyof typeof stats.alertsBySeverity] ?? 0;
            return (
              <div key={s.key} className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${s.className}`}
                >
                  {s.label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        <Button variant="outline" size="sm" asChild className="mt-4 w-full text-xs bg-transparent">
          <Link href="/alerts">View All Alerts</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
