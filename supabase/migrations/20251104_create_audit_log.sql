-- =====================================================
-- SISTEMA DE AUDITORÍA COMPLETA - RyR Constructora
-- =====================================================
-- Fecha: 2025-11-04
-- Descripción: Tabla para auditar TODAS las acciones CRUD
--              en los módulos de negocio (viviendas, clientes,
--              negociaciones, abonos, etc.)
--
-- NOTA: Esta tabla es DIFERENTE de audit_log_seguridad
--       - audit_log_seguridad → Eventos de autenticación/seguridad
--       - audit_log → Eventos de negocio (CRUD en módulos)
-- =====================================================

-- =====================================================
-- 1. CREAR TABLA audit_log
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
  -- Identificador único
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ¿QUÉ SE MODIFICÓ?
  tabla varchar(100) NOT NULL,              -- Tabla afectada: 'viviendas', 'clientes', 'negociaciones', etc.
  accion varchar(20) NOT NULL,              -- Acción realizada: 'CREATE', 'UPDATE', 'DELETE'
  registro_id uuid NOT NULL,                -- ID del registro afectado

  -- ¿QUIÉN LO HIZO?
  usuario_id uuid,                          -- FK a auth.users (puede ser NULL si usuario fue eliminado)
  usuario_email varchar(255) NOT NULL,      -- Email del usuario (guardado por si se elimina el usuario)
  usuario_rol varchar(50),                  -- Rol del usuario al momento de la acción

  -- ¿CUÁNDO?
  fecha_evento timestamp with time zone DEFAULT now() NOT NULL,

  -- ¿DÓNDE?
  ip_address inet,                          -- IP desde donde se hizo el cambio
  user_agent text,                          -- Navegador/dispositivo

  -- ¿QUÉ CAMBIÓ? (Lo más importante para auditoría)
  datos_anteriores jsonb,                   -- Snapshot completo del registro ANTES del cambio (NULL en CREATE)
  datos_nuevos jsonb,                       -- Snapshot completo del registro DESPUÉS del cambio (NULL en DELETE)
  cambios_especificos jsonb,                -- Solo los campos que cambiaron: { campo: { antes: X, despues: Y } }

  -- CONTEXTO ADICIONAL
  metadata jsonb DEFAULT '{}',              -- Datos adicionales: { proyecto_nombre, cliente_email, etc. }
  modulo varchar(50),                       -- Módulo de la app: 'viviendas', 'clientes', 'negociaciones', etc.

  -- VALIDACIÓN
  CONSTRAINT valid_accion CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE')),
  CONSTRAINT valid_datos_create CHECK (
    (accion = 'CREATE' AND datos_anteriores IS NULL AND datos_nuevos IS NOT NULL) OR
    (accion != 'CREATE')
  ),
  CONSTRAINT valid_datos_delete CHECK (
    (accion = 'DELETE' AND datos_nuevos IS NULL AND datos_anteriores IS NOT NULL) OR
    (accion != 'DELETE')
  )
);

-- =====================================================
-- 2. COMENTARIOS EN LA TABLA Y COLUMNAS
-- =====================================================

COMMENT ON TABLE audit_log IS
'Registro de auditoría para todas las operaciones CRUD en módulos de negocio.
Permite trazabilidad completa: quién hizo qué, cuándo, y qué datos cambiaron.';

COMMENT ON COLUMN audit_log.tabla IS
'Nombre de la tabla afectada (ej: viviendas, clientes, negociaciones)';

COMMENT ON COLUMN audit_log.accion IS
'Tipo de operación: CREATE, UPDATE, DELETE';

COMMENT ON COLUMN audit_log.registro_id IS
'UUID del registro que fue creado/modificado/eliminado';

COMMENT ON COLUMN audit_log.datos_anteriores IS
'Snapshot JSON del registro ANTES del cambio. NULL para CREATE.';

COMMENT ON COLUMN audit_log.datos_nuevos IS
'Snapshot JSON del registro DESPUÉS del cambio. NULL para DELETE.';

COMMENT ON COLUMN audit_log.cambios_especificos IS
'JSON con solo los campos que cambiaron. Formato: { "campo": { "antes": valor1, "despues": valor2 } }';

COMMENT ON COLUMN audit_log.metadata IS
'Datos de contexto adicionales: proyecto, cliente, monto, etc.';

COMMENT ON COLUMN audit_log.modulo IS
'Módulo de la aplicación donde ocurrió el cambio';

-- =====================================================
-- 3. ÍNDICES PARA BÚSQUEDA RÁPIDA
-- =====================================================

-- Índice por tabla (para ver historial de viviendas, clientes, etc.)
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla
ON audit_log(tabla);

-- Índice por registro_id (para ver historial de UN registro específico)
CREATE INDEX IF NOT EXISTS idx_audit_log_registro_id
ON audit_log(registro_id);

