import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const timeline = store.getTimeline();

    return NextResponse.json(
      {
        timeline,
        timestamp: new Date().toISOString(),
        total: timeline.length,
      },
      {
        headers: {
          "Content-Disposition": `attachment; filename="forensic-timeline-${Date.now()}.json"`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export timeline", details: String(error) },
      { status: 500 }
    );
  }
}
