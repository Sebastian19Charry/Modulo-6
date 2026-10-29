# Bitácora Técnica y Control de Cambios — Módulo 6

Este documento registra cada avance técnico, decisión de arquitectura, dependencia e inconsistencia resuelta por el **Grupo 6**, sirviendo como respaldo directo para el Excel compartido de la asignatura.

---

## Registro de Avances (Changelog)

### [2026-10-29] — Iteración 1: Inicialización de Repositorio, Base de Datos y Bitácora de Integración
- **Responsable:** Sebastián Charry Corredor (Scrum Master) & Equipo Grupo 6.
- **Archivos creados:**
  - `database/schema_m6.sql`: Diseño completo en PostgreSQL de las 5 tablas propias del Módulo 6 (`m6_personal`, `m6_uniformes`, `m6_ventas_uniformes`, `m6_detalle_ventas_uniformes`, `m6_prestamos_uniformes`) y las 5 tablas puente de integración (`m1_usuarios_ref`, `m2_compradores_patinadores_ref`, `m3_grupos_ref`, `m5_cobros_cartera_ref`, `m5_pagos_mensualidades_ref`).
  - `README.md` y `.gitignore`: Configuración del repositorio Git aislado para trabajo colaborativo del Grupo 6.
- **Reglas de negocio garantizadas desde Base de Datos:**
  - `HU-6.2`: Unicidad de `numero_documento` y `correo` en `m6_personal`, y soporte de borrado lógico (`estado_laboral IN ('ACTIVO', 'INACTIVO')`).
  - `HU-6.3`: Control explícito de `rol_sistema` para validar permisos del rol `CONTADOR` y `ADMINISTRADOR`.
  - `HU-6.6`: Restricción de unicidad compuesta `UNIQUE (referencia, talla, tipo)` en `m6_uniformes` y validación `CHECK` contra cantidades o precios negativos.
  - `HU-6.7`: Estructura maestro-detalle (`m6_ventas_uniformes` + `m6_detalle_ventas_uniformes`) con integridad referencial `ON DELETE RESTRICT` para impedir borrar uniformes con ventas registradas.
  - `HU-6.8`: Control de estados de préstamo (`ACTIVO`, `VENCIDO`, `DEVUELTO`, `PERDIDA_DANO`) y validación de fechas (`fecha_estimada_devolucion >= fecha_prestamo`).
