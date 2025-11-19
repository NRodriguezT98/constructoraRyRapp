-- ============================================================================
-- LIMPIEZA Y MIGRACIÓN: FK usuarios en documentos_vivienda
-- ============================================================================

BEGIN;

-- 1. Verificar y limpiar datos huérfanos
DO $$
DECLARE
  huerfanos INTEGER;
  admin_id UUID;
BEGIN
  -- Contar documentos con subido_por inválido (casting a UUID)
  SELECT COUNT(*) INTO huerfanos
  FROM documentos_vivienda
  WHERE subido_por IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM usuarios WHERE id = documentos_vivienda.subido_por::uuid);

  RAISE NOTICE 'Documentos huérfanos encontrados: %', huerfanos;

  -- Si hay huérfanos, asignarlos al primer admin
  IF huerfanos > 0 THEN
    SELECT id INTO admin_id
    FROM usuarios
    WHERE rol = 'Administrador'
    LIMIT 1;

    IF admin_id IS NOT NULL THEN
      UPDATE documentos_vivienda
      SET subido_por = admin_id::text
      WHERE subido_por IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM usuarios WHERE id = documentos_vivienda.subido_por::uuid);

      RAISE NOTICE 'Documentos huérfanos reasignados a admin: %', admin_id;
    ELSE
      -- Si no hay admin, poner NULL
      UPDATE documentos_vivienda
      SET subido_por = NULL
      WHERE subido_por IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM usuarios WHERE id = documentos_vivienda.subido_por::uuid);

      RAISE NOTICE 'No hay admin disponible, subido_por = NULL';
    END IF;
  END IF;
END $$;

-- 2. Guardar definición de vista y eliminarla temporalmente
DO $$
DECLARE
  vista_definition TEXT;
BEGIN
  -- Guardar definición de la vista
  SELECT definition INTO vista_definition
  FROM pg_views
  WHERE viewname = 'vista_documentos_vivienda';

  -- Eliminar vista temporalmente
  DROP VIEW IF EXISTS vista_documentos_vivienda CASCADE;

  RAISE NOTICE 'Vista eliminada temporalmente';
END $$;

-- 3. Convertir subido_por de TEXT a UUID
ALTER TABLE documentos_vivienda
  ALTER COLUMN subido_por TYPE UUID USING subido_por::uuid;

-- 4. Recrear vista
CREATE OR REPLACE VIEW vista_documentos_vivienda AS
SELECT
  dv.id,
  dv.vivienda_id,
  dv.categoria_id,
  dv.titulo,
  dv.descripcion,
  dv.nombre_archivo,
  dv.nombre_original,
  dv.tamano_bytes,
  dv.tipo_mime,
  dv.url_storage,
  dv.etiquetas,
  dv.version,
  dv.es_version_actual,
  dv.estado,
  dv.subido_por,
  dv.fecha_documento,
  dv.fecha_vencimiento,
  dv.es_importante,
  dv.fecha_creacion,
  dv.fecha_actualizacion,
  cd.nombre AS categoria_nombre,
  cd.color AS categoria_color,
  cd.icono AS categoria_icono,
  cd.es_sistema AS categoria_es_sistema,
  v.numero AS vivienda_numero,
  v.manzana_id,
  m.nombre AS manzana_nombre,
  m.proyecto_id,
  p.nombre AS proyecto_nombre
FROM documentos_vivienda dv
  LEFT JOIN categorias_documento cd ON dv.categoria_id = cd.id
  LEFT JOIN viviendas v ON dv.vivienda_id = v.id
  LEFT JOIN manzanas m ON v.manzana_id = m.id
  LEFT JOIN proyectos p ON m.proyecto_id = p.id
WHERE dv.estado = 'activo';

-- 5. Eliminar FK si existe (limpieza)
ALTER TABLE documentos_vivienda
  DROP CONSTRAINT IF EXISTS fk_documentos_vivienda_subido_por;

-- 6. Crear Foreign Key
ALTER TABLE documentos_vivienda
  ADD CONSTRAINT fk_documentos_vivienda_subido_por
  FOREIGN KEY (subido_por)
  REFERENCES usuarios(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 7. Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_documentos_vivienda_subido_por
  ON documentos_vivienda(subido_por);

-- 8. Comentario descriptivo
COMMENT ON CONSTRAINT fk_documentos_vivienda_subido_por ON documentos_vivienda IS
  'Relación con usuario que subió el documento';

COMMIT;

-- Verificación final
DO $$
DECLARE
  total_docs INTEGER;
  con_usuario INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_docs FROM documentos_vivienda;
  SELECT COUNT(subido_por) INTO con_usuario FROM documentos_vivienda;

  RAISE NOTICE '✅ Foreign key creada exitosamente';
  RAISE NOTICE 'Total documentos: %, Con usuario: %, Sin usuario: %',
    total_docs, con_usuario, (total_docs - con_usuario);
END $$;
