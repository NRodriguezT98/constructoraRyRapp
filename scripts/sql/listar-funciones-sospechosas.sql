-- Listar funciones que probablemente usan audit_log
SELECT proname FROM pg_proc WHERE proname LIKE '%audit%' OR proname LIKE '%fuente%' OR proname LIKE '%negociacion%' ORDER BY proname;
