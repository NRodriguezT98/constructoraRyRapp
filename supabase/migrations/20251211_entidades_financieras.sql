-- =====================================================
-- Migración: Sistema de Entidades Financieras
-- Fecha: 2025-12-11
-- Descripción: Tabla para administrar bancos y cajas de compensación
--              Reemplaza hardcoding de entidades en formularios
-- =====================================================

-- =====================================================
-- TABLA: entidades_financieras
-- =====================================================
CREATE TABLE IF NOT EXISTS public.entidades_financieras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  nombre VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(50) NOT NULL UNIQUE,

  -- Tipo de entidad
  tipo VARCHAR(50) CHECK (tipo IN ('Banco', 'Caja de Compensación', 'Cooperativa', 'Otro')) NOT NULL,

  -- Información corporativa
  nit VARCHAR(20),
  razon_social VARCHAR(200),

  -- Contacto
  telefono VARCHAR(50),
  email_contacto VARCHAR(255),
  sitio_web VARCHAR(255),
  direccion TEXT,

  -- Información adicional
  codigo_superintendencia VARCHAR(20), -- Código en Superfinanciera o Supersociedades
  notas TEXT,

  -- UI/UX
  logo_url TEXT, -- URL del logo (storage)
  color VARCHAR(20) DEFAULT 'blue' NOT NULL, -- Color representativo
  orden INTEGER DEFAULT 1 NOT NULL,

  -- Estado
  activo BOOLEAN DEFAULT true NOT NULL,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT entidades_financieras_nombre_not_empty CHECK (LENGTH(TRIM(nombre)) > 0),
  CONSTRAINT entidades_financieras_codigo_not_empty CHECK (LENGTH(TRIM(codigo)) > 0),
  CONSTRAINT entidades_financieras_orden_positivo CHECK (orden > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_entidades_financieras_activo ON public.entidades_financieras(activo);
CREATE INDEX IF NOT EXISTS idx_entidades_financieras_tipo ON public.entidades_financieras(tipo);
CREATE INDEX IF NOT EXISTS idx_entidades_financieras_codigo ON public.entidades_financieras(codigo);
CREATE INDEX IF NOT EXISTS idx_entidades_financieras_orden ON public.entidades_financieras(orden);

-- =====================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_entidades_financieras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entidades_financieras_updated_at
  BEFORE UPDATE ON public.entidades_financieras
  FOR EACH ROW
  EXECUTE FUNCTION update_entidades_financieras_updated_at();

-- =====================================================
-- SEED: Migrar datos hardcoded existentes
-- =====================================================

-- Bancos
INSERT INTO public.entidades_financieras (nombre, codigo, tipo, orden, activo) VALUES
  ('Bancolombia', 'bancolombia', 'Banco', 1, true),
  ('Banco de Bogotá', 'banco_bogota', 'Banco', 2, true),
  ('Davivienda', 'davivienda', 'Banco', 3, true),
  ('BBVA Colombia', 'bbva', 'Banco', 4, true),
  ('Banco Agrario', 'banco_agrario', 'Banco', 5, true),
  ('Banco AV Villas', 'av_villas', 'Banco', 6, true),
  ('Banco Popular', 'banco_popular', 'Banco', 7, true),
  ('Colpatria', 'colpatria', 'Banco', 8, true),
  ('Banco Caja Social', 'caja_social', 'Banco', 9, true),
  ('Banco Falabella', 'banco_falabella', 'Banco', 10, true),
  ('Banco GNB Sudameris', 'gnb_sudameris', 'Banco', 11, true),
  ('Scotiabank Colpatria', 'scotiabank', 'Banco', 12, true),
  ('Banco Pichincha', 'pichincha', 'Banco', 13, true),
  ('Banco Cooperativo Coopcentral', 'coopcentral', 'Banco', 14, true),
  ('Banco W', 'banco_w', 'Banco', 15, true),
  ('Bancamía', 'bancamia', 'Banco', 16, true),
  ('Banco Mundo Mujer', 'mundo_mujer', 'Banco', 17, true)
ON CONFLICT (codigo) DO NOTHING;

-- Cajas de Compensación
INSERT INTO public.entidades_financieras (nombre, codigo, tipo, orden, activo) VALUES
  ('Comfandi', 'comfandi', 'Caja de Compensación', 20, true),
  ('Comfenalco Valle', 'comfenalco_valle', 'Caja de Compensación', 21, true),
  ('Comfenalco Antioquia', 'comfenalco_antioquia', 'Caja de Compensación', 22, true),
  ('Compensar', 'compensar', 'Caja de Compensación', 23, true),
  ('Comfama', 'comfama', 'Caja de Compensación', 24, true),
  ('Cafam', 'cafam', 'Caja de Compensación', 25, true),
  ('Comfenalco Santander', 'comfenalco_santander', 'Caja de Compensación', 26, true),
  ('Comfamiliar Risaralda', 'comfamiliar_risaralda', 'Caja de Compensación', 27, true)
ON CONFLICT (codigo) DO NOTHING;

-- Otros
INSERT INTO public.entidades_financieras (nombre, codigo, tipo, orden, activo) VALUES
  ('Otro Banco', 'otro_banco', 'Otro', 100, true),
  ('Otra Caja', 'otra_caja', 'Otro', 101, true)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.entidades_financieras ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer entidades activas
CREATE POLICY "entidades_financieras_select_all"
  ON public.entidades_financieras
  FOR SELECT
  USING (true); -- Todos pueden ver (filtro por activo en query)

-- Policy: Solo admin puede insertar
CREATE POLICY "entidades_financieras_insert_admin"
  ON public.entidades_financieras
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  );

-- Policy: Solo admin puede actualizar
CREATE POLICY "entidades_financieras_update_admin"
  ON public.entidades_financieras
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  );

-- Policy: Solo admin puede eliminar
CREATE POLICY "entidades_financieras_delete_admin"
  ON public.entidades_financieras
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'Administrador'
      AND usuarios.estado = 'Activo'
    )
  );

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON TABLE public.entidades_financieras IS 'Catálogo de bancos, cajas de compensación y otras entidades financieras';
COMMENT ON COLUMN public.entidades_financieras.codigo IS 'Identificador único estable para usar en código (snake_case)';
COMMENT ON COLUMN public.entidades_financieras.tipo IS 'Tipo de entidad: Banco, Caja de Compensación, Cooperativa, Otro';
COMMENT ON COLUMN public.entidades_financieras.codigo_superintendencia IS 'Código en Superfinanciera o Supersociedades';
COMMENT ON COLUMN public.entidades_financieras.logo_url IS 'URL del logo en Supabase Storage';
COMMENT ON COLUMN public.entidades_financieras.color IS 'Color representativo para UI (blue, green, orange, etc.)';
COMMENT ON COLUMN public.entidades_financieras.orden IS 'Orden de visualización en formularios';

-- =====================================================
-- AUDIT LOG TRIGGER (si existe función global)
-- =====================================================
-- Si tienes función audit_log_trigger existente, descomenta:
-- CREATE TRIGGER audit_entidades_financieras
--   AFTER INSERT OR UPDATE OR DELETE ON public.entidades_financieras
--   FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
