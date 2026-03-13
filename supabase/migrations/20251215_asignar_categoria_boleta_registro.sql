-- Actualizar Boleta de Registro para tener el UUID correcto de categoría
-- Categoría: "Cartas de aprobación, Promesas de Compraventa y Documentos del Proceso"
-- UUID: 4898e798-c188-4f02-bfcf-b2b15be48e34

UPDATE requisitos_fuentes_pago_config
SET
  categoria_documento = '4898e798-c188-4f02-bfcf-b2b15be48e34',
  fecha_actualizacion = now()
WHERE paso_identificador = 'boleta_registro';

-- Verificar cambios
SELECT
  tipo_fuente,
  titulo,
  categoria_documento,
  (SELECT nombre FROM categorias_documento WHERE id::text = categoria_documento) as nombre_categoria
FROM requisitos_fuentes_pago_config
WHERE paso_identificador = 'boleta_registro'
ORDER BY tipo_fuente;
