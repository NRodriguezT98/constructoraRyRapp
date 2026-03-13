-- Ver código de la función del trigger problemático
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'actualizar_estado_vivienda';
