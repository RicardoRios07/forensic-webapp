# 🌍 Mapa de Ataques en Tiempo Real

## Descripción

Visualización geoespacial de ataques cibernéticos en tiempo real similar al mapa de amenazas de Kaspersky. El sistema geolocaliza las IPs de origen de los ataques y muestra animaciones de líneas desde el atacante hasta el servidor.

## Características

- ✅ **Geolocalización automática** de IPs usando ip-api.com
- ✅ **Animaciones fluidas** de ataques con Canvas 2D
- ✅ **Colores por severidad** (crítico=rojo, alto=naranja, medio=amarillo, bajo=verde)
- ✅ **Visualización en tiempo real** con actualización cada 3 segundos
- ✅ **Grid de mapa mundial** con coordenadas lat/lon
- ✅ **Estadísticas en vivo**: IPs únicas, países, total de ataques
- ✅ **Lista de ubicaciones** con detalles de ISP y organización
- ✅ **Cache de geolocalización** para optimizar consultas

## Cómo Funciona

### 1. Geolocalización (lib/geolocation.ts)

```typescript
// IPs privadas → Servidor local (Quito, Ecuador)
192.168.x.x, 10.x.x.x, 127.0.0.1 → SERVER_LOCATION

// IPs públicas → API de geolocalización
await geolocateIP("8.8.8.8")
// → { country: "United States", city: "Ashburn", lat: 39.03, lon: -77.5, ... }
```

### 2. API Endpoint (app/api/geolocation/route.ts)

```
GET /api/geolocation?ip=8.8.8.8
```

Respuesta:
```json
{
  "ip": "8.8.8.8",
  "country": "United States",
  "countryCode": "US",
  "city": "Ashburn",
  "lat": 39.03,
  "lon": -77.5,
  "isp": "Google LLC"
}
```

### 3. Componente del Mapa (components/map/AttackMapCanvas.tsx)

#### Ciclo de vida:

1. **Fetch de alertas** cada 3 segundos desde `/api/alerts`
2. **Geolocalización** de IPs nuevas automáticamente
3. **Creación de animaciones** para ataques recientes (últimos 20)
4. **Renderizado con Canvas**:
   - Grid mundial de coordenadas
   - Puntos pulsantes para IPs origen (azul)
   - Punto pulsante para servidor (verde)
   - Líneas animadas de ataque con color por severidad
   - Punto en movimiento siguiendo la línea

### 4. Página del Mapa (app/map/page.tsx)

Ruta: `http://localhost:3001/map`

## Configuración

### API de Geolocalización

Usando **ip-api.com** (gratuito):
- ✅ Sin API key requerida
- ✅ 45 solicitudes por minuto
- ✅ Soporta IPv4 e IPv6
- ✅ JSON response con lat/lon, país, ciudad, ISP

### Ubicación del Servidor

Por defecto: **Quito, Ecuador**

```typescript
const SERVER_LOCATION = { 
  lat: -0.1807, 
  lon: -78.4678 
};
```

Para cambiar, editar en:
- `lib/geolocation.ts` → `SERVER_LOCATION`
- `components/map/AttackMapCanvas.tsx` → `SERVER_LOCATION`

## Demostración

### 1. Generar Ataques de Prueba

```bash
# SQL Injection
curl "http://localhost:8888/vulnerabilities/sqli/?id=1'%20OR%20'1'='1" \
  -b "security=low; PHPSESSID=test"

# Command Injection
curl "http://localhost:8888/vulnerabilities/exec/?ip=127.0.0.1;whoami" \
  -b "security=low; PHPSESSID=test"

# File Inclusion
curl "http://localhost:8888/vulnerabilities/fi/?page=../../etc/passwd" \
  -b "security=low; PHPSESSID=test"
```

### 2. Ver el Mapa

1. Abrir navegador: `http://localhost:3001/map`
2. Las IPs se geolocalizarán automáticamente
3. Las animaciones aparecerán mostrando ataques en tiempo real

### 3. Resultado Esperado

```
Mapa de Ataques Globales

[Mapa mundial con grid]
- Punto azul pulsante: IP atacante (ej. 192.168.65.1 → Quito)
- Punto verde pulsante: Servidor DVWA
- Líneas rojas animadas: Ataques críticos
- Líneas naranjas: Ataques altos

Estadísticas:
┌──────────┬──────────┬────────────┬──────────────┐
│ IPs: 5   │ Países: 1│ Ataques: 23│ Estado: ACTIVO│
└──────────┴──────────┴────────────┴──────────────┘

Ubicaciones Detectadas:
- 192.168.65.1 → Quito, Ecuador (Local Server)
```

## Arquitectura Técnica

```
┌──────────────────┐
│ useForensicStream│ ← Mantiene stream activo
└────────┬─────────┘
         │
         ↓
┌────────────────────┐
│ /api/alerts        │ ← Fetch cada 3s
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│ AttackMapCanvas    │
├────────────────────┤
│ 1. Extract IPs     │
│ 2. Geolocate       │ → /api/geolocation?ip=X
│ 3. Create anims    │
│ 4. Canvas draw     │
└────────────────────┘
         │
         ↓
┌────────────────────┐
│ Canvas 2D Context  │
├────────────────────┤
│ • Draw grid        │
│ • Draw markers     │
│ • Animate attacks  │
│ • Update 60fps     │
└────────────────────┘
```

## Optimizaciones

### Cache de Geolocalización
```typescript
// IPs se consultan una sola vez
const geoCache = new Map<string, GeoLocation>();

// Limpieza periódica
export function clearGeoCache(): void {
  geoCache.clear();
}
```

### Limitación de Animaciones
```typescript
// Máximo 15 animaciones simultáneas
setAnimations(prev => [...prev.slice(-15), newAnimation]);

// Animaciones de 2 segundos de duración
progress = (Date.now() - timestamp) / 2000

// Auto-eliminación al completarse
.filter(anim => anim.progress < 1)
```

### Rate Limiting de API

ip-api.com: 45 req/min

Estrategia:
- Cache de resultados
- Deduplicación de IPs
- Batch processing de IPs únicas

## Solución de Problemas

### "No aparecen animaciones"

1. Verificar alertas: `curl http://localhost:3001/api/alerts`
2. Verificar stream: `curl http://localhost:3001/api/docker/status`
3. Generar ataques de prueba (ver arriba)

### "IPs no se geolocalizan"

```bash
# Probar API directamente
curl "http://localhost:3001/api/geolocation?ip=8.8.8.8"

# Expected: { "ip": "8.8.8.8", "country": "United States", ... }
```

### "Canvas en blanco"

- Verificar consola del navegador (F12)
- Canvas necesita dimensiones definidas por el contenedor padre
- Verificar que `canvasRef.current` no es null

## Mejoras Futuras

- [ ] Soporte para múltiples servidores/regiones
- [ ] Heatmap de zonas con más ataques
- [ ] Filtros por tipo de ataque
- [ ] Replay de timeline de ataques
- [ ] Exportar captura de mapa como imagen
- [ ] Integración con MaxMind GeoIP2 (más preciso)
- [ ] WebGL para renderizado más rápido
- [ ] Proyección Mercator precisa
- [ ] Mapa mundial con fronteras de países

## Referencias

- **ip-api.com**: https://ip-api.com/docs/api:json
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **Kaspersky Cybermap**: https://cybermap.kaspersky.com/
