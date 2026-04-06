#!/bin/bash

################################################################################
# Script de desinstalación y limpieza
# Uso: sudo bash uninstall.sh
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }

################################################################################

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script debe ejecutarse como root"
        exit 1
    fi
}

confirm() {
    local prompt=$1
    read -p "$(echo -e ${YELLOW}$prompt${NC}) (s/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Ss]$ ]]
}

main() {
    log_info "Script de desinstalación - Forensic Webapp"
    echo ""
    
    if ! confirm "¿Deseas continuar con la desinstalación?"; then
        log_info "Desinstalación cancelada"
        exit 0
    fi
    
    PROJECT_DIR="/opt/forensic-webapp"
    
    # Detener servicio
    log_info "Deteniendo servicios..."
    systemctl stop forensic-webapp || true
    systemctl disable forensic-webapp || true
    
    # Detener contenedores
    log_info "Deteniendo contenedores Docker..."
    cd "$PROJECT_DIR" 2>/dev/null && docker-compose down -v || true
    
    # Eliminar servicio systemd
    if [ -f "/etc/systemd/system/forensic-webapp.service" ]; then
        log_info "Removiendo servicio systemd..."
        rm -f /etc/systemd/system/forensic-webapp.service
        systemctl daemon-reload
    fi
    
    # Eliminar configuración de Apache
    if [ -f "/etc/apache2/sites-available/forensic-webapp.conf" ]; then
        log_info "Removiendo configuración de Apache..."
        a2dissite forensic-webapp || true
        rm -f /etc/apache2/sites-available/forensic-webapp.conf
        systemctl reload apache2 || true
    fi
    
    # Eliminar directorio del proyecto
    if confirm "¿Deseas eliminar el directorio del proyecto ($PROJECT_DIR)?"; then
        log_info "Eliminando directorio del proyecto..."
        rm -rf "$PROJECT_DIR"
        log_success "Directorio eliminado"
    else
        log_info "Directorio del proyecto preservado en: $PROJECT_DIR"
    fi
    
    # Limpiar Docker (opcional)
    if confirm "¿Deseas limpiar todas las imágenes y volúmenes Docker relacionados?"; then
        log_info "Limpiando Docker..."
        docker volume rm dvwa_db_data dvwa_data 2>/dev/null || true
        docker image rm vulnerables/web-dvwa 2>/dev/null || true
        docker image rm mysql:5.7 2>/dev/null || true
        log_success "Docker limpiado"
    fi
    
    log_success "Desinstalación completada"
    echo ""
    echo "Notas:"
    echo "  - Docker y Apache2 no han sido desinstalados"
    echo "  - Puedes desinstalarlos manualmente si lo deseas"
    echo "  - Los datos respaldados (si existen) se conservan"
}

check_root
main "$@"
