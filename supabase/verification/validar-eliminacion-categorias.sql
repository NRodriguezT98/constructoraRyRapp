-- ============================================
-- VALIDACIONES: Eliminación de Categorías
-- ============================================
-- Detectar qué validar antes de eliminar una categoría

-- 1. Documentos que usan cada categoría (PROYECTOS)
SELECT
  c.id as categoria_id,
  c.nombre as categoria,
  c.modulos_permitidos,
  COUNT(dp.id) as docs_proyectos
FROM categorias_documento c
LEFT JOIN documentos_proyecto dp ON dp.categoria_id = c.id
WHERE 'proyectos' = ANY(c.modulos_permitidos)
GROUP BY c.id, c.nombre, c.modulos_permitidos
ORDER BY docs_proyectos DESC, c.nombre;

-- 2. Documentos que usan cada categoría (CLIENTES)
SELECT
  c.id as categoria_id,
  c.nombre as categoria,
  c.modulos_permitidos,
  COUNT(dc.id) as docs_clientes
FROM categorias_documento c
LEFT JOIN documentos_cliente dc ON dc.categoria_id = c.id
WHERE 'clientes' = ANY(c.modulos_permitidos)
GROUP BY c.id, c.nombre, c.modulos_permitidos
ORDER BY docs_clientes DESC, c.nombre;

-- 3. Documentos que usan cada categoría (VIVIENDAS)
SELECT
  c.id as categoria_id,
  c.nombre as categoria,
  c.modulos_permitidos,
  COUNT(dv.id) as docs_viviendas
FROM categorias_documento c
LEFT JOIN documentos_vivienda dv ON dv.categoria_id = c.id
WHERE 'viviendas' = ANY(c.modulos_permitidos)
GROUP BY c.id, c.nombre, c.modulos_permitidos
ORDER BY docs_viviendas DESC, c.nombre;

-- 4. Resumen total de uso de categorías
SELECT
  c.id,
  c.nombre,
  c.modulos_permitidos,
  COALESCE(dp.total, 0) as docs_proyectos,
  COALESCE(dc.total, 0) as docs_clientes,
  COALESCE(dv.total, 0) as docs_viviendas,
  COALESCE(dp.total, 0) + COALESCE(dc.total, 0) + COALESCE(dv.total, 0) as total_documentos,
  CASE
    WHEN COALESCE(dp.total, 0) + COALESCE(dc.total, 0) + COALESCE(dv.total, 0) = 0
    THEN '✅ Puede eliminarse'
    ELSE '⚠️ Tiene documentos asociados'
  END as estado_eliminacion
FROM categorias_documento c
LEFT JOIN (
  SELECT categoria_id, COUNT(*) as total
  FROM documentos_proyecto
  GROUP BY categoria_id
) dp ON dp.categoria_id = c.id
LEFT JOIN (
  SELECT categoria_id, COUNT(*) as total
  FROM documentos_cliente
  GROUP BY categoria_id
) dc ON dc.categoria_id = c.id
LEFT JOIN (
  SELECT categoria_id, COUNT(*) as total
  FROM documentos_vivienda
  GROUP BY categoria_id
) dv ON dv.categoria_id = c.id
ORDER BY total_documentos DESC, c.nombre;

-- 5. Categorías que pueden eliminarse de forma segura (sin documentos)
SELECT
  id,
  nombre,
  modulos_permitidos,
  color,
  icono,
  fecha_creacion
FROM categorias_documento
WHERE id NOT IN (
  SELECT DISTINCT categoria_id FROM documentos_proyecto WHERE categoria_id IS NOT NULL
  UNION
  SELECT DISTINCT categoria_id FROM documentos_cliente WHERE categoria_id IS NOT NULL
  UNION
  SELECT DISTINCT categoria_id FROM documentos_vivienda WHERE categoria_id IS NOT NULL
)
ORDER BY nombre;
