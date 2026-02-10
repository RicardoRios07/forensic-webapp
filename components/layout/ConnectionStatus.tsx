"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wifi, WifiOff } from "lucide-react";
import type { ContainerInfo } from "@/types/forensic";

export function ConnectionStatus() {
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [containerName, setContainerName] = useState("");

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch("/api/docker/containers");
      const data = await res.json();
      setContainers(data.containers || []);
      if (data.containers?.length > 0 && !selectedId) {
        setSelectedId(data.containers[0].name);
      }
    } catch {
      // ignore
    }
  }, [selectedId]);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/docker/status");
      const data = await res.json();
      setConnected(data.connected);
      if (data.containerName) {
        setContainerName(data.containerName);
      }
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
    checkStatus();
  }, [fetchContainers, checkStatus]);

  const handleConnect = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch("/api/docker/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ containerId: selectedId }),
      });
      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setContainerName(data.container?.name || selectedId);
      }
    } catch {
      // ignore
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/docker/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setConnected(false);
        setContainerName("");
      }
    } catch {
      // ignore
    }
  };

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-state-running/10 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-state-running opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-state-running" />
          </span>
          <span className="text-xs font-medium text-state-running">
            {containerName}
          </span>
        </div>
        <Wifi className="h-4 w-4 text-state-running" />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDisconnect}
          className="h-8 gap-1 text-xs"
        >
          <WifiOff className="h-3 w-3" />
          Desconectar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Contenedor" />
        </SelectTrigger>
        <SelectContent>
          {containers.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant="default" onClick={handleConnect} className="h-8 gap-1 text-xs">
        <WifiOff className="h-3 w-3" />
        Conectar
      </Button>
    </div>
  );
}