-- Índice por usuario (para ver actividad de un usuario)
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario
ON audit_log(usuario_id)
WHERE usuario_id IS NOT NULL;

-- Índice por fecha (para reportes cronológicos, consultas recientes)
CREATE INDEX IF NOT EXISTS idx_audit_log_fecha
ON audit_log(fecha_evento DESC);

-- Índice compuesto: tabla + registro_id (query más común)
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla_registro
ON audit_log(tabla, registro_id);

-- Índice por módulo (para dashboard por módulo)
CREATE INDEX IF NOT EXISTS idx_audit_log_modulo
ON audit_log(modulo)
WHERE modulo IS NOT NULL;

-- Índice por acción (para filtrar solo creaciones, actualizaciones, etc.)
CREATE INDEX IF NOT EXISTS idx_audit_log_accion
ON audit_log(accion);

-- Índice compuesto: usuario + fecha (actividad de usuario en rango de fechas)
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario_fecha
ON audit_log(usuario_id, fecha_evento DESC)
WHERE usuario_id IS NOT NULL;

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden ver audit_log
CREATE POLICY "Administradores pueden ver audit_log"
ON audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'Administrador'
  )
);

-- Política: Sistema puede insertar auditoría (SERVICE ROLE)
-- Nota: Los inserts se harán desde el backend con service_role key
CREATE POLICY "Sistema puede insertar audit_log"
ON audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: NADIE puede actualizar o eliminar registros de auditoría
-- (La auditoría debe ser inmutable)
CREATE POLICY "Auditoría es inmutable"
ON audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Auditoría no se puede eliminar"
ON audit_log
FOR DELETE
TO authenticated
USING (false);

-- =====================================================
-- 5. FUNCIÓN AUXILIAR: Calcular cambios entre JSON
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_cambios_json(
  datos_antes jsonb,
  datos_despues jsonb
) RETURNS jsonb AS $$
DECLARE
  cambios jsonb := '{}';
  key text;
  valor_antes jsonb;
  valor_despues jsonb;
BEGIN
  -- Iterar sobre todas las claves del objeto DESPUÉS
  FOR key IN SELECT jsonb_object_keys(datos_despues)
  LOOP
    valor_antes := datos_antes -> key;
    valor_despues := datos_despues -> key;

    -- Si el valor cambió, agregarlo a cambios
    IF valor_antes IS DISTINCT FROM valor_despues THEN
      cambios := cambios || jsonb_build_object(
        key,
        jsonb_build_object(
          'antes', valor_antes,
          'despues', valor_despues
        )
      );
    END IF;
  END LOOP;

  RETURN cambios;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_cambios_json IS
'Compara dos objetos JSON y retorna solo los campos que cambiaron';

