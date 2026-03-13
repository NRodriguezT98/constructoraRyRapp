-- ================================================================
-- AGREGAR PASO FALTANTE: Carta de Aprobación de Crédito
-- ================================================================

-- 1. Agregar a la configuración de requisitos si no existe
INSERT INTO requisitos_fuentes_pago_config (
  id,
  tipo_fuente,
  paso_identificador,
  titulo,
  descripcion,
  instrucciones,
  nivel_validacion,
  tipo_documento_sugerido,
  categoria_documento,
  orden,
  activo,
  version,
  fecha_creacion,
  fecha_actualizacion
)
VALUES (
  gen_random_uuid(),
  'Crédito Hipotecario',
  'carta_aprobacion_credito',
  'Carta de Aprobación de Crédito',
  'Carta emitida por el banco aprobando el crédito hipotecario del cliente',
  'Solicita al cliente la carta de aprobación del banco. Debe incluir monto aprobado y condiciones del crédito.',
  'DOCUMENTO_OBLIGATORIO',
  'carta_aprobacion_credito',
  'Cartas de aprobación',
  1, -- Orden 1 (primera validación)
  true,
  1,
  NOW(),
  NOW()
)
ON CONFLICT (tipo_fuente, paso_identificador, version) DO NOTHING;

-- 2. Crear el paso para todas las fuentes de Crédito Hipotecario existentes
INSERT INTO pasos_fuente_pago (
  fuente_pago_id,
  paso,
  titulo,
  descripcion,
  tipo_documento_requerido,
  categoria_documento_requerida,
  nivel_validacion,
  completado
)
SELECT
  fp.id AS fuente_pago_id,
  'carta_aprobacion_credito' AS paso,
  'Carta de Aprobación de Crédito' AS titulo,
  'Carta emitida por el banco aprobando el crédito hipotecario del cliente' AS descripcion,
  'carta_aprobacion_credito' AS tipo_documento_requerido,
  'Cartas de aprobación' AS categoria_documento_requerida,
  'DOCUMENTO_OBLIGATORIO' AS nivel_validacion,
  false AS completado
FROM fuentes_pago fp
WHERE fp.tipo = 'Crédito Hipotecario'
  AND NOT EXISTS (
    SELECT 1
    FROM pasos_fuente_pago pfp
    WHERE pfp.fuente_pago_id = fp.id
      AND pfp.paso = 'carta_aprobacion_credito'
  );

-- 3. Vincular con documentos existentes que ya estén subidos
UPDATE pasos_fuente_pago pfp
SET
  completado = true,
  documento_id = subq.documento_id,
  completado_automaticamente = true,
  fecha_completado = NOW()
FROM (
  SELECT DISTINCT ON (pfp.id)
    pfp.id AS paso_id,
    dc.id AS documento_id
  FROM pasos_fuente_pago pfp
  INNER JOIN fuentes_pago fp ON fp.id = pfp.fuente_pago_id
  INNER JOIN negociaciones n ON n.id = fp.negociacion_id
  INNER JOIN documentos_cliente dc ON dc.cliente_id = n.cliente_id
  WHERE pfp.paso = 'carta_aprobacion_credito'
    AND pfp.completado = false
    AND dc.tipo_documento = 'carta_aprobacion_credito'
  ORDER BY pfp.id, dc.fecha_creacion DESC
) subq
WHERE pfp.id = subq.paso_id;

-- 4. Verificar resultado final
SELECT
  fp.tipo,
  COUNT(pfp.id) AS total_pasos,
  SUM(CASE WHEN pfp.completado THEN 1 ELSE 0 END) AS completados,
  SUM(CASE WHEN NOT pfp.completado THEN 1 ELSE 0 END) AS pendientes,
  STRING_AGG(
    CASE
      WHEN pfp.completado THEN '✅ ' || pfp.titulo
      ELSE '⬜ ' || pfp.titulo
    END,
    ', '
    ORDER BY pfp.fecha_creacion
  ) AS pasos_detalle
FROM fuentes_pago fp
LEFT JOIN pasos_fuente_pago pfp ON pfp.fuente_pago_id = fp.id
WHERE fp.tipo = 'Crédito Hipotecario'
GROUP BY fp.tipo;
