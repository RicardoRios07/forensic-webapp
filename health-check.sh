#!/bin/bash

################################################################################
# Script de Verificación de Salud del Sistema
# Ejecutar con: bash health-check.sh
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FAILED=0
WARNINGS=0
SUCCESS=0

log_success() { echo -e "${GREEN}✓${NC} $1"; ((SUCCESS++)); }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; ((WARNINGS++)); }
log_error() { echo -e "${RED}✗${NC} $1"; ((FAILED++)); }

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICACIÓN DE SALUD DEL SISTEMA${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

################################################################################
# 1. Verificación de Docker
################################################################################

echo -e "${BLUE}[1/10] Verificando Docker...${NC}"

if docker ps > /dev/null 2>&1; then
    log_success "Docker daemon está en ejecución"
else
    log_error "Docker daemon no está disponible"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    log_success "Docker Compose instalado"
else
    log_error "Docker Compose no encontrado"
fi

################################################################################
# 2. Verificación de contenedores
################################################################################

echo ""
echo -e "${BLUE}[2/10] Verificando contenedores...${NC}"

REQUIRED_CONTAINERS=("dvwa" "dvwa-db" "forensic-webapp")
for container in "${REQUIRED_CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        STATUS=$(docker ps --format "{{.Status}}" --filter "name=^${container}$")
        if echo "$STATUS" | grep -q "Up"; then
            log_success "Contenedor '$container' está en ejecución"
        else
            log_warning "Contenedor '$container' existe pero no está en ejecución"
        fi
    else
        log_error "Contenedor '$container' no encontrado"
    fi
done

################################################################################
# 3. Verificación de servicios HTTP
################################################################################

echo ""
echo -e "${BLUE}[3/10] Verificando servicios HTTP...${NC}"

# DVWA
if curl -s -f http://localhost:8080 > /dev/null; then
    log_success "DVWA (http://localhost:8080) está respondiendo"
else
    log_warning "DVWA (http://localhost:8080) no está respondiendo"
fi

# Forensic App
if curl -s -f http://localhost:3000 > /dev/null; then
    log_success "Forensic App (http://localhost:3000) está respondiendo"
else
    log_warning "Forensic App (http://localhost:3000) no está respondiendo"
fi

# Apache Proxy
if curl -s -f http://localhost > /dev/null; then
    log_success "Apache proxy (http://localhost) está respondiendo"
else
    log_warning "Apache proxy no está respondiendo"
fi

################################################################################
# 4. Verificación de base de datos
################################################################################

echo ""
echo -e "${BLUE}[4/10] Verificando base de datos...${NC}"

if docker exec dvwa-db mysqladmin ping -u dvwa -pdvwa > /dev/null 2>&1; then
    log_success "MySQL está accesible y responde"
else
    log_error "MySQL no está respondiendo"
fi

################################################################################
# 5. Verificación de disky
################################################################################

echo ""
echo -e "${BLUE}[5/10] Verificando espacio en disco...${NC}"

USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$USAGE" -lt 80 ]; then
    log_success "Espacio en disco OK ($USAGE% usado)"
elif [ "$USAGE" -lt 90 ]; then
    log_warning "Espacio en disco bajo ($USAGE% usado)"
else
    log_error "Espacio en disco crítico ($USAGE% usado)"
fi

################################################################################
# 6. Verificación de memoria
################################################################################

echo ""
echo -e "${BLUE}[6/10] Verificando memoria...${NC}"

TOTAL=$(free -h | awk 'NR==2 {print $2}')
USED=$(free -h | awk 'NR==2 {print $3}')
PERCENT=$(free | awk 'NR==2 {printf "%.0f", ($3/$2)*100}')

if [ "$PERCENT" -lt 80 ]; then
    log_success "Memoria OK ($USED de $TOTAL, $PERCENT%)"
elif [ "$PERCENT" -lt 90 ]; then
    log_warning "Memoria alta ($USED de $TOTAL, $PERCENT%)"
else
    log_error "Memoria crítica ($USED de $TOTAL, $PERCENT%)"
fi

################################################################################
# 7. Verificación de volúmenes Docker
################################################################################

echo ""
echo -e "${BLUE}[7/10] Verificando volúmenes Docker...${NC}"

EXPECTED_VOLUMES=("dvwa_db_data" "dvwa_data")
for volume in "${EXPECTED_VOLUMES[@]}"; do
    if docker volume ls --format "{{.Name}}" | grep -q "^${volume}$"; then
        log_success "Volumen '$volume' existe"
    else
        log_warning "Volumen '$volume' no encontrado"
    fi
done

################################################################################
# 8. Verificación de logs
################################################################################

echo ""
echo -e "${BLUE}[8/10] Verificando logs de errores...${NC}"

# Errores en Forensic App
if docker logs forensic-webapp 2>&1 | grep -i "error" | head -1 | grep -q .; then
    ERROR_COUNT=$(docker logs forensic-webapp 2>&1 | grep -ic "error" | tail -1)
    log_warning "Forensic App tiene $ERROR_COUNT errores en logs"
else
    log_success "Forensic App sin errores visibles en logs"
fi

# Errores en DVWA
if docker logs dvwa 2>&1 | grep -i "error" | head -1 | grep -q .; then
    log_warning "DVWA tiene errores en logs"
else
    log_success "DVWA sin errores visibles en logs"
fi

################################################################################
# 9. Verificación de Apache
################################################################################

echo ""
echo -e "${BLUE}[9/10] Verificando Apache...${NC}"

if systemctl is-active --quiet apache2; then
    log_success "Apache2 está activo"
else
    log_error "Apache2 no está activo"
fi

if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
    log_success "Configuración de Apache válida"
else
    log_error "Error en configuración de Apache"
fi

################################################################################
# 10. Verificación de conectividad de contenedores
################################################################################

echo ""
echo -e "${BLUE}[10/10] Verificando conectividad entre contenedores...${NC}"

if docker exec forensic-webapp curl -s -f http://dvwa-db:3306 > /dev/null 2>&1 || \
   docker exec forensic-webapp curl -s http://dvwa > /dev/null 2>&1; then
    log_success "Contenedores pueden comunicarse"
else
    log_warning "Verificar conectividad entre contenedores"
fi

################################################################################
# Resumen
################################################################################

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}RESUMEN${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo "  ${GREEN}Pasadas:${NC} $SUCCESS"
echo "  ${YELLOW}Advertencias:${NC} $WARNINGS"
echo "  ${RED}Errores:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ Sistema en óptimas condiciones${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Sistema funcionando con advertencias${NC}"
        exit 0
    fi
else
    echo -e "${RED}✗ Sistema con errores que requieren atención${NC}"
    exit 1
fi
