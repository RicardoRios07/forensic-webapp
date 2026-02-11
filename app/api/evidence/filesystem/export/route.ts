import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: NextRequest) {
  try {
    const captureId = request.nextUrl.searchParams.get("id");

    const captures = store.getFilesystemCaptures();
    const capture = captureId
      ? captures.find((c) => c.id === captureId)
      : captures[captures.length - 1];

    if (!capture) {
      return NextResponse.json(
        { error: "Captura no encontrada" },
        { status: 404 }
      );
    }

    // Create a formatted export file
    const content = `=== CAPTURA DE FILESYSTEM ===
Fecha: ${capture.timestamp}
Contenedor: ${capture.containerId}
ID: ${capture.id}

=== CONTENIDO ===
${capture.output}
`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="filesystem-${capture.id}.txt"`,
      },
    });
  } catch (error) {
    console.error("Error exporting filesystem capture:", error);
    return NextResponse.json(
      {
        error: "No se pudo exportar la captura",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
