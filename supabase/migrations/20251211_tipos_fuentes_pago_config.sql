-- =====================================================
-- Migración: Sistema de Administración de Tipos de Fuentes de Pago
-- Fecha: 2025-12-11
-- Descripción: Tabla para administrar dinámicamente los tipos de fuentes de pago
--              disponibles en el sistema (reemplaza hardcoding en frontend)
-- =====================================================

-- =====================================================
-- TABLA: tipos_fuentes_pago
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tipos_fuentes_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  nombre VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(50) NOT NULL UNIQUE, -- 'cuota_inicial', 'credito_hipotecario', etc.
  descripcion TEXT,

  -- Configuración
  requiere_entidad BOOLEAN DEFAULT false NOT NULL,
  permite_multiples_abonos BOOLEAN DEFAULT false NOT NULL,
  es_subsidio BOOLEAN DEFAULT false NOT NULL,

  -- UI/UX
  color VARCHAR(20) DEFAULT 'blue' NOT NULL, -- 'blue', 'green', 'purple', 'orange', etc.
  icono VARCHAR(50) DEFAULT 'Wallet' NOT NULL, -- Nombre del icono de lucide-react
  orden INTEGER DEFAULT 1 NOT NULL,

  -- Estado
  activo BOOLEAN DEFAULT true NOT NULL,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT tipos_fuentes_pago_nombre_not_empty CHECK (LENGTH(TRIM(nombre)) > 0),
  CONSTRAINT tipos_fuentes_pago_codigo_not_empty CHECK (LENGTH(TRIM(codigo)) > 0),
  CONSTRAINT tipos_fuentes_pago_orden_positivo CHECK (orden > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tipos_fuentes_pago_activo ON public.tipos_fuentes_pago(activo);
CREATE INDEX IF NOT EXISTS idx_tipos_fuentes_pago_codigo ON public.tipos_fuentes_pago(codigo);
CREATE INDEX IF NOT EXISTS idx_tipos_fuentes_pago_orden ON public.tipos_fuentes_pago(orden);

-- =====================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_tipos_fuentes_pago_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tipos_fuentes_pago_updated_at
  BEFORE UPDATE ON public.tipos_fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_tipos_fuentes_pago_updated_at();

-- =====================================================
-- SEED: Migrar datos hardcoded existentes
-- =====================================================
INSERT INTO public.tipos_fuentes_pago (
  nombre,
  codigo,
  descripcion,
  requiere_entidad,
  permite_multiples_abonos,
  es_subsidio,
  color,
  icono,
  orden,
  activo
) VALUES
  (
    'Cuota Inicial',
    'cuota_inicial',
    'Pagos directos del cliente (permite múltiples abonos)',
    false,
    true,
    false,
    'purple',
    'Wallet',
    1,
    true
  ),
  (
    'Crédito Hipotecario',
    'credito_hipotecario',
    'Financiación bancaria',
    true,
    false,
    false,
    'blue',
    'Building2',
    2,
    true
  ),
  (
    'Subsidio Mi Casa Ya',
    'subsidio_mi_casa_ya',
    'Subsidio del gobierno nacional',
    false,
    false,
    true,
    'green',
    'Home',
    3,
    true
  ),
  (
    'Subsidio Caja Compensación',
    'subsidio_caja_compensacion',
    'Subsidio de caja de compensación familiar',
    true,
    false,
    true,
    'orange',
    'Shield',
    4,
    true
  )
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.tipos_fuentes_pago ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden leer fuentes activas
CREATE POLICY "tipos_fuentes_pago_select_all"
  ON public.tipos_fuentes_pago
  FOR SELECT
  USING (true); -- Todos pueden ver (filtro por activo en query)

-- Policy: Solo admin puede insertar
CREATE POLICY "tipos_fuentes_pago_insert_admin"
  ON public.tipos_fuentes_pago
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
CREATE POLICY "tipos_fuentes_pago_update_admin"
  ON public.tipos_fuentes_pago
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
CREATE POLICY "tipos_fuentes_pago_delete_admin"
  ON public.tipos_fuentes_pago
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
COMMENT ON TABLE public.tipos_fuentes_pago IS 'Catálogo de tipos de fuentes de pago disponibles en el sistema';
COMMENT ON COLUMN public.tipos_fuentes_pago.codigo IS 'Identificador único estable para usar en código (snake_case)';
COMMENT ON COLUMN public.tipos_fuentes_pago.requiere_entidad IS 'Indica si requiere especificar entidad financiera (banco, caja, etc.)';
COMMENT ON COLUMN public.tipos_fuentes_pago.permite_multiples_abonos IS 'Indica si se pueden hacer múltiples abonos parciales';
COMMENT ON COLUMN public.tipos_fuentes_pago.es_subsidio IS 'Indica si es un subsidio (requiere validaciones especiales)';
COMMENT ON COLUMN public.tipos_fuentes_pago.color IS 'Color para UI (blue, green, purple, orange, red, etc.)';
COMMENT ON COLUMN public.tipos_fuentes_pago.icono IS 'Nombre del icono de lucide-react';
COMMENT ON COLUMN public.tipos_fuentes_pago.orden IS 'Orden de visualización en formularios';

-- =====================================================
-- AUDIT LOG TRIGGER (si existe función global)
-- =====================================================
-- Si tienes función audit_log_trigger existente, descomenta:
-- CREATE TRIGGER audit_tipos_fuentes_pago
--   AFTER INSERT OR UPDATE OR DELETE ON public.tipos_fuentes_pago
--   FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
