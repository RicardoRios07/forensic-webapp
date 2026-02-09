import type { DetectionResult, LogEntry, Severity } from "@/types/forensic";
import { AttackDetector } from "./base";

export class CommandInjectionDetector extends AttackDetector {
  name = "command_injection" as const;

  patterns = [
    /;\s*(ls|cat|whoami|pwd|id|uname|ifconfig|netstat|ps|wget|curl|nc|ncat|bash|sh|python|perl|ruby|php)/gi,
    /\|\s*(ls|cat|whoami|pwd|id|uname|bash|sh)/gi,
    /`[^`]+`/gi,
    /\$\([^)]+\)/gi,
    /&&\s*[a-z]+/gi,
    /\/etc\/passwd/gi,
    /\/etc\/shadow/gi,
    /\/bin\/(bash|sh)/gi,
    /\beval\s*\(/gi,
    /\bexec\s*\(/gi,
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
    if (/\/etc\/(passwd|shadow)/gi.test(text)) return "critical";
    if (/(bash|sh|python|perl|ruby|nc|ncat|wget|curl)/gi.test(text))
      return "critical";
    if (/eval|exec/gi.test(text)) return "critical";
    return "high";
  }
}
