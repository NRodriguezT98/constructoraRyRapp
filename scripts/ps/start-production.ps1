# ============================================
# SCRIPT: Iniciar Servidor de Producción
# ============================================
#
# Este script inicia el servidor Next.js optimizado
# en modo producción en el puerto 3000
#
# REQUISITO: Debes haber ejecutado el build primero
#   .\build-production.ps1
#
# Uso:
#   .\start-production.ps1
# ============================================

Write-Host ""
Write-Host "🚀 RyR CONSTRUCTORA - SERVIDOR DE PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el build
if (-not (Test-Path .\.next)) {
    Write-Host "❌ ERROR: No se encontró el build de producción" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Primero debes construir la aplicación:" -ForegroundColor Yellow
    Write-Host "   .\build-production.ps1" -ForegroundColor White
    Write-Host "   o" -ForegroundColor Gray
    Write-Host "   npm run build" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Build de producción encontrado" -ForegroundColor Green
Write-Host ""

# Mostrar información
Write-Host "📊 INFORMACIÓN DEL SERVIDOR:" -ForegroundColor Yellow
Write-Host "   🌐 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🔧 Modo: Producción (optimizado)" -ForegroundColor Cyan
Write-Host "   ⚡ Puerto: 3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
npm start
