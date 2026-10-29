# Módulo 6 — Administración, Reportes, Finanzas e Inventario (FIS)

Repositorio de desarrollo independiente del **Grupo 6** para la asignatura **Fundamentos de Ingeniería de Software**.
Diseñado con arquitectura modular desacoplada para integrarse posteriormente al repositorio general del proyecto.

## Integrantes del Equipo (Grupo 6)
- **Sebastián Charry Corredor** (Scrum Master)
- **Bettsy Liliana Garcés Buriticá**
- **Alejandro Mauricio Junco Oviedo**
- **Sergio Nicolás Mendivelso Martínez**

---

## Alcance del Módulo (8 Historias de Usuario — 120 Horas Estimadas)

| ID HU | Requisito | Título | Estimación | Bloque |
| :--- | :--- | :--- | :--- | :--- |
| **HU-6.1** | `RF-M6-01` | Visualización del panel general administrativo (KPIs) | 8 SP (20 h) | Bloque 3: Finanzas y KPI |
| **HU-6.2** | `RF-M6-02` | Registro y administración de personal (CRUD + Borrado lógico) | 5 SP (13 h) | Bloque 1: Personal y Roles |
| **HU-6.3** | `RF-M6-03` | Asignación de permisos al rol Contador (RBAC en servidor) | 3 SP (8 h) | Bloque 1: Personal y Roles |
| **HU-6.4** | `RF-M6-04` | Generación de reportes financieros filtrados por fechas | 8 SP (20 h) | Bloque 3: Finanzas y KPI |
| **HU-6.5** | `RF-M6-05` | Exportación de reportes financieros a PDF y Excel (`.xlsx`) | 5 SP (13 h) | Bloque 3: Finanzas y KPI |
| **HU-6.6** | `RF-M6-06` | Registro y control de inventario de uniformes | 5 SP (13 h) | Bloque 2: Inventario |
| **HU-6.7** | `RF-M6-07` | Registro de venta de uniformes (Multi-ítem y stock atómico) | 5 SP (13 h) | Bloque 2: Inventario |
| **HU-6.8** | `RF-M6-08` | Registro de préstamo y entrega de uniformes | 8 SP (20 h) | Bloque 2: Inventario |

---

## Estructura del Repositorio

```text
modulo-6/
├── database/
│   └── schema_m6.sql          # Esquema PostgreSQL de las tablas de M6 + Tablas puente de integración
├── backend/                   # API REST en NestJS / Node.js (Reglas de negocio, RBAC, PDF/Excel)
├── frontend/                  # Interfaz de usuario en React (Pantallas de las 8 Historias de Usuario)
├── BITACORA_CAMBIOS.md        # Registro detallado de cambios técnicos, dependencias e inconsistencias
└── README.md                  # Guía del repositorio para el Grupo 6
```

---

## Cómo subir este repositorio al GitHub propio del Grupo 6

1. Crea un repositorio vacío en tu cuenta de GitHub (por ejemplo `fis-modulo-6`).
2. Abre una terminal en esta carpeta (`c:\Users\seb0c\Downloads\FIS\modulo-6`) y ejecuta:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/fis-modulo-6.git
   git branch -M main
   git push -u origin main
   ```
3. Invita a tus 3 compañeros (**Bettsy**, **Alejandro** y **Sergio**) en *Settings -> Collaborators* de ese repositorio.
