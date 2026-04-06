#!/bin/bash

################################################################################
# Script de Verificación de Configuración
# Verifica que todos los archivos están presentes
# Uso: bash verify-setup.sh
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

FAILED=0
SUCCESS=0

log_success() { echo -e "${GREEN}✓${NC} $1"; ((SUCCESS++)); }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; ((FAILED++)); }
log_info() { echo -e "${BLUE}[•]${NC} $1"; }

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICACIÓN DE CONFIGURACIÓN DE DESPLIEGUE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Archivos requeridos
REQUIRED_FILES=(
    "Dockerfile"
    "docker-compose.yml"
    "setup-ubuntu.sh"
    "maintenance.sh"
    "monitor.sh"
    "health-check.sh"
    "uninstall.sh"
    "QUICKSTART.md"
    "DEPLOYMENT.md"
    "INSTALLATION_CHECKLIST.md"
    "PRODUCTION.md"
    "DEPLOYMENT_SUMMARY.md"
    "apache-config-notes.conf"
    "docker/.env.example"
    ".dockerignore"
)

echo -e "${BLUE}VERIFICANDO ARCHIVOS${NC}"
echo ""

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Obtener tamaño
        SIZE=$(du -h "$file" | cut -f1)
        log_success "$file ($SIZE)"
    else
        log_error "FALTA: $file"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICANDO PERMISOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar permisos ejecutables
EXECUTABLES=("setup-ubuntu.sh" "maintenance.sh" "monitor.sh" "health-check.sh" "uninstall.sh")

for file in "${EXECUTABLES[@]}"; do
    if [ -f "$file" ]; then
        if [ -x "$file" ]; then
            log_success "$file es ejecutable"
        else
            log_warn "$file NO es ejecutable (ejecutar: chmod +x $file)"
        fi
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICANDO CONTENIDO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar contenido de archivos críticos
log_info "Validando docker-compose.yml..."
if grep -q "forensic-webapp\|dvwa\|mysql" docker-compose.yml 2>/dev/null; then
    log_success "docker-compose.yml contiene configuración requerida"
else
    log_error "docker-compose.yml parece incompleto"
fi

log_info "Validando Dockerfile..."
if grep -q "node:20\|next build\|next start" Dockerfile 2>/dev/null; then
    log_success "Dockerfile configurado para Next.js"
else
    log_error "Dockerfile parece incompleto"
fi

log_info "Validando setup-ubuntu.sh..."
if grep -q "docker\|apache\|mysql" setup-ubuntu.sh 2>/dev/null; then
    log_success "setup-ubuntu.sh contiene instalación Docker/Apache"
else
    log_error "setup-ubuntu.sh parece incompleto"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICANDO DOCUMENTACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

DOCS=(
    "QUICKSTART.md:Guía rápida de inicio"
    "DEPLOYMENT.md:Despliegue completo"
    "INSTALLATION_CHECKLIST.md:Checklist paso a paso"
    "PRODUCTION.md:Configuración de producción"
    "DEPLOYMENT_SUMMARY.md:Resumen de configuración"
)

for doc_spec in "${DOCS[@]}"; do
    doc="${doc_spec%:*}"
    desc="${doc_spec#*:}"
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        log_success "$doc ($desc) - $LINES líneas"
    else
        log_error "FALTA: $doc"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}VERIFICANDO DIRECTORIOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

DIRS=("docker" "logs" "backups")

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Directorio: $dir"
    else
        log_warn "Directorio no existe (se creará): $dir"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}RESUMEN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ CONFIGURACIÓN LISTA${NC}"
    echo ""
    echo "Pasos siguientes:"
    echo "1. Actualizar permisos si es necesario:"
    echo "   chmod +x setup-ubuntu.sh maintenance.sh monitor.sh health-check.sh uninstall.sh"
    echo ""
    echo "2. Transferir al servidor:"
    echo "   scp -r . usuario@servidor:/tmp/forensic-setup/"
    echo ""
    echo "3. En el servidor ejecutar:"
    echo "   cd /tmp/forensic-setup"
    echo "   sudo bash setup-ubuntu.sh"
    echo ""
    echo "4. Consultar documentación:"
    echo "   cat QUICKSTART.md          # Inicio rápido"
    echo "   cat DEPLOYMENT_SUMMARY.md  # Descripción general"
    echo ""
    exit 0
else
    echo -e "${RED}✗ FALTAN $FAILED ARCHIVO(S)${NC}"
    exit 1
fi
