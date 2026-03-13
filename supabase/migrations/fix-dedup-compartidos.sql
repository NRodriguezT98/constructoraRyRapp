-- ============================================
-- LIMPIEZA: Eliminar duplicados de requisitos compartidos
-- ============================================
-- Se crearon 3 filas "Boleta de Registro" porque la mutación
-- creaba una fila por cada fuente seleccionada.
-- El comportamiento correcto es 1 sola fila con tipo_fuente = 'COMPARTIDO'
-- ============================================

BEGIN;

-- Ver el estado antes de limpiar
SELECT id, tipo_fuente, titulo, alcance, activo, fecha_creacion
FROM public.requisitos_fuentes_pago_config
WHERE alcance = 'COMPARTIDO_CLIENTE'
ORDER BY fecha_creacion;

-- Desactivar (soft-delete) los duplicados:
-- Mantener el primero creado (orden ASC) y desactivar el resto con mismo titulo
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY titulo, alcance ORDER BY fecha_creacion ASC) as rn
  FROM public.requisitos_fuentes_pago_config
  WHERE alcance = 'COMPARTIDO_CLIENTE'
    AND activo = true
)
UPDATE public.requisitos_fuentes_pago_config
SET activo = false
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

-- Asegurarse que el registros que quedó tenga tipo_fuente = 'COMPARTIDO'
UPDATE public.requisitos_fuentes_pago_config
SET tipo_fuente = 'COMPARTIDO'
WHERE alcance = 'COMPARTIDO_CLIENTE'
  AND activo = true;

-- Verificar resultado final
SELECT id, tipo_fuente, titulo, alcance, activo
FROM public.requisitos_fuentes_pago_config
WHERE alcance = 'COMPARTIDO_CLIENTE'
ORDER BY activo DESC, fecha_creacion;

COMMIT;
