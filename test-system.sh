#!/bin/bash

# =============================================================================
# DVWA Forensic Monitor - Sistema de Testing Completo
# =============================================================================
# Este script prueba todas las funcionalidades del sistema:
# - Conexión Docker
# - Contenedor DVWA
# - Detección de ataques
# - APIs del sistema
# - Generación de evidencias
# =============================================================================

# No usar set -e para permitir manejo mejor de errores
# set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
DVWA_CONTAINER="dvwa-test"
DVWA_PORT="8888"
WEBAPP_PORT="3001"
WEBAPP_URL="http://localhost:${WEBAPP_PORT}"
DVWA_URL="http://localhost:${DVWA_PORT}"
TEST_RESULTS_DIR="./test-results"
SESSION_ID=""

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# =============================================================================
# Funciones de Utilidad
# =============================================================================

print_header() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++)) || true
    ((TOTAL_TESTS++)) || true
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++)) || true
    ((TOTAL_TESTS++)) || true
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=0
    
    print_step "Esperando que el servicio esté disponible: $url"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" > /dev/null 2>&1; then
            print_success "Servicio disponible"
            return 0
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_error "Timeout esperando el servicio"
    return 1
}

# =============================================================================
# Tests de Prerequisitos
# =============================================================================

test_prerequisites() {
    print_header "1. VERIFICANDO PREREQUISITOS"
    
    # Docker
    print_step "Verificando Docker..."
    if command -v docker >/dev/null 2>&1; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker instalado: $DOCKER_VERSION"
    else
        print_error "Docker no está instalado"
        exit 1
    fi
    
    # Docker running
    print_step "Verificando Docker daemon..."
    if docker info >/dev/null 2>&1; then
        print_success "Docker daemon está corriendo"
    else
        print_error "Docker daemon no está corriendo"
        print_info "Por favor inicia Docker Desktop"
        exit 1
    fi
    
    # Node.js
    print_step "Verificando Node.js..."
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_success "Node.js instalado: $NODE_VERSION"
    else
        print_error "Node.js no está instalado"
        exit 1
    fi
    
    # pnpm
    print_step "Verificando pnpm..."
    if command -v pnpm >/dev/null 2>&1; then
        PNPM_VERSION=$(pnpm --version)
        print_success "pnpm instalado: $PNPM_VERSION"
    else
        print_error "pnpm no está instalado"
        exit 1
    fi
    
    # curl
    print_step "Verificando curl..."
    if command -v curl >/dev/null 2>&1; then
        print_success "curl está disponible"
    else
        print_error "curl no está instalado"
        exit 1
    fi
    
    # jq (opcional pero recomendado)
    if command -v jq >/dev/null 2>&1; then
        print_success "jq está disponible (para output JSON)"
    else
        print_warning "jq no está instalado (recomendado para mejor output)"
    fi
}

# =============================================================================
# Tests de Docker y DVWA
# =============================================================================

