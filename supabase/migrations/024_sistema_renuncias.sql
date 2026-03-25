-- =====================================================
-- MIGRACIÓN 024: SISTEMA DE RENUNCIAS — ACTUALIZACIÓN
-- =====================================================
-- Fecha: 2026-03-25
-- Spec: docs/superpowers/specs/2026-03-24-sistema-renuncias-design.md
-- Descripción:
--   1. Agregar columnas de retención y snapshots extendidos
--   2. Eliminar estado 'Cancelada' y columnas asociadas
--   3. Actualizar trigger calcular_monto_devolver (con retención)
--   4. Crear función RPC registrar_renuncia_completa (atómica)
--   5. Deprecar validar_cancelacion_renuncia
--   6. Actualizar vistas
--   7. Agregar UNIQUE constraint en negociacion_id
--   8. RLS policies
--   9. Storage bucket para comprobantes
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: AGREGAR COLUMNAS NUEVAS
-- =====================================================

-- Retención (penalización opcional)
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS retencion_monto NUMERIC(15,2) NOT NULL DEFAULT 0;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS retencion_motivo TEXT;

-- Snapshots extendidos (JSONB para datos congelados)
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS vivienda_datos_snapshot JSONB;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS cliente_datos_snapshot JSONB;

ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS negociacion_datos_snapshot JSONB;

-- Notas de cierre
ALTER TABLE public.renuncias
ADD COLUMN IF NOT EXISTS notas_cierre TEXT;

-- =====================================================
-- PARTE 2: ELIMINAR ESTADO 'Cancelada' Y COLUMNAS OBSOLETAS
-- =====================================================

-- Verificar que no hay renuncias en estado 'Cancelada' antes de eliminar
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.renuncias
  WHERE estado = 'Cancelada';

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Existen % renuncias en estado Cancelada. Migrar datos antes de eliminar el estado.', v_count;
  END IF;
END;
$$;

-- Eliminar constraint de estado actual
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_estado_check;

-- Crear nuevo constraint sin 'Cancelada'
ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_estado_check CHECK (
  estado IN ('Pendiente Devolución', 'Cerrada')
);

-- Eliminar constraint de cancelación
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_cancelada_motivo_check;

-- Eliminar columnas obsoletas de cancelación
ALTER TABLE public.renuncias
DROP COLUMN IF EXISTS fecha_cancelacion;

ALTER TABLE public.renuncias
DROP COLUMN IF EXISTS motivo_cancelacion;

ALTER TABLE public.renuncias
DROP COLUMN IF EXISTS usuario_cancelacion;

-- =====================================================
-- PARTE 3: AGREGAR CONSTRAINTS NUEVOS
-- =====================================================

-- Retención requiere justificación
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_retencion_justificacion_check;

ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_retencion_justificacion_check CHECK (
  retencion_monto = 0 OR retencion_motivo IS NOT NULL
);

-- UNIQUE: una renuncia por negociación
ALTER TABLE public.renuncias
DROP CONSTRAINT IF EXISTS renuncias_negociacion_uq;

ALTER TABLE public.renuncias
ADD CONSTRAINT renuncias_negociacion_uq UNIQUE (negociacion_id);

-- =====================================================
-- PARTE 4: ACTUALIZAR TRIGGER calcular_monto_devolver
-- =====================================================
-- Ahora resta la retención del total a devolver

CREATE OR REPLACE FUNCTION calcular_monto_devolver()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_monto_cuota_inicial NUMERIC;
  v_retencion NUMERIC;
  v_monto_neto NUMERIC;
