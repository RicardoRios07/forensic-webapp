# 🚀 Guía de Despliegue en Ubuntu con Docker

Esta guía proporciona instrucciones completas para desplegar Forensic Webapp con DVWA en un servidor Ubuntu.

## Requisitos Previos

- Servidor con Ubuntu 20.04 LTS, 22.04 LTS o 24.04 LTS
- Mínimo 4GB RAM (recomendado 8GB+)
- Conocimientos básicos de terminal Linux
- Acceso root o sudo
- Conexión a internet

## Instalación Automática (Recomendado)

### 1. Transferir archivos al servidor

```bash
# Desde tu máquina local
scp -r /path/to/forensic-webapp usuario@servidor:/tmp/
ssh usuario@servidor
```

### 2. Ejecutar script de instalación

```bash
# En el servidor
cd /tmp/forensic-webapp
sudo bash setup-ubuntu.sh
```

El script realizará automáticamente:
- ✅ Actualizar el sistema
- ✅ Instalar Docker y Docker Compose
- ✅ Instalar y configurar Apache
- ✅ Configurar reverse proxy
- ✅ Descargar e iniciar contenedores DVWA y Forensic Webapp
- ✅ Crear servicios systemd para autostart

## Instalación Manual

Si prefieres instalar paso a paso:

### 1. Actualizar sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Instalar Docker

```bash
# Instalar dependencias
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Agregar repositorio de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Iniciar servicio
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4. Instalar Apache

```bash
sudo apt-get install -y apache2

# Habilitar módulos necesarios
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

sudo systemctl start apache2
sudo systemctl enable apache2
```

### 5. Preparar directorio del proyecto

```bash
PROJECT_DIR="/opt/forensic-webapp"
sudo mkdir -p $PROJECT_DIR
sudo cp -r /path/to/forensic-webapp/* $PROJECT_DIR/
sudo chown -R $USER:$USER $PROJECT_DIR
```

### 6. Configurar Apache como reverse proxy

```bash
sudo bash -c 'cat > /etc/apache2/sites-available/forensic-webapp.conf' << 'EOF'
<VirtualHost *:80>
    ServerName forensic-webapp.local
    ServerAlias localhost
    
    ErrorLog ${APACHE_LOG_DIR}/forensic-error.log
    CustomLog ${APACHE_LOG_DIR}/forensic-access.log combined
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"
    RequestHeader set X-Forwarded-Proto "http"
    
    RewriteEngine On
    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]
</VirtualHost>
EOF
```

```bash
sudo a2ensite forensic-webapp
sudo a2dissite 000-default
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 7. Iniciar contenedores

```bash
cd $PROJECT_DIR
sudo docker-compose up -d
# Esperar ~60 segundos para que DVWA y la app se inicien
sleep 60
docker-compose logs
```

## Acceso a Servicios

Después de la instalación, accede a:

| Servicio | URL | Puerto |
|----------|-----|--------|
| Forensic Webapp | `http://servidor-ip` | 80 (Apache proxy) |
| Forensic Webapp (directo) | `http://servidor-ip:3000` | 3000 |
| DVWA | `http://servidor-ip:8080` | 8080 |
| Logs de contenedores | - | - |

### Credentials DVWA

- **Usuario**: admin
- **Contraseña**: password

## Gestión de Servicios

### Ver logs

```bash
# Logs de todos los contenedores
docker-compose logs -f

# Logs específicos
docker logs -f forensic-webapp
docker logs -f dvwa
docker logs -f dvwa-db
```

### Estado de contenedores

```bash
docker ps
docker-compose ps
```

### Reiniciar servicios

```bash
# Todos
docker-compose down
docker-compose up -d

# Solo Forensic Webapp
docker restart forensic-webapp
```

### Detener servicios

```bash
docker-compose down
```

### Eliminar datos (⚠️ Cuidado)

```bash
# Eliminar contenedores pero mantener volúmenes
docker-compose down

# Eliminar contenedores Y datos (PERMANENTE)
docker-compose down -v
```

## Configuración Avanzada

### Cambiar puertos

Editar `docker-compose.yml`:

```yaml
services:
  forensic-app:
    ports:
      - "3001:3000"  # Cambiar de 3000 a 3001
  
  dvwa:
    ports:
      - "8081:80"    # Cambiar de 8080 a 8081
```

Luego reiniciar:
```bash
docker-compose down
docker-compose up -d
```

### Usar dominio personalizado

Si tienes un dominio, editar `/etc/apache2/sites-available/forensic-webapp.conf`:

```apache
ServerName tu-dominio.com
ServerAlias www.tu-dominio.com
```

### Habilitar HTTPS

Instalar Certbot:
```bash
sudo apt-get install -y certbot python3-certbot-apache
sudo certbot --apache -d tu-dominio.com
```

### Variables de entorno personalizadas

Crear `.env`:
```bash
NODE_ENV=production
DOCKER_HOST=unix:///var/run/docker.sock
NEXT_PUBLIC_API_URL=http://tu-dominio.com
```

## Troubleshooting

### Los contenedores no inician

```bash
# Verificar Docker
docker ps -a

# Ver logs detallados
docker-compose logs

# Verificar espacio en disco
df -h

# Verificar permisos
ls -la /var/run/docker.sock
```

### Apache no está redirigiendo

```bash
# Verificar configuración
sudo apache2ctl configtest

# Ver logs
sudo tail -f /var/log/apache2/forensic-error.log

# Verificar módulos habilitados
sudo apache2ctl -M | grep proxy
```

### DVWA no inicia

```bash
# Ver logs de DVWA
docker logs dvwa

# Verificar base de datos
docker logs dvwa-db

# Reiniciar base de datos
docker-compose restart dvwa-db
```

### No puedo acceder desde otro ordenador

```bash
# Verificar que el servicio está escuchando en todas las interfaces
sudo netstat -tlnp | grep 3000
sudo netstat -tlnp | grep 80

# Verificar firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
```

## Backup y Restauración

### Crear backup de datos

```bash
# Backup de base de datos DVWA
docker exec dvwa-db mysqldump -u dvwa -pdvwa dvwa > backup_dvwa_db.sql

# Backup de volúmenes
docker run --rm -v dvwa_db_data:/data -v $(pwd):/backup ubuntu tar czf /backup/dvwa_db_data.tar.gz /data

# Backup de proyecto
tar czf forensic-webapp-backup.tar.gz /opt/forensic-webapp/
```

### Restaurar desde backup

```bash
# Restaurar base de datos
docker exec -i dvwa-db mysql -u dvwa -pdvwa dvwa < backup_dvwa_db.sql

# Restaurar volúmenes
docker run --rm -v dvwa_db_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/dvwa_db_data.tar.gz -C /
```

## Mantenimiento Regular

### Actualizar contenedores

```bash
docker-compose pull
docker-compose down
docker-compose up -d
```

### Limpiar recursos no usados

```bash
# Eliminar imágenes no usadas
docker image prune -a

# Eliminar redes no usadas
docker network prune

# Limpiar todo sin volúmenes
docker system prune
```

## Monitoreo

### Usar Docker Stats

```bash
docker stats
docker stats forensic-webapp
```

### Monitoreo avanzado con Portainer (Opcional)

```bash
docker volume create portainer_data
docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

Acceder a `http://servidor-ip:9000`

## Soporte y Ayuda

Para más información:
- Documentación Next.js: https://nextjs.org/docs
- Documentación Docker: https://docs.docker.com/
- DVWA Oficial: http://www.dvwa.co.uk/
