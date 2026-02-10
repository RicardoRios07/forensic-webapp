"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import type { DashboardStats } from "@/types/forensic";

interface TopIPsProps {
  stats: DashboardStats | null;
}

export function TopIPs({ stats }: TopIPsProps) {
  const topIPs = stats?.topIPs ?? [];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          IPs con Más Ataques
        </CardTitle>
        <Globe className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {topIPs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin datos aún
          </p>
        ) : (
          <div className="space-y-3">
            {topIPs.slice(0, 5).map((item, i) => {
              const maxCount = topIPs[0]?.count ?? 1;
              const pct = (item.count / maxCount) * 100;
              return (
                <div key={item.ip} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono text-xs text-foreground">
                      <span className="text-muted-foreground">
                        {i + 1}.
                      </span>
                      {item.ip}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.count} ataques
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full rounded-full bg-severity-high"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
