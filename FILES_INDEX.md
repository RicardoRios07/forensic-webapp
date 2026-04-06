# 📑 Índice de Archivos de Despliegue

**Proyecto**: Forensic Webapp + DVWA  
**Creado**: 6 de abril de 2026  
**Total**: 17 archivos de configuración y documentación  

---

## 🗂️ Estructura del Proyecto

```
forensic-webapp/
│
├── 📋 DOCUMENTACIÓN (Leer estas primero)
│   ├── README_DEPLOYMENT.md          ← COMIENZA AQUÍ (resumen ejecutivo)
│   ├── DEPLOYMENT_SUMMARY.md         ← Descripción general y rápida
│   ├── QUICKSTART.md                 ← Inicio rápido (5-10 min)
│   ├── INSTALLATION_CHECKLIST.md     ← Paso a paso detallado
│   ├── DEPLOYMENT.md                 ← Referencia completa (~80 KB)
│   └── PRODUCTION.md                 ← Configuración avanzada
│
├── 🐳 DOCKER (Configuración de contenedores)
│   ├── Dockerfile                    ← Build de imagen Next.js
│   ├── docker-compose.yml            ← Orquestación (DVWA + App + MySQL)
│   ├── .dockerignore                 ← Exclusiones para build
│   └── docker/
│       └── .env.example              ← Template de variables
│
├── 🔧 SCRIPTS (Instalación y mantenimiento)
│   ├── setup-ubuntu.sh               ← INSTALAR AQUÍ (principal)
│   ├── maintenance.sh                ← Backups, limpieza, updates
│   ├── monitor.sh                    ← Monitoreo en tiempo real
│   ├── health-check.sh               ← Verificación de state
│   ├── uninstall.sh                  ← Desinstalación limpia
│   └── verify-setup.sh               ← Validar archivos
│
├── ⚙️ CONFIGURACIÓN
│   └── apache-config-notes.conf      ← Config Apache reverse proxy
│
└── 📁 DIRECTORIOS A CREAR (automático)
    ├── docker/                       ← Archivos docker custom
    ├── logs/                         ← Logs de aplicación
    ├── backups/                      ← Backups automáticos
    └── (proyecto Next.js)            ← Código fuente

```

---

## 📄 Archivos - Descripción Detallada

### 1. 📘 DOCUMENTACIÓN

#### `README_DEPLOYMENT.md` ⭐ PUNTO DE INICIO
- **Tamaño**: ~4 KB
- **Contenido**: Resumen ejecutivo, checklist, timeline
- **Audiencia**: Todos
- **Tiempo lectura**: 5 minutos
- **Propósito**: Overview rápido de qué se ha creado

#### `DEPLOYMENT_SUMMARY.md`
- **Tamaño**: ~3 KB
- **Contenido**: Resumen de archivos y cómo usarlos
- **Audiencia**: Instaladores
- **Tiempo lectura**: 5 minutos
- **Propósito**: Referencia rápida de archivos

#### `QUICKSTART.md`
- **Tamaño**: ~5 KB
- **Contenido**: Inicio rápido, comandos frecuentes
- **Audiencia**: Usuarios finales
- **Tiempo lectura**: 10 minutos
- **Propósito**: Referencia rápida post-instalación

#### `INSTALLATION_CHECKLIST.md`
- **Tamaño**: ~8 KB
- **Contenido**: Checklist, proceso paso a paso, troubleshooting
- **Audiencia**: Instaladores
- **Tiempo lectura**: 15 minutos
- **Propósito**: Guía detallada de instalación manual

#### `DEPLOYMENT.md` (Completa)
- **Tamaño**: ~15 KB
- **Contenido**: Guía detallada de despliegue, todos los detalles
- **Audiencia**: DevOps/Ops/Instaladores avanzados
- **Tiempo lectura**: 30 minutos
- **Propósito**: Referencia completa y definitiva

#### `PRODUCTION.md` (No incluido por defecto)
- **Tamaño**: ~8 KB
- **Contenido**: SSL/HTTPS, seguridad, monitoreo, escalabilidad
- **Audiencia**: DevOps/Admin en producción
- **Tiempo lectura**: 20 minutos
- **Propósito**: Setup avanzado para producción

---

### 2. 🐳 DOCKER

#### `Dockerfile`
- **Líneas**: 53
- **Base**: Node.js 20 Alpine (multi-etapa)
- **Propósito**: Compilar y packagizar Next.js app
- **Contenido**:
  - Etapa 1: Build con pnpm
  - Etapa 2: Runtime optimizado
  - Health checks
  - Expose puerto 3000

#### `docker-compose.yml`
- **Líneas**: 89
- **Contenedores**: 3 (DVWA, MySQL, Forensic App)
- **Redes**: forensic-network (bridge)
- **Volúmenes**:
  - dvwa_db_data (MySQL datos)
  - dvwa_data (DVWA app files)
