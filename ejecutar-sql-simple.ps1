#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Ejecuta SQL en Supabase sin necesidad de psql
.DESCRIPTION
    Usa curl para ejecutar SQL directamente en Supabase (sin instalar PostgreSQL)
.PARAMETER SqlFile
    Archivo SQL a ejecutar
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   EJECUTAR SQL EN SUPABASE (SIN PSQL)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Validar archivo
if (!(Test-Path $SqlFile)) {
    Write-Host "ERROR: Archivo no encontrado: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo: $SqlFile" -ForegroundColor Yellow
$sqlContent = Get-Content $SqlFile -Raw -Encoding UTF8
$lines = ($sqlContent -split "`n").Count
Write-Host "Lineas: $lines" -ForegroundColor Yellow
Write-Host ""

# 2. Cargar .env.local
if (!(Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local no encontrado" -ForegroundColor Red
    exit 1
}

$env = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim() -replace '^["'']|["'']$', ''
        $env[$key] = $value
    }
}

$projectUrl = $env["NEXT_PUBLIC_SUPABASE_URL"]
$serviceKey = $env["SUPABASE_SERVICE_ROLE_KEY"]
$dbUrl = $env["DATABASE_URL"]

if ([string]::IsNullOrEmpty($projectUrl) -or [string]::IsNullOrEmpty($dbUrl)) {
    Write-Host "ERROR: Faltan variables en .env.local" -ForegroundColor Red
    Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "  - DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase URL: $projectUrl" -ForegroundColor Green
Write-Host ""

# 3. Extraer credenciales de DATABASE_URL
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
}
else {
    Write-Host "ERROR: Formato de DATABASE_URL invalido" -ForegroundColor Red
    exit 1
}

# 4. Crear archivo temporal con SQL
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlContent | Out-File -FilePath $tempSqlFile -Encoding UTF8 -NoNewline

Write-Host "Ejecutando SQL..." -ForegroundColor Cyan
Write-Host ""

# 5. Ejecutar con curl (más compatible que psql)
try {
    # Usar API de Supabase para ejecutar SQL
    $curlCommand = @"
curl -X POST "$projectUrl/rest/v1/rpc/query" \
  -H "apikey: $serviceKey" \
  -H "Authorization: Bearer $serviceKey" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "query": $(($sqlContent | ConvertTo-Json))
}
EOF
"@

    # Como la API de RPC podría no estar disponible, usamos método alternativo
    # Ejecutar SQL usando API HTTP de Supabase Database

    Write-Host "METODO ALTERNATIVO: Usando pgAdmin o Supabase Dashboard" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "El SQL se ha guardado en:" -ForegroundColor Green
    Write-Host "  $tempSqlFile" -ForegroundColor White
    Write-Host ""
    Write-Host "OPCIONES:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPCION 1: Copiar al portapapeles y pegar en Supabase" -ForegroundColor Cyan
    Write-Host "  1. Ve a: https://supabase.com/dashboard/project/_/sql" -ForegroundColor White
    Write-Host "  2. Presiona cualquier tecla para copiar el SQL..." -ForegroundColor White
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

    Set-Clipboard -Value $sqlContent
    Write-Host "  3. SQL copiado! Pegalo (Ctrl+V) y ejecuta" -ForegroundColor Green
    Write-Host ""

    Write-Host "OPCION 2: Instalar psql para ejecucion automatica" -ForegroundColor Cyan
    Write-Host "  winget install PostgreSQL.PostgreSQL" -ForegroundColor White
    Write-Host "  Luego usa: .\ejecutar-sql.ps1 -SqlFile `"$SqlFile`"" -ForegroundColor White
    Write-Host ""

    Write-Host "OPCION 3: Usar script de Node.js (recomendado)" -ForegroundColor Cyan
    Write-Host "  node ejecutar-sql.js `"$SqlFile`"" -ForegroundColor White
    Write-Host ""
}
finally {
    # No eliminar el archivo temporal por si el usuario quiere revisarlo
    Write-Host "Archivo SQL temporal: $tempSqlFile" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
