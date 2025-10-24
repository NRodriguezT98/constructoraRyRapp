# ==========================================
# SCRIPT: Test Producción Local
# Propósito: Probar aplicación en modo producción
# ==========================================

Write-Host "`n🚀 PREPARANDO TEST DE PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Paso 1: Limpiar build anterior
Write-Host "📁 Limpiando builds anteriores..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ Carpeta .next eliminada" -ForegroundColor Green
}

# Paso 2: Build de producción
Write-Host "`n📦 Creando build de producción (esto puede tardar 2-3 minutos)..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error en el build. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build completado exitosamente!" -ForegroundColor Green

# Paso 3: Iniciar servidor de producción
Write-Host "`n🚀 Iniciando servidor de producción..." -ForegroundColor Yellow
Write-Host "   📍 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   ⏱️  Presiona Ctrl+C para detener`n" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

npm run start