- **Ports**:
  - 8080 → DVWA
  - 3306 → MySQL
  - 3000 → Forensic App
- **Features**:
  - Health checks
  - Dependency management
  - Auto-restart

#### `.dockerignore`
- **Líneas**: 20
- **Propósito**: Optimizar contexto de build
- **Excluye**:
  - node_modules
  - .git
  - logs
  - tests
  - (etc)

#### `docker/.env.example`
- **Líneas**: 20
- **Propósito**: Template de variables
- **Variables**:
  - MySQL credentials
  - Node environment
  - Docker socket path
  - Apache config

---

### 3. 🔧 SCRIPTS

#### `setup-ubuntu.sh` ⭐ PRINCIPAL
- **Líneas**: 510+
- **Ejecución**: `sudo bash setup-ubuntu.sh`
- **Tiempo**: ~60-80 minutos (primera vez)
- **Qué hace**:
  1. Verifica OS (Ubuntu)
  2. Actualiza sistema
  3. Instala Docker
  4. Instala Docker Compose
  5. Instala Apache 2
  6. Configura reverse proxy
  7. Descarga imágenes
  8. Inicia contenedores
  9. Crea servicio systemd
  10. Genera scripts de utilidad
- **Output**:
  - Información de acceso
  - URLs de servicios
  - Credenciales

#### `maintenance.sh`
- **Líneas**: 350+
- **Ejecución**: `bash maintenance.sh` (interactivo) o `bash maintenance.sh [comando]`
- **Modo Interactivo**:
  - Menú de opciones
  - 1-9 opciones disponibles
- **Modo Directo**:
  - `maintenance.sh backup-db` → Backup BD
  - `maintenance.sh backup-volumes` → Backup volúmenes
  - `maintenance.sh backup-all` → Todo
  - `maintenance.sh cleanup` → Limpiar Docker
  - `maintenance.sh update` → Actualizar imágenes
  - `maintenance.sh report` → Generar reporte
  - `maintenance.sh maintain` → Mantenimiento completo
- **Funciones**:
  - Backup automático de BD (mysqldump)
  - Backup de volúmenes Docker
  - Limpieza de imágenes sin usar
  - Limpieza de logs antiguos
  - Limpieza de backups >30 días
  - Actualización de imágenes
  - Generación de reportes

#### `monitor.sh`
- **Líneas**: 200+
- **Ejecución**: `bash monitor.sh` (continuo) o `bash monitor.sh once`
- **Modo Continuo**:
  - Auto-actualización cada 30 segundos
  - Ctrl+C para salir
- **Modo Una Sola Vez**:
  - `monitor.sh once` → Ejecuta una vez y termina
- **Información Mostrada**:
  - Estado de contenedores
  - Uso de recursos (CPU, RAM)
  - Estadísticas Docker
  - Información de red
  - Uso de disco
  - Métricas de rendimiento

#### `health-check.sh`
- **Líneas**: 250+
- **Ejecución**: `bash health-check.sh`
- **Verifica** (10 checks):
  1. Docker daemon
  2. Contenedores requeridos
  3. Servicios HTTP
  4. Base de datos
  5. Espacio en disco
  6. Memoria
  7. Volúmenes
  8. Logs de error
  9. Apache status
  10. Conectividad
- **Output**:
  - Resumen con OK/Alertas/Errores
  - Exit code (0=OK, 1=Error)

#### `uninstall.sh`
- **Líneas**: 100+
- **Ejecución**: `sudo bash uninstall.sh`
- **Pasos**:
  1. Detiene servicio
  2. Detiene contenedores
  3. Elimina config Apache
  4. Elimina servicio systemd
  5. Opcionalmente: elimina datos
  6. Opcionalmente: limpia Docker
- **Preserva**: Backups y logs (si existen)

#### `verify-setup.sh`
- **Líneas**: 200+
- **Ejecución**: `bash verify-setup.sh`
- **Verifica**:
  - Todos los archivos presentes
  - Permisos ejecutables
  - Contenido de archivos clave
  - Directorios necesarios
- **Output**: Resumen con pasos siguientes

---

### 4. ⚙️ CONFIGURACIÓN

#### `apache-config-notes.conf`
- **Líneas**: 100+
- **Propósito**: Referencia de configuración Apache
- **Contenidos**:
  - Reverse proxy HTTP
  - Headers de seguridad
  - WebSocket upgrade
  - Compresión Gzip
  - Caching
  - Timeouts
  - Sección HTTPS comentada
- **Ubicación en Servidor**: `/etc/apache2/sites-available/forensic-webapp.conf`

---

## 🎯 GUÍA DE USO POR ROL

### 👤 Instalador
1. Lee: `README_DEPLOYMENT.md`
2. Verifica: `verify-setup.sh`
3. Transfiere archivos
4. Ejecuta: `setup-ubuntu.sh`
5. Consulta: `INSTALLATION_CHECKLIST.md` si hay problemas

