# Script para copiar SQL de políticas RLS al portapapeles
# Ejecutar: .\fix-storage-rls.ps1

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " FIX: Políticas RLS para Storage - documentos-clientes" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

$sql = Get-Content -Path "fix-storage-rls-policies.sql" -Raw

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
Write-Host "  5. Intenta subir la cedula nuevamente" -ForegroundColor White
Write-Host ""

# Copiar al portapapeles
try {
    $sql | Set-Clipboard
    Write-Host "OK: SQL copiado al portapapeles" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo copiar. Copia manualmente el SQL de arriba" -ForegroundColor Red
}

Write-Host ""
