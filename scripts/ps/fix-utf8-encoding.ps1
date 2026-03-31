# ============================================================================
# 🔧 FIX UTF-8 ENCODING - Solución Definitiva
# ============================================================================
# Descripción: Corrige TODOS los archivos con encoding incorrecto
# Uso: .\fix-utf8-encoding.ps1
# ============================================================================

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔤 FIX UTF-8 ENCODING - Corrección Masiva" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Patrones de caracteres mal codificados
$replacements = @{
    # Emojis
    'ðŸŽ¨' = '🎨'
    'ðŸ"' = '📦'
    'ðŸ"„' = '📄'
    'ðŸ"' = '📝'
    'ðŸ—„ï¸' = '🗄️'
    'ðŸ"§' = '🔧'
    'âœ…' = '✅'
    'â�' = '⚠'
    'â�"' = '❌'

    # Símbolos
    '€¢' = '•'
    'â†'' = '→'
    'â†�' = '←'
    'â�'' = '⭐'

    # Vocales con tilde
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ã­' = 'í'
    'Ã³' = 'ó'
    'Ãº' = 'ú'
    'Ã�' = 'Á'
    'Ã‰' = 'É'
    'Ã�' = 'Í'
    'Ã"' = 'Ó'
    'Ãš' = 'Ú'

    # Ñ
    'Ã±' = 'ñ'
    'Ã'' = 'Ñ'

    # Otros caracteres
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ã­' = 'í'
    'Ã³' = 'ó'
    'Ãº' = 'ú'
    'Ã¼' = 'ü'
    'Ã§' = 'ç'
}

# Archivos a procesar
$extensions = @('*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md')
$folders = @('src', 'docs', '.vscode')

$totalFixed = 0
$filesProcessed = 0

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "📁 Procesando carpeta: $folder" -ForegroundColor Cyan

        foreach ($ext in $extensions) {
            $files = Get-ChildItem -Path $folder -Filter $ext -Recurse -ErrorAction SilentlyContinue |
                     Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }

            foreach ($file in $files) {
                $filesProcessed++
                $content = Get-Content $file.FullName -Raw -Encoding UTF8
                $originalContent = $content
                $changed = $false

                # Aplicar todos los reemplazos
                foreach ($key in $replacements.Keys) {
                    if ($content -match [regex]::Escape($key)) {
                        $content = $content -replace [regex]::Escape($key), $replacements[$key]
                        $changed = $true
                    }
                }

                # Si hubo cambios, guardar con UTF-8
                if ($changed) {
                    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                    $totalFixed++
                    Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
                }
            }
        }
    }
}

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMEN:" -ForegroundColor Yellow
Write-Host "   • Archivos procesados: $filesProcessed" -ForegroundColor White
Write-Host "   • Archivos corregidos: $totalFixed" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

if ($totalFixed -gt 0) {
    Write-Host "✅ Encoding UTF-8 corregido exitosamente" -ForegroundColor Green
} else {
    Write-Host "✅ No se encontraron problemas de encoding" -ForegroundColor Green
}
