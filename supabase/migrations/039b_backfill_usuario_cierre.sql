UPDATE renuncias
SET usuario_cierre = usuario_registro
WHERE estado = 'Cerrada'
  AND usuario_cierre IS NULL
  AND usuario_registro IS NOT NULL;
