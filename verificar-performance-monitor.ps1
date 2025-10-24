# Script para verificar la integración del Performance Monitor

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verificando Performance Monitor" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos críticos
$archivos = @(
    @{Ruta="src\hooks\usePerformanceMonitor.ts"; Nombre="Hook principal"},
    @{Ruta="src\hooks\PerformanceDebugPanel.tsx"; Nombre="Panel de debug"},
    @{Ruta="src\app\layout.tsx"; Nombre="Layout principal"},
    @{Ruta="src\modules\clientes\components\clientes-page-main.tsx"; Nombre="Módulo Clientes"},
    @{Ruta="src\modules\proyectos\components\proyectos-page-main.tsx"; Nombre="Módulo Proyectos"}
)

$todosExisten = $true

foreach ($archivo in $archivos) {
    if (Test-Path $archivo.Ruta) {
        Write-Host "✅ $($archivo.Nombre)" -ForegroundColor Green
        Write-Host "   $($archivo.Ruta)" -ForegroundColor Gray
    } else {
        Write-Host "❌ $($archivo.Nombre) - NO ENCONTRADO" -ForegroundColor Red
        Write-Host "   $($archivo.Ruta)" -ForegroundColor Gray
        $todosExisten = $false
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Verificar integración en layout
if (Test-Path "src\app\layout.tsx") {
    $layoutContent = Get-Content "src\app\layout.tsx" -Raw

    Write-Host "Verificando integración en Layout:" -ForegroundColor Yellow

    if ($layoutContent -match "import.*PerformanceDebugPanel") {
        Write-Host "✅ Import del panel encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta import del panel" -ForegroundColor Red
    }

    if ($layoutContent -match "<PerformanceDebugPanel") {
        Write-Host "✅ Componente renderizado" -ForegroundColor Green
    } else {
        Write-Host "❌ Componente no renderizado" -ForegroundColor Red
    }

    if ($layoutContent -match "NODE_ENV.*development") {
        Write-Host "✅ Condicional de desarrollo activa" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Panel se mostrará en producción también" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Verificar módulos instrumentados
$modulosInstrumentados = @(
    @{Ruta="src\modules\clientes\components\clientes-page-main.tsx"; Nombre="Clientes"},
    @{Ruta="src\modules\proyectos\components\proyectos-page-main.tsx"; Nombre="Proyectos"}
)

Write-Host "Módulos instrumentados:" -ForegroundColor Yellow

foreach ($modulo in $modulosInstrumentados) {
    if (Test-Path $modulo.Ruta) {
        $contenido = Get-Content $modulo.Ruta -Raw

        if ($contenido -match "usePerformanceMonitor") {
            Write-Host "✅ $($modulo.Nombre) - Hook integrado" -ForegroundColor Green

            if ($contenido -match "markDataLoaded") {
                Write-Host "   ✅ markDataLoaded() presente" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  markDataLoaded() no encontrado" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ $($modulo.Nombre) - Hook NO integrado" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

# Resumen
Write-Host ""
if ($todosExisten) {
    Write-Host "CONFIGURACION COMPLETA" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "1. npm run dev (si no esta corriendo)" -ForegroundColor White
    Write-Host "2. Abre http://localhost:3000" -ForegroundColor White
    Write-Host "3. Presiona Ctrl + Shift + P para ver el panel" -ForegroundColor White
    Write-Host "4. Navega entre modulos y observa las metricas" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentacion completa:" -ForegroundColor Cyan
    Write-Host "   docs\GUIA-PERFORMANCE-MONITOR.md" -ForegroundColor White
} else {
    Write-Host "CONFIGURACION INCOMPLETA" -ForegroundColor Yellow
    Write-Host "Revisa los archivos marcados con X" -ForegroundColor Yellow
}

Write-Host ""
