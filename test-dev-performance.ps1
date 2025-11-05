# ============================================
# SCRIPT: Comparar Performance Dev vs Build
# ============================================
#
# Este script te ayuda a medir la diferencia
# de velocidad entre modo desarrollo y producción
#
# Uso:
#   .\test-dev-performance.ps1
# ============================================

Write-Host ""
Write-Host "⚡ RyR CONSTRUCTORA - TEST DE PERFORMANCE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Función para medir tiempo de inicio
function Measure-StartupTime {
    param (
        [string]$Command,
        [string]$Label
    )

    Write-Host "📊 Midiendo: $Label" -ForegroundColor Yellow
    Write-Host "Comando: $Command" -ForegroundColor Gray
    Write-Host ""

    $startTime = Get-Date

    # Mostrar mensaje
    Write-Host "⏳ Iniciando servidor..." -ForegroundColor Cyan
    Write-Host "   (Presiona Ctrl+C después de que cargue completamente)" -ForegroundColor Gray
    Write-Host ""

    # Ejecutar comando
    try {
        Invoke-Expression $Command
    } catch {
        # Capturar Ctrl+C
    }

    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host ""
    Write-Host "✅ Tiempo de inicio: $duration segundos" -ForegroundColor Green
    Write-Host ""

    return $duration
}

# Menú
Write-Host "Selecciona qué quieres medir:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Desarrollo OPTIMIZADO (Turbopack + 4GB RAM)" -ForegroundColor Cyan
Write-Host "2. Desarrollo ORIGINAL (sin optimizaciones)" -ForegroundColor Cyan
Write-Host "3. Desarrollo con Webpack (sin Turbopack)" -ForegroundColor Cyan
Write-Host "4. Build de Producción" -ForegroundColor Cyan
Write-Host "5. Comparar TODO (toma ~15 minutos)" -ForegroundColor Magenta
Write-Host ""

$opcion = Read-Host "Ingresa opción (1-5)"

Write-Host ""

switch ($opcion) {
    "1" {
        Measure-StartupTime "npm run dev" "Desarrollo OPTIMIZADO (Turbopack)"
    }
    "2" {
        Measure-StartupTime "npm run dev:original" "Desarrollo ORIGINAL"
    }
    "3" {
        Measure-StartupTime "npm run dev:webpack" "Desarrollo con Webpack"
    }
    "4" {
        Write-Host "🏗️ Construyendo aplicación..." -ForegroundColor Yellow
        $buildStart = Get-Date
        npm run build
        $buildEnd = Get-Date
        $buildDuration = ($buildEnd - $buildStart).TotalSeconds
        Write-Host "✅ Build completado en: $buildDuration segundos" -ForegroundColor Green
        Write-Host ""

        Measure-StartupTime "npm start" "Producción (después de build)"
    }
    "5" {
        Write-Host "🔬 COMPARACIÓN COMPLETA" -ForegroundColor Magenta
        Write-Host "========================" -ForegroundColor Magenta
        Write-Host ""

        # Medir cada modo
        Write-Host "📋 Instrucciones:" -ForegroundColor Yellow
        Write-Host "   1. Espera a que cada servidor cargue completamente" -ForegroundColor Gray
        Write-Host "   2. Abre el navegador en http://localhost:3000" -ForegroundColor Gray
        Write-Host "   3. Navega a 2-3 módulos (Proyectos, Viviendas, Auditorías)" -ForegroundColor Gray
        Write-Host "   4. Presiona Ctrl+C para parar y continuar con el siguiente" -ForegroundColor Gray
        Write-Host ""

        $resultados = @()

        # Test 1: Desarrollo Optimizado
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        $tiempo1 = Measure-StartupTime "npm run dev" "Desarrollo OPTIMIZADO (Turbopack)"
        $resultados += @{ Modo = "Dev Optimizado (Turbopack)"; Tiempo = $tiempo1 }

        Start-Sleep -Seconds 3

        # Test 2: Desarrollo Original
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        $tiempo2 = Measure-StartupTime "npm run dev:original" "Desarrollo ORIGINAL"
        $resultados += @{ Modo = "Dev Original"; Tiempo = $tiempo2 }

        Start-Sleep -Seconds 3

        # Test 3: Build
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "🏗️ Construyendo aplicación..." -ForegroundColor Yellow
        $buildStart = Get-Date
        npm run build | Out-Null
        $buildEnd = Get-Date
        $buildDuration = ($buildEnd - $buildStart).TotalSeconds

        $tiempo3 = Measure-StartupTime "npm start" "Producción"
        $resultados += @{ Modo = "Producción (build)"; Tiempo = $buildDuration; TiempoStart = $tiempo3 }

        # Mostrar resultados
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "📊 RESULTADOS FINALES" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host ""

        foreach ($resultado in $resultados) {
            Write-Host "  $($resultado.Modo):" -ForegroundColor Cyan
            Write-Host "    Tiempo de inicio: $($resultado.Tiempo) segundos" -ForegroundColor White
            if ($resultado.TiempoStart) {
                Write-Host "    Tiempo de build: $($resultado.TiempoStart) segundos" -ForegroundColor White
            }
            Write-Host ""
        }

        # Calcular mejoras
        $mejoraTurbopack = [math]::Round((($tiempo2 - $tiempo1) / $tiempo2) * 100, 1)
        Write-Host "🚀 Mejora con Turbopack: $mejoraTurbopack%" -ForegroundColor Green
        Write-Host ""
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Test completado" -ForegroundColor Green
Write-Host ""
