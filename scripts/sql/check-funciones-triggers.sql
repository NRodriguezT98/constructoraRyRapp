SELECT prosrc as source_code, proname as function_name
FROM pg_proc
WHERE proname IN (
  'validar_categoria_documento',
  'trigger_compactar_despues_update',
  'trigger_compactar_despues_insert',
  'trigger_compactar_despues_delete'
);
