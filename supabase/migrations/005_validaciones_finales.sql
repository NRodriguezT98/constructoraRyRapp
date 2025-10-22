-- =====================================================
-- MIGRACIÓN 005: VALIDACIONES FINALES Y CONSISTENCIA
-- =====================================================
-- Fecha: 2025-10-22
-- Descripción: Crear constraints de integridad entre tablas
-- Referencia: docs/DEFINICION-ESTADOS-SISTEMA.md
-- =====================================================

-- =====================================================
-- PARTE 1: VALIDACIONES DE SINCRONIZACIÓN DE ESTADOS
-- =====================================================

-- VALIDACIÓN 1: Cliente Activo debe tener al menos 1 negociación Activa
-- Nota: Esto es difícil de hacer con constraint CHECK, mejor con trigger
-- Por ahora solo documentamos la regla

COMMENT ON COLUMN public.clientes.estado IS
'Estado del cliente. REGLA: Cliente Activo debe tener al menos 1 negociación con estado Activa. Cliente Propietario debe tener al menos 1 negociación Completada.';

-- VALIDACIÓN 2: Vivienda Asignada debe estar vinculada a negociación Activa
-- Ya tenemos constraint viviendas_asignada_tiene_cliente
-- Agreguemos validación de negociacion_id

ALTER TABLE public.viviendas
DROP CONSTRAINT IF EXISTS viviendas_asignada_tiene_negociacion;

ALTER TABLE public.viviendas
ADD CONSTRAINT viviendas_asignada_tiene_negociacion CHECK (
  (estado != 'Asignada') OR
  (estado = 'Asignada' AND negociacion_id IS NOT NULL)
);

-- VALIDACIÓN 3: Vivienda Entregada debe estar vinculada a negociación Completada
-- Esto requiere trigger, por ahora solo documentamos

COMMENT ON COLUMN public.viviendas.estado IS
'Estado de la vivienda. REGLA: Asignada debe tener cliente_id y negociacion_id. Entregada debe tener fecha_entrega y estar vinculada a negociación Completada.';

-- =====================================================
-- PARTE 2: CREAR FUNCIÓN PARA VALIDAR CANCELACIÓN DE RENUNCIA
-- =====================================================

-- Función que valida si una renuncia puede cancelarse
CREATE OR REPLACE FUNCTION validar_cancelacion_renuncia(
  p_renuncia_id UUID
)
RETURNS TABLE(
  puede_cancelar BOOLEAN,
  mensaje_error TEXT,
  vivienda_disponible BOOLEAN,
  precio_igual BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_vivienda_id UUID;
  v_precio_actual NUMERIC;
  v_precio_snapshot NUMERIC;
  v_estado_vivienda VARCHAR;
BEGIN
  -- Obtener datos de la renuncia
  SELECT
    r.vivienda_id,
    r.vivienda_valor_snapshot,
    v.estado,
    v.valor_total
  INTO
    v_vivienda_id,
    v_precio_snapshot,
    v_estado_vivienda,
    v_precio_actual
  FROM renuncias r
  INNER JOIN viviendas v ON v.id = r.vivienda_id
  WHERE r.id = p_renuncia_id;

  -- Validación 1: Vivienda debe estar Disponible
  vivienda_disponible := (v_estado_vivienda = 'Disponible');

  -- Validación 2: Precio no debe haber cambiado
  precio_igual := (v_precio_actual = v_precio_snapshot);

  -- Determinar si puede cancelar
  puede_cancelar := (vivienda_disponible AND precio_igual);

  -- Generar mensaje de error
  IF NOT puede_cancelar THEN
    IF NOT vivienda_disponible THEN
      mensaje_error := 'La vivienda ya fue asignada a otro cliente';
    ELSIF NOT precio_igual THEN
      mensaje_error := 'El precio de la vivienda cambió de $' || v_precio_snapshot || ' a $' || v_precio_actual;
    END IF;
  ELSE
    mensaje_error := NULL;
  END IF;

  RETURN QUERY SELECT puede_cancelar, mensaje_error, vivienda_disponible, precio_igual;
END;
$$;

COMMENT ON FUNCTION validar_cancelacion_renuncia IS
'Valida si una renuncia puede cancelarse: vivienda debe estar Disponible y precio no debe haber cambiado';

-- =====================================================
-- PARTE 3: TRIGGER PARA CALCULAR MONTO A DEVOLVER
-- =====================================================

-- Función que calcula monto a devolver automáticamente
CREATE OR REPLACE FUNCTION calcular_monto_devolver()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_monto_total NUMERIC;
BEGIN
  -- Calcular suma de abonos de Cuota Inicial
  SELECT COALESCE(SUM(monto_recibido), 0)
  INTO v_monto_total
  FROM fuentes_pago
  WHERE negociacion_id = NEW.negociacion_id
    AND tipo = 'Cuota Inicial'
    AND monto_recibido > 0;

  -- Asignar valores
  NEW.monto_a_devolver := v_monto_total;
  NEW.requiere_devolucion := (v_monto_total > 0);

  -- Si no requiere devolución, cerrar automáticamente
  IF NEW.requiere_devolucion = false THEN
    NEW.estado := 'Cerrada';
    NEW.fecha_cierre := NOW();
  ELSE
    NEW.estado := 'Pendiente Devolución';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger que ejecuta la función al insertar renuncia
DROP TRIGGER IF EXISTS trigger_calcular_monto_devolver ON public.renuncias;

CREATE TRIGGER trigger_calcular_monto_devolver
  BEFORE INSERT ON public.renuncias
  FOR EACH ROW
  EXECUTE FUNCTION calcular_monto_devolver();

COMMENT ON TRIGGER trigger_calcular_monto_devolver ON public.renuncias IS
'Calcula automáticamente monto_a_devolver sumando abonos de Cuota Inicial. Si es 0, cierra renuncia automáticamente.';

-- =====================================================
-- PARTE 4: FUNCIÓN HELPER PARA OBTENER SNAPSHOT DE ABONOS
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_snapshot_abonos(
  p_negociacion_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'tipo', tipo,
      'entidad', entidad,
      'monto_aprobado', monto_aprobado,
      'monto_recibido', monto_recibido,
      'estado', estado,
      'fecha_aprobacion', fecha_aprobacion,
      'fecha_desembolso', fecha_desembolso
    )
  )
  INTO v_snapshot
  FROM fuentes_pago
  WHERE negociacion_id = p_negociacion_id;

  RETURN v_snapshot;
