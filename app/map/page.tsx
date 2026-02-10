"use client";

import { useEffect, useState, useCallback } from "react";
import { AttackMapCanvas } from "@/components/map/AttackMapCanvas";
import { useForensicStream } from "@/hooks/use-forensic-stream";
import type { Alert } from "@/types/forensic";

export default function MapPage() {
  useForensicStream(); // Mantener el stream activo

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000); // Actualizar cada 3 segundos
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return (
    <div className="flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mapa de Ataques Globales
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualización en tiempo real de ataques detectados con geolocalización
        </p>
      </div>

      <AttackMapCanvas alerts={alerts} autoRefresh={true} />
    </div>
  );
}
