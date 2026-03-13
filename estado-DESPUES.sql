-- Estado DESPUÉS de modificar fuentes (ejecutar inmediatamente después del cambio)

-- Nueva versión
SELECT 'VERSION_DESPUES' as seccion, version_actual, version_lock
FROM negociaciones
WHERE id = '105f3121-8d56-4b29-adac-380cebdc1faf';

-- CRÍTICO: Versiones creadas en el último minuto
SELECT
  'VERSIONES_NUEVAS' as seccion,
  version,
  tipo_cambio,
  LEFT(razon_cambio, 50) as razon,
  TO_CHAR(fecha_cambio, 'HH24:MI:SS.MS') as timestamp,
  ROUND(EXTRACT(EPOCH FROM (NOW() - fecha_cambio))) as segundos_atras
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND fecha_cambio > NOW() - INTERVAL '1 minute'
ORDER BY version DESC;

-- Detectar duplicados
SELECT
  'DUPLICADOS' as seccion,
  TO_CHAR(DATE_TRUNC('second', fecha_cambio), 'HH24:MI:SS') as mismo_segundo,
  COUNT(*) as versiones,
  STRING_AGG(version::text, ', ') as nums_version
FROM negociaciones_historial
WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
  AND fecha_cambio > NOW() - INTERVAL '1 minute'
GROUP BY DATE_TRUNC('second', fecha_cambio)
HAVING COUNT(*) > 1;

-- Resumen
SELECT
  'RESUMEN' as seccion,
  (SELECT COUNT(*) FROM negociaciones_historial
   WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
     AND fecha_cambio > NOW() - INTERVAL '1 minute') as versiones_creadas,
  (SELECT COUNT(*) FROM fuentes_pago
   WHERE negociacion_id = '105f3121-8d56-4b29-adac-380cebdc1faf'
     AND estado_fuente = 'activa') as fuentes_activas;
