-- =====================================================
-- CORRECCIÓN: Restaurar ultimo_acceso real desde auth.sessions
-- Usa el login más reciente real de cada usuario.
-- Si nunca tuvo sesión, deja el valor anterior (no toca).
-- =====================================================

UPDATE public.usuarios u
SET ultimo_acceso = s.ultimo_login_real
FROM (
  SELECT user_id, MAX(created_at) AS ultimo_login_real
  FROM auth.sessions
  GROUP BY user_id
) s
WHERE u.id = s.user_id;
