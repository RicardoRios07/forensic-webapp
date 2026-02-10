import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const stats = store.getDashboardStats();
    const alerts = store.getAlerts();
    const timeline = store.getTimeline();

    // Generate Markdown report
    const report = generateForensicReport(stats, alerts, timeline);

    return new Response(report, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="forensic-report-${Date.now()}.md"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate report", details: String(error) },
      { status: 500 }
    );
  }
}

function generateForensicReport(stats: any, alerts: any[], timeline: any[]): string {
  const now = new Date().toISOString();
  const containerName = store.connectedContainerName || "unknown";

  return `# REPORTE FORENSE - DVWA Monitor
## Análisis de Incidente de Seguridad

**Fecha de Generación:** ${now}  
**Contenedor Analizado:** ${containerName}  
**ID del Contenedor:** ${store.connectedContainerId || "N/A"}

---

## 1. RESUMEN EJECUTIVO

Este reporte documenta el análisis forense realizado sobre el contenedor Docker **${containerName}**.
Durante el período de monitoreo se detectaron **${stats.totalAttacks}** ataques, generando **${alerts.length}** alertas de seguridad.

### Estadísticas Clave

- **Total de Ataques Detectados:** ${stats.totalAttacks}
- **Tasa de Ataques:** ${stats.attackRate.toFixed(2)} ataques/minuto
- **Líneas de Log Procesadas:** ${stats.linesProcessed.toLocaleString()}
- **Errores HTTP Detectados:** ${stats.errorsDetected}

### Distribución de Ataques

| Tipo de Ataque | Cantidad | Porcentaje |
|----------------|----------|------------|
| Inyección SQL | ${stats.attacksByType.sqli} | ${((stats.attacksByType.sqli / stats.totalAttacks) * 100).toFixed(1)}% |
| Inyección de Comandos | ${stats.attacksByType.command_injection} | ${((stats.attacksByType.command_injection / stats.totalAttacks) * 100).toFixed(1)}% |
| Fuerza Bruta | ${stats.attacksByType.brute_force} | ${((stats.attacksByType.brute_force / stats.totalAttacks) * 100).toFixed(1)}% |
| Inclusión de Archivos | ${stats.attacksByType.file_inclusion} | ${((stats.attacksByType.file_inclusion / stats.totalAttacks) * 100).toFixed(1)}% |

---

## 2. LÍNEA DE TIEMPO DEL INCIDENTE

${timeline.slice(0, 50).map((event, index) => {
  const time = new Date(event.timestamp).toLocaleTimeString();
  const severity = getSeverityIcon(event.severity);
  return `### ${index + 1}. ${time} ${severity} ${event.description}
- **Tipo:** ${event.type}
${event.details.ip ? `- **IP Origen:** ${event.details.ip}` : ""}
${event.details.endpoint ? `- **Endpoint:** ${event.details.endpoint}` : ""}
${event.details.method ? `- **Método:** ${event.details.method}` : ""}
${event.details.payload ? `- **Payload:** \`${event.details.payload}\`` : ""}
`;
}).join("\n")}

---

## 3. ALERTAS DE SEGURIDAD

### Alertas por Severidad

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | ${stats.alertsBySeverity.critical || 0} |
| 🟠 Alto | ${stats.alertsBySeverity.high || 0} |
| 🟡 Medio | ${stats.alertsBySeverity.medium || 0} |
| 🔵 Bajo | ${stats.alertsBySeverity.low || 0} |

### Alertas Detalladas

${alerts.slice(0, 20).map((alert, index) => `#### Alerta #${index + 1} - ${getSeverityLabel(alert.severity)}

- **ID:** ${alert.id}
- **Timestamp:** ${new Date(alert.timestamp).toISOString()}
- **Tipo de Ataque:** ${getAttackLabel(alert.attackType)}
- **IP Origen:** ${alert.source}
- **Objetivo:** ${alert.target}
- **Payload:** \`${alert.payload}\`
- **Estado:** ${alert.status}
- **Evidencia:** ${alert.evidence.join(", ")}

`).join("\n")}

---

## 4. ANÁLISIS DE ATAQUES

### Inyección SQL (SQLi)

Se detectaron **${stats.attacksByType.sqli}** intentos de inyección SQL. Este tipo de ataque permite a los atacantes manipular consultas a la base de datos.

