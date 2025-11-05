-- ============================================
-- 🧹 LIMPIEZA COMPLETA DE BASE DE DATOS
-- ============================================
-- ⚠️ ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS
-- ⚠️ Las tablas y estructura se mantienen intactas
-- ⚠️ Ejecutar SOLO en desarrollo, NUNCA en producción
--
-- Fecha: 2025-11-05
-- Propósito: Limpiar base de datos para empezar fresco
-- ============================================

-- Desactivar verificación de claves foráneas temporalmente
SET session_replication_role = 'replica';

-- ============================================
-- PASO 1: LIMPIAR TABLAS DE NEGOCIO
-- ============================================

-- 1. Eliminar auditorías (sin dependencias)
TRUNCATE TABLE auditoria_acciones CASCADE;
TRUNCATE TABLE auditoria_cambios CASCADE;
TRUNCATE TABLE auditoria_errores CASCADE;

-- 2. Eliminar documentos
TRUNCATE TABLE documentos CASCADE;

-- 3. Eliminar abonos
TRUNCATE TABLE abonos CASCADE;

-- 4. Eliminar renuncias
TRUNCATE TABLE renuncias CASCADE;

-- 5. Eliminar negociaciones
TRUNCATE TABLE negociaciones CASCADE;

-- 6. Eliminar viviendas (dependencia de manzanas)
TRUNCATE TABLE viviendas CASCADE;

-- 7. Eliminar manzanas (dependencia de proyectos)
TRUNCATE TABLE manzanas CASCADE;

-- 8. Eliminar proyectos
TRUNCATE TABLE proyectos CASCADE;

-- 9. Eliminar clientes
TRUNCATE TABLE clientes CASCADE;

-- ============================================
-- PASO 2: LIMPIAR TABLAS DE CONFIGURACIÓN
-- ============================================

-- 10. Eliminar categorías de documentos
TRUNCATE TABLE categorias_documentos CASCADE;

-- ============================================
-- PASO 3: LIMPIAR TABLA DE USUARIOS
-- (Opcional - comentado por seguridad)
-- ============================================

-- ⚠️ DESCOMENTAR SOLO SI QUIERES ELIMINAR USUARIOS
-- TRUNCATE TABLE usuarios CASCADE;

-- ⚠️ Si solo quieres mantener tu usuario admin, usa esto en su lugar:
-- DELETE FROM usuarios WHERE email != 'n_rodriguez98@outlook.com';

-- ============================================
-- PASO 4: RESETEAR SECUENCIAS (si las hay)
-- ============================================

-- No hay secuencias en este esquema (todos usan UUID)

-- Reactivar verificación de claves foráneas
SET session_replication_role = 'origin';

-- ============================================
-- VERIFICACIÓN DE RESULTADOS
-- ============================================

-- Ver conteo de registros en cada tabla
SELECT
  'proyectos' as tabla,
  COUNT(*) as registros
FROM proyectos
UNION ALL
SELECT 'manzanas', COUNT(*) FROM manzanas
UNION ALL
SELECT 'viviendas', COUNT(*) FROM viviendas
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'negociaciones', COUNT(*) FROM negociaciones
UNION ALL
SELECT 'abonos', COUNT(*) FROM abonos
UNION ALL
SELECT 'renuncias', COUNT(*) FROM renuncias
UNION ALL
SELECT 'documentos', COUNT(*) FROM documentos
UNION ALL
SELECT 'categorias_documentos', COUNT(*) FROM categorias_documentos
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'auditoria_acciones', COUNT(*) FROM auditoria_acciones
UNION ALL
SELECT 'auditoria_cambios', COUNT(*) FROM auditoria_cambios
UNION ALL
SELECT 'auditoria_errores', COUNT(*) FROM auditoria_errores
ORDER BY tabla;

-- ============================================
-- ✅ LIMPIEZA COMPLETADA
-- ============================================
-- Todas las tablas han sido vaciadas
-- La estructura de la base de datos se mantiene intacta
-- Los buckets de Storage deben limpiarse manualmente
-- ============================================
