import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { execInContainer, checkDockerConnection } from "@/lib/docker/client";

export async function POST() {
  try {
    const containerId = store.connectedContainerId;

    if (!containerId) {
      return NextResponse.json(
        { error: "No container connected" },
        { status: 400 }
      );
    }

    const dockerAvailable = await checkDockerConnection();

    if (!dockerAvailable) {
      return NextResponse.json({
        success: false,
        message: "Docker not available, cannot capture filesystem",
      });
    }

    // Execute ls command to capture filesystem state
    const output = await execInContainer(containerId, [
      "ls",
      "-lah",
      "/var/www/html",
    ]);

    // Store the capture (in a real app, save to file)
    const timestamp = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      timestamp,
      output,
      message: "Filesystem state captured successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to capture filesystem", details: String(error) },
      { status: 500 }
    );
  }
}