**Patrones Comunes Detectados:**
- \`' OR '1'='1\`
- \`UNION SELECT\`
- \`-- (comentarios SQL)\`
- \`DROP TABLE\`

### Inyección de Comandos

Se registraron **${stats.attacksByType.command_injection}** ataques de inyección de comandos, permitiendo ejecución remota de código.

**Comandos Ejecutados:**
- \`cat /etc/passwd\`
- \`whoami\`
- \`ls -la\`
- \`id\`

### Fuerza Bruta

**${stats.attacksByType.brute_force}** intentos de fuerza bruta contra el sistema de autenticación.

### Inclusión de Archivos (LFI/RFI)

**${stats.attacksByType.file_inclusion}** intentos de acceder a archivos no autorizados.

---

## 5. IPs ATACANTES

### Top IPs con Mayor Actividad

${stats.topIPs.slice(0, 10).map((item: { ip: string; count: number }, index: number) => 
  `${index + 1}. **${item.ip}** - ${item.count} ataques`
).join("\n")}

---

## 6. EVIDENCIAS RECOLECTADAS

### Archivos de Evidencia

1. **forensic-logs.txt** - Logs completos del sistema
2. **forensic-alerts.json** - Todas las alertas generadas
3. **forensic-timeline.json** - Línea de tiempo del incidente
4. **forensic-hashes.txt** - Hashes SHA256 para integridad

### Integridad de Evidencias

Todos los archivos de evidencia han sido procesados con hash SHA256 para garantizar su integridad y admisibilidad en procesos legales.

---

## 7. RECOMENDACIONES

### Inmediatas

1. **Aislar el Contenedor:** Detener el contenedor comprometido inmediatamente
2. **Cambiar Credenciales:** Rotar todas las contraseñas y tokens de acceso
3. **Revisar Logs:** Analizar logs del host para detectar propagación
4. **Actualizar Sistema:** Aplicar parches de seguridad

### A Corto Plazo

1. Implementar WAF (Web Application Firewall)
2. Configurar rate limiting
3. Habilitar autenticación multifactor
4. Implementar lista blanca de IPs

### A Largo Plazo

1. Capacitación en seguridad para el equipo
2. Auditorías de seguridad regulares
3. Implementar SIEM para detección temprana
4. Desarrollar plan de respuesta a incidentes

---

## 8. CONCLUSIONES

El análisis forense revela múltiples vectores de ataque explotados contra el contenedor DVWA.
Los ataques más prevalentes fueron **${getTopAttackType(stats.attacksByType)}** con ${Math.max(...(Object.values(stats.attacksByType) as number[]))} ocurrencias.

La evidencia recolectada demuestra:
- Actividad maliciosa confirmada
- Múltiples intentos de compromiso
- Necesidad urgente de medidas de mitigación

---

## 9. INFORMACIÓN DEL ANALISTA

**Herramienta:** DVWA Forensic Monitor  
**Versión:** 1.0.0  
**Fecha:** ${now}  

---

## 10. ANEXOS

### A. Metodología

Este análisis se realizó utilizando técnicas de análisis forense digital, incluyendo:
- Análisis de logs en tiempo real
- Detección de patrones de ataque
- Correlación de eventos
- Generación de línea de tiempo

### B. Referencias

- OWASP Top 10
- NIST Cybersecurity Framework
- ISO 27001
- Chain of Custody Best Practices

---

**Fin del Reporte**

*Este documento contiene información sensible de seguridad. Manéjese con confidencialidad.*
`;
}

function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🔵",
    info: "⚪",
  };
  return icons[severity] || "⚪";
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: "CRÍTICO",
    high: "ALTO",
    medium: "MEDIO",
    low: "BAJO",
    info: "INFO",
  };
  return labels[severity] || "DESCONOCIDO";
}

function getAttackLabel(type: string): string {
  const labels: Record<string, string> = {
    sqli: "Inyección SQL",
    command_injection: "Inyección de Comandos",
    brute_force: "Fuerza Bruta",
    file_inclusion: "Inclusión de Archivos",
  };
  return labels[type] || type;
}

function getTopAttackType(attacksByType: Record<string, number>): string {
  const entries = Object.entries(attacksByType);
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  return getAttackLabel(max[0]);
}