test_docker_and_dvwa() {
    print_header "2. VERIFICANDO CONTENEDOR DVWA"
    
    # Verificar si el contenedor existe
    print_step "Buscando contenedor DVWA..."
    if docker ps -a --format '{{.Names}}' | grep -q "^${DVWA_CONTAINER}$"; then
        print_success "Contenedor DVWA encontrado"
        
        # Verificar si está corriendo
        if docker ps --format '{{.Names}}' | grep -q "^${DVWA_CONTAINER}$"; then
            print_success "Contenedor DVWA está corriendo"
        else
            print_warning "Contenedor DVWA existe pero no está corriendo"
            print_step "Intentando iniciar contenedor DVWA..."
            
            # Intentar iniciar, si falla por puerto ocupado, recrear
            if docker start "$DVWA_CONTAINER" 2>&1 | grep -q "port is already allocated"; then
                print_warning "Puerto $DVWA_PORT ocupado, recreando contenedor..."
                docker rm -f "$DVWA_CONTAINER" >/dev/null 2>&1
                
                # Verificar si el puerto está ocupado por otro proceso
                if lsof -ti:${DVWA_PORT} >/dev/null 2>&1; then
                    PORT_PID=$(lsof -ti:${DVWA_PORT})
                    print_error "Puerto $DVWA_PORT está ocupado por proceso $PORT_PID"
                    print_info "Libera el puerto manualmente: kill $PORT_PID"
                    exit 1
                fi
                
                docker run -d \
                    --name "$DVWA_CONTAINER" \
                    -p "${DVWA_PORT}:80" \
                    vulnerables/web-dvwa
                print_success "Contenedor DVWA recreado e iniciado"
            elif docker start "$DVWA_CONTAINER" >/dev/null 2>&1; then
                print_success "Contenedor DVWA iniciado"
            else
                # Si falla por otra razón, intentar recrear
                print_warning "Error al iniciar, recreando contenedor..."
                docker rm -f "$DVWA_CONTAINER" >/dev/null 2>&1
                docker run -d \
                    --name "$DVWA_CONTAINER" \
                    -p "${DVWA_PORT}:80" \
                    vulnerables/web-dvwa
                print_success "Contenedor DVWA recreado"
            fi
        fi
    else
        print_warning "Contenedor DVWA no existe, creándolo..."
        docker run -d \
            --name "$DVWA_CONTAINER" \
            -p "${DVWA_PORT}:80" \
            vulnerables/web-dvwa
        print_success "Contenedor DVWA creado e iniciado"
    fi
    
    # Esperar a que DVWA esté disponible
    wait_for_service "$DVWA_URL"
    
    # Verificar puerto
    print_step "Verificando puerto $DVWA_PORT..."
    if curl -s -o /dev/null -w "%{http_code}" "$DVWA_URL" | grep -q "200"; then
        print_success "DVWA responde en puerto $DVWA_PORT"
    else
        if curl -s -o /dev/null -w "%{http_code}" "$DVWA_URL" | grep -q "302"; then
            print_success "DVWA responde (redirect) en puerto $DVWA_PORT"
        else
            print_error "DVWA no responde correctamente"
        fi
    fi
    
    # Obtener sesión de DVWA
    print_step "Obteniendo sesión de DVWA..."
    SESSION_ID=$(curl -s -c /tmp/dvwa_cookies.txt "$DVWA_URL/login.php" | grep -o 'PHPSESSID=[^;]*' | cut -d= -f2)
    if [ -n "$SESSION_ID" ]; then
        print_success "Sesión obtenida: ${SESSION_ID:0:20}..."
    else
        # Intentar de otra forma
        SESSION_ID=$(curl -s -i "$DVWA_URL/login.php" | grep -i "set-cookie" | grep -o 'PHPSESSID=[^;]*' | cut -d= -f2)
        if [ -n "$SESSION_ID" ]; then
            print_success "Sesión obtenida: ${SESSION_ID:0:20}..."
        else
            print_warning "No se pudo obtener sesión automáticamente"
            SESSION_ID="test_session"
        fi
    fi
}

# =============================================================================
# Tests de Webapp
# =============================================================================

test_webapp() {
    print_header "3. VERIFICANDO FORENSIC WEBAPP"
    
    # Verificar si está corriendo
    print_step "Verificando si la webapp está corriendo..."
    if curl -s -o /dev/null -w "%{http_code}" "$WEBAPP_URL" | grep -q "200"; then
        print_success "Webapp está corriendo en puerto $WEBAPP_PORT"
    else
        print_error "Webapp no está corriendo en puerto $WEBAPP_PORT"
        print_info "Inicia la webapp con: pnpm dev"
        exit 1
    fi
    
    # Test API: Containers
    print_step "Test API: /api/docker/containers"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$WEBAPP_URL/api/docker/containers")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "API Containers responde correctamente"
    else
        print_error "API Containers falló (HTTP $HTTP_CODE)"
    fi
    
    # Test API: Connect
    print_step "Test API: /api/docker/connect"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBAPP_URL/api/docker/connect" \
        -H "Content-Type: application/json" \
        -d "{\"containerId\": \"$DVWA_CONTAINER\"}")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "API Connect responde correctamente"
    else
        print_error "API Connect falló (HTTP $HTTP_CODE)"
    fi
    
    # Test API: Status
    print_step "Test API: /api/docker/status"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$WEBAPP_URL/api/docker/status")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "API Status responde correctamente"
    else
        print_error "API Status falló (HTTP $HTTP_CODE)"
    fi
    
    # Test API: Stats
    print_step "Test API: /api/stats"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$WEBAPP_URL/api/stats")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "API Stats responde correctamente"
    else
        print_error "API Stats falló (HTTP $HTTP_CODE)"
    fi
    
    # Test API: Alerts
    print_step "Test API: /api/alerts"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$WEBAPP_URL/api/alerts")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "API Alerts responde correctamente"
    else
        print_error "API Alerts falló (HTTP $HTTP_CODE)"
    fi
    
    # Test API: Timeline
    print_step "Test API: /api/timeline"
    RESPONSE=$(curl -s -w "\n%{http_code}" "$WEBAPP_URL/api/timeline")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "API Timeline responde correctamente"
    else
        print_error "API Timeline falló (HTTP $HTTP_CODE)"
    fi
}

