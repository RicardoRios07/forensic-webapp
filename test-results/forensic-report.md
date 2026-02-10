# REPORTE FORENSE - DVWA Monitor
## Análisis de Incidente de Seguridad

**Fecha de Generación:** 2026-02-10T01:41:51.948Z  
**Contenedor Analizado:** dvwa-test  
**ID del Contenedor:** dvwa-test

---

## 1. RESUMEN EJECUTIVO

Este reporte documenta el análisis forense realizado sobre el contenedor Docker **dvwa-test**.
Durante el período de monitoreo se detectaron **886** ataques, generando **886** alertas de seguridad.

### Estadísticas Clave

- **Total de Ataques Detectados:** 886
- **Tasa de Ataques:** 886.00 ataques/minuto
- **Líneas de Log Procesadas:** 1,201
- **Errores HTTP Detectados:** 986

### Distribución de Ataques

| Tipo de Ataque | Cantidad | Porcentaje |
|----------------|----------|------------|
| Inyección SQL | 273 | 30.8% |
| Inyección de Comandos | 359 | 40.5% |
| Fuerza Bruta | 0 | 0.0% |
| Inclusión de Archivos | 254 | 28.7% |

---

## 2. LÍNEA DE TIEMPO DEL INCIDENTE

### 1. 8:41:12 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 2. 8:41:12 PM 🔴 Command Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 3. 8:41:12 PM 🟠 File Inclusion detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/fi/
- **Método:** GET
- **Payload:** `page=../../etc/passwd`

### 4. 8:41:13 PM ⚪ GET /index.php from 192.168.65.1
- **Tipo:** access
- **IP Origen:** 192.168.65.1
- **Endpoint:** /index.php
- **Método:** GET


### 5. 8:41:29 PM ⚪ GET / from 192.168.65.1
- **Tipo:** access
- **IP Origen:** 192.168.65.1
- **Endpoint:** /
- **Método:** GET


### 6. 8:41:30 PM ⚪ GET / from 192.168.65.1
- **Tipo:** access
- **IP Origen:** 192.168.65.1
- **Endpoint:** /
- **Método:** GET


### 7. 8:41:30 PM ⚪ GET / from 192.168.65.1
- **Tipo:** access
- **IP Origen:** 192.168.65.1
- **Endpoint:** /
- **Método:** GET


### 8. 8:41:30 PM ⚪ GET / from 192.168.65.1
- **Tipo:** access
- **IP Origen:** 192.168.65.1
- **Endpoint:** /
- **Método:** GET


### 9. 8:41:30 PM ⚪ GET / from 192.168.65.1
- **Tipo:** access
- **IP Origen:** 192.168.65.1
- **Endpoint:** /
- **Método:** GET


### 10. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 11. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 12. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 13. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 14. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 15. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 16. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 17. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 18. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 19. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 20. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 21. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 22. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 23. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 24. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 25. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 26. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 27. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 28. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 29. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 30. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 31. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 32. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 33. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 34. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 35. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 36. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 37. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 38. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 39. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 40. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 41. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 42. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 43. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 44. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 45. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 46. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 47. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 48. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 49. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`

### 50. 8:41:34 PM 🟡 SQL Injection detected from 192.168.65.1
- **Tipo:** attack
- **IP Origen:** 192.168.65.1
- **Endpoint:** /vulnerabilities/sqli/
- **Método:** GET
- **Payload:** `id=1'+OR+'1'='1&Submit=Submit`


---

## 3. ALERTAS DE SEGURIDAD

### Alertas por Severidad

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 359 |
| 🟠 Alto | 417 |
| 🟡 Medio | 110 |
| 🔵 Bajo | 0 |

### Alertas Detalladas

#### Alerta #1 - ALTO

- **ID:** 1770687702833-24088-ztqfih
- **Timestamp:** 2026-02-10T01:41:42.833Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702833-24085-aede05


#### Alerta #2 - CRÍTICO

- **ID:** 1770687702833-24086-6mfkir
- **Timestamp:** 2026-02-10T01:41:42.833Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702833-24085-aede05


#### Alerta #3 - ALTO

- **ID:** 1770687702830-24083-n41q2h
- **Timestamp:** 2026-02-10T01:41:42.830Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702830-24080-sxz1fp


#### Alerta #4 - CRÍTICO

- **ID:** 1770687702830-24081-ilw8bo
- **Timestamp:** 2026-02-10T01:41:42.830Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702830-24080-sxz1fp


#### Alerta #5 - ALTO

- **ID:** 1770687702828-24078-xr81ku
- **Timestamp:** 2026-02-10T01:41:42.828Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702828-24075-hdzxrp


