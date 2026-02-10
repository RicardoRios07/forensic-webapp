# 🧪 Guía de Testing - DVWA Forensic Monitor

## Scripts de Testing Disponibles

### `test-system.sh` - Suite Completa de Testing

Script bash que ejecuta una suite completa de tests automatizados para verificar todas las funcionalidades del sistema.

## 🚀 Uso Rápido

```bash
# Asegúrate de tener Docker Desktop corriendo y la webapp iniciada
pnpm dev

# En otra terminal, ejecuta el script de testing
./test-system.sh
```

## 📋 Qué Prueba el Script

### 1. **Prerequisitos del Sistema**
- ✅ Docker instalado y corriendo
- ✅ Node.js y pnpm disponibles
- ✅ Herramientas adicionales (curl, jq)

### 2. **Contenedor DVWA**
- ✅ Verifica si el contenedor existe
- ✅ Inicia el contenedor si es necesario
- ✅ Crea el contenedor si no existe
- ✅ Verifica que responda en el puerto 8080
- ✅ Obtiene sesión PHP válida

### 3. **Forensic Webapp**
- ✅ Verifica que esté corriendo en puerto 3001
- ✅ Prueba todos los endpoints de API:
  - `/api/docker/containers` - Lista de contenedores
  - `/api/docker/connect` - Conexión a contenedor
  - `/api/docker/status` - Estado del contenedor
  - `/api/stats` - Estadísticas de ataques
  - `/api/alerts` - Alertas generadas
  - `/api/timeline` - Línea de tiempo de eventos

### 4. **Detección de Ataques**

El script ejecuta ataques reales contra DVWA para verificar la detección:

#### SQL Injection
```bash
# Ataque básico
GET /vulnerabilities/sqli/?id=1' OR '1'='1

# UNION attack
GET /vulnerabilities/sqli/?id=1' UNION SELECT null,version()--
```

#### Command Injection
```bash
# Lectura de archivos
POST /vulnerabilities/exec/?ip=127.0.0.1;cat /etc/passwd

# Ejecución de comandos
POST /vulnerabilities/exec/?ip=127.0.0.1;whoami
```

#### File Inclusion
```bash
# Path traversal
GET /vulnerabilities/fi/?page=../../etc/passwd
```

#### Brute Force
```bash
# 5 intentos de login fallidos
POST /vulnerabilities/brute/ (username=admin, password=wrong1-5)
```

### 5. **Verificación de Detección**
- ✅ Confirma que se generaron alertas
- ✅ Valida estadísticas de ataques
- ✅ Verifica contadores por tipo de ataque
- ✅ Muestra severidades detectadas

### 6. **Generación de Evidencias**

Prueba todos los endpoints de evidencias y guarda los resultados en `test-results/`:

| Archivo | Contenido |
|---------|-----------|
| `logs.txt` | Logs procesados del sistema |
| `alerts.json` | Todas las alertas generadas |
| `timeline.json` | Timeline completo de eventos |
| `hashes.json` | Hashes SHA256 de evidencias |
| `forensic-report.md` | Reporte forense completo |

### 7. **Performance**
- ✅ Ejecuta 20 requests concurrentes
- ✅ Mide tiempo de procesamiento
- ✅ Verifica que el sistema sigue respondiendo

## 📊 Output del Script

El script genera output colorizado con:

- 🟣 **Headers de sección** - Indica la fase actual
- 🔵 **Pasos** - Operaciones en progreso
- 🟢 **Éxitos** - Tests que pasaron
- 🔴 **Errores** - Tests que fallaron
- 🟡 **Warnings** - Situaciones no ideales pero no críticas
- 🔷 **Info** - Información adicional

### Ejemplo de Output

```
═══════════════════════════════════════════════════════════════
  1. VERIFICANDO PREREQUISITOS
═══════════════════════════════════════════════════════════════

▶ Verificando Docker...
✓ Docker instalado: Docker version 24.0.7

▶ Verificando Docker daemon...
✓ Docker daemon está corriendo

▶ Verificando Node.js...
✓ Node.js instalado: v20.11.0

═══════════════════════════════════════════════════════════════
  RESUMEN DE RESULTADOS
═══════════════════════════════════════════════════════════════

Total de Tests: 35
Tests Exitosos: 35
Tests Fallidos: 0

╔════════════════════════════════════════════╗
║  ✓ TODOS LOS TESTS PASARON EXITOSAMENTE  ║
╚════════════════════════════════════════════╝
```

## 🔧 Prerequisitos

### Obligatorios
- Docker Desktop corriendo
- Node.js (v18+)
- pnpm
- curl