END;
$$;

COMMENT ON FUNCTION obtener_snapshot_abonos IS
'Genera un JSON con el snapshot de todas las fuentes de pago de una negociación (para auditoría)';

-- =====================================================
-- PARTE 5: ÍNDICES COMPUESTOS PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para buscar cliente activo con vivienda asignada
CREATE INDEX IF NOT EXISTS idx_clientes_activo_vivienda
ON public.clientes(id, estado)
WHERE estado = 'Activo';

-- Índice para buscar negociaciones activas por cliente
CREATE INDEX IF NOT EXISTS idx_negociaciones_activas_cliente
ON public.negociaciones(cliente_id, estado, fecha_creacion DESC)
WHERE estado = 'Activa';

-- Índice para buscar viviendas disponibles por proyecto
CREATE INDEX IF NOT EXISTS idx_viviendas_disponibles_manzana
ON public.viviendas(manzana_id, estado, numero)
WHERE estado = 'Disponible';

-- =====================================================
-- PARTE 6: VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista de negociaciones con información completa
CREATE OR REPLACE VIEW v_negociaciones_completas AS
SELECT
  n.id,
  n.estado AS estado_negociacion,
  n.fecha_creacion,
  n.valor_total,
  n.saldo_pendiente,
  n.fecha_completada,
  n.fecha_renuncia_efectiva,

  -- Cliente
  c.id AS cliente_id,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.estado AS estado_cliente,

  -- Vivienda
  v.id AS vivienda_id,
  v.numero AS vivienda_numero,
  v.estado AS estado_vivienda,
  v.valor_total AS vivienda_valor,
  v.fecha_entrega,

  -- Proyecto (via manzana)
  p.id AS proyecto_id,
  p.nombre AS proyecto_nombre,

  -- Renuncia (si existe)
  r.id AS renuncia_id,
  r.estado AS estado_renuncia,
  r.fecha_renuncia,
  r.requiere_devolucion,
  r.monto_a_devolver

FROM negociaciones n
INNER JOIN clientes c ON c.id = n.cliente_id
INNER JOIN viviendas v ON v.id = n.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
LEFT JOIN renuncias r ON r.negociacion_id = n.id AND r.estado != 'Cancelada';

COMMENT ON VIEW v_negociaciones_completas IS
'Vista con información completa de negociaciones, incluye cliente, vivienda, proyecto y renuncia (si aplica)';

-- Vista de renuncias pendientes de devolución
CREATE OR REPLACE VIEW v_renuncias_pendientes AS
SELECT
  r.id,
  r.fecha_renuncia,
  r.motivo,
  r.monto_a_devolver,

  -- Cliente
  c.id AS cliente_id,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.telefono AS cliente_telefono,

  -- Vivienda
  v.numero AS vivienda_numero,
  p.nombre AS proyecto_nombre,

  -- Negociación
  n.valor_total AS negociacion_valor_total,

  -- Días transcurridos
  EXTRACT(DAY FROM (NOW() - r.fecha_renuncia))::INTEGER AS dias_pendiente

FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = n.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
WHERE r.estado = 'Pendiente Devolución'
ORDER BY r.fecha_renuncia ASC;

COMMENT ON VIEW v_renuncias_pendientes IS
'Vista de renuncias que tienen devolución pendiente, ordenadas por antigüedad';

-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Consultas de validación:

-- 1. Verificar estados de todas las tablas
-- SELECT 'clientes' as tabla, estado, COUNT(*) FROM clientes GROUP BY estado
-- UNION ALL
-- SELECT 'viviendas', estado, COUNT(*) FROM viviendas GROUP BY estado
-- UNION ALL
-- SELECT 'negociaciones', estado, COUNT(*) FROM negociaciones GROUP BY estado
-- UNION ALL
-- SELECT 'renuncias', estado, COUNT(*) FROM renuncias GROUP BY estado;

-- 2. Verificar integridad de viviendas asignadas
-- SELECT COUNT(*) FROM viviendas WHERE estado = 'Asignada' AND (cliente_id IS NULL OR negociacion_id IS NULL);
-- -- Debe ser 0

-- 3. Verificar integridad de negociaciones completadas
-- SELECT COUNT(*) FROM negociaciones WHERE estado = 'Completada' AND (porcentaje_completado != 100 OR fecha_completada IS NULL);
-- -- Debe ser 0

-- 4. Verificar integridad de renuncias
-- SELECT COUNT(*) FROM renuncias WHERE requiere_devolucion = true AND monto_a_devolver = 0;
-- -- Debe ser 0

-- 5. Probar función de validación de cancelación
-- SELECT * FROM validar_cancelacion_renuncia('uuid-de-renuncia-aqui');

-- =====================================================
-- FIN DE MIGRACIONES
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ MIGRACIONES COMPLETADAS EXITOSAMENTE';
  RAISE NOTICE '📋 Ejecutar consultas de validación para verificar integridad';
  RAISE NOTICE '📄 Referencia: docs/DEFINICION-ESTADOS-SISTEMA.md';
END $$;
