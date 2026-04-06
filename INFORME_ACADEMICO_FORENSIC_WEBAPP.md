# Informe académico del proyecto: Forensic WebApp para DVWA

## 1. Datos generales

- **Asignatura:** Computación Forense
- **Proyecto:** Forensic WebApp (monitor de eventos y evidencias sobre DVWA)
- **Fecha:** 1 de marzo de 2026
- **Integrantes:** Renato Andrade, Gabriel Ríos, Ricardo Ríos
- **Repositorio:** https://github.com/RicardoRios07/forensic-webapp
- **Despliegue (demo):** https://v0-forensic-webapp.vercel.app

---

## 2. Introducción

En el contexto de la ciberseguridad, la computación forense requiere herramientas que permitan observar, registrar y organizar evidencia digital de manera clara y oportuna. Este proyecto propone una aplicación web orientada al análisis de actividad sospechosa en un entorno de práctica con DVWA (Damn Vulnerable Web Application), con el fin de apoyar procesos de aprendizaje, detección inicial y documentación forense.

La propuesta se enfoca en centralizar información de eventos, alertas y registros en una interfaz accesible para estudiantes, facilitando la comprensión del ciclo de un incidente desde su generación hasta su análisis.

---

## 3. Problemática

Durante prácticas de seguridad ofensiva y defensiva, es común que la evidencia quede dispersa en múltiples fuentes (logs de servicios, salidas de consola, eventos aislados), lo que dificulta:

1. **Identificar rápidamente patrones de ataque** en tiempo real.
2. **Relacionar eventos en una secuencia temporal** que tenga sentido para el análisis.
3. **Conservar evidencia verificable**, útil para informes académicos o técnicos.
4. **Presentar hallazgos de forma comprensible** para equipos no especializados.

Como resultado, el análisis forense puede volverse lento, propenso a omisiones y difícil de reproducir.

---

## 4. Solución propuesta

El equipo desarrolló una aplicación web que integra la observación y organización de evidencia en un solo entorno. La solución ofrece:

- **Monitoreo general de actividad** sobre un contenedor DVWA.
- **Detección de comportamientos asociados a ataques web frecuentes**, como inyección SQL, inyección de comandos, inclusión de archivos y fuerza bruta.
- **Panel de alertas** con niveles de criticidad para priorizar revisión.
- **Línea de tiempo de eventos**, que ayuda a reconstruir el incidente.
- **Gestión de evidencias**, incluyendo exportación de datos y generación de huellas hash para respaldo de integridad.

La arquitectura del proyecto permite trabajar con datos reales cuando existe conectividad con Docker y, en caso contrario, mantener la experiencia educativa mediante datos de demostración.

---

## 5. Funcionamiento general del sistema

De forma resumida, el sistema funciona en cuatro etapas:

1. **Captura de actividad:** se reciben registros de eventos del entorno donde corre DVWA.
2. **Análisis inicial:** se comparan patrones conocidos para identificar actividad potencialmente maliciosa.
3. **Visualización y correlación:** la información se organiza en paneles de métricas, alertas, registros y cronología.
4. **Conservación de evidencia:** se exportan resultados y se generan elementos de trazabilidad para documentación.

Este flujo permite pasar de datos crudos a información útil para investigación forense académica sin exigir un conocimiento técnico profundo del backend.

---

## 6. Aporte académico del proyecto

El proyecto aporta valor en tres niveles:

- **Didáctico:** facilita la comprensión de cómo se detectan y documentan incidentes web.
- **Metodológico:** promueve buenas prácticas de recolección, organización y presentación de evidencia.
- **Aplicado:** simula escenarios reales de laboratorio con una interfaz unificada, útil para demostraciones, prácticas guiadas y evaluación.

De esta manera, la herramienta sirve como puente entre la teoría de computación forense y su aplicación en entornos controlados.

---

## 7. Resumen para implementación en producción

Aunque la plataforma tiene un enfoque académico, para llevarla a un entorno de producción se recomienda un plan básico por fases:

### Fase 1: Endurecimiento de seguridad
- Restringir completamente el acceso al entorno de monitoreo.
- Aplicar autenticación y control de roles para usuarios del panel.
- Aislar la comunicación con servicios de contenedores y limitar privilegios.

### Fase 2: Escalabilidad y confiabilidad
- Migrar almacenamiento temporal a una base de datos persistente.
- Implementar colas o procesos asíncronos para manejar mayor volumen de eventos.
- Incorporar políticas de retención y archivado de evidencia.

### Fase 3: Operación y cumplimiento
- Centralizar auditoría y trazabilidad de acciones administrativas.
- Definir procedimientos de respaldo, recuperación y continuidad.
- Establecer lineamientos de cadena de custodia y cumplimiento normativo según contexto institucional.

En síntesis, el sistema ya cumple adecuadamente su objetivo educativo y puede evolucionar a un uso más formal mediante controles de seguridad, persistencia de datos y gobernanza operativa.

---

## 8. Conclusiones

El proyecto **Forensic WebApp** resuelve una necesidad concreta de la asignatura de Computación Forense: transformar eventos de seguridad dispersos en evidencia organizada, interpretable y útil para análisis académico. Su diseño prioriza la claridad del proceso forense (detección, correlación y reporte), permitiendo que estudiantes y docentes trabajen sobre incidentes de forma estructurada.

Como resultado, la solución no solo apoya la práctica técnica, sino que también fortalece la capacidad de comunicar hallazgos de manera profesional, requisito clave en escenarios reales de ciberseguridad y respuesta a incidentes.

---

## 9. Referencias del proyecto

- Repositorio oficial: https://github.com/RicardoRios07/forensic-webapp
- Despliegue web: https://v0-forensic-webapp.vercel.app
