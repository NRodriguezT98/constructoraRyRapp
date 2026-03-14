-- Buscar referencias REALES (no en comentarios) a carta_aprobacion_url como campo
-- Esto detecta accesos tipo NEW.carta_aprobacion_url o OLD.carta_aprobacion_url
SELECT p.proname AS function_name, LEFT(p.prosrc, 400) AS preview
FROM pg_proc p
WHERE p.prosrc ~ 'NEW\.carta_aprobacion_url|OLD\.carta_aprobacion_url';
