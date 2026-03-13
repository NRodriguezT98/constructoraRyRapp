-- ================================================================
-- MIGRACIÓN: Agregar tipo_documento para validación automática
-- ================================================================
-- Fecha: 2025-12-13
-- Autor: Sistema RyR
-- Descripción: Agrega campo tipo_documento a documentos_cliente
--              para permitir validación automática de requisitos
--              de fuentes de pago
--
-- CAMBIOS:
-- 1. Agregar columna tipo_documento (NULLABLE)
-- 2. Crear índice para búsquedas rápidas
-- 3. Actualizar trigger de vinculación para usar tipo exacto
-- 4. Migrar datos existentes con intento inteligente
-- ================================================================

-- ================================================================
-- PASO 1: Agregar columna tipo_documento
-- ================================================================

ALTER TABLE public.documentos_cliente
ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(100);

COMMENT ON COLUMN public.documentos_cliente.tipo_documento IS
'Tipo específico de documento para validación automática de requisitos de fuentes de pago.
NULL para documentos generales sin validación. Ejemplos: boleta_registro, carta_aprobacion_credito, avaluo_vivienda';

-- ================================================================
-- PASO 2: Crear índice para búsquedas eficientes
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_documentos_cliente_tipo_documento
ON public.documentos_cliente(tipo_documento)
WHERE tipo_documento IS NOT NULL;

-- Índice compuesto para trigger (tipo + fuente en metadata)
CREATE INDEX IF NOT EXISTS idx_documentos_cliente_tipo_metadata_fuente
ON public.documentos_cliente(tipo_documento, ((metadata->>'fuente_pago_id')::UUID))
WHERE tipo_documento IS NOT NULL AND metadata->>'fuente_pago_id' IS NOT NULL;

COMMENT ON INDEX idx_documentos_cliente_tipo_documento IS
'Índice para búsquedas rápidas por tipo de documento en validaciones';

-- ================================================================
-- PASO 3: Actualizar trigger de vinculación automática
-- ================================================================

CREATE OR REPLACE FUNCTION public.vincular_documento_a_paso_fuente()
RETURNS TRIGGER AS $$
DECLARE
  v_fuente_id UUID;
  v_paso_id UUID;
  v_paso_titulo TEXT;
BEGIN
  -- Extraer fuente_pago_id desde metadata del documento
  v_fuente_id := (NEW.metadata->>'fuente_pago_id')::UUID;

  -- ✅ VALIDACIÓN: Solo procesar si hay tipo_documento Y fuente_pago_id
  IF v_fuente_id IS NULL OR NEW.tipo_documento IS NULL THEN
    RETURN NEW; -- Ignorar documentos sin tipo o sin vinculación a fuente
  END IF;

  -- Buscar paso pendiente que coincida EXACTAMENTE con tipo_documento
  SELECT id, titulo INTO v_paso_id, v_paso_titulo
  FROM public.pasos_fuente_pago
  WHERE fuente_pago_id = v_fuente_id
    AND completado = FALSE
    AND tipo_documento_requerido = NEW.tipo_documento  -- ← Comparación exacta
  LIMIT 1;

  -- Si encontramos paso pendiente, auto-completarlo
  IF v_paso_id IS NOT NULL THEN
    -- Actualizar paso a completado
    UPDATE public.pasos_fuente_pago
    SET
      completado = TRUE,
      completado_automaticamente = TRUE,
      documento_id = NEW.id,
      fecha_completado = NOW(),
      fecha_actualizacion = NOW()
    WHERE id = v_paso_id;

    -- Eliminar documentos_pendientes relacionado si existe
    DELETE FROM public.documentos_pendientes
    WHERE fuente_pago_id = v_fuente_id
      AND tipo_documento = NEW.tipo_documento;

    RAISE NOTICE 'Paso % auto-completado con documento % (id: %)',
                 v_paso_titulo, NEW.titulo, NEW.id;
  ELSE
    RAISE NOTICE 'Documento % (tipo: %) subido pero no se encontro paso pendiente para fuente %',
                 NEW.titulo, NEW.tipo_documento, v_fuente_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger (por si ya existe)
