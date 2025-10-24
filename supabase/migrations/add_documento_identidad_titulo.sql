-- Agregar columna para guardar título personalizado de la cédula
-- Esto permite renombrar la cédula sin afectar el archivo físico

ALTER TABLE clientes
ADD COLUMN documento_identidad_titulo VARCHAR(200);

-- Comentario explicativo
COMMENT ON COLUMN clientes.documento_identidad_titulo IS
'Título personalizado para mostrar el documento de identidad. Si es NULL, se usa "Cédula de Ciudadanía" por defecto.';

-- Migración de datos: dejar NULL para usar el título por defecto
-- (No es necesario UPDATE porque NULL es el valor deseado)
