import type { DetectionResult, LogEntry, Severity } from "@/types/forensic";
import { AttackDetector } from "./base";

interface LoginAttempt {
  timestamp: number;
  ip: string;
}

export class BruteForceDetector extends AttackDetector {
  name = "brute_force" as const;
  patterns = [/login\.php/gi, /\/login/gi, /\/auth/gi, /\/session/gi];

  private loginAttempts: LoginAttempt[] = [];
  private readonly WINDOW_MS = 10000; // 10 seconds
  private readonly THRESHOLD = 5;

  detect(logEntry: LogEntry): DetectionResult | null {
    // Only look at POST requests to login-like endpoints
    if (logEntry.method !== "POST") return null;

    const fullText = `${logEntry.endpoint} ${logEntry.params}`;
    const matched = this.matchPatterns(fullText);
    if (matched.length === 0) return null;

    const now = Date.now();

    // Record this attempt
    this.loginAttempts.push({ timestamp: now, ip: logEntry.ip });

    // Clean old entries
    this.loginAttempts = this.loginAttempts.filter(
      (a) => now - a.timestamp < this.WINDOW_MS
    );

    // Count attempts from this IP in the window
    const ipAttempts = this.loginAttempts.filter(
      (a) => a.ip === logEntry.ip
    ).length;

    if (ipAttempts < this.THRESHOLD) return null;

    const severity = this.calculateSeverity(ipAttempts);
    const payload = `${ipAttempts} login attempts in ${this.WINDOW_MS / 1000}s from ${logEntry.ip}`;
    const alert = this.createAlert(logEntry, payload, severity);

    // Reset to avoid flooding alerts for same burst
    this.loginAttempts = this.loginAttempts.filter(
      (a) => a.ip !== logEntry.ip
    );

    return {
      detected: true,
      alert,
      confidence: Math.min((ipAttempts / this.THRESHOLD) * 80, 100),
    };
  }

  private calculateSeverity(attempts: number): Severity {
    if (attempts > 20) return "high";
    if (attempts > 10) return "medium";
    return "medium";
  }
}
