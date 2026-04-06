# 🏗️ Guía de Arquitectura y Producción

## 📐 Arquitectura del Despliegue

```
┌────────────────────────────────────────────────────────────┐
│                     Internet / Red Local                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    (Puerto 80)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   SERVIDOR UBUNTU                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ┌────────────────────────────────────────────────┐    │  │
│  │ │         Apache HTTP Server (localhost:80)      │    │  │
│  │ │     Reverse Proxy → localhost:3000             │    │  │
│  │ │     WebSocket Upgrade Support                  │    │  │
│  │ └────────────────────┬───────────────────────────┘    │  │
│  │                      │                                 │  │
│  │  ┌──────────────────┴──────────────────┐              │  │
│  │  │                                     │              │  │
│  │  ▼                                     ▼              │  │
│  │ ┌──────────────────────┐  ┌─────────────────────┐   │  │
│  │ │  FORENSIC WEBAPP     │  │    DVWA (Vulnerable)│   │  │
│  │ │  (Next.js/React)     │  │   Apache + PHP       │   │  │
│  │ │  Puerto: 3000        │  │   Puerto: 8080      │   │  │
│  │ │                      │  │   ┌────────────┐    │   │  │
│  │ │ ├─ Dashboard        │  │   │   MySQL    │    │   │  │
│  │ │ ├─ Alerts          │  │   │   BD DVWA  │    │   │  │
│  │ │ ├─ Evidence        │  │   │ Puerto 3306│    │   │  │
│  │ │ ├─ Timeline        │  │   └────────────┘    │   │  │
│  │ │ ├─ Logs            │  │                     │   │  │
│  │ │ └─ Map             │  │                     │   │  │
│  │ └────────┬───────────┘  └──────────┬──────────┘   │  │
│  │          │                        │               │  │
│  │          └────────────┬───────────┘               │  │
│  │                       │                           │  │
│  │                       ▼                           │  │
│  │         ┌─────────────────────────┐               │  │
│  │         │   Docker Daemon Socket  │               │  │
│  │         │  (Análisis de contenedores)             │  │
│  │         └─────────────────────────┘               │  │
│  │                                                    │  │
│  │         ┌─────────────────────────┐               │  │
│  │         │   Docker Networks       │               │  │
│  │         │ forensic-network        │               │  │
│  │         └─────────────────────────┘               │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  VOLÚMENES PERSISTENTES:                                 │
│  ├─ dvwa_db_data (MySQL data)                           │
│  └─ dvwa_data (DVWA application files)                  │
│                                                            │
│  DIRECTORIOS MONTADOS:                                   │
│  └─ /var/run/docker.sock (acceso a Docker daemon)       │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

```
1. Usuario accede http://servidor
   ↓
2. Apache reverse proxy (puerto 80)
   ↓
3. Next.js app (puerto 3000)
   ↓
