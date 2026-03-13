-- ============================================
-- SISTEMA AUTOCONFIGURACIÓN: Requisitos por Tipo de Fuente
-- ============================================
--
-- Estrategia: Cuando se crea un tipo de fuente nuevo, automáticamente
-- se le asignan requisitos base (plantilla por defecto)
--
-- Fecha: 2025-12-12
-- Versión: 2.0.0 (Sistema configurable)
-- ============================================

-- ============================================
-- 1. TABLA DE PLANTILLAS DE REQUISITOS (catálogo reutilizable)
-- ============================================

CREATE TABLE IF NOT EXISTS plantillas_requisitos_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  tipo_documento TEXT NOT NULL,
  es_obligatorio BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  se_valida_en TEXT DEFAULT 'desembolso',
  descripcion TEXT,
  icono TEXT,
  es_sistema BOOLEAN DEFAULT true, -- true = no editable/eliminar por admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_plantillas_requisitos_nombre
  ON plantillas_requisitos_documentos(nombre);

-- ============================================
-- 2. DATOS MAESTROS: Plantillas Reutilizables
-- ============================================

INSERT INTO plantillas_requisitos_documentos
  (nombre, tipo_documento, es_obligatorio, orden, se_valida_en, descripcion, icono, es_sistema)
VALUES
  -- Plantilla: Carta de Aprobación (común en créditos/subsidios)
  (
    'carta_aprobacion_credito',
    'Carta de Aprobación',
    true,
    1,
    'creacion',
    'Carta de aprobación emitida por la entidad financiera o institución',
    'FileCheck',
    true
  ),

  -- Plantilla: Boleta de Registro (común para todos)
  (
    'boleta_registro',
    'Boleta de Registro',
    true,
    2,
    'desembolso',
    'Boleta de registro de escritura pública ante notaría',
    'FileSignature',
    true
  ),

  -- Plantilla: Solicitud Desembolso (opcional)
  (
    'solicitud_desembolso',
    'Solicitud Desembolso',
    false,
    3,
    'desembolso',
    'Formato de solicitud de desembolso (opcional según entidad)',
    'Send',
    true
  ),

  -- Plantilla: Certificado Subsidio (para subsidios estatales)
  (
    'certificado_subsidio',
    'Certificado de Subsidio',
    true,
    1,
    'creacion',
    'Certificado oficial de aprobación del subsidio estatal',
    'Award',
    true
  ),

  -- Plantilla: Contrato Crédito (para créditos bancarios)
  (
    'contrato_credito',
    'Contrato de Crédito',
    true,
    2,
    'desembolso',
    'Contrato firmado con la entidad crediticia',
    'FileText',
    true
  )
ON CONFLICT (nombre) DO UPDATE
SET
  tipo_documento = EXCLUDED.tipo_documento,
  es_obligatorio = EXCLUDED.es_obligatorio,
  orden = EXCLUDED.orden,
  se_valida_en = EXCLUDED.se_valida_en,
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  updated_at = NOW();

-- ============================================
-- 3. TABLA DE MAPEO: Tipo Fuente → Plantillas
-- ============================================

CREATE TABLE IF NOT EXISTS tipos_fuente_plantillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_fuente TEXT NOT NULL,
  plantilla_id UUID NOT NULL REFERENCES plantillas_requisitos_documentos(id) ON DELETE CASCADE,
  orden_personalizado INT,
  es_obligatorio_personalizado BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tipo_fuente, plantilla_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tipo_fuente_plantillas
  ON tipos_fuente_plantillas(tipo_fuente);

-- ============================================
-- 4. FUNCIÓN: Auto-configurar tipo de fuente nuevo
-- ============================================

CREATE OR REPLACE FUNCTION autoconfigurar_requisitos_tipo_fuente()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_fuente TEXT;
  v_ya_configurado BOOLEAN;
  v_plantillas_ids UUID[];
BEGIN
  v_tipo_fuente := NEW.tipo;

  -- Verificar si ya tiene configuración
  SELECT EXISTS(
    SELECT 1 FROM fuentes_pago_requisitos_config
    WHERE tipo_fuente = v_tipo_fuente
  ) INTO v_ya_configurado;

  -- Si ya está configurado, no hacer nada
  IF v_ya_configurado THEN
    RETURN NEW;
  END IF;

  RAISE NOTICE '🔧 Nuevo tipo de fuente detectado: %. Autoconfiguración...', v_tipo_fuente;

  -- Determinar plantillas según tipo de fuente
  CASE
    -- Créditos Hipotecarios/Bancarios
    WHEN v_tipo_fuente ILIKE '%Crédito%' OR v_tipo_fuente ILIKE '%Bancario%' THEN
      -- Usar plantillas: carta_aprobacion + boleta_registro + solicitud_desembolso
      INSERT INTO fuentes_pago_requisitos_config
        (tipo_fuente, tipo_documento, es_obligatorio, orden, se_valida_en, descripcion, icono)
      SELECT
        v_tipo_fuente,
        p.tipo_documento,
        p.es_obligatorio,
        p.orden,
        p.se_valida_en,
        p.descripcion,
        p.icono
      FROM plantillas_requisitos_documentos p
      WHERE p.nombre IN ('carta_aprobacion_credito', 'boleta_registro', 'solicitud_desembolso')
      ON CONFLICT (tipo_fuente, tipo_documento) DO NOTHING;

      RAISE NOTICE '✅ Configurado como CRÉDITO (3 requisitos)';

    -- Subsidios Estatales
    WHEN v_tipo_fuente ILIKE '%Subsidio%' THEN
      -- Usar plantillas: carta_aprobacion + boleta_registro
      INSERT INTO fuentes_pago_requisitos_config
        (tipo_fuente, tipo_documento, es_obligatorio, orden, se_valida_en, descripcion, icono)
      SELECT
        v_tipo_fuente,
        p.tipo_documento,
        p.es_obligatorio,
        p.orden,
        p.se_valida_en,
        p.descripcion,
        p.icono
      FROM plantillas_requisitos_documentos p
      WHERE p.nombre IN ('carta_aprobacion_credito', 'boleta_registro')
      ON CONFLICT (tipo_fuente, tipo_documento) DO NOTHING;

      RAISE NOTICE '✅ Configurado como SUBSIDIO (2 requisitos)';

    -- Cuota Inicial u otros
    ELSE
      -- No crear requisitos (Cuota Inicial no necesita documentación)
      RAISE NOTICE '⚪ No requiere requisitos documentales';
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGER: Detectar nuevos tipos de fuente
-- ============================================

