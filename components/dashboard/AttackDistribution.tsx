"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { DashboardStats } from "@/types/forensic";

interface AttackDistributionProps {
  stats: DashboardStats | null;
}

const ATTACK_COLORS: Record<string, string> = {
  sqli: "hsl(263, 70%, 50%)",
  command_injection: "hsl(0, 84%, 60%)",
  brute_force: "hsl(38, 92%, 50%)",
  file_inclusion: "hsl(330, 81%, 60%)",
};

const ATTACK_LABELS: Record<string, string> = {
  sqli: "SQL Injection",
  command_injection: "Command Injection",
  brute_force: "Brute Force",
  file_inclusion: "File Inclusion",
};

export function AttackDistribution({ stats }: AttackDistributionProps) {
  const data = stats
    ? Object.entries(stats.attacksByType)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: ATTACK_LABELS[key] || key,
          value,
          color: ATTACK_COLORS[key] || "#64748b",
        }))
    : [];

  const hasData = data.length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Attack Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(217, 33%, 17%)",
                  border: "1px solid hsl(215, 19%, 35%)",
                  borderRadius: "6px",
                  color: "hsl(210, 40%, 98%)",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-60 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Waiting for attack data...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
