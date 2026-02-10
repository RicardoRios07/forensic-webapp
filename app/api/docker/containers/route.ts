import { NextResponse } from "next/server";
import { listContainers, checkDockerConnection } from "@/lib/docker/client";

export async function GET() {
  try {
    // Check if Docker is available
    const dockerAvailable = await checkDockerConnection();
    
    if (!dockerAvailable) {
      return NextResponse.json(
        { error: 'Docker daemon no está disponible. Por favor inicia Docker Desktop.' },
        { status: 503 }
      );
    }

    // Use real Docker client
    const containers = await listContainers();
    return NextResponse.json({ containers, source: 'docker' });
  } catch (error) {
    console.error('Error listing containers:', error);
    return NextResponse.json(
      { error: 'Error al conectar con Docker', details: String(error) },
      { status: 500 }
    );
  }
}
