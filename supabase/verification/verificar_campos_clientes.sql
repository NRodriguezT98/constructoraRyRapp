-- Verificar si los clientes tienen estado_civil y fecha_nacimiento
SELECT
  id,
  nombre_completo,
  estado_civil,
  fecha_nacimiento,
  CASE
    WHEN fecha_nacimiento IS NOT NULL THEN
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento::date))
    ELSE NULL
  END AS edad_calculada
FROM clientes
WHERE estado = 'Interesado'
LIMIT 5;

-- Ver estructura de la vista
SELECT
  id,
  nombre_completo,
  estado_civil,
  fecha_nacimiento,
  telefono,
  email
FROM vista_clientes_resumen
WHERE estado = 'Interesado'
LIMIT 5;
