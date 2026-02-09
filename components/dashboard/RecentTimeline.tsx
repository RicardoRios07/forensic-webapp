"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { TimelineEvent } from "@/types/forensic";
import { cn } from "@/lib/utils";

interface RecentTimelineProps {
  events: TimelineEvent[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-severity-critical",
  high: "bg-severity-high",
  medium: "bg-severity-medium",
  low: "bg-severity-low",
  info: "bg-severity-info",
};

const ATTACK_LABELS: Record<string, string> = {
  sqli: "Iny. SQL",
  command_injection: "Iny. Cmd",
  brute_force: "F. Bruta",
  file_inclusion: "Inc. Arch",
};

export function RecentTimeline({ events }: RecentTimelineProps) {
  const recentEvents = events.slice(-20).reverse();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Cronolog\u00eda Reciente
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="h-7 gap-1 text-xs text-primary">
          <Link href="/timeline">
            Ver Todo
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Esperando eventos...
          </p>
        ) : (
          <div className="space-y-3">
            {recentEvents.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      SEVERITY_COLORS[event.severity] || "bg-severity-info"
                    )}
                  />
                  <div className="mt-1 h-full w-px bg-border" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    {event.attackType && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                        {ATTACK_LABELS[event.attackType] || event.attackType}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
