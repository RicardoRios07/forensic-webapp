import { spawn } from "child_process";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      try {
        // Change to the forensic-webapp directory
        const workDir = process.cwd();
        
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "info", text: `📂 Directorio de trabajo: ${workDir}\n` })}

`
          )
        );
        
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "info", text: "🚀 Iniciando script de tests...\n\n" })}

`
          )
        );

        // Execute the test script
        // Remove DYLD_INSERT_LIBRARIES to avoid console-ninja errors
        const cleanEnv = { ...process.env };
        delete cleanEnv.DYLD_INSERT_LIBRARIES;
        
        const testProcess = spawn("./test-system.sh", [], {
          cwd: workDir,
          shell: true,
          env: cleanEnv,
        });

        // Send stdout
        testProcess.stdout.on("data", (data) => {
          const text = data.toString();
          // Filter out console-ninja and dyld errors
          if (!text.includes("console-ninja") && !text.includes("dyld[") && !text.match(/Abort trap:/)) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "stdout", text })}

`
              )
            );
          }
        });

        // Send stderr
        testProcess.stderr.on("data", (data) => {
          const text = data.toString();
          // Filter out console-ninja and dyld errors
          if (!text.includes("console-ninja") && !text.includes("dyld[") && !text.match(/Abort trap:/)) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "stderr", text })}

`
              )
            );
          }
        });

        // Handle process exit
        testProcess.on("close", (code) => {
          const exitMsg =
            code === 0
              ? "✅ Tests completados exitosamente"
              : `❌ Tests finalizados con código de error: ${code}`;
          
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "exit", text: `\n${exitMsg}\n`, code })}

`
            )
          );
          
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });

        // Handle errors
        testProcess.on("error", (error) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", text: `Error: ${error.message}\n` })}

`
            )
          );
          
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", text: `Error al iniciar tests: ${error}\n` })}

`
          )
        );
        controller.close();
      }
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
