# 📦 Resumen de Configuración de Despliegue

**Fecha de creación**: 6 de abril de 2026  
**Proyecto**: Forensic Webapp + DVWA en Docker  
**Ambiente**: Ubuntu (20.04/22.04/24.04 LTS)  

---

## 📋 Archivos Creados

### 1️⃣ **Configuración Docker** (Core)

| Archivo | Propósito | Descripción |
|---------|-----------|-------------|
| `Dockerfile` | Construcción de imagen | Compilación multi-etapa de Next.js |
| `docker-compose.yml` | Orquestación | Define DVWA, MySQL, y Forensic App |
| `.dockerignore` | Optimización | Exclusiones para build de Docker |
| `docker/.env.example` | Configuración | Variables de entorno ejemplo |

### 2️⃣ **Scripts de Instalación y Mantenimiento**

| Archivo | Propósito | Ejecución |
|---------|-----------|-----------|
| `setup-ubuntu.sh` | **Instalación completa** | `sudo bash setup-ubuntu.sh` |
| `maintenance.sh` | Backup, limpieza, actualización | `bash maintenance.sh` (interactivo) |
| `monitor.sh` | Monitoreo en tiempo real | `bash monitor.sh` |
| `health-check.sh` | Verificación de salud | `bash health-check.sh` |
| `uninstall.sh` | Desinstalación completa | `sudo bash uninstall.sh` |

### 3️⃣ **Documentación Completa**

| Archivo | Contenido | Audiencia |
|---------|-----------|-----------|
| `QUICKSTART.md` | **Inicio rápido (5-10 min)** | Todos |
| `DEPLOYMENT.md` | Guía detallada de despliegue | Ops/DevOps |
| `INSTALLATION_CHECKLIST.md` | Checklist paso a paso | Instaladores |
| `PRODUCTION.md` | Configuración de producción | DevOps/Admin |
| `apache-config-notes.conf` | Configuración Apache | Admin |

### 4️⃣ **Configuración Apache**

| Archivo | Propósito |
|---------|-----------|
| `apache-config-notes.conf` | Configuración de reverse proxy |

---

## 🚀 Cómo Usar Esta Configuración

### **Opción A: Instalación Automática (Recomendada)**

```bash
# 1. En el servidor Ubuntu
cd /ruta/del/proyecto
chmod +x setup-ubuntu.sh

# 2. Ejecutar instalación
sudo bash setup-ubuntu.sh

# 3. El script hace todo automáticamente:
✓ Instala Docker
✓ Instala Docker Compose  
✓ Instala Apache
✓ Descarga imágenes
✓ Inicia contenedores
✓ Configura reverse proxy
✓ Crea servicios systemd
```

### **Opción B: Instalación Manual**

