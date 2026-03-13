-- Eliminar documentos pendientes duplicados (mantener los más recientes)
-- Para cada combinación de cliente + fuente_pago + tipo_documento,
-- mantener SOLO el registro con ID más grande (más reciente)

WITH duplicados AS (
  SELECT
    id,
    cliente_id,
    fuente_pago_id,
    tipo_documento,
    ROW_NUMBER() OVER (
      PARTITION BY cliente_id, fuente_pago_id, tipo_documento
      ORDER BY id DESC
    ) as rn
  FROM documentos_pendientes
  WHERE cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
)
DELETE FROM documentos_pendientes
WHERE id IN (
  SELECT id
  FROM duplicados
  WHERE rn > 1  -- Eliminar todos excepto el primero (más reciente)
);

-- Verificar resultado (debe quedar solo 3 documentos)
SELECT
  dp.id,
  dp.tipo_documento,
  fp.tipo as fuente_tipo,
  fp.entidad
FROM documentos_pendientes dp
INNER JOIN fuentes_pago fp ON dp.fuente_pago_id = fp.id
WHERE dp.cliente_id = '8dfeba01-ac6e-4f15-9561-e7039a417beb'
ORDER BY fp.tipo;
