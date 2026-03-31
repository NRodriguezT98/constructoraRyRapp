# ============================================
# 🧹 LIMPIEZA COMPLETA DE SUPABASE STORAGE
# ============================================
# ⚠️ ADVERTENCIA: Este script ELIMINA TODOS LOS ARCHIVOS
# ⚠️ de los buckets de Supabase Storage
# ⚠️ Ejecutar SOLO en desarrollo, NUNCA en producción
#
# Fecha: 2025-11-05
# Propósito: Limpiar storage para empezar fresco
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🧹 LIMPIEZA COMPLETA DE SUPABASE STORAGE" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ============================================
# CONFIGURACIÓN
# ============================================

$SUPABASE_URL = "https://jqfbnggglbdiqbqtkubu.supabase.co"
$SUPABASE_ANON_KEY = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY

# Lista de buckets a limpiar
$BUCKETS = @(
    "documentos",
    "procesos"
)

# ============================================
# ARCHIVOS PROTEGIDOS (NO SE ELIMINAN)
# ============================================

# Archivos que NUNCA se eliminarán (ej: plantillas)
$ARCHIVOS_PROTEGIDOS = @(
    "procesos/plantillas/",  # Toda la carpeta de plantillas
    "procesos/plantilla-",   # Cualquier archivo que empiece con "plantilla-"
    "procesos/template"      # Archivos de template
)

# Función para verificar si un archivo está protegido
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
# VALIDACIONES
# ============================================

if (-not $SUPABASE_ANON_KEY) {
    Write-Host "❌ ERROR: Variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada" -ForegroundColor Red
    Write-Host "💡 Asegúrate de tener un archivo .env.local con las credenciales" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Credenciales encontradas" -ForegroundColor Green
Write-Host "🔗 URL: $SUPABASE_URL`n" -ForegroundColor Gray

# ============================================
# CONFIRMACIÓN DE SEGURIDAD
# ============================================

Write-Host "⚠️  ADVERTENCIA CRÍTICA ⚠️" -ForegroundColor Red -BackgroundColor Yellow
Write-Host ""
Write-Host "Este script eliminará TODOS los archivos de los siguientes buckets:" -ForegroundColor Yellow
foreach ($bucket in $BUCKETS) {
    Write-Host "  • $bucket" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Esta acción NO se puede deshacer." -ForegroundColor Red
Write-Host ""

$confirmacion = Read-Host "¿Estás seguro de continuar? (escribe 'SI' para confirmar)"

if ($confirmacion -ne "SI") {
    Write-Host "`n❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# ============================================
# FUNCIÓN: LISTAR ARCHIVOS EN BUCKET
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
        Write-Host "❌ Error listando archivos en bucket '$BucketName': $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

# ============================================
# FUNCIÓN: ELIMINAR ARCHIVO
# ============================================

function Remove-StorageFile {
    param (
        [string]$BucketName,
        [string]$FilePath
    )

    # ✅ PROTECCIÓN: Verificar si el archivo está protegido
    if (Test-ArchivoProtegido -BucketName $BucketName -FilePath $FilePath) {
        Write-Host "  🛡️  PROTEGIDO (no eliminado): $FilePath" -ForegroundColor Yellow
        return $true
    }

    $endpoint = "$SUPABASE_URL/storage/v1/object/$BucketName/$FilePath"

    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method DELETE -Headers @{
            "apikey" = $SUPABASE_ANON_KEY
            "Authorization" = "Bearer $SUPABASE_ANON_KEY"
        }

        return $true
    }
    catch {
        Write-Host "  ❌ Error eliminando '$FilePath': $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}# ============================================
# FUNCIÓN: ELIMINAR CARPETA RECURSIVAMENTE
# ============================================

function Remove-BucketFolder {
    param (
        [string]$BucketName,
        [string]$FolderPath
    )

    $files = Get-BucketFiles -BucketName $BucketName -Path $FolderPath

    foreach ($file in $files) {
        if ($file.id) {
            # Es un archivo
            $fullPath = if ($FolderPath) { "$FolderPath/$($file.name)" } else { $file.name }
            Write-Host "  🗑️  Eliminando: $fullPath" -ForegroundColor Gray
            Remove-StorageFile -BucketName $BucketName -FilePath $fullPath | Out-Null
        }
        elseif ($file.name) {
            # Es una carpeta
            $subFolder = if ($FolderPath) { "$FolderPath/$($file.name)" } else { $file.name }
            Write-Host "  📁 Procesando carpeta: $subFolder" -ForegroundColor Cyan
            Remove-BucketFolder -BucketName $BucketName -FolderPath $subFolder
        }
    }
}

# ============================================
# LIMPIEZA DE BUCKETS
# ============================================

$totalArchivosEliminados = 0
$totalBucketsLimpiados = 0

foreach ($bucket in $BUCKETS) {
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "📂 Bucket: $bucket" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan

    Write-Host "🔍 Listando archivos..." -ForegroundColor Yellow

    $files = Get-BucketFiles -BucketName $bucket

    if ($files.Count -eq 0) {
        Write-Host "✅ Bucket ya está vacío`n" -ForegroundColor Green
        continue
    }

    Write-Host "📊 Encontrados $($files.Count) items`n" -ForegroundColor Yellow

    # Eliminar todos los archivos y carpetas
    Remove-BucketFolder -BucketName $bucket -FolderPath ""

    Write-Host ""
    Write-Host "✅ Bucket '$bucket' limpiado completamente`n" -ForegroundColor Green

    $totalArchivosEliminados += $files.Count
    $totalBucketsLimpiados++
}

# ============================================
# RESUMEN FINAL
# ============================================

Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "📊 Buckets procesados: $totalBucketsLimpiados" -ForegroundColor Cyan
Write-Host "🗑️  Items procesados: $totalArchivosEliminados" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛡️  ARCHIVOS PROTEGIDOS (NO ELIMINADOS):" -ForegroundColor Yellow
Write-Host "   • Carpeta: procesos/plantillas/" -ForegroundColor Green
Write-Host "   • Archivos que empiezan con: plantilla-" -ForegroundColor Green
Write-Host "   • Templates: procesos/template*" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tus plantillas de proceso están seguras" -ForegroundColor Green
Write-Host "💡 Ahora puedes ejecutar el script SQL para limpiar la base de datos" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Green
