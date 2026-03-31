# 🚀 Script Automatizado de Migraciones - RyR Constructora
# Ejecuta las migraciones SQL en orden correcto con validaciones

param(
    [switch]$DryRun,      # Solo muestra qué se ejecutaría (no ejecuta)
    [switch]$Force,       # Salta confirmaciones
    [switch]$Verbose      # Muestra output detallado
)

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

$ErrorActionPreference = "Stop"
$MigrationsPath = "supabase/migrations"
$BackupPath = "backups"

# Lista de migraciones en ORDEN de ejecución
$Migrations = @(
    @{
        File = "001_actualizar_estados_clientes.sql"
        Name = "Estados de Clientes"
        Description = "Agregar estados: 'En Proceso de Renuncia', 'Propietario'"
    },
    @{
        File = "002_actualizar_estados_viviendas.sql"
        Name = "Estados de Viviendas"
        Description = "Nuevos estados + campos: negociacion_id, fecha_entrega"
    },
    @{
        File = "003_actualizar_estados_negociaciones.sql"
        Name = "Estados de Negociaciones"
        Description = "Actualizar estados + campos: fecha_renuncia_efectiva, fecha_completada"
    },
    @{
        File = "004_actualizar_tabla_renuncias.sql"
        Name = "Tabla Renuncias Completa"
        Description = "15+ campos nuevos + estados actualizados"
    },
    @{
        File = "005_validaciones_finales.sql"
        Name = "Validaciones y Triggers"
        Description = "Constraints, triggers, funciones, vistas"
    }
)

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Text, [string]$Color = "Yellow")
    Write-Host "  $Text" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Text)
    Write-Host "  $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "  $Text" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Header "Verificando Prerrequisitos"

    # Verificar psql
    $psqlExists = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlExists) {
        Write-Error "❌ psql no encontrado"
        Write-Step "Instalar PostgreSQL Client:" -Color Gray
        Write-Step "  winget install PostgreSQL.PostgreSQL" -Color Gray
        return $false
    }
    Write-Success "✅ psql encontrado: $($psqlExists.Source)"

    # Verificar DATABASE_URL
    if (-not $env:DATABASE_URL) {
        Write-Error "❌ DATABASE_URL no configurado"
        Write-Step "Ver guía: docs/CONFIGURAR-CREDENCIALES-MIGRACION.md" -Color Gray
        return $false
    }
    Write-Success "✅ DATABASE_URL configurado"

    # Verificar archivos de migración
    $missingFiles = @()
    foreach ($migration in $Migrations) {
        $filePath = Join-Path $MigrationsPath $migration.File
        if (-not (Test-Path $filePath)) {
            $missingFiles += $migration.File
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-Error "❌ Archivos faltantes:"
        foreach ($file in $missingFiles) {
            Write-Step "  - $file" -Color Red
        }
        return $false
    }
    Write-Success "✅ Todos los archivos de migración encontrados ($($Migrations.Count))"

    return $true
}

