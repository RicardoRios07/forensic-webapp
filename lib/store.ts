// ============================================================
// In-Memory Store for Forensic Data
// Singleton that persists across API route invocations
// ============================================================

import type {
  Alert,
  AlertStatus,
  AttackType,
  ContainerStats,
  DashboardStats,
  LogEntry,
  Severity,
  TimelineEvent,
} from "@/types/forensic";

const MAX_LOGS = 10000;
const MAX_ALERTS = 5000;
const MAX_TIMELINE = 5000;

class ForensicStore {
  // Connection state
  connectedContainerId: string | null = null;
  connectedContainerName: string | null = null;
  isMonitoring = false;

  // Data stores
  logs: LogEntry[] = [];
  alerts: Alert[] = [];
  timeline: TimelineEvent[] = [];

  // Stats
  totalLinesProcessed = 0;
  linesPerSecondBuckets: number[] = [];
  attacksPerMinuteBuckets: number[] = [];
  private lastStatsReset = Date.now();

  // Container stats cache
  containerStats: ContainerStats = {
    cpuPercent: 0,
    memoryUsage: 0,
    memoryLimit: 0,
    memoryPercent: 0,
    networkIn: 0,
    networkOut: 0,
    uptime: "0s",
    running: false,
  };

  // ---- Logs ----
  addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }
    this.totalLinesProcessed++;
  }

  getLogs(limit = 10000): LogEntry[] {
    return this.logs.slice(-limit);
  }

  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  // ---- Alerts ----
  addAlert(alert: Alert) {
    this.alerts.unshift(alert);
    if (this.alerts.length > MAX_ALERTS) {
      this.alerts = this.alerts.slice(0, MAX_ALERTS);
    }
  }

  getAlerts(filters?: {
    status?: AlertStatus;
    severity?: Severity;
    type?: AttackType;
  }): Alert[] {
    let result = this.alerts;
    if (filters?.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters?.severity) {
      result = result.filter((a) => a.severity === filters.severity);
    }
    if (filters?.type) {
      result = result.filter((a) => a.attackType === filters.type);
    }
    return result;
  }

  updateAlertStatus(id: string, status: AlertStatus): Alert | null {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = status;
      return alert;
    }
    return null;
  }

  deleteAlert(id: string): boolean {
    const idx = this.alerts.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.alerts.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ---- Timeline ----
  addTimelineEvent(event: TimelineEvent) {
    this.timeline.push(event);
    if (this.timeline.length > MAX_TIMELINE) {
      this.timeline = this.timeline.slice(-MAX_TIMELINE);
    }
  }

  getTimeline(filters?: {
    from?: Date;
    to?: Date;
    type?: string;
  }): TimelineEvent[] {
    let result = this.timeline;
    if (filters?.from) {
      result = result.filter((e) => e.timestamp >= filters.from!);
    }
    if (filters?.to) {
      result = result.filter((e) => e.timestamp <= filters.to!);
    }
    if (filters?.type) {
      result = result.filter(
        (e) => e.type === filters.type || e.attackType === filters.type
      );
    }
    return result;
  }

  // ---- Dashboard Stats ----
  getDashboardStats(): DashboardStats {
    const attacksByType: Record<AttackType, number> = {
      sqli: 0,
      command_injection: 0,
      brute_force: 0,
      file_inclusion: 0,
    };
    const alertsByStatus: Record<AlertStatus, number> = {
      active: 0,
      acknowledged: 0,
      resolved: 0,
    };
    const alertsBySeverity: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    const ipCounts: Record<string, number> = {};

    for (const alert of this.alerts) {
      attacksByType[alert.attackType]++;
      alertsByStatus[alert.status]++;
      alertsBySeverity[alert.severity]++;
      ipCounts[alert.source] = (ipCounts[alert.source] || 0) + 1;
    }

    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalAttacks = this.alerts.length;
    const elapsedMinutes = Math.max(
      (Date.now() - this.lastStatsReset) / 60000,
      1
    );
    const attackRate = +(totalAttacks / elapsedMinutes).toFixed(1);
    const logRate = +(
      this.totalLinesProcessed /
      Math.max((Date.now() - this.lastStatsReset) / 1000, 1)
    ).toFixed(1);

    const errorRate = +(
      this.logs.filter(
        (l) => l.statusCode >= 400
      ).length / this.totalLinesProcessed
    ).toFixed(1);

    const avgResponseTime = +(
      this.logs.reduce(
        (acc, l) => acc + (l.responseTime || 0),
        0
      ) / this.logs.length
    ).toFixed(1);

    return {
      totalAttacks,
      attacksByType,
      attackRate,
      topIPs,
      linesProcessed: this.totalLinesProcessed,
      logRate,
      errorsDetected: this.logs.filter(
        (l) => l.statusCode >= 400
      ).length,
      alertsByStatus,
      alertsBySeverity,
      totalLogs: this.logs.length,
      totalAlerts: this.alerts.length,
      errorRate,
      avgResponseTime,
    };
  }

  // ---- Reset ----
  reset() {
    this.logs = [];
    this.alerts = [];
    this.timeline = [];
    this.totalLinesProcessed = 0;
    this.linesPerSecondBuckets = [];
    this.attacksPerMinuteBuckets = [];
    this.lastStatsReset = Date.now();
    this.connectedContainerId = null;
    this.connectedContainerName = null;
    this.isMonitoring = false;
    this.containerStats = {
      cpuPercent: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      memoryPercent: 0,
      networkIn: 0,
      networkOut: 0,
      uptime: "0s",
      running: false,
    };
  }

  stats: DashboardStats = {
    totalAttacks: 0,
    attacksByType: {
      sqli: 0,
      command_injection: 0,
      brute_force: 0,
      file_inclusion: 0,
    },
    attackRate: 0,
    topIPs: [],
    linesProcessed: 0,
    logRate: 0,
    errorsDetected: 0,
    alertsByStatus: {
      active: 0,
      acknowledged: 0,
      resolved: 0,
    },
    alertsBySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    },
    totalLogs: 0,
    totalAlerts: 0,
    errorRate: 0,
    avgResponseTime: 0,
  };
}

// Singleton
const globalForStore = globalThis as unknown as {
  forensicStore: ForensicStore;
};

export const store =
  globalForStore.forensicStore ?? new ForensicStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.forensicStore = store;
}
