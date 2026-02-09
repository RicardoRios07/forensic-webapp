import { NextResponse } from "next/server";
import { getDemoContainers } from "@/lib/docker/demoData";

export async function GET() {
  try {
    const containers = getDemoContainers();
    return NextResponse.json({ containers });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list containers", details: String(error) },
      { status: 500 }
    );
  }
}
