#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Ejecuta scripts SQL directamente en Supabase usando la API REST
.DESCRIPTION
    Lee archivo SQL y lo ejecuta en Supabase sin necesidad de copiar/pegar
.PARAMETER SqlFile
    Ruta al archivo SQL a ejecutar
.PARAMETER ShowSql
    Muestra el SQL antes de ejecutar
.EXAMPLE
    .\ejecutar-sql.ps1 -SqlFile "supabase\storage\storage-documentos-viviendas.sql"
.EXAMPLE
    .\ejecutar-sql.ps1 -SqlFile "supabase\migrations\mi-migracion.sql" -ShowSql
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile,

    [switch]$ShowSql
)

$ErrorActionPreference = "Stop"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "===> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  → $Message" -ForegroundColor Yellow
}

function Load-EnvFile {
    param([string]$EnvFile = ".env.local")

    if (!(Test-Path $EnvFile)) {
        throw "Archivo $EnvFile no encontrado"
    }

    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()

            # Remover comillas si existen
            $value = $value -replace '^["'']|["'']$', ''

            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

function Invoke-SupabaseSQL {
    param(
        [string]$Sql,
        [string]$Url,
        [string]$ApiKey
    )

    # API de Supabase para ejecutar SQL
    $endpoint = "$Url/rest/v1/rpc/exec_sql"

    $headers = @{
        "apikey" = $ApiKey
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }

    $body = @{
        query = $Sql
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message; Response = $_.ErrorDetails.Message }
    }
}

function Execute-SqlDirect {
    param(
        [string]$Sql,
        [string]$ConnectionString
    )

    Write-Info "Intentando ejecutar con psql..."

    # Extraer credenciales del CONNECTION STRING
    if ($ConnectionString -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
        $user = $matches[1]
        $password = $matches[2]
        $host = $matches[3]
        $port = $matches[4]
        $database = $matches[5]

        # Crear archivo temporal con SQL
        $tempFile = [System.IO.Path]::GetTempFileName()
        $Sql | Out-File -FilePath $tempFile -Encoding UTF8

        try {
            # Configurar variable de entorno para password
            $env:PGPASSWORD = $password

            # Ejecutar psql
            $output = psql -h $host -p $port -U $user -d $database -f $tempFile 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Success "SQL ejecutado exitosamente con psql"
                return @{ Success = $true; Output = $output }
            }
            else {
                return @{ Success = $false; Error = "psql falló con código $LASTEXITCODE", Output = $output }
            }
        }
        finally {
            # Limpiar
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        }
    }
    else {
        return @{ Success = $false; Error = "Formato de CONNECTION STRING inválido" }
    }
}

# ============================================================================
# SCRIPT PRINCIPAL
# ============================================================================

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   EJECUTAR SQL EN SUPABASE" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Validar archivo SQL
Write-Step "Validando archivo SQL"
if (!(Test-Path $SqlFile)) {
    Write-Error-Custom "Archivo no encontrado: $SqlFile"
    exit 1
}
Write-Success "Archivo encontrado: $SqlFile"

# 2. Leer SQL
Write-Step "Leyendo contenido SQL"
$sqlContent = Get-Content $SqlFile -Raw -Encoding UTF8
$lines = ($sqlContent -split "`n").Count
Write-Success "Leídas $lines líneas de SQL"

if ($ShowSql) {
    Write-Host ""
    Write-Host "--- SQL A EJECUTAR ---" -ForegroundColor Yellow
    Write-Host $sqlContent -ForegroundColor Gray
    Write-Host "--- FIN SQL ---" -ForegroundColor Yellow
    Write-Host ""

    $confirm = Read-Host "¿Deseas continuar con la ejecución? (S/N)"
    if ($confirm -ne 'S' -and $confirm -ne 's') {
        Write-Info "Ejecución cancelada por el usuario"
        exit 0
    }
}

# 3. Cargar variables de entorno
Write-Step "Cargando configuración de Supabase"
try {
    Load-EnvFile
    Write-Success "Variables de entorno cargadas"
}
catch {
    Write-Error-Custom "Error al cargar .env.local: $_"
    exit 1
}

# 4. Validar credenciales
$supabaseUrl = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL", "Process")
$serviceKey = [Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY", "Process")
$dbUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")

if ([string]::IsNullOrEmpty($supabaseUrl)) {
    Write-Error-Custom "NEXT_PUBLIC_SUPABASE_URL no encontrado en .env.local"
    exit 1
}

if ([string]::IsNullOrEmpty($serviceKey)) {
    Write-Error-Custom "SUPABASE_SERVICE_ROLE_KEY no encontrado en .env.local"
    Write-Info "Agrega tu Service Role Key en .env.local"
    exit 1
}

Write-Success "Credenciales validadas"
Write-Info "URL: $supabaseUrl"

# 5. Ejecutar SQL
Write-Step "Ejecutando SQL en Supabase"

# Intentar primero con psql (más confiable para Storage y políticas RLS)
if (![string]::IsNullOrEmpty($dbUrl)) {
    Write-Info "Usando conexión directa (psql)..."
    $result = Execute-SqlDirect -Sql $sqlContent -ConnectionString $dbUrl

    if ($result.Success) {
        Write-Host ""
        Write-Host "=======================================================" -ForegroundColor Green
        Write-Host "   ✓ SQL EJECUTADO EXITOSAMENTE" -ForegroundColor Green
        Write-Host "=======================================================" -ForegroundColor Green
        Write-Host ""

        if ($result.Output) {
            Write-Host "SALIDA:" -ForegroundColor Yellow
            Write-Host $result.Output -ForegroundColor Gray
        }

        exit 0
    }
    else {
        Write-Error-Custom "Error con psql: $($result.Error)"

        if ($result.Output) {
            Write-Host ""
            Write-Host "DETALLES DEL ERROR:" -ForegroundColor Red
            Write-Host $result.Output -ForegroundColor Gray
        }

        Write-Info "Nota: Si psql no está instalado, instálalo con:"
        Write-Info "  winget install PostgreSQL.PostgreSQL"
        Write-Info "  O descarga desde: https://www.postgresql.org/download/windows/"

        exit 1
    }
}
else {
    Write-Error-Custom "DATABASE_URL no encontrado en .env.local"
    Write-Info "Agrega DATABASE_URL para ejecutar SQL directamente"
    Write-Info "Obtenerlo en: Supabase Dashboard > Settings > Database > Connection String"
    exit 1
}
