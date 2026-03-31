# ============================================
# VERIFICAR ARCHIVOS PROTEGIDOS
# ============================================
# Este script muestra qué archivos están protegidos
# y NO serán eliminados durante la limpieza
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "VERIFICACION DE ARCHIVOS PROTEGIDOS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ============================================
# CONFIGURACION
# ============================================

$SUPABASE_URL = "https://jqfbnggglbdiqbqtkubu.supabase.co"
$SUPABASE_ANON_KEY = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

# Patrones protegidos (mismo que en limpiar-storage-completo.ps1)
$ARCHIVOS_PROTEGIDOS = @(
    "procesos/plantillas/",
    "procesos/plantilla-",
    "procesos/template"
)

# ============================================
# VALIDACIONES
# ============================================

if (-not $SUPABASE_ANON_KEY) {
    Write-Host "[X] ERROR: Variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada" -ForegroundColor Red
    exit 1
}

# ============================================
# FUNCION: VERIFICAR SI ESTA PROTEGIDO
# ============================================

function Test-ArchivoProtegido {
    param (
        [string]$BucketName,
        [string]$FilePath
    )

    $rutaCompleta = "$BucketName/$FilePath"

    foreach ($patron in $ARCHIVOS_PROTEGIDOS) {
        if ($rutaCompleta -like "*$patron*") {
            return $true
        }
    }

    return $false
}

# ============================================
# FUNCION: LISTAR ARCHIVOS
# ============================================

function Get-BucketFiles {
    param (
        [string]$BucketName,
        [string]$Path = ""
    )

    $endpoint = "$SUPABASE_URL/storage/v1/object/list/$BucketName"
    if ($Path) {
        $endpoint += "?prefix=$Path"
    }

    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method GET -Headers @{
            "apikey" = $SUPABASE_ANON_KEY
            "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        }

        return $response
    }
    catch {
        Write-Host "[X] Error listando archivos: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# ============================================
# VERIFICAR BUCKET PROCESOS
# ============================================

Write-Host "BUCKET: procesos" -ForegroundColor Magenta
Write-Host "=====================================`n" -ForegroundColor Magenta

$archivos = Get-BucketFiles -BucketName "procesos"

if ($archivos.Count -eq 0) {
    Write-Host "[i] Bucket vacio (no hay archivos)`n" -ForegroundColor Yellow
}
else {
    Write-Host "Total de archivos encontrados: $($archivos.Count)`n" -ForegroundColor Gray

    $protegidos = @()
    $eliminables = @()

    foreach ($archivo in $archivos) {
        if ($archivo.name) {
            $esProtegido = Test-ArchivoProtegido -BucketName "procesos" -FilePath $archivo.name

            if ($esProtegido) {
                $protegidos += $archivo.name
                Write-Host "  [PROTEGIDO] $($archivo.name)" -ForegroundColor Green
            }
            else {
                $eliminables += $archivo.name
                Write-Host "  [ELIMINABLE] $($archivo.name)" -ForegroundColor Red
            }
        }
    }

    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "RESUMEN" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "[OK] Archivos protegidos: $($protegidos.Count)" -ForegroundColor Green
    Write-Host "[X]  Archivos que se eliminaran: $($eliminables.Count)" -ForegroundColor Red
    Write-Host ""

    if ($protegidos.Count -gt 0) {
        Write-Host "Archivos protegidos:" -ForegroundColor Green
        foreach ($archivo in $protegidos) {
            Write-Host "  + $archivo" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# ============================================
# MOSTRAR PATRONES DE PROTECCION
# ============================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PATRONES DE PROTECCION ACTIVOS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Los siguientes patrones estan protegidos:" -ForegroundColor Gray
Write-Host ""

foreach ($patron in $ARCHIVOS_PROTEGIDOS) {
    Write-Host "  [OK] $patron" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "VERIFICACION COMPLETADA" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "[i] Tus plantillas estan seguras" -ForegroundColor Yellow
Write-Host "[i] Para ejecutar limpieza: .\limpiar-sistema-completo.ps1" -ForegroundColor Gray
Write-Host ""
