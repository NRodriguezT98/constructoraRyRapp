# ============================================
# 🧹 LIMPIEZA COMPLETA - MAESTRO
# ============================================
# ⚠️ ADVERTENCIA: Este script ELIMINA TODO
# ⚠️ Base de datos + Storage
# ⚠️ Ejecutar SOLO en desarrollo
#
# Orden de ejecución:
# 1. Limpiar Storage (archivos)
# 2. Limpiar Base de Datos (registros)
#
# Fecha: 2025-11-05
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🧹 LIMPIEZA COMPLETA DEL SISTEMA" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ============================================
# CONFIRMACIÓN FINAL
# ============================================

Write-Host "⚠️⚠️⚠️ ADVERTENCIA CRÍTICA ⚠️⚠️⚠️" -ForegroundColor Red -BackgroundColor Yellow
Write-Host ""
Write-Host "Este script eliminará:" -ForegroundColor Yellow
Write-Host "  ✗ TODOS los archivos en buckets de Storage" -ForegroundColor Red
Write-Host "  ✗ TODOS los registros en la base de datos" -ForegroundColor Red
Write-Host "  ✗ Proyectos, manzanas, viviendas" -ForegroundColor Red
Write-Host "  ✗ Clientes, negociaciones, abonos" -ForegroundColor Red
Write-Host "  ✗ Documentos, categorías" -ForegroundColor Red
Write-Host "  ✗ Auditorías, errores, cambios" -ForegroundColor Red
Write-Host ""
Write-Host "  ✓ La estructura de tablas se mantiene" -ForegroundColor Green
Write-Host "  ✓ Los buckets se mantienen" -ForegroundColor Green
Write-Host "  ✓ Los usuarios NO se eliminan" -ForegroundColor Green
Write-Host ""
Write-Host "Esta acción NO se puede deshacer." -ForegroundColor Red
Write-Host ""

$confirmacion1 = Read-Host "¿Estás COMPLETAMENTE seguro? (escribe 'SI ELIMINAR TODO' para confirmar)"

if ($confirmacion1 -ne "SI ELIMINAR TODO") {
    Write-Host "`n❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "⚠️  Última confirmación..." -ForegroundColor Yellow
$confirmacion2 = Read-Host "Escribe el nombre del proyecto 'constructoraRyRapp' para confirmar"

if ($confirmacion2 -ne "constructoraRyRapp") {
    Write-Host "`n❌ Operación cancelada - nombre incorrecto" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "✅ Confirmación recibida. Iniciando limpieza..." -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# PASO 1: LIMPIAR STORAGE
# ============================================

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "PASO 1/2: Limpieza de Supabase Storage" -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

& .\limpiar-storage-completo.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error en limpieza de Storage. Abortando..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 2

# ============================================
# PASO 2: LIMPIAR BASE DE DATOS
# ============================================

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "PASO 2/2: Limpieza de Base de Datos" -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

Write-Host "📋 Abriendo script SQL en el navegador..." -ForegroundColor Yellow
Write-Host ""
Write-Host "👉 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "   1. Se abrirá Supabase SQL Editor en tu navegador" -ForegroundColor White
Write-Host "   2. Copia TODO el contenido del archivo:" -ForegroundColor White
Write-Host "      supabase/migrations/LIMPIEZA_COMPLETA_BASE_DATOS.sql" -ForegroundColor Yellow
Write-Host "   3. Pégalo en el editor SQL de Supabase" -ForegroundColor White
Write-Host "   4. Haz clic en 'Run' para ejecutar" -ForegroundColor White
Write-Host "   5. Verifica que todas las tablas muestran '0 registros'" -ForegroundColor White
Write-Host ""

# Abrir Supabase SQL Editor
$supabaseUrl = "https://supabase.com/dashboard/project/jqfbnggglbdiqbqtkubu/sql/new"
Start-Process $supabaseUrl

Write-Host ""
Write-Host "⏳ Esperando a que ejecutes el script SQL..." -ForegroundColor Yellow
$continuar = Read-Host "Presiona ENTER cuando hayas ejecutado el script SQL"

# ============================================
# PASO 3: VERIFICACIÓN
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "VERIFICACIÓN FINAL" -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

Write-Host "📊 Verifica manualmente en Supabase:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Storage > Buckets > 'documentos' y 'procesos' vacíos" -ForegroundColor White
Write-Host "✓ Table Editor > Todas las tablas con 0 registros" -ForegroundColor White
Write-Host "✓ SQL Editor > Ejecuta el query de verificación del script" -ForegroundColor White
Write-Host ""

# Abrir Supabase Table Editor
$tableEditorUrl = "https://supabase.com/dashboard/project/jqfbnggglbdiqbqtkubu/editor"
Start-Process $tableEditorUrl

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Sistema limpiado completamente" -ForegroundColor Cyan
Write-Host "📦 Base de datos fresca y lista para usar" -ForegroundColor Cyan
Write-Host "🗂️  Storage vacío y listo para nuevos archivos" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Crear nuevos proyectos desde cero" -ForegroundColor White
Write-Host "   2. Subir nuevos documentos" -ForegroundColor White
Write-Host "   3. Registrar nuevos clientes" -ForegroundColor White
Write-Host ""
Write-Host "============================================`n" -ForegroundColor Green
