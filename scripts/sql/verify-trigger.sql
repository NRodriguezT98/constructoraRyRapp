SELECT prosrc LIKE '%renuncia_en_curso%' AS tiene_bypass
FROM pg_proc
WHERE proname = 'handle_fuente_inactivada';
