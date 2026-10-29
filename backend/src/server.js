/**
 * Módulo 6 — Servidor API REST
 * Escuela de Patinaje (Administración, Reportes, Finanzas e Inventario)
 * Implementa las reglas de negocio de HU-6.1 a HU-6.8
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 4000;

// Base de datos en memoria (Simula PostgreSQL y contratos de integración)
const db = {
  // Integraciones (M1, M2, M3, M5)
  m2_patinadores: [
    { id: 1, nombres: "Laura Sofía Morales", tipo: "PATINADOR", doc: "1019283746", activo: true },
    { id: 2, nombres: "Santiago Andrés Pérez", tipo: "PATINADOR", doc: "1028374651", activo: true },
    { id: 3, nombres: "María Fernanda Castro (Acudiente)", tipo: "ACUDIENTE", doc: "52839401", activo: true },
    { id: 4, nombres: "Juan Diego Ramírez", tipo: "PATINADOR", doc: "1039485720", activo: true },
    { id: 5, nombres: "Valentina Ospina", tipo: "PATINADOR", doc: "1048596031", activo: false }
  ],
  m5_pagos: [
    { id: 101, fecha: "2026-10-05", comp: "PAG-2026-001", concepto: "Mensualidad Octubre - 3 días/sem", medio: "TRANSFERENCIA", monto: 180000, estado: "REGISTRADO" },
    { id: 102, fecha: "2026-10-10", comp: "PAG-2026-002", concepto: "Mensualidad Octubre - 6 días/sem", medio: "EFECTIVO", monto: 260000, estado: "REGISTRADO" },
    { id: 103, fecha: "2026-10-15", comp: "PAG-2026-003", concepto: "Pago sesión única", medio: "EFECTIVO", monto: 25000, estado: "REGISTRADO" },
    { id: 104, fecha: "2026-10-18", comp: "PAG-2026-004", concepto: "Pago mensualidad errónea", medio: "TRANSFERENCIA", monto: 180000, estado: "ANULADO" }
  ],
  // Entidades propias M6
  personal: [
    { id: 1, tipo_doc: "CC", num_doc: "1018273645", nombres: "Carlos Eduardo", apellidos: "Gómez Ruiz", correo: "carlos.gomez@patinaje.edu.co", tel: "3101234567", cargo: "Profesor", rol: "PROFESOR", estado: "ACTIVO" },
    { id: 2, tipo_doc: "CC", num_doc: "1029384756", nombres: "Andrea Liliana", apellidos: "Vargas Peña", correo: "andrea.vargas@patinaje.edu.co", tel: "3159876543", cargo: "Profesor", rol: "PROFESOR", estado: "ACTIVO" },
    { id: 3, tipo_doc: "CC", num_doc: "79483920", nombres: "Mauricio Andrés", apellidos: "Torres Castro", correo: "mauricio.torres@patinaje.edu.co", tel: "3204567890", cargo: "Contador", rol: "CONTADOR", estado: "ACTIVO" }
  ],
  uniformes: [
    { id: 1, ref: "UNI-COMP-01", nombre: "Enterizo Competencia Élite", talla: "10", tipo: "COMPETENCIA", costo: 65000, precio: 110000, disponible: 8, minima: 5, activo: true },
    { id: 2, ref: "UNI-COMP-01", nombre: "Enterizo Competencia Élite", talla: "12", tipo: "COMPETENCIA", costo: 68000, precio: 115000, disponible: 2, minima: 5, activo: true },
    { id: 3, ref: "UNI-ENTR-02", nombre: "Camiseta Entrenamiento Transpirable", talla: "M", tipo: "ENTRENAMIENTO", costo: 25000, precio: 45000, disponible: 18, minima: 6, activo: true }
  ],
  ventas: [],
  prestamos: []
};

let consecutivoVentas = 1;

function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (e) { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // HU-6.1: KPIs Dashboard
  if (path === '/api/dashboard/kpis' && method === 'GET') {
    const fIni = parsedUrl.query.fecha_inicio || '2026-10-01';
    const fFin = parsedUrl.query.fecha_fin || '2026-10-31';

    const estActivos = db.m2_patinadores.filter(p => p.tipo === 'PATINADOR' && p.activo).length;
    const profActivos = db.personal.filter(p => p.cargo === 'Profesor' && p.estado === 'ACTIVO').length;
    const stockTotal = db.uniformes.reduce((acc, u) => acc + (u.activo ? u.disponible : 0), 0);
    
    let ingresos = 0;
    db.m5_pagos.forEach(p => {
      if (p.estado === 'REGISTRADO' && p.fecha >= fIni && p.fecha <= fFin) ingresos += p.monto;
    });
    db.ventas.forEach(v => {
      if (v.fecha >= fIni && v.fecha <= fFin) ingresos += v.total;
    });

    return jsonResponse(res, 200, {
      estudiantes_activos: estActivos,
      grupos_activos: 6, // Mock M3
      profesores_activos: profActivos,
      cartera_pendiente: 1250000, // Mock M5
      ingresos_periodo: ingresos,
      uniformes_disponibles: stockTotal
    });
  }

  // HU-6.2: Personal (GET)
  if (path === '/api/personal' && method === 'GET') {
    return jsonResponse(res, 200, db.personal);
  }

  // HU-6.2: Personal (POST)
  if (path === '/api/personal' && method === 'POST') {
    const data = await parseBody(req);
    // Validación unicidad
    if (db.personal.some(p => p.num_doc === data.num_doc)) {
      return jsonResponse(res, 400, { error: "Ya existe un trabajador con este documento." });
    }
    if (db.personal.some(p => p.correo === data.correo)) {
      return jsonResponse(res, 400, { error: "Ya existe un trabajador con este correo institucional." });
    }
    const nuevo = { id: db.personal.length + 1, ...data, estado: "ACTIVO" };
    db.personal.push(nuevo);
    return jsonResponse(res, 201, nuevo);
  }

  // HU-6.3: Asignar Rol Contador (PATCH)
  if (path.startsWith('/api/personal/') && path.endsWith('/rol-contador') && method === 'PATCH') {
    const id = parseInt(path.split('/')[3]);
    const p = db.personal.find(x => x.id === id);
    if (!p) return jsonResponse(res, 404, { error: "Trabajador no encontrado" });
    p.rol = "CONTADOR";
    return jsonResponse(res, 200, { mensaje: "Rol Contador asignado con éxito", trabajador: p });
  }

  // HU-6.6: Uniformes (GET y POST)
  if (path === '/api/uniformes' && method === 'GET') {
    return jsonResponse(res, 200, db.uniformes);
  }
  if (path === '/api/uniformes' && method === 'POST') {
    const data = await parseBody(req);
    const duplicado = db.uniformes.some(u => u.ref === data.ref && u.talla === data.talla && u.tipo === data.tipo);
    if (duplicado) {
      return jsonResponse(res, 400, { error: "Restricción de unicidad: ya existe esa referencia, talla y tipo." });
    }
    const nuevo = { id: db.uniformes.length + 1, ...data, activo: true };
    db.uniformes.push(nuevo);
    return jsonResponse(res, 201, nuevo);
  }

  // HU-6.7: Venta de uniformes (POST)
  if (path === '/api/ventas' && method === 'POST') {
    const data = await parseBody(req);
    const numComp = "VTA-" + String(consecutivoVentas).padStart(4, '0');
    consecutivoVentas++;

    // Descontar inventario
    for (let item of data.items) {
      const u = db.uniformes.find(x => x.id === item.uniforme_id);
      if (!u || u.disponible < item.cant) {
        return jsonResponse(res, 400, { error: `Stock insuficiente para ${u ? u.nombre : 'uniforme'}` });
      }
      u.disponible -= item.cant;
    }

    const nuevaVenta = {
      id: db.ventas.length + 1,
      consecutivo: numComp,
      fecha: new Date().toISOString().split('T')[0],
      ...data
    };
    db.ventas.unshift(nuevaVenta);
    return jsonResponse(res, 201, nuevaVenta);
  }

  // HU-6.4: Reporte Financiero (GET)
  if (path === '/api/reportes/financiero' && method === 'GET') {
    const fIni = parsedUrl.query.fecha_inicio || '2026-10-01';
    const fFin = parsedUrl.query.fecha_fin || '2026-10-31';

    let movimientos = [];
    let totalM5 = 0;
    let totalM6 = 0;

    db.m5_pagos.forEach(p => {
      if (p.fecha >= fIni && p.fecha <= fFin) {
        if (p.estado === 'REGISTRADO') totalM5 += p.monto;
        movimientos.push({ ...p, origen: "M5 · Pagos" });
      }
    });

    db.ventas.forEach(v => {
      if (v.fecha >= fIni && v.fecha <= fFin) {
        totalM6 += v.total;
        movimientos.push({
          fecha: v.fecha,
          comp: v.consecutivo,
          concepto: `Venta uniformes (${v.comprador_nombre})`,
          medio: v.medio,
          monto: v.total,
          estado: "REGISTRADO",
          origen: "M6 · Uniformes"
        });
      }
    });

    return jsonResponse(res, 200, {
      periodo: { inicio: fIni, fin: fFin },
      totales: {
        total_ingresos: totalM5 + totalM6,
        total_mensualidades: totalM5,
        total_uniformes: totalM6,
        cartera_pendiente: 1250000
      },
      movimientos
    });
  }

  // Ruta no encontrada
  return jsonResponse(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`[API MÓDULO 6] Servidor backend corriendo exitosamente en http://localhost:${PORT}`);
});
