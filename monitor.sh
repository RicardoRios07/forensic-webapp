#!/bin/bash

################################################################################
# Script de Monitoreo en Tiempo Real
# Uso: bash monitor.sh
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="${1:-.}"

################################################################################
# Funciones de utilidad
################################################################################

clear_screen() {
    clear
}

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}MONITOR DE FORENSIC WEBAPP - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name (puerto $port) - ${GREEN}Online${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} $name (puerto $port) - ${RED}Offline${NC}"
        return 1
    fi
}

show_container_status() {
    echo ""
    echo -e "${BLUE}── ESTADO DE CONTENEDORES ──${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" --no-trunc
}

show_resource_usage() {
    echo ""
    echo -e "${BLUE}── USO DE RECURSOS ──${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

show_services_status() {
    echo ""
    echo -e "${BLUE}── ESTADO DE SERVICIOS ──${NC}"
    check_service "DVWA" "http://localhost:8080" 8080
    check_service "Forensic App (directo)" "http://localhost:3000" 3000
    check_service "Apache (proxy)" "http://localhost" 80
    check_service "MySQL/DVWA-DB" "localhost:3306" 3306
}

show_disk_usage() {
    echo ""
    echo -e "${BLUE}── USO DE DISCO ──${NC}"
    df -h | grep -E "^/dev/|Filesystem"
}

show_docker_stats() {
    echo ""
    echo -e "${BLUE}── ESTADÍSTICAS DOCKER ──${NC}"
    
    TOTAL_IMAGES=$(docker images -q | wc -l)
    RUNNING_CONTAINERS=$(docker ps -q | wc -l)
    TOTAL_CONTAINERS=$(docker ps -a -q | wc -l)
    TOTAL_VOLUMES=$(docker volume ls -q | wc -l)
    
    echo "  Imágenes: $TOTAL_IMAGES"
    echo "  Contenedores en ejecución: $RUNNING_CONTAINERS/$TOTAL_CONTAINERS"
    echo "  Volúmenes: $TOTAL_VOLUMES"
    
    DOCKER_SIZE=$(docker system df --format "{{.TotalReclaimableSpace}}" 2>/dev/null || echo "N/A")
    echo "  Espacio recuperable: $DOCKER_SIZE"
}

show_logs_summary() {
    echo ""
    echo -e "${BLUE}── RESUMEN DE LOGS RECIENTES ──${NC}"
    
    echo ""
    echo "Últimos errores en Apache:"
    docker logs --tail 5 forensic-webapp 2>/dev/null | grep -i error | head -3 || echo "  Sin errores"
    
    echo ""
    echo "Últimos errores en DVWA:"
    docker logs --tail 5 dvwa 2>/dev/null | grep -i error | head -3 || echo "  Sin errores"
}

show_network_info() {
    echo ""
    echo -e "${BLUE}── INFORMACIÓN DE RED ──${NC}"
    
    echo "Red Docker 'forensic-network':"
    docker network inspect forensic-network --format="{{range .Containers}}  {{.Name}}: {{.IPv4Address}}{{println}}{{end}}" 2>/dev/null || echo "  No disponible"
}

show_performance_metrics() {
    echo ""
    echo -e "${BLUE}── MÉTRICAS DE RENDIMIENTO ──${NC}"
    
    # Uptime de contenedores
    echo "Uptime de contenedores:"
    docker ps --format "table {{.Names}}\t{{.Status}}" | tail -n +2 | while read name status; do
        echo "  $name: $(echo $status | sed 's/Up //')"
    done
}

show_footer() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo "Presiona Ctrl+C para salir | Auto-actualiza cada 30 segundos"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

main() {
    if [ "$1" = "once" ]; then
        # Ejecutar una sola vez
        clear_screen
        print_header
        show_services_status
        show_container_status
        show_resource_usage
        show_docker_stats
        show_network_info
        show_disk_usage
        show_footer
    else
        # Modo continuo con auto-actualización
        while true; do
            clear_screen
            print_header
            show_services_status
            show_container_status
            show_resource_usage
            show_docker_stats
            show_network_info
            show_disk_usage
            show_footer
            
            sleep 30
        done
    fi
}

main "$@"
