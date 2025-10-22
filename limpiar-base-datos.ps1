# ============================================
# 🗑️ Script para Limpiar Base de Datos
# ============================================
# Fecha: 2025-10-22
# Propósito: Ejecutar limpieza de datos de forma segura
# ============================================

param(
    [switch]$Force
)

Write-Host ""
Write-Host "🗑️  LIMPIEZA COMPLETA DE BASE DE DATOS" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""

# Verificar si existe el archivo SQL
$sqlFile = ".\supabase\migrations\limpiar-datos-completo.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: No se encontró el archivo $sqlFile" -ForegroundColor Red
    exit 1
}

# Advertencias
Write-Host "⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Lo que se eliminará:" -ForegroundColor Cyan
Write-Host "   • Todos los clientes" -ForegroundColor White
Write-Host "   • Todos los proyectos, manzanas y viviendas" -ForegroundColor White
Write-Host "   • Todas las negociaciones y abonos" -ForegroundColor White
Write-Host "   • Todas las renuncias" -ForegroundColor White
Write-Host "   • Todos los documentos" -ForegroundColor White
Write-Host "   • Todo el historial y auditoría" -ForegroundColor White
Write-Host ""
Write-Host "✅ Lo que se mantendrá:" -ForegroundColor Green
Write-Host "   • Estructura de tablas" -ForegroundColor White
Write-Host "   • Triggers y funciones" -ForegroundColor White
Write-Host "   • Políticas RLS" -ForegroundColor White
Write-Host "   • Configuración del sistema" -ForegroundColor White
Write-Host ""

# Confirmar si no se usó -Force
if (-not $Force) {
    $confirmacion = Read-Host "¿Estás SEGURO de continuar? (escribe 'LIMPIAR' para confirmar)"

    if ($confirmacion -ne "LIMPIAR") {
        Write-Host ""
        Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
}

Write-Host ""
Write-Host "🚀 Ejecutando limpieza..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script SQL con Supabase CLI
try {
    $output = npx supabase db push --file $sqlFile 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ LIMPIEZA COMPLETADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Próximos pasos recomendados:" -ForegroundColor Cyan
        Write-Host "   1. Verifica la limpieza en Supabase Dashboard" -ForegroundColor White
        Write-Host "   2. Crea datos de prueba frescos" -ForegroundColor White
        Write-Host "   3. Ejecuta testing E2E completo" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error al ejecutar la limpieza" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error inesperado: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Opción alternativa: ejecutar directamente con psql
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Método alternativo (si lo anterior falla):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Ve a Supabase Dashboard → SQL Editor" -ForegroundColor White
Write-Host "   2. Copia y pega el contenido de:" -ForegroundColor White
Write-Host "      $sqlFile" -ForegroundColor Cyan
Write-Host "   3. Ejecuta el script" -ForegroundColor White
Write-Host ""
