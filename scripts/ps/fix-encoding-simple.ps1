# Fix UTF-8 Encoding - Version Simple
# Convierte todos los archivos TypeScript/React a UTF-8

Write-Host "`nArreglando encoding UTF-8..." -ForegroundColor Yellow

$count = 0
$folders = @("src\modules\viviendas")

foreach ($folder in $folders) {
    $files = Get-ChildItem -Path $folder -Include "*.ts","*.tsx" -Recurse

    foreach ($file in $files) {
        try {
            # Leer como UTF-8
            $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

            # Reemplazos criticos
            $content = $content -replace [char]0xF0F09F8EA8, [char]0x1F3A8  # emoji
            $content = $content -replace '€¢', '•'
            $content = $content -replace 'Ã³', 'ó'
            $content = $content -replace 'Ã­', 'í'
            $content = $content -replace 'Ã¡', 'á'
            $content = $content -replace 'Ã©', 'é'
            $content = $content -replace 'Ãº', 'ú'
            $content = $content -replace 'Ã±', 'ñ'

            # Guardar como UTF-8
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            $count++
            Write-Host "✅ $($file.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Error en $($file.Name)" -ForegroundColor Red
        }
    }
}

Write-Host "`n✅ $count archivos procesados`n" -ForegroundColor Green
