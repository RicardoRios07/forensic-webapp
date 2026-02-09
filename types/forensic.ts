// ============================================================
// Core Types for DVWA Forensic Monitor
// ============================================================

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type AttackType =
  | "sqli"
  | "command_injection"
  | "brute_force"
  | "file_inclusion";

export type AlertStatus = "active" | "acknowledged" | "resolved";

// ---- Log Entry ----
export interface LogEntry {
  id: string;
  raw: string;
  ip: string;
  timestamp: Date;
  method: string;
  endpoint: string;
  statusCode: number;
  size: number;
  params: string;
  url: string;
}

// ---- Detection Result ----
export interface DetectionResult {
  detected: boolean;
  alert: Alert;
  confidence: number;
}

// ---- Alert ----
export interface Alert {
  id: string;
  timestamp: Date;
  severity: Severity;
  attackType: AttackType;
  source: string;
  target: string;
  payload: string;
  evidence: string[];
  status: AlertStatus;
}

// ---- Timeline Event ----
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: "attack" | "access" | "modification" | "alert";
  attackType?: AttackType;
  description: string;
  details: {
    ip?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    payload?: string;
  };
  severity: Severity;
}

// ---- Container Info ----
export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  created: string;
  ports: string;
}

export interface ContainerStats {
  cpuPercent: number;
  memoryUsage: number;
  memoryLimit: number;
  memoryPercent: number;
  networkIn: number;
  networkOut: number;
  uptime: string;
  running: boolean;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalAttacks: number;
  attacksByType: Record<AttackType, number>;
  attackRate: number; // attacks per minute
  topIPs: { ip: string; count: number }[];
  linesProcessed: number;
  logRate: number;
  errorsDetected: number;
  alertsByStatus: Record<AlertStatus, number>;
  alertsBySeverity: Record<Severity, number>;
}

// ---- Process Result ----
export interface ProcessResult {
  processed: boolean;
  logEntry?: LogEntry;
  detections?: DetectionResult[];
}
