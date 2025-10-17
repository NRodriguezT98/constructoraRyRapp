# Script para obtener tipos de Supabase manualmente
# Ejecutar en PowerShell

$projectId = "ynsxcwgrltvgdqzlgqtf"
$apiUrl = "https://api.supabase.com/v1/projects/$projectId/types/typescript"

# Este comando abrirá tu navegador en la página correcta
# Copia el código TypeScript generado y pégalo en src/lib/supabase/database.types.ts

Write-Host "================================"
Write-Host "PASO 1: Ve a esta URL en tu navegador:"
Write-Host ""
Write-Host "https://supabase.com/dashboard/project/$projectId/settings/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================"
Write-Host "PASO 2: Scroll hacia abajo hasta 'Project API keys'"
Write-Host "================================"
Write-Host "PASO 3: Busca la sección 'Generate Types'"
Write-Host "================================"
Write-Host "PASO 4: Click en el botón y selecciona 'TypeScript'"
Write-Host "================================"
Write-Host "PASO 5: Copia TODO el código generado"
Write-Host "================================"
Write-Host "PASO 6: Pega en src/lib/supabase/database.types.ts"
Write-Host "================================"
Write-Host ""
Write-Host "Presiona Enter para abrir el navegador..."
Read-Host

Start-Process "https://supabase.com/dashboard/project/$projectId/settings/api"
