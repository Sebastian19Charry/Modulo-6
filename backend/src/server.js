/**
 * Módulo 6 — Servidor API REST (Sprint 1)
 * Escuela de Patinaje: Administración, Reportes, Finanzas e Inventario
 * 
 * ALCANCE DEL SPRINT 1:
 * - HU-6.2 (RF-M6-02): Registro y administración de personal (CRUD + Borrado Lógico)
 * - HU-6.6 (RF-M6-06): Registro y control de inventario de uniformes (Unicidad compuesta + Stock mínimo)
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 4000;

// Base de datos en memoria para el Sprint 1
const db = {
  personal: [
    { id: 1, tipo_doc: "CC", num_doc: "1018273645", nombres: "Carlos Eduardo", apellidos: "Gómez Ruiz", correo: "carlos.gomez@patinaje.edu.co", tel: "3101234567", cargo: "Profesor", estado: "ACTIVO" },
    { id: 2, tipo_doc: "CC", num_doc: "1029384756", nombres: "Andrea Liliana", apellidos: "Vargas Peña", correo: "andrea.vargas@patinaje.edu.co", tel: "3159876543", cargo: "Profesor", estado: "ACTIVO" },
    { id: 3, tipo_doc: "CC", num_doc: "79483920", nombres: "Mauricio Andrés", apellidos: "Torres Castro", correo: "mauricio.torres@patinaje.edu.co", tel: "3204567890", cargo: "Contador", estado: "ACTIVO" },
    { id: 4, tipo_doc: "CC", num_doc: "80192837", nombres: "Jorge Enrique", apellidos: "Pinzón Silva", correo: "jorge.pinzon@patinaje.edu.co", tel: "3187654321", cargo: "Profesor", estado: "INACTIVO" }
  ],
  uniformes: [
    { id: 1, ref: "UNI-COMP-01", nombre: "Enterizo Competencia Élite", talla: "10", tipo: "COMPETENCIA", costo: 65000, precio: 110000, disponible: 8, minima: 5 },
    { id: 2, ref: "UNI-COMP-01", nombre: "Enterizo Competencia Élite", talla: "12", tipo: "COMPETENCIA", costo: 68000, precio: 115000, disponible: 2, minima: 5 },
    { id: 3, ref: "UNI-ENTR-02", nombre: "Camiseta Entrenamiento Transpirable", talla: "M", tipo: "ENTRENAMIENTO", costo: 25000, precio: 45000, disponible: 18, minima: 6 }
  ]
};

function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
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
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // =========================================================================
  // 1. ENDPOINTS HU-6.2: PERSONAL DE LA ESCUELA (Sebastián y Sergio)
  // =========================================================================

  // Listar personal (con filtro opcional de estado)
  if (path === '/api/personal' && method === 'GET') {
    const estado = parsedUrl.query.estado;
    if (estado && estado !== 'TODOS') {
      return jsonResponse(res, 200, db.personal.filter(p => p.estado === estado));
    }
    return jsonResponse(res, 200, db.personal);
  }

  // Registrar trabajador (validando unicidad de documento y correo)
  if (path === '/api/personal' && method === 'POST') {
    const data = await parseBody(req);

    if (!data.tipo_doc || !data.num_doc || !data.nombres || !data.apellidos || !data.correo || !data.tel || !data.cargo) {
      return jsonResponse(res, 400, { error: "Todos los campos marcados con (*) son obligatorios según HU-6.2." });
    }

    if (db.personal.some(p => p.num_doc === data.num_doc)) {
      return jsonResponse(res, 400, { error: `Ya existe un trabajador registrado con el documento ${data.num_doc}.` });
    }

    if (db.personal.some(p => p.correo.toLowerCase() === data.correo.toLowerCase())) {
      return jsonResponse(res, 400, { error: `Ya existe un trabajador registrado con el correo institucional ${data.correo}.` });
    }

    const nuevo = {
      id: db.personal.length + 1,
      tipo_doc: data.tipo_doc,
      num_doc: data.num_doc,
      nombres: data.nombres,
      apellidos: data.apellidos,
      correo: data.correo,
      tel: data.tel,
      cargo: data.cargo,
      estado: "ACTIVO"
    };

    db.personal.push(nuevo);
    return jsonResponse(res, 201, nuevo);
  }

  // Desactivar trabajador (Borrado lógico)
  if (path.startsWith('/api/personal/') && path.endsWith('/desactivar') && method === 'PATCH') {
    const id = parseInt(path.split('/')[3]);
    const p = db.personal.find(x => x.id === id);
    if (!p) return jsonResponse(res, 404, { error: "Trabajador no encontrado." });
    p.estado = "INACTIVO";
    return jsonResponse(res, 200, { mensaje: "Trabajador desactivado exitosamente (borrado lógico).", trabajador: p });
  }

  // =========================================================================
  // 2. ENDPOINTS HU-6.6: INVENTARIO DE UNIFORMES (Bettsy y Alejandro)
  // =========================================================================

  // Listar uniformes
  if (path === '/api/uniformes' && method === 'GET') {
    return jsonResponse(res, 200, db.uniformes);
  }

  // Registrar nueva referencia (validando unicidad de referencia + talla + tipo)
  if (path === '/api/uniformes' && method === 'POST') {
    const data = await parseBody(req);

    if (!data.ref || !data.nombre || !data.talla || !data.tipo || data.costo === undefined || data.precio === undefined) {
      return jsonResponse(res, 400, { error: "Todos los campos de la prenda son obligatorios según HU-6.6." });
    }

    if (data.costo < 0 || data.precio < 0 || data.disponible < 0) {
      return jsonResponse(res, 400, { error: "Los valores numéricos no pueden ser negativos." });
    }

    const duplicado = db.uniformes.some(u => u.ref === data.ref.toUpperCase() && u.talla === data.talla && u.tipo === data.tipo);
    if (duplicado) {
      return jsonResponse(res, 400, { error: `Restricción de unicidad: ya existe una prenda con referencia ${data.ref}, talla ${data.talla} y tipo ${data.tipo}.` });
    }

    const nuevo = {
      id: db.uniformes.length + 1,
      ref: data.ref.toUpperCase(),
      nombre: data.nombre,
      talla: data.talla,
      tipo: data.tipo,
      costo: Number(data.costo),
      precio: Number(data.precio),
      disponible: Number(data.disponible) || 0,
      minima: Number(data.minima) || 5
    };

    db.uniformes.push(nuevo);
    return jsonResponse(res, 201, nuevo);
  }

  // Ajustar cantidad de stock
  if (path.startsWith('/api/uniformes/') && path.endsWith('/stock') && method === 'PATCH') {
    const id = parseInt(path.split('/')[3]);
    const u = db.uniformes.find(x => x.id === id);
    if (!u) return jsonResponse(res, 404, { error: "Prenda no encontrada." });
    const data = await parseBody(req);
    if (data.disponible === undefined || data.disponible < 0) {
      return jsonResponse(res, 400, { error: "Cantidad inválida o negativa." });
    }
    u.disponible = Number(data.disponible);
    return jsonResponse(res, 200, { mensaje: "Stock actualizado.", uniforme: u });
  }

  // Ruta por defecto no encontrada
  return jsonResponse(res, 404, { error: "Ruta no encontrada en el Sprint 1." });
});

server.listen(PORT, () => {
  console.log(`[API SPRINT 1 — MÓDULO 6] Corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`- GET/POST  /api/personal   (HU-6.2: Sebastián y Sergio)`);
  console.log(`- GET/POST  /api/uniformes  (HU-6.6: Bettsy y Alejandro)`);
});
