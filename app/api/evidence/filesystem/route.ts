import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { execInContainer, checkDockerConnection } from "@/lib/docker/client";

export async function GET() {
  try {
    const captures = store.getFilesystemCaptures();
    
    // Solo devolvemos metadatos sin el output completo
    const captureMetadata = captures.map((c) => ({
      id: c.id,
      timestamp: c.timestamp,
      containerId: c.containerId,
    }));
    
    return NextResponse.json({
      success: true,
      captures: captureMetadata,
    });
  } catch (error) {
    console.error("Error in GET /api/evidence/filesystem:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "No se pudieron recuperar las capturas" 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const containerId = store.connectedContainerId;

    if (!containerId) {
      return NextResponse.json(
        { 
          success: false,
          error: "No hay contenedor conectado",
          message: "Conecta un contenedor primero"
        },
        { status: 400 }
      );
    }

    const dockerAvailable = await checkDockerConnection();

    if (!dockerAvailable) {
      return NextResponse.json({
        success: false,
        error: "Docker no disponible",
        message: "No se puede acceder al daemon de Docker",
      }, { status: 503 });
    }

    // Execute ls command to capture filesystem state
    const output = await execInContainer(containerId, [
      "ls",
      "-lah",
      "/var/www/html",
    ]);

    // Store the capture
    const capture = store.addFilesystemCapture(output, containerId);
    
    return NextResponse.json({
      success: true,
      capture: {
        id: capture.id,
        timestamp: capture.timestamp,
        containerId: capture.containerId,
      },
      message: "Filesystem capturado correctamente",
    });
  } catch (error) {
    console.error("Error in POST /api/evidence/filesystem:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "No se pudo capturar el filesystem"
      },
      { status: 500 }
    );
  }
}
