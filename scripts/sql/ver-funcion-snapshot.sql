-- Ver definición de función del trigger
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'crear_snapshot_por_cambio_fuente';