BEGIN
  -- Calcular suma de abonos de Cuota Inicial
  SELECT COALESCE(SUM(monto_recibido), 0)
  INTO v_monto_cuota_inicial
  FROM fuentes_pago
  WHERE negociacion_id = NEW.negociacion_id
    AND tipo = 'Cuota Inicial'
    AND monto_recibido > 0;

  -- Obtener retención (ya viene en el INSERT)
  v_retencion := COALESCE(NEW.retencion_monto, 0);

  -- Validar que retención no supere cuota inicial
  IF v_retencion > v_monto_cuota_inicial THEN
    RAISE EXCEPTION 'La retención ($%) no puede superar la cuota inicial abonada ($%)',
      v_retencion, v_monto_cuota_inicial;
  END IF;

  -- Calcular monto neto a devolver
  v_monto_neto := v_monto_cuota_inicial - v_retencion;

  -- Asignar valores
  NEW.monto_a_devolver := v_monto_neto;
  NEW.requiere_devolucion := (v_monto_neto > 0);

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

COMMENT ON FUNCTION calcular_monto_devolver IS
'Calcula monto_a_devolver = SUM(Cuota Inicial) - retención. Si monto = 0, cierra automáticamente.';

-- =====================================================
-- PARTE 5: FUNCIÓN RPC registrar_renuncia_completa
-- =====================================================
-- Transacción atómica: validaciones + snapshots + cascada

