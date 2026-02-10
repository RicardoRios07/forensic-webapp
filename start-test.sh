#!/bin/bash

# =============================================================================
# Script Helper para Iniciar Testing Rápido
# =============================================================================

set -e

echo "🚀 Iniciando entorno de testing..."
echo ""

# Verificar Docker
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Limpiar contenedores antiguos
echo "🧹 Limpiando contenedores anteriores..."
docker rm -f dvwa-test 2>/dev/null || true

# Iniciar DVWA en puerto 8888
echo "📦 Iniciando DVWA en puerto 8888..."
docker run -d --name dvwa-test -p 8888:80 vulnerables/web-dvwa

# Esperar a que DVWA esté listo
echo "⏳ Esperando a que DVWA inicie..."
for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/ | grep -q "302\|200"; then
        echo "✅ DVWA está listo en http://localhost:8888"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Verificar webapp
echo "🔍 Verificando webapp..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ | grep -q "200"; then
    echo "✅ Webapp está corriendo en http://localhost:3001"
else
    echo "⚠️  Webapp no está corriendo."
    echo "   Inicia la webapp en otra terminal con: pnpm dev"
    echo ""
fi

# Conectar webapp al contenedor
echo "🔗 Conectando webapp al contenedor DVWA..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/docker/connect \
    -H "Content-Type: application/json" \
    -d '{"containerId": "dvwa-test"}')

if echo "$RESPONSE" | grep -q "connected\|success"; then
    echo "✅ Conexión establecida"
else
    echo "⚠️  No se pudo conectar automáticamente"
    echo "   Conecta manualmente desde la webapp"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ENTORNO LISTO                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Información:"
echo "   - DVWA:    http://localhost:8888"
echo "   - Webapp:  http://localhost:3001"
echo "   - Contenedor: dvwa-test"
echo ""
echo "🧪 Para ejecutar los tests:"
echo "   ./test-system.sh"
echo ""
echo "🎯 Para generar tráfico de ataque:"
echo "   # Accede a DVWA y ejecuta ataques manualmente, o..."
echo "   curl \"http://localhost:8888/vulnerabilities/sqli/?id=1'+OR+'1'='1\""
echo ""
echo "🛑 Para detener el entorno:"
echo "   docker stop dvwa-test"
echo ""
