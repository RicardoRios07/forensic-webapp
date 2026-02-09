import type {
  Alert,
  AttackType,
  DetectionResult,
  LogEntry,
  Severity,
} from "@/types/forensic";
import { generateId } from "@/lib/utils/ids";

export abstract class AttackDetector {
  abstract name: AttackType;
  abstract patterns: RegExp[];

  abstract detect(logEntry: LogEntry): DetectionResult | null;

  protected matchPatterns(text: string): RegExp[] {
    return this.patterns.filter((p) => {
      p.lastIndex = 0; // reset for /g flags
      return p.test(text);
    });
  }

  protected createAlert(
    logEntry: LogEntry,
    payload: string,
    severity: Severity
  ): Alert {
    return {
      id: generateId(),
      timestamp: new Date(),
      severity,
      attackType: this.name,
      source: logEntry.ip,
      target: logEntry.endpoint,
      payload,
      evidence: [logEntry.id],
      status: "active",
    };
  }

  protected calculateConfidence(text: string): number {
    const matches = this.patterns.filter((p) => {
      p.lastIndex = 0;
      return p.test(text);
    }).length;
    return Math.min((matches / this.patterns.length) * 100, 100);
  }
}
