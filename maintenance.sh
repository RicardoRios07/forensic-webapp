#!/bin/bash

################################################################################
# Script de Mantenimiento y Actualización
# Uso: sudo bash maintenance.sh
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="${1:-.}"
BACKUP_DIR="${PROJECT_DIR}/backups"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

################################################################################
# Funciones de backup
################################################################################

backup_database() {
    log_info "Realizando backup de base de datos DVWA..."
    
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/dvwa_db_backup_${TIMESTAMP}.sql"
    
    docker exec dvwa-db mysqldump -u dvwa -pdvwa dvwa > "$BACKUP_FILE" 2>/dev/null
    
    if [ -f "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_success "Backup creado: $BACKUP_FILE ($SIZE)"
    else
        log_error "Fallo al crear el backup"
        return 1
    fi
}

backup_volumes() {
    log_info "Realizando backup de volúmenes Docker..."
    
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/dvwa_volumes_backup_${TIMESTAMP}.tar.gz"
    
    docker run --rm \
        -v dvwa_db_data:/data \
        -v dvwa_data:/app \
        -v "$BACKUP_DIR:/backup" \
        alpine tar czf /backup/$(basename "$BACKUP_FILE") -C / data app 2>/dev/null
    
    if [ -f "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_success "Volúmenes respaldados: $BACKUP_FILE ($SIZE)"
    else
        log_error "Fallo al respaldar volúmenes"
        return 1
    fi
}

backup_config() {
    log_info "Realizando backup de configuración..."
    
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/config_backup_${TIMESTAMP}.tar.gz"
    
    tar czf "$BACKUP_FILE" \
        -C "$PROJECT_DIR" \
        docker-compose.yml \
        Dockerfile \
        .env 2>/dev/null || true
    
    if [ -f "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_success "Configuración respaldada: $BACKUP_FILE ($SIZE)"
    else
        log_error "Fallo al respaldar configuración"
        return 1
    fi
}

################################################################################
# Limpiar recursos
################################################################################

cleanup_docker() {
    log_info "Limpiando recursos Docker no utilizados..."
    
    # Imágenes sin usar
    IMAGES=$(docker image prune -af 2>&1 | grep -c "deleted\|untagged" || echo "0")
    [ "$IMAGES" -gt 0 ] && log_success "Imágenes eliminadas: $IMAGES"
    
    # Redes sin usar
    NETWORKS=$(docker network prune -f 2>&1 | grep -c "deleted" || echo "0")
    [ "$NETWORKS" -gt 0 ] && log_success "Redes eliminadas: $NETWORKS"
    
    log_success "Limpieza completada"
}

cleanup_logs() {
    log_info "Limpiando logs antiguos..."
    
    # Limpiar logs de Apache
    find /var/log/apache2/ -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
    
    # Logs de Docker (opcional)
    # find /var/lib/docker/containers -name "*.log" -mtime +7 -delete
    
    log_success "Logs limpios"
}

cleanup_backups() {
    log_info "Eliminando backups antiguos (más de 30 días)..."
    
    if [ -d "$BACKUP_DIR" ]; then
        DELETED=$(find "$BACKUP_DIR" -type f -mtime +30 -delete -print | wc -l)
        [ "$DELETED" -gt 0 ] && log_success "Archivos de backup eliminados: $DELETED"
    else
        log_warning "Directorio de backups no existe"
    fi
}

################################################################################
# Actualización
################################################################################

update_images() {
    log_info "Actualizando imágenes Docker..."
    
    cd "$PROJECT_DIR"
    docker-compose pull
    
    log_info "Recreando contenedores con nuevas imágenes..."
    docker-compose down
    sleep 5
    docker-compose up -d
    
    sleep 30
    log_success "Actualización completada"
}

################################################################################
# Reportes
################################################################################

generate_report() {
    log_info "Generando reporte de sistema..."
    
    REPORT_FILE="${PROJECT_DIR}/maintenance_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "======================================"
        echo "REPORTE DE MANTENIMIENTO"
        echo "Fecha: $(date)"
        echo "======================================"
        echo ""
        
        echo "1. ESTADO DE CONTENEDORES"
        echo "--------------------------------------"
        docker ps -a --format "table {{.Names}}\t{{.Status}}" || echo "No hay contenedores"
        echo ""
        
        echo "2. USO DE RECURSOS"
        echo "--------------------------------------"
        docker stats --no-stream || echo "No hay contenedores en ejecución"
        echo ""
        
        echo "3. IMÁGENES DOCKER"
        echo "--------------------------------------"
        docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" || echo "No hay imágenes"
        echo ""
        
        echo "4. VOLÚMENES"
        echo "--------------------------------------"
        docker volume ls --format "table {{.Name}}\t{{.Driver}}" || echo "No hay volúmenes"
        echo ""
        
        echo "5. ESPACIO EN DISCO"
        echo "--------------------------------------"
        df -h /
        echo ""
        
        echo "6. ARCHIVOS DE BACKUP"
        echo "--------------------------------------"
        if [ -d "$BACKUP_DIR" ]; then
            ls -lh "$BACKUP_DIR" || echo "No hay backups"
        else
            echo "No existe directorio de backups"
        fi
        echo ""
        
    } > "$REPORT_FILE"
    
    log_success "Reporte creado: $REPORT_FILE"
}

################################################################################
# Menú principal
################################################################################

show_menu() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}HERRAMIENTA DE MANTENIMIENTO${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo "1) Backup de base de datos"
    echo "2) Backup de volúmenes"
    echo "3) Backup completo (BD + Volúmenes + Config)"
    echo "4) Limpiar recursos Docker no usados"
    echo "5) Limpiar logs antiguos"
    echo "6) Limpiar backups antiguos (>30 días)"
    echo "7) Actualizar contenedores"
    echo "8) Generar reporte del sistema"
    echo "9) Ejecutar mantenimiento completo"
    echo "0) Salir"
    echo ""
}

main() {
    if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
        log_error "docker-compose.yml no encontrado en $PROJECT_DIR"
        exit 1
    fi
    
    if [ "$#" -eq 0 ]; then
        # Modo interactivo
        while true; do
            show_menu
            read -p "Selecciona una opción: " choice
            
            case $choice in
                1) backup_database ;;
                2) backup_volumes ;;
                3) backup_database && backup_volumes && backup_config ;;
                4) cleanup_docker ;;
                5) cleanup_logs ;;
                6) cleanup_backups ;;
                7) update_images ;;
                8) generate_report ;;
                9) 
                    backup_database
                    backup_volumes
                    cleanup_docker
                    cleanup_logs
                    cleanup_backups
                    log_success "Mantenimiento completo finalizado"
                    ;;
                0) log_info "Saliendo..."; exit 0 ;;
                *) log_error "Opción inválida" ;;
            esac
        done
    else
        # Modo comando directo
        case "$1" in
            backup-db) backup_database ;;
            backup-volumes) backup_volumes ;;
            backup-all) backup_database && backup_volumes && backup_config ;;
            cleanup) cleanup_docker && cleanup_logs && cleanup_backups ;;
            update) update_images ;;
            report) generate_report ;;
            maintain) 
                backup_database
                backup_volumes
                cleanup_docker
                cleanup_logs
                cleanup_backups
                log_success "Mantenimiento completo finalizado"
                ;;
            *) 
                echo "Uso: $0 [backup-db|backup-volumes|backup-all|cleanup|update|report|maintain]"
                exit 1
                ;;
        esac
    fi
}

main "$@"
