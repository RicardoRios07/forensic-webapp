# DVWA Forensic Monitor 🔍

![Dashboard](https://img.shields.io/badge/Status-Production-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Docker](https://img.shields.io/badge/Docker-Required-blue)

Panel de análisis forense en tiempo real para contenedores Docker con DVWA. Detecta y analiza ataques web comunes incluyendo SQL Injection, Command Injection, Brute Force y File Inclusion.

## 🎯 Características

### ✅ Implementado

- ✅ **Detección de Ataques en Tiempo Real**
  - SQL Injection (SQLi)
  - Command Injection
  - Brute Force
  - File Inclusion (LFI/RFI)

- ✅ **Integración Docker Real**
  - Conexión directa al Docker daemon
  - Streaming de logs en vivo
  - Estadísticas de contenedor (CPU, memoria, red)
  - Fallback automático a datos demo

- ✅ **Dashboard Interactivo**
  - Métricas en tiempo real
  - Distribución de ataques
  - Top IPs atacantes
  - Timeline de incidentes

- ✅ **Sistema de Alertas**
  - 4 niveles de severidad (Critical, High, Medium, Low)
  - Filtros avanzados
  - Gestión de estados

- ✅ **Visor de Logs**
  - Resaltado de sintaxis
  - Detección automática de ataques
  - Búsqueda y filtrado
  - Exportación

- ✅ **Timeline Visual**
  - Cronología de eventos
  - Filtros por tipo y tiempo
  - Exportación JSON

- ✅ **Gestión de Evidencias**
  - Exportación de logs, alertas y timeline
  - Generación de hashes SHA256
  - Captura de filesystem
  - Reporte forense completo en Markdown

## 🚀 Instalación

### Requisitos Previos

- Node.js 20+
- pnpm (o npm/yarn)
- Docker Desktop instalado y ejecutándose
- Contenedor DVWA corriendo

### 1. Clonar e Instalar Dependencias

```bash
cd forensic-webapp
pnpm install
```

### 2. Configurar Variables de Entorno

El archivo `.env.local` ya está configurado:

```env
DOCKER_HOST=unix:///var/run/docker.sock
DVWA_CONTAINER_NAME=dvwa
NEXT_PUBLIC_WS_URL=ws://localhost:3000
LOG_RETENTION_DAYS=7
MAX_LOGS_IN_MEMORY=10000
ENABLE_ML_DETECTION=false
```

### 3. Iniciar DVWA (si no está corriendo)

```bash
docker run -d \\
  --name dvwa \\
  -p 8080:80 \\
  vulnerables/web-dvwa
```

Accede a [http://localhost:8080](http://localhost:8080) y configura:
- Usuario: `admin`
- Password: `password`
- Click en "Create / Reset Database"
- Security Level: **Low**

### 4. Iniciar la Aplicación

```bash
pnpm dev
```

Abre [http://localhost:3001](http://localhost:3001)

## 📖 Uso

### Conectar al Contenedor

1. La aplicación detecta automáticamente contenedores Docker
2. Si encuentra el contenedor "dvwa", se conecta automáticamente
3. Si Docker no está disponible, usa datos demo para pruebas

### Generar Tráfico de Ataque

Para probar la detección, ejecuta ataques en DVWA:

#### SQL Injection
```bash
curl "http://localhost:8080/vulnerabilities/sqli/?id=1'+OR+'1'='1&Submit=Submit" \\
  --cookie "PHPSESSID=tu_session_id; security=low"
```

#### Command Injection
```bash
curl "http://localhost:8080/vulnerabilities/exec/?ip=127.0.0.1;cat+/etc/passwd&Submit=Submit" \\
  --cookie "PHPSESSID=tu_session_id; security=low"
```

#### File Inclusion
```bash
curl "http://localhost:8080/vulnerabilities/fi/?page=../../etc/passwd" \\
  --cookie "PHPSESSID=tu_session_id; security=low"
```

#### Brute Force
```bash
for i in {1..10}; do
  curl -X POST "http://localhost:8080/login.php" \\
    -d "username=admin&password=wrong$i"
done
```

### Navegación

- **Panel**: Vista general con métricas en tiempo real
- **Registros**: Stream de logs con detección automática
- **Alertas**: Todas las alertas generadas con filtros
- **Cronología**: Timeline visual de eventos
- **Evidencias**: Exportación y gestión de evidencias forenses

## 🧪 Testing

### Suite Automatizada de Testing

El proyecto incluye un script completo de testing que prueba todas las funcionalidades:

```bash
# Ejecutar todos los tests
./test-system.sh
```

**El script prueba:**
- ✅ Prerequisitos del sistema (Docker, Node.js, etc.)
- ✅ Contenedor DVWA (creación, inicio, conectividad)
- ✅ Todas las APIs de la webapp
- ✅ Detección de 4 tipos de ataques (SQLi, Command Injection, File Inclusion, Brute Force)
- ✅ Generación de evidencias (logs, hashes, reportes)
- ✅ Performance bajo carga

**Archivos generados en `test-results/`:**
- `logs.txt` - Logs exportados
- `alerts.json` - Alertas detectadas
- `timeline.json` - Timeline de eventos
- `hashes.json` - Hashes SHA256
- `forensic-report.md` - Reporte forense completo

📖 **Ver documentación completa:** [TESTING.md](TESTING.md)

## 🔧 Arquitectura

```
forensic-webapp/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Dashboard principal
│   ├── logs/page.tsx            # Visor de logs
│   ├── alerts/page.tsx          # Panel de alertas
│   ├── timeline/page.tsx        # Timeline visual
│   ├── evidence/page.tsx        # Gestión de evidencias
│   └── api/                     # API Routes
│       ├── docker/              # Endpoints Docker
│       │   ├── containers/      # Listar contenedores
│       │   ├── connect/         # Conectar a contenedor
│       │   ├── status/          # Estado del contenedor
│       │   └── logs/            # Logs del contenedor
│       ├── alerts/              # CRUD de alertas
│       ├── timeline/            # Timeline de eventos
│       └── evidence/            # Exportación de evidencias
├── components/                   # Componentes React
│   ├── dashboard/               # Componentes del dashboard
│   ├── logs/                    # Componentes de logs
│   ├── alerts/                  # Componentes de alertas
│   ├── timeline/                # Componentes de timeline
│   └── layout/                  # Layout y navegación
├── lib/                         # Lógica de negocio
│   ├── docker/                  # Cliente Docker
│   │   ├── client.ts           # dockerode wrapper
│   │   ├── logProcessor.ts     # Procesador de logs
│   │   └── demoData.ts         # Datos demo
│   ├── detectors/               # Detectores de ataques
│   │   ├── base.ts             # Clase base
│   │   ├── sqli.ts             # SQLi detector
│   │   ├── commandInjection.ts # Command injection
│   │   ├── bruteForce.ts       # Brute force
│   │   └── fileInclusion.ts    # File inclusion
│   ├── store.ts                 # Store in-memory
│   └── utils/                   # Utilidades
└── types/                       # TypeScript types
    └── forensic.ts              # Tipos principales
```

## 🎨 Capturas de Pantalla

### Dashboard Principal
Vista general con métricas en tiempo real, distribución de ataques y timeline reciente.

### Visor de Logs
Stream de logs con resaltado automático de ataques y búsqueda en tiempo real.

### Panel de Alertas
Gestión de alertas con filtros por severidad, tipo y estado.

### Timeline
Cronología visual de todos los eventos del incidente.

### Evidencias
Exportación de evidencias forenses con hashes SHA256.

## 🔒 Seguridad

⚠️ **IMPORTANTE**: Esta aplicación tiene acceso completo al Docker daemon.

- ❌ **NO** exponer a internet
- ✅ Ejecutar solo en entorno local/controlado
- ✅ Revisar permisos de Docker socket
- ✅ Usar en ambiente educativo o de pruebas

## 🧪 Desarrollo

### Estructura de Datos

**LogEntry**: Entrada de log parseada
```typescript
{
  id: string;
  timestamp: Date;
  ip: string;
  method: string;
  endpoint: string;
  statusCode: number;
  params: string;
}
```

**Alert**: Alerta de seguridad
```typescript
{
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  attackType: 'sqli' | 'command_injection' | 'brute_force' | 'file_inclusion';
  source: string; // IP
  target: string; // endpoint
  payload: string;
  status: 'active' | 'acknowledged' | 'resolved';
}
```

### Agregar Nuevo Detector

1. Crear archivo en `lib/detectors/`
2. Extender `AttackDetector`
3. Implementar patrones regex
4. Implementar método `detect()`
5. Registrar en `logProcessor.ts`

Ejemplo:
```typescript
import { AttackDetector } from './base';

export class MyDetector extends AttackDetector {
  name = 'my_attack' as const;
  
  patterns = [
    /pattern1/gi,
    /pattern2/gi,
  ];
  
  detect(logEntry: LogEntry): DetectionResult | null {
    // Tu lógica aquí
  }
}
```

## 📊 Métricas

La aplicación rastrea:
- Total de ataques detectados
- Ataques por tipo
- Tasa de ataques (ataques/minuto)
- Top IPs atacantes
- Líneas de log procesadas
- Tasa de procesamiento (líneas/segundo)
- Errores HTTP detectados

## 🐛 Troubleshooting

### Docker no se conecta

**Problema**: `Docker connection failed`

**Solución**:
1. Verificar que Docker Desktop esté ejecutándose
2. Comprobar permisos del socket:
   ```bash
   ls -la /var/run/docker.sock
   ```
3. La app automáticamente usa datos demo si Docker no está disponible

### No se detectan ataques

**Problema**: Los ataques no aparecen en alertas

**Solución**:
1. Verificar que el contenedor DVWA esté generando logs
2. Comprobar nivel de seguridad en DVWA (debe ser "Low")
3. Revisar cookies de sesión en requests
4. Ver logs de la consola del navegador

### Caracteres mal codificados

**Problema**: `Inyecci\u00f3n` en lugar de "Inyección"

**Solución**: Ya corregido en esta versión. Si persiste:
1. Reiniciar el servidor de desarrollo
2. Limpiar caché: `pnpm clean` y `pnpm dev`

## 📝 Licencia

Este proyecto es parte de un trabajo académico de Computación Forense.

## 👥 Contribución

Proyecto educativo - UIDE 7mo Semestre - Computación Forense

## 🙏 Agradecimientos

- [DVWA](https://github.com/digininja/DVWA) - Damn Vulnerable Web Application
- [dockerode](https://github.com/apocas/dockerode) - Docker API para Node.js
- [Next.js](https://nextjs.org/) - Framework React
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI

---

**Nota**: Esta herramienta es exclusivamente para fines educativos y de investigación en seguridad. No usar en sistemas de producción o con intenciones maliciosas.
