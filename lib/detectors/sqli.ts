import type { DetectionResult, LogEntry, Severity } from "@/types/forensic";
import { AttackDetector } from "./base";

export class SQLInjectionDetector extends AttackDetector {
  name = "sqli" as const;

  patterns = [
    /('|%27).*OR.*('|%27).*=.*('|%27)/gi,
    /UNION\s+SELECT/gi,
    /('|%27).*--/gi,
    /('|%27);?\s*DROP/gi,
    /('|%27)\s*OR\s*1\s*=\s*1/gi,
    /('|%27)\s*OR\s*('|%27)\s*\w+('|%27)\s*=\s*('|%27)\s*\w+/gi,
    /SELECT\s+.*\s+FROM/gi,
    /INSERT\s+INTO/gi,
    /UPDATE\s+\w+\s+SET/gi,
    /ORDER\s+BY\s+\d+/gi,
    /SLEEP\s*\(/gi,
    /BENCHMARK\s*\(/gi,
  ];

  detect(logEntry: LogEntry): DetectionResult | null {
    const fullText = decodeURIComponent(
      `${logEntry.endpoint} ${logEntry.params}`
    );
    const matched = this.matchPatterns(fullText);

    if (matched.length === 0) return null;

    const severity = this.calculateSeverity(fullText);
    const payload = logEntry.params || logEntry.endpoint;
    const alert = this.createAlert(logEntry, payload, severity);

    return {
      detected: true,
      alert,
      confidence: this.calculateConfidence(fullText),
    };
  }

  private calculateSeverity(text: string): Severity {
    if (/DROP|DELETE|UPDATE|INSERT/gi.test(text)) return "critical";
    if (/UNION.*SELECT/gi.test(text)) return "high";
    if (/SLEEP|BENCHMARK/gi.test(text)) return "high";
    return "medium";
  }
}
