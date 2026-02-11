import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import {
  getNetworkConnections,
  getNetworkInterfaces,
  getDNSResolutions,
  getListeningPorts,
} from "@/lib/docker/network";

export async function GET() {
  try {
    const containerId = store.connectedContainerId;

    if (!containerId) {
      return NextResponse.json(
        { error: "No hay contenedor conectado" },
        { status: 400 }
      );
    }

    // Get all network data in parallel
    const [connections, interfaces, dns, ports] = await Promise.all([
      getNetworkConnections(containerId),
      getNetworkInterfaces(containerId),
      getDNSResolutions(containerId),
      getListeningPorts(containerId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        connections,
        interfaces,
        dns,
        ports,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting network monitoring data:", error);
    return NextResponse.json(
      {
        error: "No se pudieron obtener los datos de red",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
