# 🐛 Solución: Problema de Conexión Docker en macOS

## Problema

La webapp eliminó los datos demo correctamente pero dockerode no puede conectarse al daemon de Docker en macOS, aunque el contenedor está corriendo.

## Causa

Next.js ejecuta el código del servidor con permisos diferentes al CLI de Docker. En macOS con Docker Desktop, el socket puede no ser accesible.

## Soluciones

### Opción 1: Reiniciar Next.js con Permisos (Recomendado)

```bash
# Detén el servidor actual (Ctrl+C en la terminal de pnpm dev)
# Luego reinicia:
cd "/Users/ricardo/Documents/UIDE/7mo/COMPUTACIÓN FORENSE/dvwa-forense/forensic-webapp"
pnpm dev
```

### Opción 2: Variable de Entorno

```bash
# En .env.local agrega:
DOCKER_HOST=unix:///Users/ricardo/.docker/run/docker.sock

# O usa la ruta por defecto:
DOCKER_HOST=unix:///var/run/docker.sock

# Luego reinicia con pnpm dev
```

### Opción 3: Permisos del Socket

```bash
# Dar permisos al socket (requiere password)
sudo chmod 666 /var/run/docker.sock

# Luego reinicia pnpm dev
```

### Opción 4: Usar Docker Desktop Context

```bash
# Asegúrate que Docker Desktop esté usando el contexto correcto
docker context use desktop-linux

# Reinicia pnpm dev
```

## Verificación Rápida

```bash
# Test 1: Docker CLI funciona
docker ps

# Test 2: Socket existe
ls -la /var/run/docker.sock

# Test 3: API responde
curl http://localhost:3001/api/docker/containers
```

## Resultado Esperado

Después de aplicar una solución:

```json
{
  "containers": [
    {
      "id": "...",
      "name": "dvwa-test",
      "state": "running"
    }
  ],
  "source": "docker"
}
```

## Estado Actual

✅ Datos demo eliminados completamente
✅ APIs actualizadas para solo Docker real  
✅ No hay errores de compilación
⚠️ dockerode no puede conectar al daemon (problema de permisos/contexto)

## Próximo Paso Recomendado

**Reinicia el servidor Next.js:**

1. Ve a la terminal donde está corriendo `pnpm dev`
2. Presiona `Ctrl + C` para detenerlo
3. Ejecuta nuevamente: `pnpm dev`
4. Recarga el navegador en http://localhost:3001
5. El sistema se auto-conectará a `dvwa-test`
