import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getContainerStats, checkDockerConnection } from "@/lib/docker/client";

export async function GET() {
  if (!store.connectedContainerId) {
    return NextResponse.json({
      connected: false,
      stats: null,
    });
  }

  try {
    // Check if Docker is available
    const dockerAvailable = await checkDockerConnection();
    
    if (!dockerAvailable) {
      return NextResponse.json(
        { error: 'Docker daemon no está disponible' },
        { status: 503 }
      );
    }

    // Get real stats
    const stats = await getContainerStats(store.connectedContainerId);
    store.containerStats = stats;

    return NextResponse.json({
      connected: true,
      containerId: store.connectedContainerId,
      containerName: store.connectedContainerName,
      isMonitoring: store.isMonitoring,
      stats,
      source: 'docker',
    });
  } catch (error) {
    console.error('Error getting container status:', error);
    return NextResponse.json(
      { error: "Failed to get status", details: String(error) },
      { status: 500 }
    );
  }
}
