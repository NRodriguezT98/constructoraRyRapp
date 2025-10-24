# Script PowerShell para copiar SQL al portapapeles
# Ejecutar: .\scripts\ejecutar-sql-db.ps1

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " ELIMINAR COLUMNA es_documento_identidad" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# SQL a ejecutar
$sql = @'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documentos_cliente'
      AND column_name = 'es_documento_identidad'
  ) THEN
    DROP INDEX IF EXISTS idx_documentos_cliente_cedula;
    ALTER TABLE documentos_cliente DROP COLUMN es_documento_identidad;
    RAISE NOTICE 'Columna eliminada exitosamente';
  ELSE
    RAISE NOTICE 'La columna NO existe';
  END IF;
END $$;
'@

Write-Host "SQL a ejecutar:" -ForegroundColor Yellow
Write-Host ""
Write-Host $sql -ForegroundColor White
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PASOS:" -ForegroundColor Green
Write-Host "  1. El SQL ha sido copiado al portapapeles" -ForegroundColor White
Write-Host "  2. Ve al Dashboard de Supabase > SQL Editor" -ForegroundColor White
Write-Host "  3. Pega el SQL (Ctrl+V)" -ForegroundColor White
Write-Host "  4. Haz click en RUN" -ForegroundColor White
Write-Host "  5. Vuelve aquí y reinicia el servidor" -ForegroundColor White
Write-Host ""

# Copiar al portapapeles
try {
    $sql | Set-Clipboard
    Write-Host "OK: SQL copiado al portapapeles" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo copiar. Copia manualmente el SQL de arriba" -ForegroundColor Red
}

Write-Host ""
