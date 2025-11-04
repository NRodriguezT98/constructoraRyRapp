# ==========================================
# SCRIPT: Test Producción Local
# Propósito: Probar aplicación en modo producción
# Versión: 2.0 - Mejorado con métricas
# ==========================================

Write-Host "`n🚀 RyR CONSTRUCTORA - TEST DE PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Verificar variables de entorno
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ Archivo .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ADVERTENCIA: .env.local no encontrado" -ForegroundColor Red
    Write-Host "   Las variables de entorno pueden no estar configuradas" -ForegroundColor Yellow
}

# Paso 1: Limpiar build anterior
Write-Host "`n📁 [1/3] Limpiando builds anteriores..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ Carpeta .next eliminada" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No hay builds anteriores" -ForegroundColor Gray
}

# Paso 2: Build de producción
Write-Host "`n📦 [2/3] Creando build de producción..." -ForegroundColor Yellow
Write-Host "   ⏱️  Esto puede tardar 1-3 minutos dependiendo de tu hardware" -ForegroundColor Gray
Write-Host ""

$buildStart = Get-Date
npm run build
$buildEnd = Get-Date

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error en el build. Revisa los errores arriba." -ForegroundColor Red
    Write-Host ""
    exit 1
}

$buildTime = ($buildEnd - $buildStart).TotalSeconds
Write-Host "`n✅ Build completado exitosamente!" -ForegroundColor Green
Write-Host "   ⏱️  Tiempo de build: $([math]::Round($buildTime, 2)) segundos" -ForegroundColor Cyan

# Mostrar métricas del build
if (Test-Path ".next") {
    $nextSize = (Get-ChildItem .\.next -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    $fileCount = (Get-ChildItem .\.next -Recurse -File).Count
    Write-Host "   📦 Tamaño del build: $([math]::Round($nextSize, 2)) MB" -ForegroundColor Cyan
    Write-Host "   📄 Archivos generados: $fileCount" -ForegroundColor Cyan
}

# Paso 3: Iniciar servidor de producción
Write-Host "`n🚀 [3/3] Iniciando servidor de producción..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ SERVIDOR DE PRODUCCIÓN INICIADO" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "   🌐 URL Local:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🔧 Modo:           Producción (optimizado)" -ForegroundColor Cyan
Write-Host "   ⚡ Performance:    Máxima optimización" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRUEBAS RECOMENDADAS:" -ForegroundColor Yellow
Write-Host "   • Login y autenticación" -ForegroundColor White
Write-Host "   • Navegación entre módulos" -ForegroundColor White
Write-Host "   • Nuevo sidebar compacto (hover para expandir)" -ForegroundColor White
Write-Host "   • Modo oscuro / claro" -ForegroundColor White
Write-Host "   • Performance en móvil" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

npm run start
