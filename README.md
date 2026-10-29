# Módulo 6 — Escuela de Patinaje (FIS)

Repositorio de trabajo del **Grupo 6**:
- **Sebastián Charry Corredor** (Scrum Master)
- **Bettsy Liliana Garcés Buriticá**
- **Alejandro Mauricio Junco Oviedo**
- **Sergio Nicolás Mendivelso Martínez**

---

## Estado Actual: Sprint 1 (Semana 1)
En este primer Sprint el equipo se enfoca en los **cimientos y catálogos base**:
1. **HU-6.2 (RF-M6-02):** Registro y administración de personal (Sebastián y Sergio).
2. **HU-6.6 (RF-M6-06):** Registro y control de inventario de uniformes (Bettsy y Alejandro).

---

## Cómo ejecutar el proyecto del Sprint 1

### 1. Frontend (Pantallas de HU-6.2 y HU-6.6):
Abre el archivo `frontend/index.html` en cualquier navegador (Chrome, Edge) dándole doble clic.

### 2. Backend (API REST en Node.js):
En una terminal:
```bash
cd backend
npm start
```
El servidor arrancará en `http://localhost:4000`.

---

## Estructura de carpetas
```text
modulo-6/
├── database/schema_m6.sql    # Esquema de tablas en PostgreSQL
├── backend/src/server.js     # API REST del Sprint 1 (HU-6.2 y HU-6.6)
├── frontend/index.html       # Interfaz visual del Sprint 1
├── BITACORA_CAMBIOS.md       # Trazabilidad y tareas por Sprint
└── README.md
```
