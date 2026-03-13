-- Corregir cliente "felipe santiago morel jackson"
-- Nombres correctos: "felipe santiago"
-- Apellidos correctos: "morel jackson"

UPDATE clientes
SET
  nombres = 'felipe santiago',
  apellidos = 'morel jackson'
WHERE numero_documento = '1058244';

-- Verificar corrección
SELECT id, nombres, apellidos, nombre_completo
FROM clientes
WHERE numero_documento = '1058244';