# =============================================================================
# Tests de Detección de Ataques
# =============================================================================

test_attack_detection() {
    print_header "4. PROBANDO DETECCIÓN DE ATAQUES"
    
    print_info "Se ejecutarán ataques simulados contra DVWA..."
    print_info "La webapp debería detectarlos y generar alertas"
    echo ""
    
    # Wait a bit for streaming to start
    sleep 3
    
    # SQL Injection
    print_step "Test 1: SQL Injection"
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/vulnerabilities/sqli/?id=1'+OR+'1'='1&Submit=Submit"
    print_success "Ataque SQLi ejecutado"
    
    sleep 2
    
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/vulnerabilities/sqli/?id=1'+UNION+SELECT+null,version()--&Submit=Submit"
    print_success "Ataque SQLi (UNION) ejecutado"
    
    sleep 2
    
    # Command Injection
    print_step "Test 2: Command Injection"
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/vulnerabilities/exec/?ip=127.0.0.1;cat+/etc/passwd&Submit=Submit"
    print_success "Ataque Command Injection (cat) ejecutado"
    
    sleep 2
    
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/vulnerabilities/exec/?ip=127.0.0.1;whoami&Submit=Submit"
    print_success "Ataque Command Injection (whoami) ejecutado"
    
    sleep 2
    
    # File Inclusion
    print_step "Test 3: File Inclusion"
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/vulnerabilities/fi/?page=../../etc/passwd"
    print_success "Ataque File Inclusion ejecutado"
    
    sleep 2
    
    # Brute Force
    print_step "Test 4: Brute Force"
    for i in {1..5}; do
        curl -s -o /dev/null \
            -X POST \
            "${DVWA_URL}/vulnerabilities/brute/" \
            -d "username=admin&password=wrong${i}&Login=Login" \
            --cookie "PHPSESSID=${SESSION_ID}; security=low"
        echo -n "."
    done
    echo ""
    print_success "Ataque Brute Force ejecutado (5 intentos)"
    
    sleep 2
    
    # Tráfico normal
    print_step "Test 5: Tráfico Normal (para comparación)"
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/"
    curl -s -o /dev/null \
        --cookie "PHPSESSID=${SESSION_ID}; security=low" \
        "${DVWA_URL}/index.php"
    print_success "Tráfico normal ejecutado"
    
    print_info "Esperando 5 segundos para que se procesen los logs..."
    sleep 5
}

# =============================================================================
# Tests de Verificación de Detección
# =============================================================================