4. API Routes (/api/*)
   ├─ /api/alerts → Lee eventos análisis
   ├─ /api/stats → Estadísticas
   ├─ /api/logs → Logs de Docker
   ├─ /api/network → Info de red
   ├─ /api/timeline → Timeline de eventos
   └─ /api/evidence → Gestión de evidencias
   ↓
5. Docker Daemon Socket
   ↓
6. Análisis de logs DVWA
   │
   ├─ Detector SQLi
   ├─ Detector Command Injection
   ├─ Detector Brute Force
   └─ Detector File Inclusion
   ↓
7. Database (MySQL)
   └─ Almacenamiento de alertas, timeline, evidencia
```

## ⚙️ Configuración de Producción

### 1. Variables de Entorno

```bash
# .env (crear en /opt/forensic-webapp)

# Node.js
NODE_ENV=production
NUM_WORKERS=4

# Next.js
NEXT_PUBLIC_API_URL=https://forensic-webapp.com  # Cambiar a tu dominio
NEXT_TELEMETRY_DISABLED=1

# Docker
DOCKER_HOST=unix:///var/run/docker.sock
LOG_RETENTION_DAYS=30

# Base de datos
MYSQL_ROOT_PASSWORD=CAMBIAR_CONTRASEÑA_FUERTE
MYSQL_DATABASE=dvwa
MYSQL_USER=dvwa_user
MYSQL_PASSWORD=CAMBIAR_CONTRASEÑA_FUERTE

# Apache
SERVER_NAME=forensic-webapp.com  # Tu dominio
SERVER_ADMIN=admin@forensic-webapp.com
```

### 2. Limites de Recursos (docker-compose.yml)

```yaml
services:
  forensic-app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    
  dvwa:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
  
  dvwa-db:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 3. Seguridad

#### 3.1 SSL/HTTPS

```bash
# Instalar Certbot (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-apache

# Obtener certificado
sudo certbot --apache -d forensic-webapp.com -d www.forensic-webapp.com

# Renovación automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### 3.2 Firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Opcional: Limitar SSH a IPs específicas
sudo ufw allow from 192.168.1.0/24 to any port 22
```

#### 3.3 Acceso Restringido

```bash
# Proteger /api con basic auth en Apache
# En /etc/apache2/sites-available/forensic-webapp.conf

<Location /api>
    AuthType Basic
    AuthName "Forensic API"
    AuthUserFile /etc/apache2/.htpasswd
    Require valid-user
</Location>

# Crear usuarios
sudo htpasswd -c /etc/apache2/.htpasswd usuario1
sudo htpasswd /etc/apache2/.htpasswd usuario2
```

#### 3.4 Rate Limiting

```apache
# En Apache config
<IfModule mod_ratelimit.c>
  <Location />
    SetOutputFilter RATE_LIMIT
    ModRateLimit 10000
  </Location>
</IfModule>
```

### 4. Logging y Monitoreo

#### 4.1 Logs Centralizados

```bash
# Configurar logrotate para Apache
cat > /etc/logrotate.d/forensic-webapp << 'EOF'
/var/log/apache2/forensic-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /etc/apache2/mods-enabled/status.load ]; then
            /usr/sbin/apache2ctl graceful > /dev/null 2>&1 || true
        fi
    endscript
}
EOF

# Logs de Docker
docker-compose logs --tail 1000 > logs/docker-$(date +%Y%m%d).log
```

#### 4.2 Monitoreo del Sistema

```bash
# Instalar Prometheus + Grafana (Docker)
docker run -d \
  -p 9090:9090 \
  -v /opt/forensic-webapp/prometheus.yml:/etc/prometheus/prometheus.yml \
  --name prometheus \
  prom/prometheus

docker run -d \
  -p 3001:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=password \
  --name grafana \
  grafana/grafana
```

#### 4.3 Alertas

```bash
# Instalar Alertmanager
# Configurar notificaciones por:
# - Email
# - Slack
# - PagerDuty
# - Webhook personalizado
```

### 5. Backups Automatizados

```bash
# Cron job para backups diarios
cat > /etc/cron.d/forensic-backups << 'EOF'
# Backup a las 2 AM todos los días
0 2 * * * root cd /opt/forensic-webapp && bash maintenance.sh backup-all >> /var/log/forensic-backup.log 2>&1

# Limpieza de backups antiguos (1er día del mes)
0 3 1 * * root cd /opt/forensic-webapp && bash maintenance.sh cleanup >> /var/log/forensic-backup.log 2>&1

# Health check cada 30 minutos
*/30 * * * * root cd /opt/forensic-webapp && bash health-check.sh >> /var/log/forensic-health.log 2>&1
EOF

chmod 0644 /etc/cron.d/forensic-backups
```

### 6. Escalabilidad (Opcional)

Para múltiples instancias:

```yaml
# docker-compose con múltiples app workers
version: '3.8'

services:
  forensic-app-1:
    build: .
    ports:
      - "3001:3000"
    environment:
      WORKER_ID: 1
  
  forensic-app-2:
    build: .
    ports:
      - "3002:3000"
    environment:
      WORKER_ID: 2
  
  forensic-app-3:
    build: .
    ports:
      - "3003:3000"
    environment:
      WORKER_ID: 3
  
  # Nginx como load balancer
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### 7. Disaster Recovery

```bash
# Plan de restauración
1. Backup:
   - BD MySQL diaria
   - Volúmenes Docker semanales
   - Config completa mensual

2. Testing:
   - Test de restauración mensual
   - Documentar proceso

3. RTO/RPO:
   - RTO: < 1 hora
   - RPO: < 1 hora
```

## 📊 Checklist de Producción

- [ ] SSL/HTTPS habilitado
- [ ] Firewall configurado
- [ ] Backups automatizados
- [ ] Monitoreo activo
- [ ] Logs centralizados
- [ ] Alertas configuradas
- [ ] Plan de DR documentado
- [ ] Usuarios/contraseñas cambiadas
- [ ] Acceso SSH con claves
- [ ] Rate limiting habilitado
- [ ] Headers de seguridad
- [ ] Pruebas de carga completadas
- [ ] Documentación actualizada

## 🔍 Performance Tuning

```bash
# Aumentar tamaño de upload
echo "post_max_size = 100M" >> /etc/php/8.1/apache2/php.ini
echo "upload_max_filesize = 100M" >> /etc/php/8.1/apache2/php.ini

# Optimizar MySQL
# Editar /etc/mysql/mysql.conf.d/mysqld.cnf

# Caché de Docker
# Aumentar image cache en daemon.json

# Compresión gzip en Apache
a2enmod deflate
# Configurado en apache-config-notes.conf
```

## 📈 Métricas a Monitorear

| Métrica | Alerta | Crítico |
|---------|--------|---------|
| CPU | > 75% | > 90% |
| RAM | > 80% | > 95% |
| Disco | > 80% | > 95% |
| Respuesta app | > 3s | > 10s |
| Respuesta DB | > 500ms | > 2s |
| Contenedores caídos | Cualquiera | > 1 |

---

**Última actualización**: 2026-04-06
**Versión de arquitectura**: 1.0
