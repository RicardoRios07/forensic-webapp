# REPORTE FORENSE - DVWA Monitor
## Análisis de Incidente de Seguridad

**Fecha de Generación:** 2026-02-10T23:01:45.905Z  
**Contenedor Analizado:** dvwa-test  
**ID del Contenedor:** dvwa-test

---

## 1. RESUMEN EJECUTIVO

Este reporte documenta el análisis forense realizado sobre el contenedor Docker **dvwa-test**.
Durante el período de monitoreo se detectaron **21** ataques, generando **21** alertas de seguridad.

### Estadísticas Clave

- **Total de Ataques Detectados:** 21
- **Tasa de Ataques:** 6.60 ataques/minuto
- **Líneas de Log Procesadas:** 27
- **Errores HTTP Detectados:** 24

### Distribución de Ataques

| Tipo de Ataque | Cantidad | Porcentaje |
|----------------|----------|------------|
| Inyección SQL | 6 | 28.6% |
| Inyección de Comandos | 9 | 42.9% |
| Fuerza Bruta | 0 | 0.0% |
| Inclusión de Archivos | 6 | 28.6% |

---

## 2. LÍNEA DE TIEMPO DEL INCIDENTE

### 1. 6:01:28 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 2. 6:01:28 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 3. 6:01:28 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 4. 6:01:30 PM 🟠 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+UNION+SELECT+null,version()--&Submit=Submit`

### 5. 6:01:30 PM 🟠 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+UNION+SELECT+null,version()--&Submit=Submit`

### 6. 6:01:30 PM 🟠 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+UNION+SELECT+null,version()--&Submit=Submit`

### 7. 6:01:32 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`

### 8. 6:01:32 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`

### 9. 6:01:32 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`

### 10. 6:01:32 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`

### 11. 6:01:32 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`

### 12. 6:01:32 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`

### 13. 6:01:35 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;whoami&Submit=Submit`

### 14. 6:01:35 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;whoami&Submit=Submit`

### 15. 6:01:35 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/exec/
- **Método:** GET
- **Payload:** `ip=127.0.0.1;whoami&Submit=Submit`

### 16. 6:01:37 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 17. 6:01:37 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 18. 6:01:37 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 19. 6:01:37 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 20. 6:01:37 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 21. 6:01:37 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`


---

## 3. ALERTAS DE SEGURIDAD

### Alertas por Severidad

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 9 |
| 🟠 Alto | 9 |
| 🟡 Medio | 3 |
| 🔵 Bajo | 0 |

### Alertas Detalladas

#### Alerta #1 - ALTO

- **ID:** 1770764497315-74-gp1y9j
- **Timestamp:** 2026-02-10T23:01:37.315Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770764497315-71-85nhcq


#### Alerta #2 - CRÍTICO

- **ID:** 1770764497315-72-7gnb3l
- **Timestamp:** 2026-02-10T23:01:37.315Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770764497315-71-85nhcq


#### Alerta #3 - ALTO

- **ID:** 1770764497314-69-o0f9yc
- **Timestamp:** 2026-02-10T23:01:37.314Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770764497314-66-n696w5


#### Alerta #4 - CRÍTICO

- **ID:** 1770764497314-67-gxozqc
- **Timestamp:** 2026-02-10T23:01:37.314Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770764497314-66-n696w5


#### Alerta #5 - ALTO

- **ID:** 1770764497313-64-u7qr6l
- **Timestamp:** 2026-02-10T23:01:37.313Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770764497313-61-atm4rz


#### Alerta #6 - CRÍTICO

- **ID:** 1770764497313-62-1vw2wv
- **Timestamp:** 2026-02-10T23:01:37.313Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770764497313-61-atm4rz


#### Alerta #7 - CRÍTICO

- **ID:** 1770764495306-59-0zb8p8
- **Timestamp:** 2026-02-10T23:01:35.306Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;whoami&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764495306-58-dq5ecm


#### Alerta #8 - CRÍTICO

- **ID:** 1770764495305-56-d6kcl8
- **Timestamp:** 2026-02-10T23:01:35.305Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;whoami&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764495304-55-tezrnb


#### Alerta #9 - CRÍTICO

- **ID:** 1770764495303-53-posg2p
- **Timestamp:** 2026-02-10T23:01:35.303Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;whoami&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764495302-52-host3b


#### Alerta #10 - ALTO

- **ID:** 1770764492295-50-juosy0
- **Timestamp:** 2026-02-10T23:01:32.295Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764492295-47-445chi


#### Alerta #11 - CRÍTICO

- **ID:** 1770764492295-48-3jdu3h
- **Timestamp:** 2026-02-10T23:01:32.295Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764492295-47-445chi


#### Alerta #12 - ALTO

- **ID:** 1770764492295-45-6a4rep
- **Timestamp:** 2026-02-10T23:01:32.295Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764492295-42-81i2ch


#### Alerta #13 - CRÍTICO

- **ID:** 1770764492295-43-bm11ue
- **Timestamp:** 2026-02-10T23:01:32.295Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764492295-42-81i2ch


#### Alerta #14 - ALTO

- **ID:** 1770764492294-40-g7f2ou
- **Timestamp:** 2026-02-10T23:01:32.294Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764492293-37-mgbape