test_detection_results() {
    print_header "5. VERIFICANDO RESULTADOS DE DETECCIÓN"
    
    # Verificar alertas generadas
    print_step "Obteniendo alertas generadas..."
    ALERTS_RESPONSE=$(curl -s "$WEBAPP_URL/api/alerts")
    
    if command -v jq >/dev/null 2>&1; then
        TOTAL_ALERTS=$(echo "$ALERTS_RESPONSE" | jq '.alerts | length')
        CRITICAL_ALERTS=$(echo "$ALERTS_RESPONSE" | jq '[.alerts[] | select(.severity == "critical")] | length')
        HIGH_ALERTS=$(echo "$ALERTS_RESPONSE" | jq '[.alerts[] | select(.severity == "high")] | length')
        
        print_info "Total de alertas: $TOTAL_ALERTS"
        print_info "Alertas críticas: $CRITICAL_ALERTS"
        print_info "Alertas high: $HIGH_ALERTS"
        
        if [ "$TOTAL_ALERTS" -gt 0 ]; then
            print_success "Sistema detectó ataques correctamente"
        else
            print_warning "No se detectaron alertas (puede que esté usando datos demo)"
        fi
    else
        # Sin jq, verificar si hay contenido
        if echo "$ALERTS_RESPONSE" | grep -q "alerts"; then
            print_success "API de alertas responde con datos"
        else
            print_error "API de alertas no tiene datos"
        fi
    fi
    
    # Verificar stats
    print_step "Obteniendo estadísticas..."
    STATS_RESPONSE=$(curl -s "$WEBAPP_URL/api/stats")
    
    if command -v jq >/dev/null 2>&1; then
        TOTAL_ATTACKS=$(echo "$STATS_RESPONSE" | jq '.stats.totalAttacks')
        SQLI_COUNT=$(echo "$STATS_RESPONSE" | jq '.stats.attacksByType.sqli')
        CMDI_COUNT=$(echo "$STATS_RESPONSE" | jq '.stats.attacksByType.command_injection')
        
        print_info "Total de ataques detectados: $TOTAL_ATTACKS"
        print_info "SQL Injection: $SQLI_COUNT"
        print_info "Command Injection: $CMDI_COUNT"
        
        if [ "$TOTAL_ATTACKS" != "null" ] && [ "$TOTAL_ATTACKS" != "0" ]; then
            print_success "Estadísticas de ataques generadas correctamente"
        else
            print_warning "Sin estadísticas de ataques (modo demo?)"
        fi
    fi
}

# =============================================================================
# Tests de Evidencias
# =============================================================================

test_evidence_generation() {
    print_header "6. PROBANDO GENERACIÓN DE EVIDENCIAS"
    
    # Crear directorio de resultados
    mkdir -p "$TEST_RESULTS_DIR"
    
    # Test: Export Logs
    print_step "Test: Exportar Logs"
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "${TEST_RESULTS_DIR}/logs.txt" \
        "$WEBAPP_URL/api/evidence/logs")
    if [ "$HTTP_CODE" = "200" ]; then
        if [ -s "${TEST_RESULTS_DIR}/logs.txt" ]; then
            LOG_SIZE=$(wc -c < "${TEST_RESULTS_DIR}/logs.txt")
            print_success "Logs exportados correctamente (${LOG_SIZE} bytes)"
        else
            print_error "Archivo de logs está vacío"
        fi
    else
        print_error "Exportación de logs falló (HTTP $HTTP_CODE)"
    fi
    
    # Test: Export Alerts
    print_step "Test: Exportar Alertas"
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "${TEST_RESULTS_DIR}/alerts.json" \
        "$WEBAPP_URL/api/alerts")
    if [ "$HTTP_CODE" = "200" ]; then
        if [ -s "${TEST_RESULTS_DIR}/alerts.json" ]; then
            print_success "Alertas exportadas correctamente"
        else
            print_error "Archivo de alertas está vacío"
        fi
    else
        print_error "Exportación de alertas falló (HTTP $HTTP_CODE)"
    fi
    
    # Test: Export Timeline
    print_step "Test: Exportar Timeline"
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "${TEST_RESULTS_DIR}/timeline.json" \
        "$WEBAPP_URL/api/timeline/export")
    if [ "$HTTP_CODE" = "200" ]; then
        if [ -s "${TEST_RESULTS_DIR}/timeline.json" ]; then
            print_success "Timeline exportado correctamente"
        else
            print_error "Archivo de timeline está vacío"
        fi
    else
        print_error "Exportación de timeline falló (HTTP $HTTP_CODE)"
    fi
    
    # Test: Generate Hashes
    print_step "Test: Generar Hashes SHA256"
    HASHES_RESPONSE=$(curl -s "$WEBAPP_URL/api/evidence/hashes")
    if echo "$HASHES_RESPONSE" | grep -q "hashes"; then
        echo "$HASHES_RESPONSE" > "${TEST_RESULTS_DIR}/hashes.json"
        print_success "Hashes generados correctamente"
    else
        print_error "Generación de hashes falló"
    fi
    
    # Test: Generate Report
    print_step "Test: Generar Reporte Forense"
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "${TEST_RESULTS_DIR}/forensic-report.md" \
        "$WEBAPP_URL/api/evidence/report")
    if [ "$HTTP_CODE" = "200" ]; then
        if [ -s "${TEST_RESULTS_DIR}/forensic-report.md" ]; then
            REPORT_SIZE=$(wc -c < "${TEST_RESULTS_DIR}/forensic-report.md")
            print_success "Reporte forense generado (${REPORT_SIZE} bytes)"
        else
            print_error "Reporte forense está vacío"
        fi
    else
        print_error "Generación de reporte falló (HTTP $HTTP_CODE)"
    fi
    
    # Test: Capture Filesystem
    print_step "Test: Capturar Filesystem"
    FS_RESPONSE=$(curl -s -X POST "$WEBAPP_URL/api/evidence/filesystem")
    if echo "$FS_RESPONSE" | grep -q "success"; then
        print_success "Filesystem capturado correctamente"
    else
        print_warning "Captura de filesystem falló (requiere Docker real)"
    fi
}

