import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { listContainers, checkDockerConnection } from "@/lib/docker/client";

export async function POST(request: Request) {
  try {
    const { containerId } = await request.json();

    if (!containerId) {
      return NextResponse.json(
        { error: "containerId es requerido" },
        { status: 400 }
      );
    }

    // Check Docker availability
    const dockerAvailable = await checkDockerConnection();
    if (!dockerAvailable) {
      return NextResponse.json(
        { error: "Docker daemon no está disponible" },
        { status: 503 }
      );
    }

    // Get real containers
    const containers = await listContainers();
    const container = containers.find(
      (c) => c.id === containerId || c.name === containerId
    );

    if (!container) {
      return NextResponse.json(
        { error: "Contenedor no encontrado" },
        { status: 404 }
      );
    }

    store.connectedContainerId = containerId;
    store.connectedContainerName = container.name;
    store.isMonitoring = true;

    return NextResponse.json({
      success: true,
      container,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al conectar", details: String(error) },
      { status: 500 }
    );
  }
}
