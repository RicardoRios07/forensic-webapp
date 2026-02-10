import { logProcessor } from "@/lib/docker/logProcessor";
import { store } from "@/lib/store";
import { streamContainerLogs, checkDockerConnection } from "@/lib/docker/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const containerId = store.connectedContainerId;
      
      if (!containerId) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "No hay contenedor conectado" })}\n\n`
          )
        );
        controller.close();
        return;
      }

      // Check if Docker is available
      const dockerAvailable = await checkDockerConnection();

      if (!dockerAvailable) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Docker daemon no está disponible" })}\n\n`
          )
        );
        controller.close();
        return;
      }

      try {
        // Use real Docker logs
        const logStream = await streamContainerLogs(
          containerId,
          (line: string) => {
            try {
              // Process the log line
              const result = logProcessor.processLogLine(line);

              const payload = JSON.stringify({
                type: "log",
                logEntry: result.logEntry,
                detections: result.detections || [],
                timestamp: new Date().toISOString(),
              });

              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            } catch (error) {
              console.error("Error processing log line:", error);
            }
          },
          {
            follow: true,
            tail: 100,
          }
        );

        // Handle stream events
        logStream.on("end", () => {
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });

        logStream.on("error", (error) => {
          console.error("Log stream error:", error);
          try {
            controller.error(error);
          } catch {
            // Already closed
          }
        });

        return;
      } catch (error) {
        console.error("Failed to stream logs:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Error al obtener logs" })}\n\n`
          )
        );
        controller.close();
      }

      // Clean up after 30 minutes max
      setTimeout(() => {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }, 1000 * 60 * 30);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
