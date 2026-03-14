-- Ver código completo de las 2 funciones restantes con carta_aprobacion_url
SELECT p.proname, p.prosrc
FROM pg_proc p
WHERE p.proname IN ('crear_documento_pendiente_si_falta_carta', 'fn_invalidar_carta_por_cambio');
