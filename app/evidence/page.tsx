"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  Hash,
  GitCompare,
  FileBox,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EvidencePage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportLogs = async () => {
    try {
      const response = await fetch("/api/evidence/logs");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensic-logs-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Logs exportados",
        description: "Los logs se han descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los logs",
        variant: "destructive",
      });
    }
  };

  const handleExportAlerts = async () => {
    try {
      const response = await fetch("/api/alerts");
      const data = await response.json();
      const json = JSON.stringify(data.alerts, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensic-alerts-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Alertas exportadas",
        description: "Las alertas se han descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar las alertas",
        variant: "destructive",
      });
    }
  };

  const handleExportTimeline = async () => {
    try {
      const response = await fetch("/api/timeline/export");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensic-timeline-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Línea de tiempo exportada",
        description: "La cronología se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar la línea de tiempo",
        variant: "destructive",
      });
    }
  };

  const handleGenerateHashes = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/evidence/hashes");
      const data = await response.json();

      if (data.hashes) {
        const content = Object.entries(data.hashes)
          .map(([file, hash]) => `${hash}  ${file}`)
          .join("\n");

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `forensic-hashes-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Hashes generados",
          description: `Se generaron hashes para ${Object.keys(data.hashes).length} archivos`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron generar los hashes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/evidence/report");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `forensic-report-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Reporte generado",
        description: "El reporte forense se ha generado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCaptureFilesystem = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/evidence/filesystem", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Filesystem capturado",
          description: "El estado del filesystem se capturó correctamente",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo capturar el filesystem",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Gestión de Evidencias
        </h1>
        <p className="text-sm text-muted-foreground">
          Captura, exporta y preserva evidencias forenses digitales
        </p>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export">Exportar</TabsTrigger>
          <TabsTrigger value="integrity">Integridad</TabsTrigger>
          <TabsTrigger value="capture">Capturar</TabsTrigger>
          <TabsTrigger value="report">Reporte</TabsTrigger>
        </TabsList>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Logs del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Exporta todos los registros procesados en formato de texto
                  plano.
                </p>
                <Button onClick={handleExportLogs} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Alertas de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Exporta todas las alertas generadas en formato JSON.
                </p>
                <Button onClick={handleExportAlerts} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Alertas
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileBox className="h-4 w-4" />
                  Línea de Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Exporta la cronología completa del incidente.
                </p>
                <Button onClick={handleExportTimeline} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Timeline
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Exportar Todo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Descarga un paquete con todas las evidencias.
                </p>
                <Button
                  onClick={() => {
                    handleExportLogs();
                    handleExportAlerts();
                    handleExportTimeline();
                  }}
                  className="w-full"
                  variant="secondary"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Todo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrity Tab */}
        <TabsContent value="integrity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hashes SHA256
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Genera hashes SHA256 de todas las evidencias para verificar su
                integridad. Los hashes se pueden usar para demostrar que las
                evidencias no han sido alteradas.
              </p>

              <div className="rounded-md border border-border bg-muted/50 p-4">
                <h3 className="mb-2 font-semibold">Cadena de Custodia</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Fecha y hora de captura</li>
                  <li>• Hash SHA256 de cada archivo</li>
                  <li>• Identificador único de evidencia</li>
                  <li>• Ubicación del contenedor fuente</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateHashes}
                disabled={isGenerating}
                className="w-full"
              >
                <Hash className="mr-2 h-4 w-4" />
                {isGenerating ? "Generando..." : "Generar Hashes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capture Tab */}
        <TabsContent value="capture" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileBox className="h-4 w-4" />
                  Estado del Filesystem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Captura el estado actual del sistema de archivos del
                  contenedor para análisis posterior.
                </p>
                <Button
                  onClick={handleCaptureFilesystem}
                  disabled={isGenerating}
                  className="w-full"
                  variant="secondary"
                >
                  <FileBox className="mr-2 h-4 w-4" />
                  {isGenerating ? "Capturando..." : "Capturar Filesystem"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitCompare className="h-4 w-4" />
                  Comparación de Estados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Compara el estado inicial con el estado actual para
                  identificar cambios.
                </p>
                <Button className="w-full" variant="secondary" disabled>
                  <GitCompare className="mr-2 h-4 w-4" />
                  Comparar Estados
                </Button>
                <p className="text-xs text-muted-foreground">
                  Disponible después de capturar el filesystem
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Archivos Capturados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No hay archivos capturados aún. Usa los botones de arriba
                  para capturar evidencias.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reporte Forense Completo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Genera un reporte forense completo en formato Markdown que
                incluye:
              </p>

              <div className="rounded-md border border-border bg-muted/50 p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Resumen Ejecutivo:</strong> Análisis de alto
                      nivel del incidente
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Línea de Tiempo:</strong> Cronología detallada de
                      eventos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Alertas Generadas:</strong> Todas las alertas con
                      detalles técnicos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Estadísticas:</strong> Métricas y análisis de
                      ataques
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Evidencias:</strong> Listado de archivos y hashes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>
                      <strong>Recomendaciones:</strong> Acciones de mitigación
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? "Generando Reporte..." : "Generar Reporte Forense"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
