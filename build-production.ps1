# ============================================
# SCRIPT: Construir y Probar en Modo Producción
# ============================================
#
# Este script:
# 1. Limpia builds anteriores
# 2. Construye la aplicación optimizada
# 3. Inicia el servidor de producción en puerto 3001
# 4. Muestra métricas de build
#
# Uso:
#   .\build-production.ps1
# ============================================

Write-Host ""
Write-Host "🏗️  RyR CONSTRUCTORA - BUILD DE PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Limpiar builds anteriores
Write-Host "🧹 [1/4] Limpiando builds anteriores..." -ForegroundColor Yellow
if (Test-Path .\.next) {
    Remove-Item -Recurse -Force .\.next
    Write-Host "   ✅ Carpeta .next eliminada" -ForegroundColor Green
}
if (Test-Path .\out) {
    Remove-Item -Recurse -Force .\out
    Write-Host "   ✅ Carpeta out eliminada" -ForegroundColor Green
}
Write-Host ""

# 2. Verificar variables de entorno
Write-Host "🔍 [2/4] Verificando variables de entorno..." -ForegroundColor Yellow
if (Test-Path .\.env.local) {
    Write-Host "   ✅ Archivo .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ADVERTENCIA: .env.local no encontrado" -ForegroundColor Red
    Write-Host "   Asegúrate de tener las variables de Supabase configuradas" -ForegroundColor Yellow
}
Write-Host ""

# 3. Construir aplicación
Write-Host "🔨 [3/4] Construyendo aplicación optimizada..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 1-3 minutos)" -ForegroundColor Gray
Write-Host ""

$buildStart = Get-Date
npm run build
$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalSeconds

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "   ✅ Build completado exitosamente" -ForegroundColor Green
    Write-Host "   ⏱️  Tiempo de build: $([math]::Round($buildTime, 2)) segundos" -ForegroundColor Cyan
    Write-Host ""

    # 4. Mostrar métricas
    Write-Host "📊 [4/4] Métricas del Build:" -ForegroundColor Yellow

    # Tamaño de la carpeta .next
    $nextSize = (Get-ChildItem .\.next -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "   📦 Tamaño total: $([math]::Round($nextSize, 2)) MB" -ForegroundColor Cyan

    # Contar archivos
    $fileCount = (Get-ChildItem .\.next -Recurse -File).Count
    Write-Host "   📄 Archivos generados: $fileCount" -ForegroundColor Cyan

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "✅ BUILD COMPLETADO - Listo para producción" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 SIGUIENTE PASO:" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm start" -ForegroundColor White
    Write-Host "   O usa:   .\start-production.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 La aplicación estará disponible en:" -ForegroundColor Yellow
    Write-Host "   http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""

} else {
    Write-Host ""
    Write-Host "   ❌ Error en el build" -ForegroundColor Red
    Write-Host "   Revisa los errores arriba" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
