# ============================================
# SCRIPT: Test Completo de Producción
# ============================================
#
# Este script hace TODO el proceso:
# 1. Limpia builds anteriores
# 2. Construye la aplicación
# 3. Inicia el servidor de producción
#
# Es una combinación de build-production.ps1 + start-production.ps1
#
# Uso:
#   .\test-production.ps1
# ============================================

Write-Host ""
Write-Host "🧪 RyR CONSTRUCTORA - TEST DE PRODUCCIÓN COMPLETO" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

# Paso 1: Build
Write-Host "PASO 1: Construir aplicación" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Gray
.\build-production.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ El build falló. Abortando test de producción." -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "PASO 2: Iniciar servidor de producción" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Gray
Write-Host ""

# Pequeña pausa para que se vea el mensaje
Start-Sleep -Seconds 2

# Paso 2: Start
.\start-production.ps1
