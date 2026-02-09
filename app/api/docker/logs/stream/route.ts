import { generateLogLine } from "@/lib/docker/demoData";
import { logProcessor } from "@/lib/docker/logProcessor";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let running = true;

      const interval = setInterval(() => {
        if (!running) return;

        try {
          // Generate 1-3 lines per tick
          const count = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < count; i++) {
            const line = generateLogLine();
            const result = logProcessor.processLogLine(line);

            const payload = JSON.stringify({
              type: "log",
              logEntry: result.logEntry,
              detections: result.detections || [],
              timestamp: new Date().toISOString(),
            });

            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          running = false;
          clearInterval(interval);
          controller.close();
        }
      }, 800); // ~1-3 logs every 800ms

      // Clean up after 5 minutes max
      setTimeout(() => {
        running = false;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      }, 300000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
