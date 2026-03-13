-- ============================================
-- VINCULAR MANUALMENTE DOCUMENTO COMFANDI EXISTENTE
-- ============================================
--
-- Contexto: Documento fue subido ANTES de que existiera el trigger
-- Solución: Vincular manualmente usando misma lógica del trigger
--
-- Documento: d4aa2a76-95c9-4adc-96e0-ef0b68978bc9
-- Pendiente: a87dedc0-dc9f-4dec-8c92-0094227de63e
-- Fuente Pago: 65dc5c6d-e1b7-4e14-803c-8b5cff8c3cfb
-- ============================================

BEGIN;

-- 1️⃣ Actualizar fuente_pago con URL del documento
UPDATE fuentes_pago
SET
  carta_aprobacion_url = (
    SELECT url_storage
    FROM documentos_cliente
    WHERE id = 'd4aa2a76-95c9-4adc-96e0-ef0b68978bc9'
  ),
  estado_documentacion = 'Completo',
  fecha_actualizacion = NOW()
WHERE id = '65dc5c6d-e1b7-4e14-803c-8b5cff8c3cfb';

-- 2️⃣ Marcar documento pendiente como completado
UPDATE documentos_pendientes
SET
  estado = 'Completado',
  fecha_completado = NOW(),
  completado_por = (
    SELECT subido_por  -- ✅ Nombre correcto
    FROM documentos_cliente
    WHERE id = 'd4aa2a76-95c9-4adc-96e0-ef0b68978bc9'
  )
WHERE id = 'a87dedc0-dc9f-4dec-8c92-0094227de63e';

-- 3️⃣ Registrar en auditoría
INSERT INTO audit_log (
  tabla,
  accion,
  registro_id,
  usuario_email,
  metadata
)
SELECT
  'fuentes_pago' as tabla,
  'UPDATE' as accion,  -- ✅ Acción estándar válida
  '65dc5c6d-e1b7-4e14-803c-8b5cff8c3cfb' as registro_id,
  'admin' as usuario_email,
  jsonb_build_object(
    'documento_id', dc.id,
    'documento_url', dc.url_storage,
    'tipo_fuente', dc.metadata->>'tipo_fuente',
    'entidad', dc.metadata->>'entidad',
    'pendiente_id', 'a87dedc0-dc9f-4dec-8c92-0094227de63e',
    'cliente_id', dc.cliente_id,
    'razon', 'Vinculación manual retroactiva - trigger no existía cuando se subió'
  ) as metadata
FROM documentos_cliente dc
WHERE dc.id = 'd4aa2a76-95c9-4adc-96e0-ef0b68978bc9';

COMMIT;

-- ============================================
-- ✅ VERIFICAR RESULTADO
-- ============================================

-- Ver que el pendiente quedó completado
SELECT
  'PENDIENTE' as tipo,
  id,
  tipo_documento,
  estado,
  fecha_completado
FROM documentos_pendientes
WHERE id = 'a87dedc0-dc9f-4dec-8c92-0094227de63e';

-- Ver que la fuente_pago tiene el documento
SELECT
  'FUENTE_PAGO' as tipo,
  id,
  entidad,
  tipo,
  estado_documentacion,
  carta_aprobacion_url
FROM fuentes_pago
WHERE id = '65dc5c6d-e1b7-4e14-803c-8b5cff8c3cfb';