CREATE OR REPLACE FUNCTION registrar_renuncia_completa(
  p_negociacion_id UUID,
  p_motivo TEXT,
  p_retencion_monto NUMERIC DEFAULT 0,
  p_retencion_motivo TEXT DEFAULT NULL,
  p_notas TEXT DEFAULT NULL,
  p_usuario_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_negociacion RECORD;
  v_cliente RECORD;
  v_vivienda RECORD;
  v_proyecto_nombre TEXT;
  v_tiene_desembolso BOOLEAN;
  v_renuncia_existente UUID;
  v_snapshot_abonos JSONB;
  v_snapshot_cliente JSONB;
  v_snapshot_vivienda JSONB;
  v_snapshot_negociacion JSONB;
  v_renuncia_id UUID;
  v_renuncia RECORD;
BEGIN
  -- ═══════════════════════════════════════
  -- VALIDACIÓN 1: Negociación existe y estado válido
  -- ═══════════════════════════════════════
  SELECT n.*, c.id AS cli_id, v.id AS viv_id
  INTO v_negociacion
  FROM negociaciones n
  INNER JOIN clientes c ON c.id = n.cliente_id
  INNER JOIN viviendas v ON v.id = n.vivienda_id
  WHERE n.id = p_negociacion_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Negociación no encontrada: %', p_negociacion_id;
  END IF;

  IF v_negociacion.estado NOT IN ('Activa', 'Suspendida') THEN
    RAISE EXCEPTION 'Solo se pueden renunciar negociaciones Activas o Suspendidas. Estado actual: %', v_negociacion.estado;
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 2: Sin renuncia previa
  -- ═══════════════════════════════════════
  SELECT id INTO v_renuncia_existente
  FROM renuncias
  WHERE negociacion_id = p_negociacion_id;

  IF FOUND THEN
    RAISE EXCEPTION 'Ya existe una renuncia para esta negociación';
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 3: Sin desembolsos bloqueantes
  -- ═══════════════════════════════════════
  SELECT EXISTS(
    SELECT 1
    FROM fuentes_pago
    WHERE negociacion_id = p_negociacion_id
      AND tipo IN ('Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Caja de Compensación')
      AND COALESCE(monto_desembolsado, 0) > 0
  ) INTO v_tiene_desembolso;

  IF v_tiene_desembolso THEN
    RAISE EXCEPTION 'No se puede renunciar: existen fuentes con desembolsos realizados (Crédito Hipotecario, Subsidio o Caja de Compensación)';
  END IF;

  -- ═══════════════════════════════════════
  -- VALIDACIÓN 4: Retención con justificación
  -- ═══════════════════════════════════════
  IF COALESCE(p_retencion_monto, 0) > 0 AND (p_retencion_motivo IS NULL OR TRIM(p_retencion_motivo) = '') THEN
    RAISE EXCEPTION 'Si la retención es mayor a 0, debe proporcionar una justificación';
  END IF;

  -- ═══════════════════════════════════════
  -- OBTENER SNAPSHOTS
  -- ═══════════════════════════════════════

  -- Snapshot de abonos (fuentes de pago)
  v_snapshot_abonos := obtener_snapshot_abonos(p_negociacion_id);

  -- Snapshot del cliente
  SELECT jsonb_build_object(
    'id', c.id,
    'nombre_completo', c.nombre_completo,
    'numero_documento', c.numero_documento,
    'tipo_documento', c.tipo_documento,
    'telefono', c.telefono,
    'email', c.email,
    'estado', c.estado
  ) INTO v_snapshot_cliente
  FROM clientes c
  WHERE c.id = v_negociacion.cliente_id;

  -- Snapshot de vivienda
  SELECT jsonb_build_object(
    'id', v.id,
    'numero', v.numero,
    'estado', v.estado,
    'valor_total', v.valor_total,
    'area', v.area,
    'manzana', m.nombre,
    'proyecto', p.nombre
  ) INTO v_snapshot_vivienda
  FROM viviendas v
  INNER JOIN manzanas m ON m.id = v.manzana_id
  INNER JOIN proyectos p ON p.id = m.proyecto_id
  WHERE v.id = v_negociacion.vivienda_id;

  -- Extraer nombre de proyecto
  v_proyecto_nombre := v_snapshot_vivienda->>'proyecto';

  -- Snapshot de negociación
  SELECT jsonb_build_object(
    'id', n.id,
    'estado', n.estado,
    'valor_total', n.valor_total,
    'saldo_pendiente', n.saldo_pendiente,
    'fecha_creacion', n.fecha_creacion
  ) INTO v_snapshot_negociacion
  FROM negociaciones n
  WHERE n.id = p_negociacion_id;

  -- ═══════════════════════════════════════
  -- INSERT RENUNCIA (trigger calcula montos)
  -- ═══════════════════════════════════════
  INSERT INTO renuncias (
    negociacion_id,
    vivienda_id,
    cliente_id,
    motivo,
    fecha_renuncia,
    retencion_monto,
    retencion_motivo,
    notas_cierre,
    vivienda_valor_snapshot,
    vivienda_datos_snapshot,
    cliente_datos_snapshot,
    negociacion_datos_snapshot,
    abonos_snapshot,
    usuario_registro
  ) VALUES (
    p_negociacion_id,
    v_negociacion.vivienda_id,
    v_negociacion.cliente_id,
    TRIM(p_motivo),
    NOW(),
    COALESCE(p_retencion_monto, 0),
    CASE WHEN COALESCE(p_retencion_monto, 0) > 0 THEN TRIM(p_retencion_motivo) ELSE NULL END,
    TRIM(NULLIF(p_notas, '')),
    (v_snapshot_vivienda->>'valor_total')::NUMERIC,
    v_snapshot_vivienda,
    v_snapshot_cliente,
    v_snapshot_negociacion,
    v_snapshot_abonos,
    p_usuario_id
  )
  RETURNING id INTO v_renuncia_id;

  -- ═══════════════════════════════════════
  -- CASCADA: Actualizar negociación
  -- ═══════════════════════════════════════
  UPDATE negociaciones
  SET estado = 'Cerrada por Renuncia',
      fecha_renuncia_efectiva = NOW(),
      fecha_actualizacion = NOW()
  WHERE id = p_negociacion_id;

  -- ═══════════════════════════════════════
  -- CASCADA: Liberar vivienda
  -- ═══════════════════════════════════════
  UPDATE viviendas
  SET estado = 'Disponible',
      cliente_id = NULL,
      negociacion_id = NULL,
      fecha_actualizacion = NOW()
  WHERE id = v_negociacion.vivienda_id;

  -- ═══════════════════════════════════════
  -- CASCADA: Inactivar fuentes de pago
  -- ═══════════════════════════════════════
  UPDATE fuentes_pago
  SET estado = 'Inactiva',
      fecha_actualizacion = NOW()
  WHERE negociacion_id = p_negociacion_id;

  -- ═══════════════════════════════════════
  -- AUDITORÍA
  -- ═══════════════════════════════════════
  INSERT INTO audit_log (
    tabla,
    registro_id,
    accion,
    usuario_id,
    datos_nuevos,
    metadata,
    fecha
  ) VALUES (
    'renuncias',
    v_renuncia_id,
    'RENUNCIA_REGISTRADA',
    p_usuario_id,
    jsonb_build_object(
      'negociacion_id', p_negociacion_id,
      'cliente_id', v_negociacion.cliente_id,
      'vivienda_id', v_negociacion.vivienda_id,
      'motivo', p_motivo,
      'retencion_monto', p_retencion_monto
    ),
    jsonb_build_object(
      'proyecto', v_proyecto_nombre,
      'cliente_nombre', v_snapshot_cliente->>'nombre_completo',
      'vivienda_numero', v_snapshot_vivienda->>'numero'
    ),
    NOW()
  );

  -- ═══════════════════════════════════════
  -- RETORNAR RENUNCIA COMPLETA
  -- ═══════════════════════════════════════
  SELECT * INTO v_renuncia
  FROM renuncias
  WHERE id = v_renuncia_id;

  RETURN jsonb_build_object(
    'id', v_renuncia.id,
    'negociacion_id', v_renuncia.negociacion_id,
    'vivienda_id', v_renuncia.vivienda_id,
    'cliente_id', v_renuncia.cliente_id,
    'motivo', v_renuncia.motivo,
    'fecha_renuncia', v_renuncia.fecha_renuncia,
    'estado', v_renuncia.estado,
    'monto_a_devolver', v_renuncia.monto_a_devolver,
    'requiere_devolucion', v_renuncia.requiere_devolucion,
    'retencion_monto', v_renuncia.retencion_monto,
    'retencion_motivo', v_renuncia.retencion_motivo
  );
END;
$$;

COMMENT ON FUNCTION registrar_renuncia_completa IS
'RPC atómica: valida, genera snapshots, inserta renuncia, y ejecuta cascada (negociación, vivienda, fuentes, auditoría). Todo o nada.';

-- =====================================================
-- PARTE 6: DEPRECAR FUNCIÓN DE CANCELACIÓN
-- =====================================================

DROP FUNCTION IF EXISTS validar_cancelacion_renuncia(UUID);

-- =====================================================
-- PARTE 7: ACTUALIZAR VISTAS
-- =====================================================

-- Eliminar vistas existentes antes de recrear con columnas diferentes
DROP VIEW IF EXISTS v_renuncias_completas;
DROP VIEW IF EXISTS v_renuncias_pendientes;
DROP VIEW IF EXISTS v_negociaciones_completas;

-- Vista de negociaciones completas (sin referencia a 'Cancelada')
CREATE OR REPLACE VIEW v_negociaciones_completas AS
SELECT
  n.id,
  n.estado AS estado_negociacion,
  n.fecha_creacion,
  n.valor_total,
  n.saldo_pendiente,
  n.fecha_completada,
  n.fecha_renuncia_efectiva,
  c.id AS cliente_id,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.estado AS estado_cliente,
  v.id AS vivienda_id,
  v.numero AS vivienda_numero,
  v.estado AS estado_vivienda,
  v.valor_total AS vivienda_valor,
  v.fecha_entrega,
  p.id AS proyecto_id,
  p.nombre AS proyecto_nombre,
  r.id AS renuncia_id,
  r.estado AS estado_renuncia,
  r.fecha_renuncia,
  r.requiere_devolucion,
  r.monto_a_devolver,
  r.retencion_monto
FROM negociaciones n
INNER JOIN clientes c ON c.id = n.cliente_id
INNER JOIN viviendas v ON v.id = n.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
LEFT JOIN renuncias r ON r.negociacion_id = n.id;

-- Vista de renuncias pendientes (mejorada con retención)
CREATE OR REPLACE VIEW v_renuncias_pendientes AS
SELECT
  r.id,
  r.fecha_renuncia,
  r.motivo,
  r.monto_a_devolver,
  r.retencion_monto,
  r.retencion_motivo,
  r.requiere_devolucion,
  c.id AS cliente_id,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.telefono AS cliente_telefono,
  v.numero AS vivienda_numero,
  p.nombre AS proyecto_nombre,
  n.valor_total AS negociacion_valor_total,
  EXTRACT(DAY FROM (NOW() - r.fecha_renuncia))::INTEGER AS dias_pendiente
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = n.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
WHERE r.estado = 'Pendiente Devolución'
ORDER BY r.fecha_renuncia ASC;

-- Vista completa de renuncias (para dashboard)
CREATE OR REPLACE VIEW v_renuncias_completas AS
SELECT
  r.*,
  c.nombre_completo AS cliente_nombre,
  c.numero_documento AS cliente_documento,
  c.telefono AS cliente_telefono,
  v.numero AS vivienda_numero,
  m.nombre AS manzana_nombre,
  p.id AS proyecto_id,
  p.nombre AS proyecto_nombre,
  n.valor_total AS negociacion_valor_total,
  EXTRACT(DAY FROM (NOW() - r.fecha_renuncia))::INTEGER AS dias_desde_renuncia
FROM renuncias r
INNER JOIN negociaciones n ON n.id = r.negociacion_id
INNER JOIN clientes c ON c.id = r.cliente_id
INNER JOIN viviendas v ON v.id = r.vivienda_id
INNER JOIN manzanas m ON m.id = v.manzana_id
INNER JOIN proyectos p ON p.id = m.proyecto_id
ORDER BY r.fecha_renuncia DESC;

COMMENT ON VIEW v_renuncias_completas IS
'Vista completa de renuncias con datos de cliente, vivienda y proyecto para el dashboard.';

-- =====================================================
-- PARTE 8: RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.renuncias ENABLE ROW LEVEL SECURITY;

-- SELECT: todos los autenticados
DROP POLICY IF EXISTS "renuncias_select_authenticated" ON public.renuncias;
CREATE POLICY "renuncias_select_authenticated" ON public.renuncias
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: solo admin
DROP POLICY IF EXISTS "renuncias_insert_admin" ON public.renuncias;
CREATE POLICY "renuncias_insert_admin" ON public.renuncias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'Administrador'
        AND usuarios.estado = 'Activo'
    )
  );

