#!/bin/bash

################################################################################
# Script de instalación y configuración en Ubuntu
# Para desplegar Forensic Webapp + DVWA + Apache Reverse Proxy
# Uso: sudo bash setup-ubuntu.sh
################################################################################

set -e

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
PROJECT_DIR="/opt/forensic-webapp"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
APACHE_SITE_CONFIG="/etc/apache2/sites-available/forensic-webapp.conf"
SYSTEMD_SERVICE="/etc/systemd/system/forensic-webapp.service"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

################################################################################
# Funciones de utilidad
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script debe ejecutarse como root"
        exit 1
    fi
}

################################################################################
# 1. Verificar sistema operativo
################################################################################

check_os() {
    log_info "Verificando sistema operativo..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "No se puede determinar el sistema operativo"
        exit 1
    fi
    
    if [ "$OS" != "ubuntu" ]; then
        log_error "Este script está diseñado para Ubuntu. Sistema detectado: $OS"
        exit 1
    fi
    
    log_success "Detectado Ubuntu $VERSION"
}

################################################################################
# 2. Actualizar sistema
################################################################################

update_system() {
    log_info "Actualizando repositorios del sistema..."
    apt-get update
    log_info "Instalando actualizaciones disponibles..."
    apt-get upgrade -y
    log_success "Sistema actualizado"
}

################################################################################
# 3. Instalar Docker
################################################################################

install_docker() {
    log_info "Verificando Docker..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_success "Docker ya está instalado: $DOCKER_VERSION"
    else
        log_info "Instalando Docker..."
        
        # Instalar dependencias
        apt-get install -y \
            apt-transport-https \
            ca-certificates \
            curl \
            gnupg \
            lsb-release
        
        # Agregar clave GPG de Docker
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Agregar repositorio de Docker
        echo \
            "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
            $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Instalar Docker
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
        
        log_success "Docker instalado correctamente"
    fi
    
    # Instalar Docker Compose
    log_info "Verificando Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        log_success "Docker Compose ya está instalado: $COMPOSE_VERSION"
    else
        log_info "Instalando Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        log_success "Docker Compose instalado"
    fi
    
    # Iniciar y habilitar servicio Docker
    systemctl start docker || true
    systemctl enable docker || true
    
    # Crear grupo docker si no existe
    if ! getent group docker > /dev/null 2>&1; then
        groupadd docker
    fi
    
    log_success "Docker listo"
}

################################################################################
# 4. Verificar Docker daemon
################################################################################

verify_docker() {
    log_info "Verificando conexión a Docker daemon..."
    
    if ! docker ps > /dev/null 2>&1; then
        log_error "No se puede conectar a Docker daemon"
        log_info "Intentando iniciar Docker..."
        systemctl start docker
        sleep 3
        
        if ! docker ps > /dev/null 2>&1; then
            log_error "El daemon de Docker no está disponible"
            exit 1
        fi
    fi
    
    log_success "Conexión a Docker verificada"
}

################################################################################
# 5. Instalar Apache
################################################################################

install_apache() {
    log_info "Verificando Apache..."
    
    if command -v apache2 &> /dev/null; then
        APACHE_VERSION=$(apache2ctl -v | grep "Server version" | awk '{print $3}')
        log_success "Apache ya está instalado: $APACHE_VERSION"
    else
        log_info "Instalando Apache..."
        apt-get install -y apache2
        log_success "Apache instalado"
    fi
    
    # Habilitar módulos necesarios
    log_info "Habilitando módulos Apache..."
    a2enmod proxy
    a2enmod proxy_http
    a2enmod rewrite
    a2enmod headers
    a2enmod ssl
    
    # Iniciar y habilitar Apache
    systemctl start apache2 || true
    systemctl enable apache2 || true
    
    log_success "Apache configurado"
}

################################################################################
# 6. Preparar directorio del proyecto
################################################################################

setup_project_dir() {
    log_info "Preparando directorio del proyecto: $PROJECT_DIR"
    
    if [ ! -d "$PROJECT_DIR" ]; then
        mkdir -p "$PROJECT_DIR"
        log_success "Directorio creado: $PROJECT_DIR"
    else
        log_info "Directorio ya existe: $PROJECT_DIR"
    fi
    
    # Cambiar permisos
    chmod 755 "$PROJECT_DIR"
}

