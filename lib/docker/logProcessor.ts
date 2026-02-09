import type {
  AttackType,
  DetectionResult,
  LogEntry,
  ProcessResult,
  TimelineEvent,
} from "@/types/forensic";
import { generateId } from "@/lib/utils/ids";
import { SQLInjectionDetector } from "@/lib/detectors/sqli";
import { CommandInjectionDetector } from "@/lib/detectors/commandInjection";
import { BruteForceDetector } from "@/lib/detectors/bruteForce";
import { FileInclusionDetector } from "@/lib/detectors/fileInclusion";
import type { AttackDetector } from "@/lib/detectors/base";
import { store } from "@/lib/store";

const ATTACK_LABELS: Record<AttackType, string> = {
  sqli: "SQL Injection",
  command_injection: "Command Injection",
  brute_force: "Brute Force",
  file_inclusion: "File Inclusion",
};

class LogProcessor {
  private detectors: AttackDetector[];

  constructor() {
    this.detectors = [
      new SQLInjectionDetector(),
      new CommandInjectionDetector(),
      new BruteForceDetector(),
      new FileInclusionDetector(),
    ];
  }

  processLogLine(line: string): ProcessResult {
    const logEntry = this.parseLogLine(line);

    if (!logEntry) {
      return { processed: false };
    }

    // Store the log
    store.addLog(logEntry);

    // Run detectors
    const detections: DetectionResult[] = [];
    for (const detector of this.detectors) {
      try {
        const result = detector.detect(logEntry);
        if (result?.detected) {
          detections.push(result);

          // Store alert and timeline event
          store.addAlert(result.alert);

          const timelineEvent: TimelineEvent = {
            id: generateId(),
            timestamp: new Date(),
            type: "attack",
            attackType: result.alert.attackType,
            description: `${ATTACK_LABELS[result.alert.attackType]} detected from ${result.alert.source}`,
            details: {
              ip: logEntry.ip,
              endpoint: logEntry.endpoint,
              method: logEntry.method,
              statusCode: logEntry.statusCode,
              payload: result.alert.payload,
            },
            severity: result.alert.severity,
          };
          store.addTimelineEvent(timelineEvent);
        }
      } catch {
        // Skip detector errors silently
      }
    }

    // Also add normal access events to timeline (sampled)
    if (detections.length === 0 && Math.random() < 0.05) {
      store.addTimelineEvent({
        id: generateId(),
        timestamp: new Date(),
        type: "access",
        description: `${logEntry.method} ${logEntry.endpoint} from ${logEntry.ip}`,
        details: {
          ip: logEntry.ip,
          endpoint: logEntry.endpoint,
          method: logEntry.method,
          statusCode: logEntry.statusCode,
        },
        severity: "info",
      });
    }

    return {
      processed: true,
      logEntry,
      detections,
    };
  }

  parseLogLine(line: string): LogEntry | null {
    // Apache combined log format
    const apacheRegex =
      /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d{3}) (\d+|-)/;
    const match = line.match(apacheRegex);

    if (!match) {
      // Try simpler format: just IP and request
      const simpleRegex = /(\d+\.\d+\.\d+\.\d+).*"(\S+) (\S+)/;
      const simpleMatch = line.match(simpleRegex);
      if (!simpleMatch) return null;

      const endpoint = simpleMatch[3];
      const [path, params] = endpoint.split("?");

      return {
        id: generateId(),
        raw: line,
        ip: simpleMatch[1],
        timestamp: new Date(),
        method: simpleMatch[2],
        endpoint: path,
        url: endpoint,
        statusCode: 200,
        size: 0,
        params: params || "",
      };
    }

    const endpoint = match[4];
    const [path, params] = endpoint.split("?");

    return {
      id: generateId(),
      raw: line,
      ip: match[1],
      timestamp: this.parseApacheDate(match[2]) || new Date(),
      method: match[3],
      endpoint: path,
      url: endpoint,
      statusCode: Number.parseInt(match[5]),
      size: match[6] !== "-" ? Number.parseInt(match[6]) : 0,
      params: params || "",
    };
  }

  private parseApacheDate(dateStr: string): Date | null {
    try {
      // Format: 09/Feb/2026:10:23:45 +0000
      const cleaned = dateStr.replace(
        /(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/,
        "$2 $1, $3 $4"
      );
      return new Date(cleaned);
    } catch {
      return null;
    }
  }
}

// Singleton
const globalForProcessor = globalThis as unknown as {
  logProcessor: LogProcessor;
};

export const logProcessor =
  globalForProcessor.logProcessor ?? new LogProcessor();

if (process.env.NODE_ENV !== "production") {
  globalForProcessor.logProcessor = logProcessor;
}
