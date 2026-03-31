# =====================================================
# Script PowerShell: Copiar SQL al Portapapeles
# Uso: .\copiar-sql.ps1 [paso]
# =====================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('1', '2', '3', 'verificar', 'todo')]
    [string]$Paso = 'menu'
)

function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   COPIAR SQL PARA SUPABASE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Selecciona qué copiar al portapapeles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [0] 🔍 Verificar Estado (RECOMENDADO PRIMERO)" -ForegroundColor Yellow
    Write-Host "  [1] Paso 1: Migración de Clientes (Segura)" -ForegroundColor Green
    Write-Host "  [2] Paso 2: Crear Negociaciones" -ForegroundColor Green
    Write-Host "  [3] Paso 3: Políticas RLS" -ForegroundColor Green
    Write-Host ""
    Write-Host "  [V] Queries de Verificación" -ForegroundColor Magenta
    Write-Host "  [D] Diagnóstico Completo" -ForegroundColor Magenta
    Write-Host "  [L] Limpiar Todo (Empezar de cero)" -ForegroundColor Red
    Write-Host "  [T] Ver instrucciones completas" -ForegroundColor Cyan
    Write-Host "  [Q] Salir" -ForegroundColor Red
    Write-Host ""
}

function Copy-ToClipboard {
    param([string]$FilePath, [string]$Description)

    if (Test-Path $FilePath) {
        Get-Content $FilePath | Set-Clipboard
        Write-Host "✅ Copiado al portapapeles: " -NoNewline -ForegroundColor Green
        Write-Host $Description -ForegroundColor White
        Write-Host ""
        Write-Host "👉 Ahora ve a Supabase Dashboard → SQL Editor → New Query" -ForegroundColor Yellow
        Write-Host "   Pega con Ctrl+V y haz click en 'Run'" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "❌ Error: No se encontró el archivo $FilePath" -ForegroundColor Red
    }
}

function Open-Instructions {
    $instructionsPath = ".\EJECUTAR-SQL-PASO-A-PASO.md"
    if (Test-Path $instructionsPath) {
        code $instructionsPath
        Write-Host "✅ Instrucciones abiertas en VS Code" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró el archivo de instrucciones" -ForegroundColor Red
    }
}

# Rutas de archivos
$migracionPath = ".\supabase\migracion-clientes-segura.sql"
$negociacionesPath = ".\supabase\negociaciones-schema.sql"
$rlsPath = ".\supabase\clientes-negociaciones-rls.sql"
$verificacionPath = ".\supabase\QUERIES-VERIFICACION.sql"
$diagnosticoPath = ".\supabase\DIAGNOSTICO.sql"
$verificarEstadoPath = ".\supabase\VERIFICAR-SIMPLE.sql"
$limpiarPath = ".\supabase\LIMPIAR-MODULO-CLIENTES.sql"

# Procesar parámetro
switch ($Paso) {
    '0' {
        Copy-ToClipboard -FilePath $verificarEstadoPath -Description "Verificar Estado Actual"
        return
    }
    '1' {
        Copy-ToClipboard -FilePath $migracionPath -Description "PASO 1 - Migración de Clientes (Segura)"
        return
    }
    '2' {
        Copy-ToClipboard -FilePath $negociacionesPath -Description "PASO 2 - Crear Negociaciones"
        return
    }
    '3' {
        Copy-ToClipboard -FilePath $rlsPath -Description "PASO 3 - Políticas RLS"
        return
    }
    'verificar' {
        Copy-ToClipboard -FilePath $verificacionPath -Description "Queries de Verificación"
        return
    }
    'diagnostico' {
        Copy-ToClipboard -FilePath $diagnosticoPath -Description "Diagnóstico Completo"
        return
    }
    'limpiar' {
        Copy-ToClipboard -FilePath $limpiarPath -Description "Limpiar Módulo Completo"
        return
    }
    'todo' {
        Open-Instructions
        return
    }
}

# Menú interactivo
while ($true) {
    Show-Menu
    $choice = Read-Host "Selecciona una opción"

    switch ($choice.ToUpper()) {
        '0' {
            Copy-ToClipboard -FilePath $verificarEstadoPath -Description "🔍 Verificar Estado Actual"
            Write-Host ""
            Write-Host "💡 CONSEJO: Ejecuta este script en Supabase para saber qué hacer" -ForegroundColor Yellow
            Read-Host "Presiona Enter para continuar"
        }
        '1' {
            Copy-ToClipboard -FilePath $migracionPath -Description "PASO 1 - Migración de Clientes (Segura)"
            Read-Host "Presiona Enter para continuar"
        }
        '2' {
            Copy-ToClipboard -FilePath $negociacionesPath -Description "PASO 2 - Crear Negociaciones"
            Read-Host "Presiona Enter para continuar"
        }
        '3' {
            Copy-ToClipboard -FilePath $rlsPath -Description "PASO 3 - Políticas RLS"
            Read-Host "Presiona Enter para continuar"
        }
        'V' {
            Copy-ToClipboard -FilePath $verificacionPath -Description "Queries de Verificación"
            Read-Host "Presiona Enter para continuar"
        }
        'D' {
            Copy-ToClipboard -FilePath $diagnosticoPath -Description "📊 Diagnóstico Completo"
            Read-Host "Presiona Enter para continuar"
        }
        'L' {
            Write-Host ""
            Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODAS las tablas del módulo de clientes" -ForegroundColor Red
            $confirm = Read-Host "¿Estás seguro? (escribe 'SI' para confirmar)"
            if ($confirm -eq 'SI') {
                Copy-ToClipboard -FilePath $limpiarPath -Description "🧹 Limpiar Módulo Completo"
            } else {
                Write-Host "❌ Cancelado" -ForegroundColor Yellow
            }
            Read-Host "Presiona Enter para continuar"
        }
        'T' {
            Open-Instructions
            Read-Host "Presiona Enter para continuar"
        }
        'Q' {
            Write-Host "👋 ¡Hasta luego!" -ForegroundColor Cyan
            return
        }
        default {
            Write-Host "❌ Opción inválida. Presiona Enter para continuar..." -ForegroundColor Red
            Read-Host
        }
    }
}
