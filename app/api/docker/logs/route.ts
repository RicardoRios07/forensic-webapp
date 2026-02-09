import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { logProcessor } from "@/lib/docker/logProcessor";
import { generateLogLine } from "@/lib/docker/demoData";

// GET: fetch historical logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 200;

  const logs = store.getLogs(limit);
  return NextResponse.json({ logs });
}

// POST: start generating demo logs (simulate streaming)
export async function POST() {
  if (!store.isMonitoring) {
    store.isMonitoring = true;
  }

  // Generate a batch of demo log lines and process them
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < batchSize; i++) {
    const line = generateLogLine();
    const result = logProcessor.processLogLine(line);
    results.push(result);
  }

  return NextResponse.json({
    processed: results.length,
    detections: results.filter((r) => r.detections && r.detections.length > 0)
      .length,
  });
}
