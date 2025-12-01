-- Verificar valores ACTUALES de estado en documentos_cliente
SELECT DISTINCT estado, COUNT(*) as cantidad
FROM documentos_cliente
GROUP BY estado
ORDER BY cantidad DESC;
