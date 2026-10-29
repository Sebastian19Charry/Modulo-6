-- =============================================================================
-- PROYECTO: Sistema de Gestión para Escuela de Patinaje (FIS)
-- MÓDULO 6: Administración, Reportes, Finanzas e Inventario
-- MOTOR: PostgreSQL
-- AUTORES: Grupo 6 (Sebastián Charry, Bettsy Garcés, Alejandro Junco, Sergio Mendivelso)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PARTE 1: TABLAS PUENTE / CONTRATOS DE INTEGRACIÓN (M1, M2, M3, M5)
-- Nota: Estas tablas simulan las entidades de los otros módulos mientras se
-- trabaja en el repositorio propio del Grupo 6. Al integrar con el repositorio
-- general, el adaptador del Backend apuntará a las tablas reales de cada grupo.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS m1_usuarios_ref (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(150) UNIQUE NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('ADMINISTRADOR', 'CONTADOR', 'PROFESOR', 'FISIOTERAPEUTA', 'PATINADOR', 'ACUDIENTE')),
    cuenta_activa BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS m2_compradores_patinadores_ref (
    id SERIAL PRIMARY KEY,
    tipo_persona VARCHAR(20) NOT NULL CHECK (tipo_persona IN ('PATINADOR', 'ACUDIENTE')),
    tipo_documento VARCHAR(10) NOT NULL,
    numero_documento VARCHAR(30) UNIQUE NOT NULL,
    nombres_completos VARCHAR(150) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS m3_grupos_ref (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS m5_cobros_cartera_ref (
    id SERIAL PRIMARY KEY,
    patinador_id INT NOT NULL REFERENCES m2_compradores_patinadores_ref(id),
    periodo VARCHAR(20) NOT NULL,
    valor_total NUMERIC(12, 2) NOT NULL CHECK (valor_total >= 0),
    saldo_pendiente NUMERIC(12, 2) NOT NULL CHECK (saldo_pendiente >= 0),
    fecha_limite DATE NOT NULL,
    estado_cartera VARCHAR(20) NOT NULL CHECK (estado_cartera IN ('AL_DIA', 'PENDIENTE', 'VENCIDO'))
);

CREATE TABLE IF NOT EXISTS m5_pagos_mensualidades_ref (
    id SERIAL PRIMARY KEY,
    numero_comprobante VARCHAR(30) UNIQUE NOT NULL,
    cobro_id INT REFERENCES m5_cobros_cartera_ref(id),
    patinador_id INT NOT NULL REFERENCES m2_compradores_patinadores_ref(id),
    concepto VARCHAR(150) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    medio_pago VARCHAR(30) NOT NULL CHECK (medio_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'CONSIGNACION')),
    estado VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO' CHECK (estado IN ('REGISTRADO', 'ANULADO'))
);

-- -----------------------------------------------------------------------------
-- PARTE 2: TABLAS PROPIAS DEL MÓDULO 6 (HU-6.1 a HU-6.8)
-- -----------------------------------------------------------------------------

-- 1. Tabla de Personal (HU-6.2 y HU-6.3 / RF-M6-02 y RF-M6-03)
-- Cumple con:
-- - Campos obligatorios: tipo_documento, numero_documento, nombres, apellidos, correo, telefono, cargo, estado_laboral
-- - Unicidad en numero_documento y correo institucional
-- - Borrado lógico mediante estado_laboral ('ACTIVO', 'INACTIVO') sin eliminar historial
-- - Asociación de rol en el sistema ('SIN_ACCESO', 'CONTADOR', 'PROFESOR', 'FISIOTERAPEUTA', 'ADMINISTRADOR')
CREATE TABLE IF NOT EXISTS m6_personal (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES m1_usuarios_ref(id),
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'TI', 'PAS')),
    numero_documento VARCHAR(30) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('Profesor', 'Contador', 'Fisioterapeuta', 'Auxiliar Administrativo', 'Coordinador')),
    rol_sistema VARCHAR(30) NOT NULL DEFAULT 'SIN_ACCESO' CHECK (rol_sistema IN ('SIN_ACCESO', 'CONTADOR', 'PROFESOR', 'FISIOTERAPEUTA', 'ADMINISTRADOR')),
    estado_laboral VARCHAR(15) NOT NULL DEFAULT 'ACTIVO' CHECK (estado_laboral IN ('ACTIVO', 'INACTIVO')),
    fecha_vinculacion DATE NOT NULL DEFAULT CURRENT_DATE,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Inventario de Uniformes (HU-6.6 / RF-M6-06)
