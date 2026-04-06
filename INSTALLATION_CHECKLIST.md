# 📋 Checklist de Instalación y Requisitos

## ✅ Checklist Pre-Instalación

Antes de comenzar la instalación, verifica que tienes:

### Hardware Mínimo
- [ ] CPU: 2 núcleos (4 recomendado)
- [ ] RAM: 4GB (8GB recomendado)
- [ ] Disco: 20GB libre
- [ ] Red: Conexión estable a internet

### Software Requerido
- [ ] Ubuntu 20.04 LTS, 22.04 LTS o 24.04 LTS
- [ ] Acceso root o sudo en el servidor
- [ ] SSH activado para administración remota

### Acceso a Red
- [ ] Puerto 80 disponible (HTTP)
- [ ] Puerto 443 disponible (HTTPS - opcional)
- [ ] Puerto 22 disponible (SSH)
- [ ] Firewall permite tráfico entrante

### Anterior a la Instalación
- [ ] Respaldar datos existentes
- [ ] Anotar cambios personalizados
- [ ] Documentar configuración actual

---

## 🚀 Guía Paso a Paso

### Paso 1: Preparación (5 minutos)

```bash
# 1.1 Conectarse al servidor
ssh usuario@tu-servidor-ip

# 1.2 Cambiar a root si es necesario
sudo su -

# 1.3 Crear directorio temporal
mkdir -p /tmp/forensic-setup
cd /tmp/forensic-setup
```

### Paso 2: Descargar Archivos (5 minutos)

```bash
# 2.1 Opción A: Con Git
git clone <tu-repositorio-url> .
cd forensic-webapp

# 2.1 Opción B: Desde otra máquina con SCP
# (Ejecutar desde tu máquina local)
# scp -r ./forensic-webapp usuario@servidor:/tmp/forensic-setup/
```

### Paso 3: Ejecutar Instalador (30-60 minutos)

```bash
# 3.1 Hacer script ejecutable
chmod +x setup-ubuntu.sh

# 3.2 Ejecutar instalador
sudo bash setup-ubuntu.sh

# Esto hará:
# - Actualizar sistema
# - Instalar Docker
# - Instalar Docker Compose
# - Instalar Apache2
# - Descargar imágenes Docker
# - Iniciar contenedores
# - Configurar servicios
```

### Paso 4: Verificación Post-Instalación (5 minutos)

```bash
# 4.1 Verificar docker
docker ps

# 4.2 Ver logs
docker-compose logs -f

# 4.3 Ejecutar health check
bash health-check.sh

# 4.4 Acceder a los servicios
# En navegador:
# - http://tu-servidor
# - http://tu-servidor:3000
# - http://tu-servidor:8080
```

---

## 📊 Tiempo Estimado

| Fase | Duración | Notas |
|------|----------|-------|
| Preparación | 5 min | Descargar archivos |
| Sistema | 10 min | Actualizaciones |
| Docker | 10 min | Instalación |
| Apache | 5 min | Configuración |
| Contenedores | 30 min | Descargas iniciales |
| Test | 5 min | Verificación |
| **TOTAL** | **~65 min** | Primera instalación |

---

## 🔍 Verificación Post-Instalación

```bash
# Checklist de verificación
docker ps                          # ✓ Debe mostrar 3 contenedores
curl -I http://localhost          # ✓ Apache (200 OK)
curl -I http://localhost:3000     # ✓ Next.js (200 OK)
curl -I http://localhost:8080     # ✓ DVWA (200 OK)
systemctl status forensic-webapp   # ✓ Servicio activo
bash health-check.sh              # ✓ Todos los chequeos OK
```

---

## 📁 Estructura de Directorios Creada

```
/opt/forensic-webapp/
├── docker-compose.yml              # Orquestación
├── Dockerfile                       # Construcción de imagen
├── setup-ubuntu.sh                  # Script de instalación
├── maintenance.sh                   # Mantenimiento/backups
├── monitor.sh                       # Monitoreo
├── health-check.sh                  # Verificación
├── uninstall.sh                     # Desinstalación
├── QUICKSTART.md                    # Guía rápida
├── DEPLOYMENT.md                    # Documentación completa
├── docker/
│   └── .env.example                # Variables de entorno
├── logs/
│   └── (logs de aplicación)
├── backups/
│   └── (backups de BD y volúmenes)
└── (otros archivos del proyecto)
```