function Show-MigrationPlan {
    Write-Header "Plan de Ejecución"

    Write-Step "Se ejecutarán $($Migrations.Count) migraciones en orden:" -Color Yellow
    Write-Host ""

    for ($i = 0; $i -lt $Migrations.Count; $i++) {
        $migration = $Migrations[$i]
        Write-Host "  $($i + 1). " -NoNewline -ForegroundColor White
        Write-Host "$($migration.Name)" -ForegroundColor Cyan
        Write-Host "     $($migration.Description)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Step "⚠️  IMPORTANTE:" -Color Red
    Write-Step "   - Se recomienda tener un backup reciente" -Color Yellow
    Write-Step "   - Las migraciones preservan datos existentes" -Color Yellow
    Write-Step "   - Cada script tiene instrucciones de rollback" -Color Yellow
}

function Confirm-Execution {
    if ($Force) {
        return $true
    }

    Write-Host ""
    Write-Host "  ¿Continuar con la ejecución? (S/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host

    return ($response -eq "S" -or $response -eq "s" -or $response -eq "Y" -or $response -eq "y")
}

function Execute-Migration {
    param(
        [hashtable]$Migration,
        [int]$Index
    )

    $filePath = Join-Path $MigrationsPath $Migration.File

    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "  Ejecutando ($($Index + 1)/$($Migrations.Count)): " -NoNewline -ForegroundColor Cyan
    Write-Host "$($Migration.Name)" -ForegroundColor White
    Write-Host "  Archivo: $($Migration.File)" -ForegroundColor Gray
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

    if ($DryRun) {
        Write-Step "[DRY RUN] No se ejecutará, solo simulación" -Color Magenta
        Start-Sleep -Milliseconds 500
        return $true
    }

    try {
        # Ejecutar con psql
        if ($Verbose) {
            psql $env:DATABASE_URL -f $filePath
        } else {
            psql $env:DATABASE_URL -f $filePath 2>&1 | Out-Null
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Completado exitosamente"
            return $true
        } else {
            Write-Error "❌ Error en ejecución (código: $LASTEXITCODE)"
            return $false
        }
    }
    catch {
        Write-Error "❌ Excepción: $($_.Exception.Message)"
        return $false
    }
}

function Show-ValidationQueries {
    Write-Header "Validación Post-Migración"

    Write-Step "Ejecuta estas queries para verificar:" -Color Yellow
    Write-Host ""

    $queries = @"
-- 1. Verificar estados de todas las tablas
SELECT 'clientes' as tabla, estado, COUNT(*) as cantidad
FROM clientes GROUP BY estado
UNION ALL
SELECT 'viviendas', estado, COUNT(*)
FROM viviendas GROUP BY estado
UNION ALL
SELECT 'negociaciones', estado, COUNT(*)
FROM negociaciones GROUP BY estado
UNION ALL
SELECT 'renuncias', estado, COUNT(*)
FROM renuncias GROUP BY estado;

-- 2. Verificar nuevos campos agregados
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('viviendas', 'negociaciones', 'renuncias')
  AND column_name IN (
    'negociacion_id', 'fecha_entrega',
    'fecha_renuncia_efectiva', 'fecha_completada',
    'vivienda_valor_snapshot', 'monto_a_devolver'
  )
ORDER BY table_name, column_name;

-- 3. Verificar triggers creados
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'trigger_%';

-- 4. Verificar vistas creadas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%';
"@

    Write-Host $queries -ForegroundColor DarkGray
    Write-Host ""
    Write-Step "💡 Copia y ejecuta en Supabase SQL Editor o psql" -Color Cyan
}

# ============================================================================
# EJECUCIÓN PRINCIPAL
# ============================================================================

try {
    Clear-Host

    Write-Header "🚀 EJECUCIÓN DE MIGRACIONES SQL"

    if ($DryRun) {
        Write-Host "  🔍 MODO DRY RUN (No se ejecutará nada)" -ForegroundColor Magenta
        Write-Host ""
    }

    # 1. Verificar prerrequisitos
    if (-not (Test-Prerequisites)) {
        exit 1
    }

    # 2. Mostrar plan
    Show-MigrationPlan

    # 3. Confirmar ejecución
    if (-not (Confirm-Execution)) {
        Write-Host ""
        Write-Step "❌ Ejecución cancelada por el usuario" -Color Yellow
        exit 0
    }

    # 4. Ejecutar migraciones
    Write-Header "Ejecutando Migraciones"

    $successCount = 0
    $failedMigration = $null

    for ($i = 0; $i -lt $Migrations.Count; $i++) {
        $success = Execute-Migration -Migration $Migrations[$i] -Index $i

        if ($success) {
            $successCount++
        } else {
            $failedMigration = $Migrations[$i]
            break
        }
    }

    # 5. Reporte final
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

    if ($successCount -eq $Migrations.Count) {
        Write-Header "🎉 MIGRACIONES COMPLETADAS EXITOSAMENTE"
        Write-Success "✅ $successCount/$($Migrations.Count) migraciones ejecutadas"

        if (-not $DryRun) {
            Show-ValidationQueries
        }

        Write-Host ""
        Write-Step "📚 Siguiente paso:" -Color Cyan
        Write-Step "   1. Ejecutar queries de validación" -Color Gray
        Write-Step "   2. Actualizar DATABASE-SCHEMA-REFERENCE.md" -Color Gray
        Write-Step "   3. Actualizar tipos TypeScript en el código" -Color Gray

    } else {
        Write-Header "❌ MIGRACIONES FALLIDAS"
        Write-Error "❌ Falló en: $($failedMigration.Name)"
        Write-Step "   Archivo: $($failedMigration.File)" -Color Red
        Write-Host ""
        Write-Step "📚 Ver instrucciones de rollback en:" -Color Yellow
        Write-Step "   supabase/migrations/README-MIGRACIONES.md" -Color Gray

        exit 1
    }

} catch {
    Write-Host ""
    Write-Error "❌ Error crítico: $($_.Exception.Message)"
    Write-Host ""
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    exit 1
}