Ver paso a paso en: [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md#guía-paso-a-paso)

---

## ✅ Qué se Instala

### Software
- ✅ Docker (último)
- ✅ Docker Compose (último)
- ✅ Apache 2 con módulos proxy
- ✅ Servicios systemd para autostart

### Contenedores Docker
- ✅ **DVWA** (Vulnerable Web App) - Puerto 8080
- ✅ **MySQL 5.7** - BD para DVWA
- ✅ **Forensic Webapp** (Next.js) - Puerto 3000/80

### Características
- ✅ Reverse proxy Apache en puerto 80
- ✅ Soporte WebSocket
- ✅ Compresión Gzip
- ✅ Health checks automáticos
- ✅ Restart automático de contenedores
- ✅ Volúmenes persistentes para datos

---

## 🎯 Acceso post-Instalación

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Forensic Webapp** | `http://tu-servidor` | 80 |
| Directo (sin proxy) | `http://tu-servidor:3000` | 3000 |
| **DVWA** | `http://tu-servidor:8080` | 8080 |
| MySQL | `tu-servidor:3306` | 3306 |

### Credenciales DVWA
```
Usuario: admin
Contraseña: password
```

---

## 🛠️ Comandos Principales

```bash
# VER ESTADO
docker ps                    # Estado de contenedores
systemctl status forensic-webapp
bash health-check.sh        # Verificación completa

# LOGS
docker-compose logs -f      # Todos
docker logs -f forensic-webapp
docker logs -f dvwa

# MANTENIMIENTO
bash maintenance.sh         # Menú interactivo
bash monitor.sh            # Monitoreo en vivo

# RESTART
systemctl restart forensic-webapp
docker-compose restart
```

---

## 📁 Estructura Final en Servidor

```
/opt/forensic-webapp/
├── docker-compose.yml
├── Dockerfile
├── setup-ubuntu.sh
├── maintenance.sh
├── monitor.sh
├── health-check.sh
├── uninstall.sh
├── QUICKSTART.md
├── DEPLOYMENT.md
├── INSTALLATION_CHECKLIST.md
├── PRODUCTION.md
├── docker/
│   └── .env.example
├── logs/           (contenedor logs)
├── backups/        (backups automáticos)
└── (proyecto Next.js)
```

---

## ⏱️ Tiempo de Instalación

```
Preparación:        5 min   (descargas, SSH)
Instalación Docker: 10 min  (descarga e instalación)
Instalación Apache: 5 min   (instalación y config)
Contenedores:       30-40 min (descargas iniciales)
Verificación:       5 min   (tests)
─────────────────────────────
TOTAL:              60-70 min (primera vez)
```

---

## 📊 Recursos Requeridos

### Mínimos
- CPU: 2 núcleos
- RAM: 4 GB
- Disco: 20 GB libre
- Ancho banda: Variable (primeras descargas)

### Recomendado
- CPU: 4+ núcleos
- RAM: 8+ GB
- Disco: 50+ GB
- Red: Estable 1 Mbps+

---

## 🔐 Seguridad

### Base
- Firewall UFW configurado
- Limitación de puertos abiertos
- DVWA en puerto separado (8080)

### Recomendaciones Post-Instalación
1. **Cambiar credenciales DVWA** vía interfaz
2. **Configurar HTTPS** (ver `PRODUCTION.md`)
3. **Cambiar contraseña MySQL**
4. **Activar SSH con claves**
5. **Ejecutar `health-check.sh`**

---

## 🐛 Troubleshooting Rápido

```bash
# Si algo falla...

# 1. Verificar Docker
docker ps
docker-compose logs

# 2. Ejecutar health check
bash health-check.sh

# 3. Reinicar todo
docker-compose down
docker-compose up -d

# 4. Consultar documentación
# - QUICKSTART.md para referencia rápida
# - DEPLOYMENT.md para soluciones detalladas
# - PRODUCTION.md para configuración avanzada
```

---

## 📚 Documentación Rápida

### Para Empezar Rápido
→ Lee: [QUICKSTART.md](QUICKSTART.md) (10 minutos)

### Para Instalar
→ Sigue: [INSTALLATION_CHECKLIST.md](INSTALLATION_CHECKLIST.md)

### Para Referencia Completa
→ Consulta: [DEPLOYMENT.md](DEPLOYMENT.md)

### Para Producción
→ Revisa: [PRODUCTION.md](PRODUCTION.md)

---

## ✨ Características Principales

✅ **Instalación Automatizada** - Un solo comando para todo  
✅ **Docker Compose** - Orquestación sencilla  
✅ **Apache Reverse Proxy** - Acceso en puerto 80  
✅ **Health Checks** - Monitoreo automático  
✅ **Logging Completo** - Acceso fácil a logs  
✅ **Backups Automatizados** - Protección de datos  
✅ **Scripts de Utilidad** - Mantenimiento simplificado  
✅ **WebSocket Support** - Para tiempo real  

---

## 🎓 Qué Puede Hacer

### Forensic Webapp
- Aanalizar logs de DVWA en tiempo real
- Detectar SQL Injection
- Detectar Command Injection
- Detectar Brute Force
- Detectar File Inclusion (LFI/RFI)
- Timeline de eventos
- Exportar evidencias
- Dark Mode/Light Mode

### DVWA (Vulnerable Training)
- Learning para seguridad web
- Testing local seguro
- Análisis forense de attacks

---

## 📞 Soporte

**Problema durante instalación:**
1. Ejecuta: `bash health-check.sh`
2. Revisa: `docker-compose logs`
3. Consulta: [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

**Problema post-instalación:**
1. `docker ps` - ver estado
2. `bash monitor.sh` - monitoreo
3. `bash maintenance.sh` - mantenimiento

---

## 📝 Notas Importantes

⚠️ **Este despliegue es para uso en red local o controlada** - No exponer sin HTTPS a internet  
⚠️ **DVWA es vulnerable por diseño** - Solo para aprendizaje/testing  
⚠️ **Cambiar credenciales post-instalación** - Especialmente MySQL y DVWA  
⚠️ **Realizar backups regularmente** - Ver `maintenance.sh`

---

## 🎯 Próximos Pasos

1. ✅ Transferir archivos al servidor
2. ✅ Ejecutar `setup-ubuntu.sh`
3. ✅ Esperar a que se complete (~60 min)
4. ✅ Acceder a `http://tu-servidor`
5. ✅ Cambiar credenciales DVWA
6. ✅ Ejecutar `health-check.sh`
7. ✅ Leer [PRODUCTION.md](PRODUCTION.md) para setup avanzado

---

**¡Listo para desplegar!** 🚀

Cualquier pregunta, consulta los documentos incluidos o revisa los logs con `docker-compose logs`.

---

*Creado: 2026-04-06  
Versión: 1.0  
Soporte: Documentación incluida*