---

## 🔧 Variables de Entorno

```bash
# Docker
NODE_ENV=production
DOCKER_HOST=unix:///var/run/docker.sock
NEXT_PUBLIC_API_URL=http://localhost:3000

# MySQL/DVWA
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=dvwa
MYSQL_USER=dvwa
MYSQL_PASSWORD=dvwa

# Apache
SERVER_ADMIN_EMAIL=admin@localhost
```

---

## ⚠️ Troubleshooting Común

### Error: "sudo: command not found"
```bash
# Conexión como root, usar:
su -
# o cambiar usuario
su root
```

### Error: "Docker daemon is not running"
```bash
systemctl start docker
systemctl enable docker
```

### Error: "Port 80 already in use"
```bash
# Ver qué lo usa
lsof -i :80

# Si es otro servicio, detenerlo o cambiar puerto
```

### Error: "curl: command not found"
```bash
apt-get install -y curl
```

### Contenedores no inician
```bash
# Ver errores
docker-compose logs

# Reintentar
docker-compose down
docker-compose up -d
```

---

## 📞 Comandos de Soporte Importantes

```bash
# SERVICIOS
systemctl status forensic-webapp       # Ver estado del servicio
systemctl restart forensic-webapp      # Reiniciar
systemctl stop forensic-webapp         # Detener
systemctl start forensic-webapp        # Iniciar

# DOCKER
docker ps                              # Contenedores activos
docker ps -a                           # Todos los contenedores
docker logs -f nombre-contenedor       # Ver logs
docker exec -it nombre bash            # Acceso a línea de comandos
docker-compose up -d                   # Iniciar
docker-compose down                    # Detener

# APACHE
apache2ctl configtest                  # Verificar configuración
apache2ctl restart                     # Reiniciar
apache2ctl status                      # Ver estado
a2enmod nombre_modulo                  # Habilitar módulo
a2dismod nombre_modulo                 # Deshabilitar módulo

# ARCHIVOS DE AYUDA
bash setup-ubuntu.sh                   # Reinstalar/reparar
bash maintenance.sh                    # Mantenimiento
bash monitor.sh                        # Monitoreo
bash health-check.sh                   # Verificación
bash uninstall.sh                      # Desinstalar
```

---

## 🔐 Cambios de Seguridad Post-Instalación (Importante)

⚠️ **REALIZAR ESTOS CAMBIOS INMEDIATAMENTE DESPUÉS DE LA INSTALACIÓN**

```bash
# 1. Cambiar credenciales de DVWA
# Acceder a: http://tu-servidor:8080
# Ir a: DVWA Setup
# Hacer click en: "Create / Reset Database"
# Cambiar usuario/contraseña en Setup

# 2. Configurar firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 4. Cambiar contraseña de root
sudo passwd

# 5. Deshabilitar SSH con contraseña (usar claves)
sudo nano /etc/ssh/sshd_config
# Cambiar: PasswordAuthentication no
sudo systemctl restart ssh
```

---

## 📈 Próximos Pasos Recomendados

1. **Configurar HTTPS/SSL** (Ver DEPLOYMENT.md)
2. **Automatizar backups** con cron
3. **Instalar Portainer** para UI de Docker
4. **Configurar monitoreo** (Nagios, Prometheus, etc.)
5. **Auditoría de seguridad** del servidor
6. **Plan de disaster recovery**

---

## 📞 Soporte

Para problemas durante la instalación:

1. Revisa los logs:
   ```bash
   docker-compose logs
   cat /var/log/syslog
   tail -n 100 /var/log/apache2/error.log
   ```

2. Ejecuta health check:
   ```bash
   bash health-check.sh
   ```

3. Consulta la documentación:
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Guía completa
   - [QUICKSTART.md](QUICKSTART.md) - Referencia rápida

---

**Última actualización**: 2026-04-06
**Versión**: 1.0