#### Alerta #6 - CRÍTICO

- **ID:** 1770687702828-24076-6ax23l
- **Timestamp:** 2026-02-10T01:41:42.828Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702828-24075-hdzxrp


#### Alerta #7 - ALTO

- **ID:** 1770687702826-24073-jr73p8
- **Timestamp:** 2026-02-10T01:41:42.826Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702826-24070-6yjd78


#### Alerta #8 - CRÍTICO

- **ID:** 1770687702826-24071-hb2obp
- **Timestamp:** 2026-02-10T01:41:42.826Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702826-24070-6yjd78


#### Alerta #9 - ALTO

- **ID:** 1770687702824-24068-ysdj0p
- **Timestamp:** 2026-02-10T01:41:42.824Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702823-24065-w9uo26


#### Alerta #10 - CRÍTICO

- **ID:** 1770687702823-24066-tyo4fv
- **Timestamp:** 2026-02-10T01:41:42.823Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702823-24065-w9uo26


#### Alerta #11 - ALTO

- **ID:** 1770687702818-24063-3875gk
- **Timestamp:** 2026-02-10T01:41:42.818Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702818-24060-msv9vx


#### Alerta #12 - CRÍTICO

- **ID:** 1770687702818-24061-0zo0so
- **Timestamp:** 2026-02-10T01:41:42.818Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702818-24060-msv9vx


#### Alerta #13 - ALTO

- **ID:** 1770687702812-24058-e3354z
- **Timestamp:** 2026-02-10T01:41:42.812Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702812-24055-pikyy2


#### Alerta #14 - CRÍTICO

- **ID:** 1770687702812-24056-nhp4jm
- **Timestamp:** 2026-02-10T01:41:42.812Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702812-24055-pikyy2


#### Alerta #15 - ALTO

- **ID:** 1770687702810-24053-fxttsn
- **Timestamp:** 2026-02-10T01:41:42.810Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702810-24050-e9zxmd


#### Alerta #16 - CRÍTICO

- **ID:** 1770687702810-24051-agofos
- **Timestamp:** 2026-02-10T01:41:42.810Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702810-24050-e9zxmd


#### Alerta #17 - ALTO

- **ID:** 1770687702808-24048-lp8hvg
- **Timestamp:** 2026-02-10T01:41:42.808Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702808-24045-lzewpf


#### Alerta #18 - CRÍTICO

- **ID:** 1770687702808-24046-ym9otm
- **Timestamp:** 2026-02-10T01:41:42.808Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702808-24045-lzewpf


#### Alerta #19 - ALTO

- **ID:** 1770687702806-24043-ma3iq8
- **Timestamp:** 2026-02-10T01:41:42.806Z
- **Tipo de Ataque:** Inclusión de Archivos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702806-24040-xtbr6a


#### Alerta #20 - CRÍTICO

- **ID:** 1770687702806-24041-3u8tvh
- **Timestamp:** 2026-02-10T01:41:42.806Z
- **Tipo de Ataque:** Inyección de Comandos
- **IP Origen:** 192.168.65.1
- **Objetivo:** /vulnerabilities/fi/
- **Payload:** `page=../../etc/passwd`
- **Estado:** active
- **Evidencia:** 1770687702806-24040-xtbr6a



---

## 4. ANÁLISIS DE ATAQUES

### Inyección SQL (SQLi)

Se detectaron **273** intentos de inyección SQL. Este tipo de ataque permite a los atacantes manipular consultas a la base de datos.

**Patrones Comunes Detectados:**
- `' OR '1'='1`
- `UNION SELECT`
- `-- (comentarios SQL)`
- `DROP TABLE`

### Inyección de Comandos

Se registraron **359** ataques de inyección de comandos, permitiendo ejecución remota de código.

**Comandos Ejecutados:**
- `cat /etc/passwd`
- `whoami`
- `ls -la`
- `id`

### Fuerza Bruta

**0** intentos de fuerza bruta contra el sistema de autenticación.

### Inclusión de Archivos (LFI/RFI)

**254** intentos de acceder a archivos no autorizados.

---

## 5. IPs ATACANTES

### Top IPs con Mayor Actividad

1. **192.168.65.1** - 886 ataques

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
Los ataques más prevalentes fueron **Inyección de Comandos** con 359 ocurrencias.

La evidencia recolectada demuestra:
- Actividad maliciosa confirmada
- Múltiples intentos de compromiso
- Necesidad urgente de medidas de mitigación

---

## 9. INFORMACIÓN DEL ANALISTA

**Herramienta:** DVWA Forensic Monitor  
**Versión:** 1.0.0  
**Fecha:** 2026-02-10T01:41:51.948Z  

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