DROP TRIGGER IF EXISTS trg_vincular_documento_a_paso_fuente ON public.documentos_cliente;

CREATE TRIGGER trg_vincular_documento_a_paso_fuente
  AFTER INSERT ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.vincular_documento_a_paso_fuente();

COMMENT ON FUNCTION public.vincular_documento_a_paso_fuente() IS
'Auto-completa pasos de validación cuando se sube documento con tipo_documento que coincide exactamente con tipo_documento_requerido del paso pendiente.';

-- ================================================================
-- PASO 4: Actualizar trigger de desvinculación
-- ================================================================

CREATE OR REPLACE FUNCTION public.desvincular_documento_de_paso()
RETURNS TRIGGER AS $$
DECLARE
  v_paso RECORD;
BEGIN
  -- Buscar pasos vinculados a este documento
  FOR v_paso IN
    SELECT * FROM public.pasos_fuente_pago
    WHERE documento_id = OLD.id
  LOOP
    -- Marcar paso como incompleto
    UPDATE public.pasos_fuente_pago
    SET
      completado = FALSE,
      documento_id = NULL,
      fecha_completado = NULL,
      observaciones = COALESCE(observaciones, '') ||
                      E'\n[' || NOW()::TEXT || '] Documento eliminado - requiere nueva carga',
      fecha_actualizacion = NOW()
    WHERE id = v_paso.id;

    -- Recrear documentos_pendientes para notificar
    INSERT INTO public.documentos_pendientes (
      fuente_pago_id,
      cliente_id,
      tipo_documento,
      metadata,
      estado,
      prioridad
    )
    SELECT
      v_paso.fuente_pago_id,
      fp.negociacion_id,  -- Asumir que cliente_id viene de negociacion
      v_paso.tipo_documento_requerido,
      jsonb_build_object(
        'paso_id', v_paso.id,
        'titulo_paso', v_paso.titulo,
        'eliminado_por', auth.uid()
      ),
      'PENDIENTE',
      CASE
        WHEN v_paso.nivel_validacion = 'DOCUMENTO_OBLIGATORIO' THEN 'ALTA'
        ELSE 'MEDIA'
      END
    FROM public.fuentes_pago fp
    WHERE fp.id = v_paso.fuente_pago_id;

    RAISE NOTICE 'Paso % marcado como incompleto por eliminacion de documento %',
                 v_paso.titulo, OLD.titulo;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear trigger
DROP TRIGGER IF EXISTS trg_desvincular_documento_de_paso ON public.documentos_cliente;

CREATE TRIGGER trg_desvincular_documento_de_paso
  AFTER DELETE ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.desvincular_documento_de_paso();

COMMENT ON FUNCTION public.desvincular_documento_de_paso() IS
'Marca pasos como incompletos y recrea documentos_pendientes cuando se elimina un documento vinculado';

-- ================================================================
-- PASO 5: Migrar datos existentes (intento inteligente)
-- ================================================================

DO $$
DECLARE
  v_count INT := 0;