-- UPDATE: solo admin
DROP POLICY IF EXISTS "renuncias_update_admin" ON public.renuncias;
CREATE POLICY "renuncias_update_admin" ON public.renuncias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'Administrador'
        AND usuarios.estado = 'Activo'
    )
  );

-- DELETE: nadie (renuncias son permanentes)
DROP POLICY IF EXISTS "renuncias_delete_none" ON public.renuncias;

-- =====================================================
-- PARTE 9: STORAGE BUCKET PARA COMPROBANTES
-- =====================================================

-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('renuncias-comprobantes', 'renuncias-comprobantes', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admin puede subir
DROP POLICY IF EXISTS "renuncias_comprobantes_insert" ON storage.objects;
CREATE POLICY "renuncias_comprobantes_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'renuncias-comprobantes'
    AND EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE usuarios.id = auth.uid()
        AND usuarios.rol = 'Administrador'
        AND usuarios.estado = 'Activo'
    )
  );

-- Policy: Autenticados pueden leer
DROP POLICY IF EXISTS "renuncias_comprobantes_select" ON storage.objects;
CREATE POLICY "renuncias_comprobantes_select" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'renuncias-comprobantes');

-- =====================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- =====================================================
-- Ejecutar después para verificar:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'renuncias'
-- ORDER BY ordinal_position;
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'renuncias'::regclass;

COMMIT;
