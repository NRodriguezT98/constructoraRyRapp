-- =====================================================
-- CONVERTIR USUARIO ACTUAL EN ADMINISTRADOR
-- =====================================================
-- Instrucciones:
-- 1. Reemplaza 'TU_EMAIL_AQUI' con tu email actual de login
-- 2. Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- Ver todos los usuarios actuales
SELECT
  id,
  email,
  nombres,
  apellidos,
  rol,
  estado,
  fecha_creacion
FROM usuarios
ORDER BY fecha_creacion DESC;

-- Convertir tu usuario en Administrador
-- ⚠️ REEMPLAZA 'TU_EMAIL_AQUI' con tu email real
UPDATE usuarios
SET
  rol = 'Administrador',
  nombres = COALESCE(NULLIF(nombres, ''), 'Admin'), -- Si está vacío, poner 'Admin'
  apellidos = COALESCE(NULLIF(apellidos, ''), 'Sistema') -- Si está vacío, poner 'Sistema'
WHERE email = 'TU_EMAIL_AQUI';

-- Verificar el cambio
SELECT
  email,
  nombres,
  apellidos,
  rol,
  estado
FROM usuarios
WHERE rol = 'Administrador';
