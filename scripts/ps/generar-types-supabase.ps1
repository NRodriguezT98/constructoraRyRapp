# Script para generar types de Supabase usando API REST
# Automatizado para GitHub Copilot

$projectRef = "swyjhwgvkfcfdtemkyad"
$apiUrl = "https://$projectRef.supabase.co/rest/v1/"

Write-Host "🔄 Generando types de Supabase..." -ForegroundColor Cyan
Write-Host "📦 Proyecto: $projectRef" -ForegroundColor Gray
Write-Host ""

# Intentar con Supabase CLI usando login interactivo
Write-Host "🔐 Intentando con Supabase CLI..." -ForegroundColor Yellow

try {
    # Método 1: Usar supabase gen types con autenticación
    $result = npx supabase gen types typescript --project-id ynsxcwgrltvgdqzlgqtf --schema public 2>&1

    if ($LASTEXITCODE -eq 0) {
        $result | Out-File -FilePath "src/lib/supabase/database.types.ts" -Encoding utf8
        Write-Host "✅ Types generados exitosamente!" -ForegroundColor Green
        Write-Host "📁 Archivo: src/lib/supabase/database.types.ts" -ForegroundColor Gray
        exit 0
    }
}
catch {
    Write-Host "⚠️ CLI falló, intentando método alternativo..." -ForegroundColor Yellow
}

# Método 2: Abrir dashboard para copiar manualmente
Write-Host ""
Write-Host "📋 Por favor, sigue estos pasos:" -ForegroundColor Cyan
Write-Host "1. Se abrirá el dashboard de Supabase" -ForegroundColor White
Write-Host "2. Ve a Settings > API" -ForegroundColor White
Write-Host "3. Scroll hasta 'Generate Types'" -ForegroundColor White
Write-Host "4. Click en 'Generate TypeScript'" -ForegroundColor White
Write-Host "5. Copia TODO el código" -ForegroundColor White
Write-Host "6. Pega en src/lib/supabase/database.types.ts" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Enter para abrir el dashboard..."
Read-Host

Start-Process "https://supabase.com/dashboard/project/ynsxcwgrltvgdqzlgqtf/settings/api"

Write-Host ""
Write-Host "✅ Dashboard abierto. Copia los types y pégalos en database.types.ts" -ForegroundColor Green
