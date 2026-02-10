import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const logs = store.getLogs();
    
    // Format logs as plain text
    const content = logs
      .map(
        (l) =>
          `${new Date(l.timestamp).toISOString()} ${l.ip} ${l.method} ${l.endpoint}${l.params ? `?${l.params}` : ""} ${l.statusCode} ${l.size}`
      )
      .join("\n");

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="forensic-logs-${Date.now()}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export logs", details: String(error) },
      { status: 500 }
    );
  }
}