sync_project_files() {
    log_info "Copiando archivos del proyecto desde $SOURCE_DIR hacia $PROJECT_DIR..."

    if [ ! -f "$SOURCE_DIR/docker-compose.yml" ] || [ ! -f "$SOURCE_DIR/Dockerfile" ]; then
        log_error "No se encontraron Dockerfile/docker-compose.yml en $SOURCE_DIR"
        log_error "Ejecuta este script desde la carpeta raíz del proyecto"
        exit 1
    fi

    if command -v rsync > /dev/null 2>&1; then
        rsync -a --delete \
            --exclude '.git' \
            --exclude 'node_modules' \
            --exclude '.next' \
            --exclude 'test-results' \
            "$SOURCE_DIR/" "$PROJECT_DIR/"
    else
        cp -a "$SOURCE_DIR/." "$PROJECT_DIR/"
        rm -rf "$PROJECT_DIR/node_modules" "$PROJECT_DIR/.next" || true
    fi

    chmod -R 755 "$PROJECT_DIR"
    log_success "Archivos del proyecto sincronizados en $PROJECT_DIR"
}

ensure_swap_for_low_memory() {
    log_info "Verificando memoria disponible para build Docker..."

    local mem_mb swap_mb
    mem_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
    swap_mb=$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo)

    log_info "Memoria RAM detectada: ${mem_mb}MB | Swap detectada: ${swap_mb}MB"

    if [ "$mem_mb" -lt 2000 ] && [ "$swap_mb" -lt 1024 ]; then
        log_warning "RAM baja detectada. Creando swap de 2GB para evitar fallos de build (exit 137)..."

        if [ ! -f /swapfile ]; then
            if ! fallocate -l 2G /swapfile; then
                dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
            fi
            chmod 600 /swapfile
            mkswap /swapfile
        fi

        swapon /swapfile || true
        if ! grep -q '^/swapfile ' /etc/fstab; then
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
        fi

        sysctl -w vm.swappiness=10 > /dev/null
        log_success "Swap configurada correctamente"
    else
        log_success "Memoria suficiente, no es necesario crear swap adicional"
    fi
}

