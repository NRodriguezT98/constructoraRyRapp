-- Documentos del cliente (solo campos existentes)
SELECT *
FROM documentos_cliente
WHERE cliente_id = '65e60e24-3dc6-4910-9c52-ae12e0aa484a'
ORDER BY fecha_creacion DESC;
