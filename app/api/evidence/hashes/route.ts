import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import crypto from "crypto";

export async function GET() {
  try {
    const logs = store.getLogs();
    const alerts = store.getAlerts();
    const timeline = store.getTimeline();

    // Generate hashes for different evidence types
    const hashes: Record<string, string> = {};

    // Hash logs
    const logsContent = JSON.stringify(logs);
    hashes["forensic-logs.json"] = crypto
      .createHash("sha256")
      .update(logsContent)
      .digest("hex");

    // Hash alerts
    const alertsContent = JSON.stringify(alerts);
    hashes["forensic-alerts.json"] = crypto
      .createHash("sha256")
      .update(alertsContent)
      .digest("hex");

    // Hash timeline
    const timelineContent = JSON.stringify(timeline);
    hashes["forensic-timeline.json"] = crypto
      .createHash("sha256")
      .update(timelineContent)
      .digest("hex");

    return NextResponse.json({
      hashes,
      timestamp: new Date().toISOString(),
      algorithm: "SHA256",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate hashes", details: String(error) },
      { status: 500 }
    );
  }
}