#### Alerta #15 - CRÍTICO

- **ID:** 1770764492294-38-3bw102
- **Timestamp:** 2026-02-10T23:01:32.294Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/exec/
- **Payload:** `ip=127.0.0.1;cat+/etc/passwd&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764492293-37-mgbape


#### Alerta #16 - ALTO

- **ID:** 1770764490289-35-1fmp7q
- **Timestamp:** 2026-02-10T23:01:30.289Z
- **Tipo de Ataque:** Inyección SQL
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/sqli/
- **Payload:** `id=1'+UNION+SELECT+null,version()--&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764490289-34-fxlvrg


#### Alerta #17 - ALTO

- **ID:** 1770764490288-32-7lsljp
- **Timestamp:** 2026-02-10T23:01:30.288Z
- **Tipo de Ataque:** Inyección SQL
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/sqli/
- **Payload:** `id=1'+UNION+SELECT+null,version()--&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764490288-31-00lac9


#### Alerta #18 - ALTO

- **ID:** 1770764490287-29-zezh2c
- **Timestamp:** 2026-02-10T23:01:30.287Z
- **Tipo de Ataque:** Inyección SQL
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/sqli/
- **Payload:** `id=1'+UNION+SELECT+null,version()--&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764490287-28-felipm


#### Alerta #19 - MEDIO

- **ID:** 1770764488282-26-4qtzic
- **Timestamp:** 2026-02-10T23:01:28.282Z
- **Tipo de Ataque:** Inyección SQL
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/sqli/
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764488282-25-cs6uwa


#### Alerta #20 - MEDIO

- **ID:** 1770764488281-23-r6tf6e
- **Timestamp:** 2026-02-10T23:01:28.281Z
- **Tipo de Ataque:** Inyección SQL
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/sqli/
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`
- **Estado:** active
- **Evidencia:** 1770764488281-22-oh83sp



---

## 4. ANÁLISIS DE ATAQUES

### Inyección SQL (SQLi)

Se detectaron **6** intentos de inyección SQL. Este tipo de ataque permite a los atacantes manipular consultas a la base de datos.

**Patrones Comunes Detectados:**
- `' OR '1'='1`
- `UNION SELECT`
- `-- (comentarios SQL)`
- `DROP TABLE`

### Inyección de Comandos

Se registraron **9** ataques de inyección de comandos, permitiendo ejecución remota de código.

**Comandos Ejecutados:**
- `cat /etc/passwd`
- `whoami`
- `ls -la`
- `id`

### Fuerza Bruta

**0** intentos de fuerza bruta contra el sistema de autenticación.

### Inclusión de Archivos (LFI/RFI)

**6** intentos de acceder a archivos no autorizados.

---

## 5. IPs ATACANTES

### Top IPs con Mayor Actividad

1. **192.168.65.1** - 21 ataques

---

## 6. EVIDENCIAS RECOLECTADAS

### Archivos de Evidencia

1. **forensic-logs.txt** - Logs completos del sistema
2. **forensic-alerts.json** - Todas las alertas generadas
3. **forensic-timeline.json** - Línea de tiempo del incidente
4. **forensic-hashes.txt** - Hashes SHA256 para integridad

### Integridad de Evidencias

Todos los archivos de evidencia han sido procesados con hash SHA256 para garantizar su integridad y admisibilidad en procesos legales.

---

## 7. RECOMENDACIONES

### Inmediatas

1. **Aislar el Contenedor:** Detener el contenedor comprometido inmediatamente
2. **Cambiar Credenciales:** Rotar todas las contraseñas y tokens de acceso
3. **Revisar Logs:** Analizar logs del host para detectar propagación
4. **Actualizar Sistema:** Aplicar parches de seguridad

### A Corto Plazo

1. Implementar WAF (Web Application Firewall)
2. Configurar rate limiting
3. Habilitar autenticación multifactor
4. Implementar lista blanca de IPs

### A Largo Plazo

1. Capacitación en seguridad para el equipo
2. Auditorías de seguridad regulares
3. Implementar SIEM para detección temprana
4. Desarrollar plan de respuesta a incidentes

---

## 8. CONCLUSIONES

El análisis forense revela múltiples vectores de ataque explotados contra el contenedor DVWA.
Los ataques más prevalentes fueron **Inyección de Comandos** con 9 ocurrencias.

La evidencia recolectada demuestra:
- Actividad maliciosa confirmada
- Múltiples intentos de compromiso
- Necesidad urgente de medidas de mitigación

---

## 9. INFORMACIÓN DEL ANALISTA

**Herramienta:** DVWA Forensic Monitor  
**Versión:** 1.0.0  
**Fecha:** 2026-02-10T23:01:45.905Z  

---

## 10. ANEXOS

### A. Metodología

Este análisis se realizó utilizando técnicas de análisis forense digital, incluyendo:
- Análisis de logs en tiempo real
- Detección de patrones de ataque
- Correlación de eventos
- Generación de línea de tiempo

### B. Referencias

- OWASP Top 10
- NIST Cybersecurity Framework
- ISO 27001
- Chain of Custody Best Practices

---

**Fin del Reporte**

*Este documento contiene información sensible de seguridad. Manéjese con confidencialidad.*
