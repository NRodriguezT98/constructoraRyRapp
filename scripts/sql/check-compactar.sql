-- 1. ¿Existe compactar_orden_requisitos?
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'compactar_orden_requisitos';
