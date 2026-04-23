-- ============================================================
-- Migración: Acciones específicas del módulo Negociaciones
-- Fecha: 2026-04-23
-- Descripción: Agrega filas en permisos_rol para las nuevas
--   acciones: trasladar, renunciar, descuento, escritura, ajustar
--   en el módulo 'negociaciones' para todos los roles no-Admin.
--   Por defecto permitido = FALSE (acceso denegado).
-- ============================================================

-- Roles objetivo (Administrador se omite: tiene bypass automático)
-- 'Contabilidad', 'Administrador de Obra', 'Gerencia'

DO $$
DECLARE
  roles TEXT[] := ARRAY['Contabilidad', 'Administrador de Obra', 'Gerencia'];
  acciones TEXT[] := ARRAY['trasladar', 'renunciar', 'descuento', 'escritura', 'ajustar'];
  rol_item TEXT;
  accion_item TEXT;
BEGIN
  FOREACH rol_item IN ARRAY roles LOOP
    FOREACH accion_item IN ARRAY acciones LOOP
      INSERT INTO permisos_rol (rol, modulo, accion, permitido, descripcion)
      VALUES (
        rol_item,
        'negociaciones',
        accion_item,
        FALSE,
        CASE accion_item
          WHEN 'trasladar' THEN 'Permite trasladar la vivienda asignada a otra disponible'
          WHEN 'renunciar'  THEN 'Permite registrar la renuncia del cliente a la negociación'
          WHEN 'descuento'  THEN 'Permite aplicar, modificar o quitar descuentos en la negociación'
          WHEN 'escritura'  THEN 'Permite editar el valor de escritura pública de la negociación'
          WHEN 'ajustar'    THEN 'Permite ajustar el cierre financiero (rebalanceo de fuentes de pago)'
          ELSE NULL
        END
      )
      ON CONFLICT (rol, modulo, accion) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- Verificar resultado
SELECT rol, modulo, accion, permitido, descripcion
FROM permisos_rol
WHERE modulo = 'negociaciones'
  AND accion IN ('trasladar', 'renunciar', 'descuento', 'escritura', 'ajustar')
ORDER BY rol, accion;