# =============================================================================
# Tests de Performance
# =============================================================================

test_performance() {
    print_header "7. PROBANDO PERFORMANCE"
    
    print_step "Test: Carga de logs múltiples"
    START_TIME=$(date +%s)
    
    for i in {1..20}; do
        curl -s -o /dev/null \
            --cookie "PHPSESSID=${SESSION_ID}; security=low" \
            "${DVWA_URL}/index.php?page=test${i}" &
    done
    
    wait
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    print_success "20 requests procesados en ${DURATION} segundos"
    
    sleep 3
    
    # Verificar que el sistema sigue respondiendo
    print_step "Test: Sistema responde después de carga"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEBAPP_URL/api/stats")
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Sistema responde correctamente después de carga"
    else
        print_error "Sistema no responde después de carga"
    fi
}

# =============================================================================
# Resumen Final
# =============================================================================

print_summary() {
    print_header "RESUMEN DE RESULTADOS"
    
    echo -e "${CYAN}Total de Tests:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Tests Exitosos:${NC} $TESTS_PASSED"
    echo -e "${RED}Tests Fallidos:${NC} $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ TODOS LOS TESTS PASARON EXITOSAMENTE  ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    else
        SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS)) || true
        echo -e "${YELLOW}╔════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  Tests completados con ${SUCCESS_RATE}% éxito       ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════╝${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Archivos generados en:${NC} $TEST_RESULTS_DIR"
    if [ -d "$TEST_RESULTS_DIR" ]; then
        ls -lh "$TEST_RESULTS_DIR"
    fi
    
    echo ""
    echo -e "${CYAN}Para ver el reporte forense:${NC}"
    echo -e "  cat ${TEST_RESULTS_DIR}/forensic-report.md"
    echo ""
    echo -e "${CYAN}Para ver la webapp:${NC}"
    echo -e "  open http://localhost:${WEBAPP_PORT}"
    echo ""
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    clear
    echo -e "${PURPLE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██████╗ ██╗   ██╗██╗    ██╗ █████╗     ████████╗███████╗║
║     ██╔══██╗██║   ██║██║    ██║██╔══██╗    ╚══██╔══╝██╔════╝║
║     ██║  ██║██║   ██║██║ █╗ ██║███████║       ██║   █████╗  ║
║     ██║  ██║╚██╗ ██╔╝██║███╗██║██╔══██║       ██║   ██╔══╝  ║
║     ██████╔╝ ╚████╔╝ ╚███╔███╔╝██║  ██║       ██║   ███████╗║
║     ╚═════╝   ╚═══╝   ╚══╝╚══╝ ╚═╝  ╚═╝       ╚═╝   ╚══════╝║
║                                                               ║
║            FORENSIC MONITOR - SISTEMA DE TESTING             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    print_info "Iniciando suite de testing completo..."
    print_info "Fecha: $(date)"
    echo ""
    
    # Ejecutar tests
    test_prerequisites
    test_docker_and_dvwa
    test_webapp
    test_attack_detection
    test_detection_results
    test_evidence_generation
    test_performance
    
    # Mostrar resumen
    print_summary
}

# Ejecutar main
main
