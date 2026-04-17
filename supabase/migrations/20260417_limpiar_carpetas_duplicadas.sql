-- Limpiar carpetas duplicadas que se crearon antes del fix
-- Mantiene solo la primera creada (menor fecha_creacion) por nombre duplicado
DELETE FROM carpetas_documentos
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY entidad_id, tipo_entidad, COALESCE(padre_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(nombre)
        ORDER BY fecha_creacion ASC
      ) AS rn
    FROM carpetas_documentos
  ) ranked
  WHERE rn > 1
);