ensure_disk_space() {
    log_info "Verificando espacio en disco para build Docker..."

    local avail_gb
    avail_gb=$(df -BG / | awk 'NR==2 {gsub("G","",$4); print $4}')

    if [ -z "$avail_gb" ]; then
        log_warning "No se pudo determinar espacio libre. Continuando..."
        return
    fi

    log_info "Espacio libre detectado en / : ${avail_gb}GB"

    if [ "$avail_gb" -lt 6 ]; then
        log_warning "Espacio libre bajo (<6GB). Limpiando caché Docker y APT para evitar ENOSPC..."
        docker system prune -af || true
        apt-get clean || true
        rm -rf /var/lib/apt/lists/* || true
        apt-get update || true

        avail_gb=$(df -BG / | awk 'NR==2 {gsub("G","",$4); print $4}')
        log_info "Espacio libre después de limpieza: ${avail_gb}GB"
    fi

    if [ "$avail_gb" -lt 4 ]; then
        log_error "Espacio insuficiente para build Docker (${avail_gb}GB libres)."
        log_error "Aumenta el disco de la instancia o libera espacio antes de continuar."
        exit 1
    fi

    log_success "Espacio en disco suficiente para continuar"
}

################################################################################
# 7. Configurar Apache como reverse proxy
################################################################################

configure_apache_proxy() {
    log_info "Configurando Apache como reverse proxy..."
    
    cat > "$APACHE_SITE_CONFIG" << 'EOF'
# Apache Reverse Proxy para Forensic Webapp
<VirtualHost *:80>
    ServerName forensic-webapp.local
    ServerAlias localhost
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/forensic-error.log
    CustomLog ${APACHE_LOG_DIR}/forensic-access.log combined
    
    # Proxy al contenedor de la aplicación
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Headers
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Host "%{SERVER_NAME}s"
    
    # Timeout settings
    ProxyTimeout 300
    
    # Rewrite rules
    RewriteEngine On
    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]
    
    # Gzip compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE text/javascript
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/json
    </IfModule>
</VirtualHost>
EOF
    
    log_success "Configuración de Apache creada"
    
    # Habilitar sitio
    if ! a2ensite forensic-webapp > /dev/null 2>&1; then
        a2ensite forensic-webapp
    fi
    
    # Deshabilitar sitio por defecto
    a2dissite 000-default || true
    
    # Verificar configuración
    if ! apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
        log_error "Error en la configuración de Apache"
        apache2ctl configtest
        exit 1
    fi
    
    # Recargar Apache
    systemctl reload apache2
    
    log_success "Apache reconfigurado"
}

################################################################################
# 8. Crear servicio systemd
################################################################################

create_systemd_service() {
    log_info "Creando servicio systemd..."
    
    cat > "$SYSTEMD_SERVICE" << EOF
[Unit]
Description=Forensic Webapp Docker Compose Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=root
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose -f $DOCKER_COMPOSE_FILE up -d
ExecStop=/usr/local/bin/docker-compose -f $DOCKER_COMPOSE_FILE down
TimeoutStartSec=300
TimeoutStopSec=60
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF
    
    chmod 644 "$SYSTEMD_SERVICE"
    systemctl daemon-reload
    systemctl enable forensic-webapp
    
    log_success "Servicio systemd creado"
}

################################################################################
# 9. Iniciar servicios
################################################################################

start_services() {
    log_info "Iniciando servicios..."

    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "No existe $DOCKER_COMPOSE_FILE"
        log_error "Verifica la sincronización de archivos del proyecto"
        exit 1
    fi
    
    # Iniciar servicio
    systemctl start forensic-webapp
    
    # Esperar a que los contenedores estén listos
    log_info "Esperando a que los contenedores se inicien (esto puede tomar 1-2 minutos)..."
    sleep 30
    
    # Verificar DVWA
    if curl -sf http://localhost:8080 > /dev/null; then
        log_success "DVWA está en línea (http://localhost:8080)"
    else
        log_warning "DVWA no está completamente listo aún, verificando en 30 segundos..."
        sleep 30
    fi
    
    # Verificar aplicación
    if curl -sf http://localhost:3000 > /dev/null; then
        log_success "Forensic Webapp está en línea (http://localhost:3000)"
    else
        log_warning "Forensic Webapp no está completamente listo aún"
    fi
    
    # Verificar Apache
    if curl -sf http://localhost > /dev/null; then
        log_success "Apache está en línea (http://localhost)"
    else
        log_warning "Apache no está respondiendo aún"
    fi
}

################################################################################
# 10. Crear scripts de utilidad
################################################################################

create_utility_scripts() {
    log_info "Creando scripts de utilidad..."
    
    # Script de logs
    cat > "$PROJECT_DIR/logs.sh" << 'EOF'
#!/bin/bash
case "${1:-all}" in
    dvwa)
        docker logs -f dvwa
        ;;
    db)
        docker logs -f dvwa-db
        ;;
    app)
        docker logs -f forensic-webapp
        ;;
    all)
        docker-compose -f docker-compose.yml logs -f
        ;;
    *)
        echo "Uso: $0 {dvwa|db|app|all}"
        exit 1
        ;;
esac
EOF
    chmod +x "$PROJECT_DIR/logs.sh"
    
    # Script de estado
    cat > "$PROJECT_DIR/status.sh" << 'EOF'
#!/bin/bash
echo "===== Status de Contenedores ====="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "===== Verificaciones de Conectividad ====="
echo -n "DVWA (8080): "
curl -s -f http://localhost:8080 > /dev/null && echo "✓ Online" || echo "✗ Offline"
echo -n "Forensic App (3000): "
curl -s -f http://localhost:3000 > /dev/null && echo "✓ Online" || echo "✗ Offline"
echo -n "Apache (80): "
curl -s -f http://localhost > /dev/null && echo "✓ Online" || echo "✗ Offline"
echo ""
echo "===== Uso de Recursos ====="
docker stats --no-stream
EOF
    chmod +x "$PROJECT_DIR/status.sh"
    
    # Script de reinicio
    cat > "$PROJECT_DIR/restart.sh" << 'EOF'
#!/bin/bash
echo "Reiniciando servicios..."
docker-compose -f docker-compose.yml down
sleep 5
docker-compose -f docker-compose.yml up -d
echo "Servicios reiniciados. Esperando inicialización (30s)..."
sleep 30
$PROJECT_DIR/status.sh
EOF
    chmod +x "$PROJECT_DIR/restart.sh"
    
    log_success "Scripts de utilidad creados"
}

################################################################################
# 11. Mostrar información
################################################################################

show_info() {
    log_success "¡Instalación completada!"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}Acceso a servicios:${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo "  📊 Forensic Webapp: http://localhost       (vía Apache)"
    echo "  📊 Forensic App:    http://localhost:3000  (directo)"
    echo "  🎯 DVWA:            http://localhost:8080"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}Directorio del proyecto:${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo "  📁 $PROJECT_DIR"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}Comandos útiles:${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo "  Ver logs:         $PROJECT_DIR/logs.sh [dvwa|db|app|all]"
    echo "  Ver estado:       $PROJECT_DIR/status.sh"
    echo "  Reiniciar:        $PROJECT_DIR/restart.sh"
    echo "  Gestionar docker: docker-compose -f $DOCKER_COMPOSE_FILE [up|down|restart]"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}Credenciales DVWA:${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    echo "  Usuario:  admin"
    echo "  Contraseña: password"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}Verificación de servicios:${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
    "$PROJECT_DIR/status.sh"
    echo ""
}

################################################################################
# Ejecución principal
################################################################################

main() {
    log_info "Iniciando instalación de Forensic Webapp..."
    echo ""
    
    check_root
    check_os
    update_system
    install_docker
    verify_docker
    install_apache
    setup_project_dir
    sync_project_files
    ensure_swap_for_low_memory
    ensure_disk_space
    configure_apache_proxy
    create_systemd_service
    create_utility_scripts
    start_services
    show_info
    
    log_success "Instalación finalizada exitosamente"
}

# Ejecutar
main "$@"