### Opcionales (pero recomendados)
- `jq` - Para mejor parsing de JSON
  ```bash
  # macOS
  brew install jq
  
  # Linux
  sudo apt install jq
  ```

## 🎯 Escenarios de Testing

### Test Completo (Recomendado)
```bash
# 1. Inicia Docker Desktop
# 2. Desde la raíz del proyecto:
cd forensic-webapp
pnpm dev

# 3. En otra terminal:
./test-system.sh
```

### Test Sin Docker
El script detectará automáticamente si Docker no está disponible y te notificará qué funcionalidades no se pueden probar.

### Test Solo APIs
Si solo quieres probar las APIs sin ejecutar ataques:
```bash
# Puedes comentar la función test_attack_detection() en el script
```

## 📁 Archivos Generados

Todos los resultados se guardan en `test-results/`:

```
test-results/
├── logs.txt              # Logs exportados
├── alerts.json          # Alertas en JSON
├── timeline.json        # Timeline de eventos
├── hashes.json          # Hashes SHA256
└── forensic-report.md   # Reporte completo
```

### Ver el Reporte
```bash
# Ver en terminal
cat test-results/forensic-report.md

# Abrir en VSCode
code test-results/forensic-report.md

# Convertir a HTML (si tienes pandoc)
pandoc test-results/forensic-report.md -o test-results/report.html
```

## 🐛 Troubleshooting

### Error: "Docker daemon no está corriendo"
```bash
# macOS: Inicia Docker Desktop desde Applications
# Linux: sudo systemctl start docker
```

### Error: "Webapp no está corriendo"
```bash
# Asegúrate de ejecutar en otra terminal:
pnpm dev
```

### Error: "Puerto 8080 ya en uso"
```bash
# Encuentra y mata el proceso usando el puerto
lsof -ti:8080 | xargs kill -9

# O usa otro puerto modificando DVWA_PORT en el script
```

### Timeout esperando DVWA
```bash
# Verifica que Docker tiene suficientes recursos
# Docker Desktop > Settings > Resources > Memory (mín 2GB)

# O aumenta max_attempts en wait_for_service()
```

### Ataques no se detectan
```bash
# Verifica que estás usando Docker real, no datos demo
# Revisa el log de la webapp:
pnpm dev

# Debería mostrar: "Docker client created successfully"
# No: "Warning: Docker not available, using demo data"
```

## 🔬 Testing Manual

Si prefieres hacer pruebas manuales:

### 1. Verificar Docker
```bash
docker ps
# Debería mostrar el contenedor DVWA
```

### 2. Probar API
```bash
# Status
curl http://localhost:3001/api/docker/status | jq

# Alerts
curl http://localhost:3001/api/alerts | jq

# Stats
curl http://localhost:3001/api/stats | jq
```

### 3. Ejecutar Ataque Manual
```bash
# SQLi
curl "http://localhost:8080/vulnerabilities/sqli/?id=1'+OR+'1'='1&Submit=Submit" \
  --cookie "security=low"

# Verifica en la webapp que se detectó
curl http://localhost:3001/api/alerts | jq '.alerts | length'
```

## 📈 CI/CD Integration

Para integrar en CI/CD (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/test.yml
name: Test Forensic Webapp

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      docker:
        image: docker:dind
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Start webapp
        run: pnpm dev &
        
      - name: Wait for webapp
        run: npx wait-on http://localhost:3001
        
      - name: Run tests
        run: ./test-system.sh
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## 🎓 Uso Académico

Para presentación en clase o demostración:

```bash
# 1. Ejecuta el script completo
./test-system.sh | tee demo-output.txt

# 2. Muestra el reporte generado
cat test-results/forensic-report.md

# 3. Abre la webapp para vista visual
open http://localhost:3001
```

## 📝 Personalización

### Modificar Ataques
Edita la función `test_attack_detection()` para agregar más ataques:

```bash
# Agregar XSS
curl -s -o /dev/null \
  "${DVWA_URL}/vulnerabilities/xss_r/?name=<script>alert(1)</script>"
```

### Cambiar Puertos
```bash
# Al inicio del script
DVWA_PORT="9090"
WEBAPP_PORT="3002"
```

### Agregar Tests Personalizados
```bash
test_custom_feature() {
    print_header "8. TEST PERSONALIZADO"
    
    print_step "Probando feature X..."
    # Tu código aquí
    print_success "Feature X funciona"
}

# Llamar en main()
test_custom_feature
```

## 📚 Referencias

- [Documentación DVWA](https://github.com/digininja/DVWA)
- [Docker API](https://docs.docker.com/engine/api/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Bash Testing Best Practices](https://github.com/bats-core/bats-core)