### 👨‍💻 Admin de Sistemas
1. Lee: `DEPLOYMENT.md`
2. Ejecuta: `setup-ubuntu.sh`
3. Monitorea: `monitor.sh`
4. Mantiene: `maintenance.sh`
5. Consulta: `PRODUCTION.md` para producción

### 👨‍🔬 DevOps
1. Personaliza: `docker-compose.yml`
2. Edita: `Dockerfile` si es necesario
3. Personaliza: `apache-config-notes.conf`
4. Automatiza: Scripts de backup/updates
5. Implementa: Configuración de `PRODUCTION.md`

### 📊 Usuario Final
1. Lee: `QUICKSTART.md`
2. Usa comandos: `monitor.sh`, `health-check.sh`
3. Consulta: Logs con `docker logs`
4. Accede: `http://servidor`

---

## ⏱️ TIEMPO DE LECTURA

| Documento | Tiempo | Cuando |
|-----------|--------|--------|
| README_DEPLOYMENT.md | 5 min | Comenzar |
| QUICKSTART.md | 10 min | Después de instalar |
| INSTALLATION_CHECKLIST.md | 15 min | Si hay problemas |
| DEPLOYMENT.md | 30 min | Para referencia completa |
| PRODUCTION.md | 20 min | Antes de producción |

---

## 🔄 WORKFLOW TÍPICO

```
DÍA 1: INSTALACIÓN
1. Leer: README_DEPLOYMENT.md (5 min)
2. Verificar: verify-setup.sh (2 min)
3. Instalar: setup-ubuntu.sh (60 min)
4. Validar: health-check.sh (3 min)
5. Acceder: http://servidor (2 min)

DÍA 2+: OPERACIÓN
1. Monitorear: monitor.sh
2. Verificar: health-check.sh (diario)
3. Respaldar: maintenance.sh backup-db (diario)
4. Limpiar: maintenance.sh cleanup (semanal)
5. Actualizar: maintenance.sh update (mensual)

ANTES DE PRODUCCIÓN:
1. Leer: PRODUCTION.md
2. Implementar: HTTPS, firewall, backups
3. Documentar: Cambios personalizados
4. Testear: Failover y recovery
```

---

## 📊 TAMAÑO TOTAL

```
Documentación:   ~40 KB (6 archivos)
Configuración:   ~3 KB  (4 archivos)
Scripts:         ~25 KB (6 archivos)
Total:           ~68 KB (16 archivos)
```

---

## ✅ CHECKLIST ANTES DE INSTALAR

- [ ] Todos los archivos presentes (`verify-setup.sh`)
- [ ] Scripts ejecutables (`chmod +x *.sh`)
- [ ] Archivos transferidos al servidor
- [ ] Ubuntu verificado en servidor
- [ ] Espacio disponible verificado
- [ ] Documentación leída (mínimo README)

---

## 🚨 ARCHIVOS CRÍTICOS (No eliminar)

```
setup-ubuntu.sh              - SIN ESTO NO HAY INSTALACIÓN
docker-compose.yml          - DEFINE LOS CONTENEDORES
Dockerfile                  - COMPILA LA APLICACIÓN
health-check.sh             - VERIFICAR ESTADO
maintenance.sh              - BACKUPS Y MANTENIMIENTO
```

---

## 📞 SI NO ENCUENTRAS ALGO

| Pregunta | Archivo |
|----------|---------|
| ¿Cómo instalo? | `setup-ubuntu.sh` + `INSTALLATION_CHECKLIST.md` |
| ¿Cómo acceso a servicios? | `QUICKSTART.md` |
| ¿Cómo hago backup? | `maintenance.sh` |
| ¿Cómo monitoreo? | `monitor.sh` |
| ¿Es esto seguro? | `PRODUCTION.md` |
| ¿Qué puedo hacer? | `QUICKSTART.md` |
| ¿Hay errores? | `health-check.sh` |
| ¿Cómo desinstalo? | `uninstall.sh` |
| ¿Documentación completa? | `DEPLOYMENT.md` |
| ¿Producción? | `PRODUCTION.md` |

---

## 🎓 DOCUMENTACIÓN RECOMENDADA POR EXPERIENCIA

### Principiante
1. README_DEPLOYMENT.md
2. QUICKSTART.md
3. Ejecutar setup-ubuntu.sh
4. INSTALLATION_CHECKLIST.md si hay problemas

### Intermedio
1. DEPLOYMENT_SUMMARY.md
2. DEPLOYMENT.md
3.health-check.sh y monitor.sh para monitoreo

### Avanzado
1. PRODUCTION.md
2. Personalizar docker-compose.yml
3. Implementar monitoreo/alertas adicionales
4. HTTPS/SSL con certbot

---

**Última actualización**: 6 de abril de 2026  
**Versión**: 1.0  
**Estado**: ✅ COMPLETO