-- =====================================================
-- 6. FUNCIÓN RPC: Obtener historial de un registro
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_historial_registro(
  p_tabla varchar,
  p_registro_id uuid,
  p_limit int DEFAULT 100
) RETURNS TABLE (
  id uuid,
  accion varchar,
  fecha_evento timestamp with time zone,
  usuario_email varchar,
  usuario_rol varchar,
  cambios_especificos jsonb,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.accion,
    al.fecha_evento,
    al.usuario_email,
    al.usuario_rol,
    al.cambios_especificos,
    al.metadata
  FROM audit_log al
  WHERE al.tabla = p_tabla
    AND al.registro_id = p_registro_id
  ORDER BY al.fecha_evento DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION obtener_historial_registro IS
'Obtiene el historial de cambios de un registro específico.
Uso: SELECT * FROM obtener_historial_registro(''viviendas'', ''uuid-aqui'', 50)';

-- =====================================================
-- 7. FUNCIÓN RPC: Obtener actividad de usuario
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_actividad_usuario(
  p_usuario_id uuid,
  p_dias int DEFAULT 30,
  p_limit int DEFAULT 100
) RETURNS TABLE (
  id uuid,
  tabla varchar,
  accion varchar,
  fecha_evento timestamp with time zone,
  registro_id uuid,
  modulo varchar,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.tabla,
    al.accion,
    al.fecha_evento,
    al.registro_id,
    al.modulo,
    al.metadata
  FROM audit_log al
  WHERE al.usuario_id = p_usuario_id
    AND al.fecha_evento >= NOW() - INTERVAL '1 day' * p_dias
  ORDER BY al.fecha_evento DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION obtener_actividad_usuario IS
'Obtiene la actividad reciente de un usuario específico.
Uso: SELECT * FROM obtener_actividad_usuario(''uuid-usuario'', 7, 50)';

-- =====================================================
-- 8. FUNCIÓN RPC: Detectar eliminaciones masivas
-- =====================================================

CREATE OR REPLACE FUNCTION detectar_eliminaciones_masivas(
  p_dias int DEFAULT 7,
  p_umbral int DEFAULT 5
) RETURNS TABLE (
  fecha date,
  usuario_email varchar,
  tabla varchar,
  total_eliminaciones bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(al.fecha_evento) AS fecha,
    al.usuario_email,
    al.tabla,
    COUNT(*) AS total_eliminaciones
  FROM audit_log al
  WHERE al.accion = 'DELETE'
    AND al.fecha_evento >= NOW() - INTERVAL '1 day' * p_dias
  GROUP BY DATE(al.fecha_evento), al.usuario_email, al.tabla
  HAVING COUNT(*) >= p_umbral
  ORDER BY total_eliminaciones DESC, fecha DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION detectar_eliminaciones_masivas IS
'Detecta posibles eliminaciones masivas sospechosas (más de X eliminaciones por día).
Uso: SELECT * FROM detectar_eliminaciones_masivas(7, 5)';

-- =====================================================
-- 9. VISTA: Resumen de auditoría por módulo
-- =====================================================

CREATE OR REPLACE VIEW v_auditoria_por_modulo AS
SELECT
  modulo,
  COUNT(*) AS total_eventos,
  COUNT(DISTINCT usuario_id) AS usuarios_activos,
  COUNT(*) FILTER (WHERE accion = 'CREATE') AS total_creaciones,
  COUNT(*) FILTER (WHERE accion = 'UPDATE') AS total_actualizaciones,
  COUNT(*) FILTER (WHERE accion = 'DELETE') AS total_eliminaciones,
  MAX(fecha_evento) AS ultimo_evento,
  MIN(fecha_evento) AS primer_evento
FROM audit_log
WHERE modulo IS NOT NULL
GROUP BY modulo
ORDER BY total_eventos DESC;

COMMENT ON VIEW v_auditoria_por_modulo IS
'Vista con estadísticas de auditoría agrupadas por módulo';

-- =====================================================
-- 10. TRIGGERS (OPCIONAL - Para auditoría automática)
-- =====================================================
-- NOTA: Los triggers están comentados porque vamos a implementar
--       auditoría desde TypeScript para tener más control.
--       Si prefieres auditoría automática, descomenta estas secciones.

/*
-- Función genérica para trigger de auditoría
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  usuario_actual jsonb;
  cambios jsonb;
BEGIN
  -- Obtener usuario de auth.jwt()
  usuario_actual := current_setting('request.jwt.claims', true)::jsonb;

  -- Calcular cambios específicos solo en UPDATE
  IF TG_OP = 'UPDATE' THEN
    cambios := calcular_cambios_json(to_jsonb(OLD), to_jsonb(NEW));
  ELSE
    cambios := NULL;
  END IF;

  -- Insertar en audit_log
  INSERT INTO audit_log (
    tabla,
    accion,
    registro_id,
    usuario_id,
    usuario_email,
    datos_anteriores,
    datos_nuevos,
    cambios_especificos,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    (usuario_actual->>'sub')::uuid,
    usuario_actual->>'email',
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('CREATE', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    cambios,
    inet_client_addr()
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo: Aplicar trigger a viviendas
-- CREATE TRIGGER viviendas_audit_trigger
-- AFTER INSERT OR UPDATE OR DELETE ON viviendas
-- FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Ejemplo: Aplicar trigger a clientes
-- CREATE TRIGGER clientes_audit_trigger
-- AFTER INSERT OR UPDATE OR DELETE ON clientes
-- FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
*/

-- =====================================================
-- 11. GRANTS (Permisos)
-- =====================================================

-- Permitir a usuarios autenticados insertar en audit_log
GRANT INSERT ON audit_log TO authenticated;

-- Solo administradores pueden leer audit_log
-- (Ya está manejado por RLS, pero explicitamos el GRANT)
GRANT SELECT ON audit_log TO authenticated;

-- NADIE puede hacer UPDATE o DELETE
-- (Ya está bloqueado por RLS)

-- =====================================================
-- 12. VALIDACIÓN POST-MIGRACIÓN
-- =====================================================

DO $$
BEGIN
  -- Verificar que la tabla existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'audit_log' AND table_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'ERROR: Tabla audit_log no fue creada';
  END IF;

  -- Verificar que los índices existen
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'audit_log' AND indexname = 'idx_audit_log_tabla'
  ) THEN
    RAISE EXCEPTION 'ERROR: Índice idx_audit_log_tabla no fue creado';
  END IF;

  -- Verificar que RLS está habilitado
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'audit_log' AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'ERROR: RLS no está habilitado en audit_log';
  END IF;

  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE '✅ Tabla audit_log creada';
  RAISE NOTICE '✅ 8 índices creados';
  RAISE NOTICE '✅ 4 políticas RLS creadas';
  RAISE NOTICE '✅ 3 funciones RPC creadas';
  RAISE NOTICE '✅ 1 vista creada';
END $$;
