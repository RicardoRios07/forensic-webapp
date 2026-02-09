import type { DetectionResult, LogEntry, Severity } from "@/types/forensic";
import { AttackDetector } from "./base";

export class FileInclusionDetector extends AttackDetector {
  name = "file_inclusion" as const;

  patterns = [
    /\.\.\//gi,
    /\.\.%2[fF]/gi,
    /\/etc\/passwd/gi,
    /\/etc\/shadow/gi,
    /\/var\/log/gi,
    /\/proc\/self/gi,
    /file=.*\.\./gi,
    /page=.*\.\./gi,
    /include=.*\.\./gi,
    /page=https?:\/\//gi,
    /file=https?:\/\//gi,
    /php:\/\/filter/gi,
    /php:\/\/input/gi,
    /data:\/\//gi,
    /expect:\/\//gi,
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
    if (/\/etc\/(passwd|shadow)/gi.test(text)) return "high";
    if (/php:\/\/(filter|input)/gi.test(text)) return "critical";
    if (/page=https?:\/\//gi.test(text)) return "high"; // RFI
    return "medium";
  }
}
