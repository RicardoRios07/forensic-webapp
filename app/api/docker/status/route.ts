import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  if (!store.connectedContainerId) {
    return NextResponse.json({
      connected: false,
      stats: null,
    });
  }

  // Simulated container stats
  const upSeconds = Math.floor((Date.now() - (Date.now() - 7200000)) / 1000);
  const hours = Math.floor(upSeconds / 3600);
  const mins = Math.floor((upSeconds % 3600) / 60);

  const stats = {
    cpuPercent: +(Math.random() * 15 + 2).toFixed(1),
    memoryUsage: Math.floor(Math.random() * 100000000 + 50000000),
    memoryLimit: 536870912,
    memoryPercent: +(Math.random() * 30 + 10).toFixed(1),
    networkIn: Math.floor(Math.random() * 10000000),
    networkOut: Math.floor(Math.random() * 5000000),
    uptime: `${hours}h ${mins}m`,
    running: true,
  };

  store.containerStats = stats;

  return NextResponse.json({
    connected: true,
    containerId: store.connectedContainerId,
    containerName: store.connectedContainerName,
    isMonitoring: store.isMonitoring,
    stats,
  });
}
