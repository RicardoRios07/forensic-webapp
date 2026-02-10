"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import type { Alert } from "@/types/forensic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MapPin, Activity } from "lucide-react";
import type { GeoLocation } from "@/lib/geolocation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface AttackAnimation {
  id: string;
  from: GeoLocation;
  to: GeoLocation;
  alert: Alert;
  timestamp: number;
  progress: number;
}

interface AttackMapProps {
  alerts: Alert[];
  autoRefresh?: boolean;
}

const SERVER_LOCATION = { lat: -0.1807, lon: -78.4678, name: "Quito, Ecuador" };

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#84cc16",
  info: "#06b6d4",
};

export function AttackMapCanvas({ alerts, autoRefresh = true }: AttackMapProps) {
  const [animations, setAnimations] = useState<AttackAnimation[]>([]);
  const [ipLocations, setIpLocations] = useState<Map<string, GeoLocation>>(
    new Map()
  );
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapLoadedRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationsRef = useRef<AttackAnimation[]>([]);

  // Geolocalizar IPs de alertas nuevas
  useEffect(() => {
    if (!autoRefresh || alerts.length === 0) return;

    const newIPs = alerts
      .map((a) => a.source)
      .filter((ip) => !ipLocations.has(ip));

    if (newIPs.length === 0) return;

    const uniqueIPs = [...new Set(newIPs)];

    uniqueIPs.forEach(async (ip) => {
      try {
        const response = await fetch(
          `/api/geolocation?ip=${encodeURIComponent(ip)}`
        );
        if (response.ok) {
          const location: GeoLocation = await response.json();
          setIpLocations((prev) => new Map(prev).set(ip, location));
        }
      } catch (error) {
        console.error(`Error geolocalizando ${ip}:`, error);
      }
    });
  }, [alerts, autoRefresh, ipLocations]);

  // Crear animaciones para nuevas alertas
  useEffect(() => {
    if (!autoRefresh || alerts.length === 0) return;

    const recentAlerts = alerts.slice(-20);

    recentAlerts.forEach((alert) => {
      const sourceLocation = ipLocations.get(alert.source);
      if (!sourceLocation) return;

      const exists = animationsRef.current.some((a) => a.alert.id === alert.id);
      if (exists) return;

      const animation: AttackAnimation = {
        id: alert.id,
        from: sourceLocation,
        to: {
          ip: "server",
          country: "Ecuador",
          countryCode: "EC",
          city: "Quito",
          lat: SERVER_LOCATION.lat,
          lon: SERVER_LOCATION.lon,
        },
        alert,
        timestamp: Date.now(),
        progress: 0,
      };

      animationsRef.current = [...animationsRef.current.slice(-15), animation];
      setAnimations([...animationsRef.current]); // Update state for stats only
    });
  }, [alerts, ipLocations, autoRefresh]);

  // Inicializar mapa con tiles OSM
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [SERVER_LOCATION.lon, SERVER_LOCATION.lat],
      zoom: 1.2,
      minZoom: 1,
      maxZoom: 8,
    });

    mapRef.current = map;

    map.on("load", () => {
      mapLoadedRef.current = true;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      mapLoadedRef.current = false;
    };
  }, []);

  // Dibujar animaciones sobre el mapa
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Skip if canvas not sized yet
      if (width === 0 || height === 0) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      if (!mapRef.current || !mapLoadedRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const map = mapRef.current;

      const project = (lat: number, lon: number) => {
        const point = map.project([lon, lat]);
        return [point.x, point.y] as [number, number];
      };

      ctx.clearRect(0, 0, width, height);

      // Dibujar IPs detectadas
      Array.from(ipLocations.values()).forEach((location) => {
        const [x, y] = project(location.lat, location.lon);
        
        // Punto pulsante
        const pulse = Math.sin(Date.now() / 500) * 2 + 3;
        
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        
        // Anillo exterior
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Dibujar servidor (Quito)
      const [serverX, serverY] = project(
        SERVER_LOCATION.lat,
        SERVER_LOCATION.lon
      );
      const serverPulse = Math.sin(Date.now() / 300) * 3 + 5;
      
      ctx.beginPath();
      ctx.arc(serverX, serverY, serverPulse, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
      
      // Anillo del servidor
      ctx.beginPath();
      ctx.arc(serverX, serverY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Actualizar y dibujar animaciones
      const now = Date.now();
      const updated = animationsRef.current
        .map((anim) => ({
          ...anim,
          progress: Math.min(1, (now - anim.timestamp) / 2000),
        }))
        .filter((anim) => anim.progress < 1);

      // Actualizar la referencia
      animationsRef.current = updated;

      // Dibujar cada animación
      updated.forEach((anim) => {
          const [fromX, fromY] = project(anim.from.lat, anim.from.lon);
          const [toX, toY] = project(anim.to.lat, anim.to.lon);

        const currentX = fromX + (toX - fromX) * anim.progress;
        const currentY = fromY + (toY - fromY) * anim.progress;

        const color = SEVERITY_COLORS[anim.alert.severity] || "#06b6d4";
        const opacity = 1 - anim.progress * 0.5;

        // Línea de ataque
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = opacity;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Punto de ataque en movimiento
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.globalAlpha = 1;
      });

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [ipLocations]); // Removed animations from dependencies

  // Sync state periodically for UI updates (without causing re-renders)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Only update state if count changed to avoid unnecessary re-renders
      if (animationsRef.current.length !== animations.length) {
        setAnimations([...animationsRef.current]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, animations.length]);

  // Redimensionar canvas con el contenedor del mapa
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = mapContainerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-5 w-5" />
          Mapa de Ataques en Tiempo Real
          {animations.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-severity-critical opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-severity-critical" />
              </span>
              {animations.length} ataques activos
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[500px] overflow-hidden rounded-lg border border-border">
          <div ref={mapContainerRef} className="absolute inset-0" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
          />
          
          {/* Leyenda */}
          <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card/90 p-3 backdrop-blur-sm">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">IP Origen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Servidor DVWA</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-severity-critical" />
                <span className="text-muted-foreground">Ataque en curso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas debajo del mapa */}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-severity-info" />
              <span className="text-xs text-muted-foreground">IPs Únicas</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {ipLocations.size}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-severity-critical" />
              <span className="text-xs text-muted-foreground">Países</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {
                new Set(
                  Array.from(ipLocations.values()).map((l) => l.countryCode)
                ).size
              }
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-severity-high" />
              <span className="text-xs text-muted-foreground">
                Total Ataques
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {alerts.length}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-running opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-state-running" />
              </span>
              <span className="text-xs text-muted-foreground">
                En Tiempo Real
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-state-running">
              ACTIVO
            </p>
          </div>
        </div>

        {/* Lista de ubicaciones recientes */}
        {ipLocations.size > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4" />
              Ubicaciones Detectadas
            </h4>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {Array.from(ipLocations.entries())
                .slice(-6)
                .map(([ip, location]) => (
                  <div
                    key={ip}
                    className="rounded border border-border bg-card/50 p-2"
                  >
                    <p className="font-mono text-xs text-severity-low">{ip}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.city}, {location.country}
                    </p>
                    {location.isp && (
                      <p className="truncate text-[10px] text-muted-foreground/70">
                        {location.isp}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
