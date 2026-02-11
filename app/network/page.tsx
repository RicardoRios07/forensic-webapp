"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Network,
  Wifi,
  Cpu,
  Globe,
  RefreshCw,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface NetworkData {
  connections: Array<{
    protocol: string;
    localAddress: string;
    localPort: string;
    remoteAddress: string;
    remotePort: string;
    state: string;
  }>;
  interfaces: Array<{
    name: string;
    ipAddress: string;
    netmask: string;
    macAddress: string;
    rxBytes: number;
    txBytes: number;
    rxPackets: number;
    txPackets: number;
  }>;
  dns: Record<string, string>;
  ports: string[];
  timestamp: string;
}

export default function NetworkPage() {
  const { toast } = useToast();
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/network");
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "No se pudieron obtener los datos de red",
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        setNetworkData(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron obtener los datos de red",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchNetworkData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "ESTABLISHED":
        return "bg-green-900 text-green-200";
      case "LISTEN":
        return "bg-blue-900 text-blue-200";
      case "TIME_WAIT":
        return "bg-yellow-900 text-yellow-200";
      case "CLOSE_WAIT":
        return "bg-orange-900 text-orange-200";
      default:
        return "bg-gray-900 text-gray-200";
    }
  };

  const handleExport = () => {
    if (!networkData) return;

    let content = `REPORTE DE MONITOREO DE RED\nFecha: ${new Date(networkData.timestamp).toLocaleString()}\n\n`;

    content += "=== INTERFACES DE RED ===\n";
    for (const iface of networkData.interfaces) {
      content += `\nInterfaz: ${iface.name}\n`;
      content += `  IP: ${iface.ipAddress}\n`;
      content += `  Netmask: ${iface.netmask}\n`;
      content += `  MAC: ${iface.macAddress}\n`;
      content += `  RX: ${formatBytes(iface.rxBytes)} (${iface.rxPackets} paquetes)\n`;
      content += `  TX: ${formatBytes(iface.txBytes)} (${iface.txPackets} paquetes)\n`;
    }

    content += "\n=== CONEXIONES ACTIVAS ===\n";
    for (const conn of networkData.connections) {
      content += `${conn.protocol} | ${conn.localAddress}:${conn.localPort} -> ${conn.remoteAddress}:${conn.remotePort} | ${conn.state}\n`;
    }

    content += "\n=== PUERTOS ESCUCHANDO ===\n";
    content += networkData.ports.join(", ") + "\n";

    content += "\n=== SERVIDORES DNS ===\n";
    for (const [key, value] of Object.entries(networkData.dns)) {
      content += `${key}: ${value}\n`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `network-monitoring-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Reporte exportado",
      description: "El reporte de red se ha descargado correctamente",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Monitoreo de Red
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualiza las conexiones de red activas, interfaces y puertos del contenedor
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-primary/10" : ""}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </Button>
          <Button
            onClick={fetchNetworkData}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            onClick={handleExport}
            disabled={!networkData}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {networkData && (
        <Tabs defaultValue="interfaces" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
            <TabsTrigger value="connections">Conexiones</TabsTrigger>
            <TabsTrigger value="ports">Puertos</TabsTrigger>
            <TabsTrigger value="dns">DNS</TabsTrigger>
          </TabsList>

          {/* Interfaces Tab */}
          <TabsContent value="interfaces" className="space-y-4">
            <div className="grid gap-4">
              {networkData.interfaces.map((iface) => (
                <Card key={iface.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Wifi className="h-4 w-4" />
                        {iface.name}
                      </CardTitle>
                      <Badge variant="outline">
                        {iface.ipAddress || "N/A"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">MAC</p>
                        <p className="font-mono text-sm">{iface.macAddress}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Netmask</p>
                        <p className="font-mono text-sm">{iface.netmask}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">RX</p>
                        <p className="font-mono text-sm">
                          {formatBytes(iface.rxBytes)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">TX</p>
                        <p className="font-mono text-sm">
                          {formatBytes(iface.txBytes)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Paquetes RX
                        </p>
                        <p className="font-mono text-sm">
                          {iface.rxPackets.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Paquetes TX
                        </p>
                        <p className="font-mono text-sm">
                          {iface.txPackets.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Conexiones Activas ({networkData.connections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Protocolo</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Remoto</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {networkData.connections.map((conn, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs">
                            {conn.protocol}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {conn.localAddress}:{conn.localPort}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {conn.remoteAddress}:{conn.remotePort}
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStateColor(conn.state)}`}>
                              {conn.state}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ports Tab */}
          <TabsContent value="ports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Puertos Escuchando ({networkData.ports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {networkData.ports.map((port) => (
                    <Badge key={port} variant="secondary">
                      :{port}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DNS Tab */}
          <TabsContent value="dns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuración DNS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(networkData.dns).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <span className="text-sm font-medium">{key}</span>
                      <span className="font-mono text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!networkData && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Haz clic en "Actualizar" para obtener los datos de red
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
