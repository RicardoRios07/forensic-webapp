# 📦 Guía Rápida de Despliegue - Forensic Webapp

## 🚀 Inicio Rápido (5 minutos)

### Opción 1: Instalación Automática (Recomendado)

```bash
# En tu servidor Ubuntu
cd /tmp
git clone <repositorio> forensic-webapp
cd forensic-webapp
sudo bash setup-ubuntu.sh
```

El script instalará automáticamente:
- ✅ Docker y Docker Compose
- ✅ Apache HTTP Server
- ✅ Contenedor DVWA (Damn Vulnerable Web App)
- ✅ Contenedor de Forensic Webapp
- ✅ Configuración como servicio systemd

### Opción 2: Instalación Manual Rápida

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Preparar directorio
sudo mkdir -p /opt/forensic-webapp
sudo cp -r . /opt/forensic-webapp
cd /opt/forensic-webapp

# 5. Iniciar contenedores
sudo docker-compose up -d
```

## 📍 Acceso a Servicios

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Forensic Webapp** | `http://tu-server` | 80 |
| Forensic Webapp (directo) | `http://tu-server:3000` | 3000 |
| DVWA | `http://tu-server:8080` | 8080 |

### Credenciales DVWA
- **Usuario**: `admin`
- **Contraseña**: `password`

## 📊 Comandos Útiles

```bash
# Ver estado de contenedores
docker ps

# Ver logs en tiempo real
docker-compose logs -f

# Logs específicos
docker logs -f forensic-webapp
docker logs -f dvwa

# Reiniciar servicios
systemctl restart forensic-webapp

# Monitoreo en vivo
bash monitor.sh

# Verificación de salud
bash health-check.sh

# Mantenimiento interactivo
sudo bash maintenance.sh
```

## 🔧 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `Dockerfile` | Construcción de imagen Docker para la app |
| `docker-compose.yml` | Orquestación de contenedores (DVWA + BD + App) |
| `setup-ubuntu.sh` | Script de instalación automática |
| `maintenance.sh` | Backups, actualizaciones, limpieza |
| `monitor.sh` | Monitoreo en tiempo real |
| `health-check.sh` | Verificación del sistema |
| `uninstall.sh` | Desinstalación completa |

## ⚙️ Estructura Docker

```
┌─────────────────────────────────┐
│      Apache (Puerto 80)         │
│   Reverse Proxy → Localhost:3000│
└────────────────┬────────────────┘
                 │
    ┌────────────┴─────────────┐
    │                          │
┌───▼────────────┐    ┌───────▼──────────┐
│ Forensic App   │    │      DVWA        │
│ Next.js        │    │  Docker Logs     │
│ Puerto: 3000   │    │  Puerto: 8080    │
└───┬────────────┘    └───────┬──────────┘
    │                         │
    │      ┌──────────────────┴┐
    │      │                   │
    └──────┤                   │
           │                   │
       ┌───▼──────────────┬────▼────────┐
       │  Docker Daemon   │  MySQL DB   │
       │  Socket Access   │  Puerto 3306│
       └──────────────────┴─────────────┘
```

## 🆘 Troubleshooting Rápido

### Los contenedores no inician
```bash
# Ver errores detallados
docker-compose logs

# Reiniciar
sudo systemctl restart forensic-webapp
```

### No puedo acceder vía HTTP
```bash
# Verificar que Apache está corriendo
sudo systemctl status apache2

# Ver configuración
sudo apache2ctl configtest

# Reiniciar Apache
sudo systemctl restart apache2
```

### DVWA no responde
```bash
# Ver logs de DVWA
docker logs dvwa

# Ver logs de BD
docker logs dvwa-db

# Reiniciar
docker-compose restart dvwa dvwa-db
```

### Puerto ya está en uso
```bash
# Encontrar qué usa el puerto
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :8080

# Cambiar puertos en docker-compose.yml y reiniciar
sudo docker-compose down
sudo docker-compose up -d
```

## 📈 Mantenimiento Básico

```bash
# Backup diario (automatizar con cron)
sudo bash maintenance.sh backup-db
sudo bash maintenance.sh backup-volumes

# Limpiar recursos no usados
sudo bash maintenance.sh cleanup

# Actualizar imágenes
sudo bash maintenance.sh update

# Generar reporte
sudo bash maintenance.sh report
```

## 🔄 Automatizar Backups con Cron

```bash
# Editar crontab
sudo crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * cd /opt/forensic-webapp && bash maintenance.sh backup-all
```

## 📝 Ver Disponibilidad

```bash
# Script interactivo
bash monitor.sh

# Una sola vez
bash monitor.sh once

# O verifica comandos individuales
curl -I http://localhost          # Apache
curl -I http://localhost:3000     # Forensic App
curl -I http://localhost:8080     # DVWA
```

## 🛑 Detener Todo

```bash
# Detener servicios pero mantener data
docker-compose down

# Detener y eliminar datos (⚠️ cuidado)
docker-compose down -v

# Detener servicio systemd
sudo systemctl stop forensic-webapp
```

## 📚 Documentación Completa

Para instrucciones detalladas, ver: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔐 Seguridad Básica

```bash
# Cambiar credenciales DVWA después de instalar
# Acceder a http://tu-server:8080 y cambiar contraseña en setup

# Configurar firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (si lo agregaste)
sudo ufw enable

# Ver estado
sudo ufw status
```

## 💬 Soporte

Si encuentras problemas:

1. Verifica logs: `docker-compose logs`
2. Ejecuta health check: `bash health-check.sh`
3. Revisa [DEPLOYMENT.md](DEPLOYMENT.md) para troubleshooting detallado

---

**Creado**: 2026-04-06
**Versión**: 1.0
**Soporte**: Consulta la documentación completa de despliegue
