-- Migración: Normalizar campo 'estado' en documentos_cliente
-- Problema: El servicio legacy escribía 'Eliminado'/'Activo' (mayúscula)
--           El servicio genérico escribe 'eliminado'/'activo' (minúscula)
-- Resultado: Documentos eliminados no aparecían en la Papelera
--
-- Esta migración normaliza todos los valores históricos a minúscula

UPDATE documentos_cliente SET estado = 'eliminado' WHERE estado = 'Eliminado';
UPDATE documentos_cliente SET estado = 'activo'    WHERE estado = 'Activo';
UPDATE documentos_cliente SET estado = 'archivado' WHERE estado = 'Archivado';
