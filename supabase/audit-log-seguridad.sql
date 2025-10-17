-- ============================================
-- TABLA: audit_log_seguridad
-- Sistema de auditoría para eventos de seguridad
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_log_seguridad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tipo de evento
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'login_exitoso',
    'login_fallido',
    'logout',
    'password_reset_solicitado',
    'password_reset_completado',
    'session_expirada',
    'cuenta_bloqueada',
    'cuenta_desbloqueada'
  )),

  -- Información del usuario
  usuario_email VARCHAR(255) NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Información de la petición
  ip_address INET,
  user_agent TEXT,

  -- Metadata adicional (JSON flexible)
  metadata JSONB DEFAULT '{}',

  -- Geolocalización (opcional)
  pais VARCHAR(100),
  ciudad VARCHAR(100),

  -- Timestamp
  fecha_evento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Búsqueda por usuario
CREATE INDEX idx_audit_log_usuario_email ON public.audit_log_seguridad(usuario_email);
CREATE INDEX idx_audit_log_usuario_id ON public.audit_log_seguridad(usuario_id);

-- Búsqueda por tipo de evento
CREATE INDEX idx_audit_log_tipo ON public.audit_log_seguridad(tipo);

-- Búsqueda por fecha (para reportes)
CREATE INDEX idx_audit_log_fecha ON public.audit_log_seguridad(fecha_evento DESC);

-- Búsqueda por IP (detectar patrones sospechosos)
CREATE INDEX idx_audit_log_ip ON public.audit_log_seguridad(ip_address);

-- Índice GIN para búsquedas en metadata
CREATE INDEX idx_audit_log_metadata ON public.audit_log_seguridad USING gin(metadata);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.audit_log_seguridad ENABLE ROW LEVEL SECURITY;

-- Política: Solo los usuarios pueden ver sus propios logs
CREATE POLICY "Los usuarios pueden ver sus propios logs de auditoría"
  ON public.audit_log_seguridad FOR SELECT
  USING (
    auth.uid()::text = usuario_id::text OR
    auth.email() = usuario_email
  );

-- Política: Solo el sistema puede insertar logs (mediante service role)
CREATE POLICY "Solo el sistema puede insertar logs de auditoría"
  ON public.audit_log_seguridad FOR INSERT
  WITH CHECK (true);

-- Política: Nadie puede actualizar o eliminar logs (inmutables)
CREATE POLICY "Los logs son inmutables"
  ON public.audit_log_seguridad FOR UPDATE
  USING (false);

CREATE POLICY "Los logs no se pueden eliminar"
  ON public.audit_log_seguridad FOR DELETE
  USING (false);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para limpiar logs antiguos (ejecutar mensualmente)
CREATE OR REPLACE FUNCTION limpiar_logs_antiguos(dias_retencion INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  registros_eliminados INTEGER;
BEGIN
  DELETE FROM public.audit_log_seguridad
  WHERE fecha_evento < CURRENT_TIMESTAMP - (dias_retencion || ' days')::INTERVAL;

  GET DIAGNOSTICS registros_eliminados = ROW_COUNT;

  RETURN registros_eliminados;
END;
$$;

-- Función para obtener resumen de seguridad de un usuario
CREATE OR REPLACE FUNCTION obtener_resumen_seguridad(p_usuario_email VARCHAR)
RETURNS TABLE (
  total_logins_exitosos BIGINT,
  total_logins_fallidos BIGINT,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  total_bloqueos BIGINT,
  ips_distintas BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE tipo = 'login_exitoso'),
    COUNT(*) FILTER (WHERE tipo = 'login_fallido'),
    MAX(fecha_evento) FILTER (WHERE tipo = 'login_exitoso'),
    COUNT(*) FILTER (WHERE tipo = 'cuenta_bloqueada'),
    COUNT(DISTINCT ip_address)
  FROM public.audit_log_seguridad
  WHERE usuario_email = p_usuario_email
  AND fecha_evento > CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE public.audit_log_seguridad IS 'Registra todos los eventos de seguridad para auditoría y detección de anomalías';
COMMENT ON COLUMN public.audit_log_seguridad.tipo IS 'Tipo de evento de seguridad';
COMMENT ON COLUMN public.audit_log_seguridad.usuario_email IS 'Email del usuario (puede no existir en BD si es intento fallido)';
COMMENT ON COLUMN public.audit_log_seguridad.usuario_id IS 'FK a auth.users si el usuario existe';
COMMENT ON COLUMN public.audit_log_seguridad.ip_address IS 'Dirección IP desde donde se originó el evento';
COMMENT ON COLUMN public.audit_log_seguridad.user_agent IS 'User-Agent del navegador';
COMMENT ON COLUMN public.audit_log_seguridad.metadata IS 'Información adicional en JSON (intentos, motivo de bloqueo, etc.)';

-- ============================================
-- DATOS DE PRUEBA (opcional)
-- ============================================

-- Insertar un ejemplo de log de login exitoso
-- INSERT INTO public.audit_log_seguridad (
--   tipo,
--   usuario_email,
--   ip_address,
--   user_agent,
--   metadata
-- ) VALUES (
--   'login_exitoso',
--   'test@example.com',
--   '192.168.1.100',
--   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
--   '{"metodo": "password", "duracion_ms": 245}'::jsonb
-- );

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver estructura
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_log_seguridad'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'audit_log_seguridad';
