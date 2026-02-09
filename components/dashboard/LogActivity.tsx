"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { DashboardStats } from "@/types/forensic";

interface LogActivityProps {
  stats: DashboardStats | null;
}

export function LogActivity({ stats }: LogActivityProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Actividad de Registros
        </CardTitle>
        <Activity className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {stats?.linesProcessed.toLocaleString() ?? 0}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {stats?.logRate ?? 0} l\u00edneas/seg
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-accent/50 px-3 py-2 text-center">
            <div className="text-sm font-semibold text-foreground">
              {stats?.linesProcessed.toLocaleString() ?? 0}
            </div>
            <div className="text-[10px] text-muted-foreground">
              L\u00edneas Procesadas
            </div>
          </div>
          <div className="rounded-md bg-accent/50 px-3 py-2 text-center">
            <div className="text-sm font-semibold text-severity-high">
              {stats?.errorsDetected ?? 0}
            </div>
            <div className="text-[10px] text-muted-foreground">
              Errores (4xx/5xx)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
