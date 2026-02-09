import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getDemoContainers } from "@/lib/docker/demoData";

export async function POST(request: Request) {
  try {
    const { containerId } = await request.json();

    if (!containerId) {
      return NextResponse.json(
        { error: "containerId is required" },
        { status: 400 }
      );
    }

    const containers = getDemoContainers();
    const container = containers.find(
      (c) => c.id === containerId || c.name === containerId
    );

    store.connectedContainerId = containerId;
    store.connectedContainerName = container?.name || containerId;
    store.isMonitoring = true;

    return NextResponse.json({
      success: true,
      container: container || {
        id: containerId,
        name: containerId,
        image: "vulnerables/web-dvwa",
        state: "running",
        status: "Up 2 hours",
        created: new Date().toISOString(),
        ports: "0.0.0.0:8080->80/tcp",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect", details: String(error) },
      { status: 500 }
    );
  }
}
