-- =============================================
-- FUNCIÓN HELPER PARA EJECUTAR SQL DINÁMICO
-- Crear esta función PRIMERO en Supabase
-- =============================================

CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Dar permisos al rol service_role
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
