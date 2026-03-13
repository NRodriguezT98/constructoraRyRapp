-- Actualizar pasos existentes de Boleta de Registro con el UUID correcto de categoría
-- Categoría: "Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso"
-- UUID: 4898e798-c188-4f02-bfcf-b2b15be48e34

-- Ver cuántos registros se actualizarán
SELECT COUNT(*) as total_actualizar
FROM pasos_fuente_pago
WHERE paso = 'boleta_registro'
  AND categoria_documento_requerida = 'escrituras';

-- Actualizar registros
UPDATE pasos_fuente_pago
SET
  categoria_documento_requerida = '4898e798-c188-4f02-bfcf-b2b15be48e34',
  fecha_actualizacion = now()
WHERE paso = 'boleta_registro'
  AND categoria_documento_requerida = 'escrituras';

-- Verificar cambios
SELECT
  paso,
  titulo,
  tipo_documento_requerido,
  categoria_documento_requerida,
  (SELECT nombre FROM categorias_documento WHERE id::text = categoria_documento_requerida) as nombre_categoria
FROM pasos_fuente_pago
WHERE paso = 'boleta_registro'
LIMIT 5;
