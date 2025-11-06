# Script para eliminar console.log de los archivos de Proyectos

$archivos = @(
    "src\modules\proyectos\hooks\useProyectosQuery.ts",
    "src\modules\proyectos\hooks\useProyectosForm.ts",
    "src\modules\proyectos\services\proyectos.service.ts"
)

foreach ($archivo in $archivos) {
    $rutaCompleta = Join-Path $PSScriptRoot $archivo

    if (Test-Path $rutaCompleta) {
        Write-Host "🧹 Limpiando logs de: $archivo" -ForegroundColor Yellow

        # Leer contenido
        $contenido = Get-Content $rutaCompleta -Raw -Encoding UTF8

        # Remover console.log con sus argumentos (multi-línea)
        $contenido = $contenido -replace "console\.log\([^)]*\)(\s*\n)*", ""

        # Remover console.error con sus argumentos (multi-línea)
        $contenido = $contenido -replace "console\.error\([^)]*\)(\s*\n)*", ""

        # Remover console.warn con sus argumentos (multi-línea)
        $contenido = $contenido -replace "console\.warn\([^)]*\)(\s*\n)*", ""

        # Remover líneas de separadores (━━━━━)
        $contenido = $contenido -replace "console\.log\('━+'\)(\s*\n)*", ""

        # Guardar archivo limpio
        Set-Content -Path $rutaCompleta -Value $contenido -Encoding UTF8 -NoNewline

        Write-Host "✅ Logs eliminados de: $archivo" -ForegroundColor Green
    } else {
        Write-Host "❌ Archivo no encontrado: $archivo" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Limpieza completada!" -ForegroundColor Cyan
