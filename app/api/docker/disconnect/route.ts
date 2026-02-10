import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST() {
    try {
        // Disconnect from the container
        store.connectedContainerId = null;
        store.connectedContainerName = null;
        store.isMonitoring = false;

        console.log("✅ Desconectado del contenedor");

        return NextResponse.json({
            success: true,
            message: "Desconectado del contenedor",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error al desconectar:", error);
        return NextResponse.json(
            { error: "Error al desconectar", details: String(error) },
            { status: 500 }
        );
    }
}
