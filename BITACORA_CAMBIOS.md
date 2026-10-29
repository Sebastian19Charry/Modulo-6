# Bitácora Técnica y Control de Cambios — Módulo 6

Este documento registra el progreso real y verificable del **Grupo 6** dividido por Sprints.

---

## 🏃 Sprint 1 (Semana 1) — Cimientos, Personal (HU-6.2) e Inventario (HU-6.6)
- **Período:** 29 de octubre de 2026 – 05 de noviembre de 2026
- **Objetivo del Sprint (Sprint Goal):** Dejar estructurada la base de datos de M6 y funcionales los dos catálogos base del sistema: Registro de Personal (`HU-6.2`) e Inventario de Uniformes (`HU-6.6`).
- **Horas estimadas:** 26 h (13 h por historia).

### Reparto de Tareas por Parejas (Grupo 6):
1. **Pareja 1 (Sebastián Charry y Sergio Mendivelso) — HU-6.2 (Personal de la Escuela):**
   - [x] Definición del modelo de datos de `personal` con campos obligatorios y borrado lógico.
   - [x] Endpoint `GET /api/personal` y `POST /api/personal` con validación de documento y correo duplicados.
   - [x] Endpoint `PATCH /api/personal/:id/desactivar` para cambio de estado sin eliminación física.
   - [x] Interfaz gráfica: Tabla con filtro de estado, buscador en tiempo real y modal de creación.

2. **Pareja 2 (Bettsy Garcés y Alejandro Junco) — HU-6.6 (Inventario de Uniformes):**
   - [x] Definición del modelo de datos de `uniformes` con restricción de unicidad `(referencia, talla, tipo)`.
   - [x] Endpoint `GET /api/uniformes` y `POST /api/uniformes` con validación de no negatividad.
   - [x] Interfaz gráfica: Tabla de existencias con semáforo de alerta visual (Verde: stock > mínimo, Rojo: stock <= mínimo).
   - [x] Modal de nueva prenda y control de ajuste de cantidades disponibles.

---

## 📅 Planificación de Sprints Futuros:
- **Sprint 2 (Semana 2):** Rol Contador (`HU-6.3`), Venta de Uniformes (`HU-6.7`) y Préstamos (`HU-6.8`).
- **Sprint 3 (Semana 3):** Reportes Financieros (`HU-6.4`), Exportación PDF/XLSX (`HU-6.5`) y Panel KPIs (`HU-6.1`).
- **Sprint 4 (Semana 4):** Integración con los demás módulos (M1, M2, M3, M5), pruebas y sustentación.