DROP TRIGGER IF EXISTS trigger_autoconfigurar_requisitos ON fuentes_pago;

CREATE TRIGGER trigger_autoconfigurar_requisitos
  AFTER INSERT ON fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION autoconfigurar_requisitos_tipo_fuente();

-- ============================================
-- 6. FUNCIÓN: Clonar configuración de un tipo a otro
-- ============================================

CREATE OR REPLACE FUNCTION clonar_configuracion_requisitos(
  p_tipo_fuente_origen TEXT,
  p_tipo_fuente_destino TEXT
) RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO fuentes_pago_requisitos_config
    (tipo_fuente, tipo_documento, es_obligatorio, orden, se_valida_en, descripcion, icono)
  SELECT
    p_tipo_fuente_destino,
    tipo_documento,
    es_obligatorio,
    orden,
    se_valida_en,
    descripcion,
    icono
  FROM fuentes_pago_requisitos_config
  WHERE tipo_fuente = p_tipo_fuente_origen
  ON CONFLICT (tipo_fuente, tipo_documento) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE '✅ Clonados % requisitos de "%" a "%"', v_count, p_tipo_fuente_origen, p_tipo_fuente_destino;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FUNCIÓN: Listar tipos de fuente sin configuración
-- ============================================

CREATE OR REPLACE FUNCTION tipos_fuente_sin_configuracion()
RETURNS TABLE(
  tipo_fuente TEXT,
  total_fuentes INT,
  ejemplo_entidad TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fp.tipo,
    COUNT(*)::INT AS total,
    MAX(fp.entidad) AS ejemplo
  FROM fuentes_pago fp
  WHERE NOT EXISTS (
    SELECT 1 FROM fuentes_pago_requisitos_config req
    WHERE req.tipo_fuente = fp.tipo
  )
  GROUP BY fp.tipo
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Plantillas
ALTER TABLE plantillas_requisitos_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de plantillas"
  ON plantillas_requisitos_documentos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Solo admins modifican plantillas"
  ON plantillas_requisitos_documentos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- ============================================
-- 9. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE plantillas_requisitos_documentos IS
'Plantillas reutilizables de requisitos de documentación. Sistema autoadministrable.';

COMMENT ON TABLE tipos_fuente_plantillas IS
'Mapeo entre tipos de fuente y plantillas de requisitos (sistema avanzado).';

COMMENT ON FUNCTION autoconfigurar_requisitos_tipo_fuente IS
'Detecta automáticamente nuevos tipos de fuente y les asigna requisitos base según su categoría.';

COMMENT ON FUNCTION clonar_configuracion_requisitos IS
'Permite clonar la configuración de requisitos de un tipo de fuente a otro (útil para variaciones).';

COMMENT ON FUNCTION tipos_fuente_sin_configuracion IS
'Lista tipos de fuente que existen en el sistema pero no tienen requisitos configurados.';

-- ============================================
-- ✅ VERIFICACIÓN
-- ============================================

-- Ver plantillas disponibles
SELECT
  nombre,
  tipo_documento,
  es_obligatorio,
  se_valida_en
FROM plantillas_requisitos_documentos
ORDER BY orden;

-- Ver trigger creado
SELECT
  t.tgname AS trigger_name,
  c.relname AS tabla,
  p.proname AS funcion,
  CASE t.tgenabled
    WHEN 'O' THEN '✅ Activo'
    WHEN 'D' THEN '❌ Desactivado'
  END AS estado
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'fuentes_pago'
  AND t.tgname = 'trigger_autoconfigurar_requisitos';

-- Ver tipos sin configuración (si los hay)
-- SELECT * FROM tipos_fuente_sin_configuracion(); -- Comentado hasta que haya datos

-- ============================================
-- 📋 RESULTADO ESPERADO:
-- ============================================
-- ✅ 5 plantillas creadas (reutilizables)
-- ✅ Trigger activo (autoconfiguración)
-- ✅ 3 funciones de gestión disponibles
-- ============================================
