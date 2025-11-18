# Script para eliminar TODOS los console.log de forma agresiva

$files = @(
    "d:\constructoraRyRapp\src\modules\viviendas\hooks\useNuevaVivienda.ts",
    "d:\constructoraRyRapp\src\modules\viviendas\components\nueva-vivienda-view.tsx"
)

foreach ($file in $files) {
    Write-Host "Procesando: $file"

    $content = Get-Content -Path $file -Raw -Encoding UTF8

    # Eliminar todas las líneas que contienen console.log
    $lines = $content -split "`r?`n"
    $cleanedLines = $lines | Where-Object { $_ -notmatch 'console\.(log|error|warn)' }
    $cleaned = $cleanedLines -join "`r`n"

    Set-Content -Path $file -Value $cleaned -Encoding UTF8 -NoNewline

    Write-Host "✅ Logs eliminados de $file"
}

Write-Host "`n✅ PROCESO COMPLETADO"
