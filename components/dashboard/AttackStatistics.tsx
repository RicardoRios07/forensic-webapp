"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import type { DashboardStats } from "@/types/forensic";

interface AttackStatisticsProps {
  stats: DashboardStats | null;
}

export function AttackStatistics({ stats }: AttackStatisticsProps) {
  const total = stats?.totalAttacks ?? 0;
  const rate = stats?.attackRate ?? 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Ataques Detectados
        </CardTitle>
        <ShieldAlert className="h-4 w-4 text-severity-high" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{total}</div>
        <p className="mt-1 text-xs text-muted-foreground">
          {rate} ataques/min
        </p>

        <div className="mt-4 space-y-2">
          <AttackRow
            label="Inyección SQL"
            count={stats?.attacksByType.sqli ?? 0}
            total={total}
            color="bg-attack-sqli"
          />
          <AttackRow
            label="Inyección Cmd"
            count={stats?.attacksByType.command_injection ?? 0}
            total={total}
            color="bg-attack-cmdi"
          />
          <AttackRow
            label="Fuerza Bruta"
            count={stats?.attacksByType.brute_force ?? 0}
            total={total}
            color="bg-attack-brute"
          />
          <AttackRow
            label="Inclusión Arch."
            count={stats?.attacksByType.file_inclusion ?? 0}
            total={total}
            color="bg-attack-fi"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function AttackRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{count}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-accent">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
