-- Verificar archivos en Storage de este cliente
SELECT
  o.id,
  o.name,
  o.bucket_id,
  o.created_at,
  CONCAT('https://mlxvufgzgrvxdjfknvzi.supabase.co/storage/v1/object/public/', o.bucket_id, '/', o.name) as url_publica
FROM storage.objects o
WHERE o.bucket_id = 'documentos-clientes'
  AND o.name LIKE '%65e60e24%'
ORDER BY o.created_at DESC;