-- Cumple con:
-- - Restricción de unicidad compuesta por (referencia, talla, tipo)
-- - Impedir cantidades negativas y precios/costos menores a cero
-- - Borrado lógico (activo BOOLEAN) para no eliminar referencias con movimientos históricos
CREATE TABLE IF NOT EXISTS m6_uniformes (
    id SERIAL PRIMARY KEY,
    referencia VARCHAR(50) NOT NULL,
    nombre_prenda VARCHAR(120) NOT NULL,
    talla VARCHAR(15) NOT NULL,
    tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('COMPETENCIA', 'ENTRENAMIENTO', 'PRESENTACION', 'ACCESORIO')),
    costo NUMERIC(12, 2) NOT NULL CHECK (costo >= 0),
    precio_venta NUMERIC(12, 2) NOT NULL CHECK (precio_venta >= 0),
    cantidad_disponible INT NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
    cantidad_minima INT NOT NULL DEFAULT 5 CHECK (cantidad_minima >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_uniforme_ref_talla_tipo UNIQUE (referencia, talla, tipo)
);

-- 3. Cabecera de Venta de Uniformes (HU-6.7 / RF-M6-07 y HU-6.4 / RF-M6-04)
-- Cumple con:
-- - Registro de fecha, comprador (patinador o acudiente), medio de pago, valor total y comprobante único
-- - Inmutabilidad de ventas confirmadas (solo admiten ajuste/devolución autorizada)
CREATE TABLE IF NOT EXISTS m6_ventas_uniformes (
    id SERIAL PRIMARY KEY,
    numero_comprobante VARCHAR(30) UNIQUE NOT NULL,
    fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
    comprador_id INT NOT NULL REFERENCES m2_compradores_patinadores_ref(id),
    medio_pago VARCHAR(30) NOT NULL CHECK (medio_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'CONSIGNACION')),
    valor_total NUMERIC(12, 2) NOT NULL CHECK (valor_total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA' CHECK (estado IN ('CONFIRMADA', 'DEVUELTA_AJUSTADA')),
    observacion_ajuste TEXT,
    registrado_por VARCHAR(100) NOT NULL DEFAULT 'Administrador',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Detalle de Ítems por Venta de Uniformes (HU-6.7 / RF-M6-07)
-- Permite ventas multi-ítem en una sola transacción atómica
CREATE TABLE IF NOT EXISTS m6_detalle_ventas_uniformes (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL REFERENCES m6_ventas_uniformes(id) ON DELETE RESTRICT,
    uniforme_id INT NOT NULL REFERENCES m6_uniformes(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    valor_unitario NUMERIC(12, 2) NOT NULL CHECK (valor_unitario >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 5. Tabla de Préstamos de Uniformes (HU-6.8 / RF-M6-08)
-- Cumple con:
-- - Registro de estudiante activo, uniforme, talla, fecha_prestamo, fecha_estimada_devolucion, estado_entrega
-- - Estados controlados: ACTIVO, VENCIDO, DEVUELTO, PERDIDA_DANO
-- - Observación justificativa para cierre por pérdida o daño
CREATE TABLE IF NOT EXISTS m6_prestamos_uniformes (
    id SERIAL PRIMARY KEY,
    estudiante_id INT NOT NULL REFERENCES m2_compradores_patinadores_ref(id),
    uniforme_id INT NOT NULL REFERENCES m6_uniformes(id),
    fecha_prestamo DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_estimada_devolucion DATE NOT NULL,
    fecha_devolucion_real DATE,
    estado_entrega VARCHAR(150) NOT NULL,
    estado_recepcion VARCHAR(150),
    estado_prestamo VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado_prestamo IN ('ACTIVO', 'VENCIDO', 'DEVUELTO', 'PERDIDA_DANO')),
    observacion TEXT,
    registrado_por VARCHAR(100) NOT NULL DEFAULT 'Administrador',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_prestamo CHECK (fecha_estimada_devolucion >= fecha_prestamo)
);
