"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RotateCcw, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LiveTerminal } from "@/components/terminal/LiveTerminal";

export function ResetButton() {
  const [isResetting, setIsResetting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "✅ Datos eliminados",
          description: "Todos los logs, alertas y estadísticas han sido borrados.",
        });
        
        // Reload page to refresh all components
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Error al resetear");
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudieron eliminar los datos.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setShowTerminal(true);
    
    toast({
      title: "🧪 Script de Tests",
      description: "La terminal se abrirá en la esquina inferior derecha.",
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Resetear Datos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar todos los datos?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Todos los logs procesados</li>
                  <li>Todas las alertas generadas</li>
                  <li>Timeline completo de eventos</li>
                  <li>Estadísticas de ataques</li>
                </ul>
                <p className="mt-3 font-medium">Esta acción no se puede deshacer.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sí, eliminar todo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={handleRunTests}
          disabled={isRunningTests}
        >
          {isRunningTests ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Ejecutar Tests
        </Button>
      </div>

      {showTerminal && (
        <LiveTerminal
          isRunning={isRunningTests}
          onClose={() => {
            setShowTerminal(false);
            setIsRunningTests(false);
          }}
        />
      )}
    </>
  );
}