BEGIN
  -- Intentar asignar tipo_documento a documentos existentes basándose en título y categoría
  UPDATE public.documentos_cliente dc
  SET tipo_documento = CASE
    -- Cartas de aprobación de crédito (categoría: Cartas de aprobación...)
    WHEN dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34'
         AND (dc.titulo ILIKE '%carta%aprobaci%n%cr%dito%'
              OR dc.titulo ILIKE '%carta%aprobaci%n%hipoteca%'
              OR dc.titulo ILIKE '%carta%aprobaci%n%banco%')
      THEN 'carta_aprobacion_credito'

    -- Cartas de asignación de subsidio
    WHEN dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34'
         AND (dc.titulo ILIKE '%carta%asignaci%n%subsidio%'
              OR dc.titulo ILIKE '%carta%asignaci%n%mi casa%'
              OR dc.titulo ILIKE '%carta%subsidio%')
      THEN 'carta_asignacion_subsidio'

    -- Boletas de registro (categoría: Certificados de Tradición)
    WHEN dc.categoria_id = 'bd49740e-d46d-43c8-973f-196f1418765c'
         AND dc.titulo ILIKE '%boleta%registro%'
      THEN 'boleta_registro'

    -- Certificados de tradición
    WHEN dc.categoria_id = 'bd49740e-d46d-43c8-973f-196f1418765c'
         AND (dc.titulo ILIKE '%certificado%tradici%n%'
              OR dc.titulo ILIKE '%certificado%libertad%')
      THEN 'certificado_tradicion'

    -- Avalúos (categoría: Gastos Notariales, Avalúos...)
    WHEN dc.categoria_id = 'f84ec757-2f11-4245-a487-5091176feec5'
         AND (dc.titulo ILIKE '%avaluo%'
              OR dc.titulo ILIKE '%aval%o%'
              OR dc.titulo ILIKE '%avalúo%')
      THEN 'avaluo_vivienda'

    -- Escrituras (categoría: Escrituras Públicas)
    WHEN dc.categoria_id = 'a82ca714-b191-4976-a089-66c031ff1496'
         AND dc.titulo ILIKE '%escritura%'
      THEN 'escritura_vivienda'

    -- Minutas
    WHEN dc.categoria_id = 'a82ca714-b191-4976-a089-66c031ff1496'
         AND dc.titulo ILIKE '%minuta%'
      THEN 'minuta_compraventa'

    -- Promesas de compraventa
    WHEN dc.categoria_id = '4898e798-c188-4f02-bfcf-b2b15be48e34'
         AND dc.titulo ILIKE '%promesa%compra%'
      THEN 'promesa_compraventa'

    -- Resto: NULL (documentos generales)
    ELSE NULL
  END
  WHERE dc.tipo_documento IS NULL  -- Solo actualizar si aún no tiene tipo
    AND dc.categoria_id IS NOT NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE 'Migracion completada: % documentos actualizados con tipo_documento', v_count;
END $$;

-- ================================================================
-- PASO 6: Constraint opcional (tipos permitidos)
-- ================================================================

-- Comentado por ahora - descomentar si queremos validación estricta
/*
ALTER TABLE public.documentos_cliente
ADD CONSTRAINT check_tipo_documento_valido
CHECK (
  tipo_documento IS NULL OR
  tipo_documento IN (
    'boleta_registro',
    'certificado_tradicion',
    'carta_aprobacion_credito',
    'carta_asignacion_subsidio',
    'avaluo_vivienda',
    'escritura_vivienda',
    'minuta_compraventa',
    'promesa_compraventa',
    'acta_entrega',
    'estudio_titulos'
  )
);
*/

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
  v_total INT;
  v_con_tipo INT;
  v_sin_tipo INT;
  v_tipo RECORD;
BEGIN
  SELECT COUNT(*) INTO v_total FROM public.documentos_cliente;
  SELECT COUNT(*) INTO v_con_tipo FROM public.documentos_cliente WHERE tipo_documento IS NOT NULL;
  SELECT COUNT(*) INTO v_sin_tipo FROM public.documentos_cliente WHERE tipo_documento IS NULL;

  RAISE NOTICE 'VERIFICACION DE MIGRACION';
  RAISE NOTICE 'Total documentos: %', v_total;
  RAISE NOTICE 'Con tipo_documento: %', v_con_tipo;
  RAISE NOTICE 'Sin tipo_documento: %', v_sin_tipo;

  -- Mostrar distribución de tipos
  RAISE NOTICE 'DISTRIBUCION DE TIPOS:';
  FOR v_tipo IN
    SELECT tipo_documento, COUNT(*) as cantidad
    FROM public.documentos_cliente
    WHERE tipo_documento IS NOT NULL
    GROUP BY tipo_documento
    ORDER BY COUNT(*) DESC
  LOOP
    RAISE NOTICE '%: %', v_tipo.tipo_documento, v_tipo.cantidad;
  END LOOP;
END $$;
