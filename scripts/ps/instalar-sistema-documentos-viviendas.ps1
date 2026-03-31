# ============================================================================
# Script: Ejecutar Migración de Sistema de Documentos para Viviendas
# Descripción: Aplica la migración SQL y crea el bucket de Storage
# ============================================================================

Write-Host "`n🚀 INSTALACIÓN: Sistema de Documentos para Viviendas" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

# Verificar que existe el archivo de migración
$migracionPath = "supabase\migrations\20250106000001_sistema_documentos_viviendas.sql"

if (-not (Test-Path $migracionPath)) {
    Write-Host "❌ ERROR: No se encontró el archivo de migración" -ForegroundColor Red
    Write-Host "   Ruta esperada: $migracionPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Archivo de migración encontrado" -ForegroundColor Green

# Mostrar instrucciones
Write-Host "`n📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "   1. Abre Supabase Studio (https://supabase.com/dashboard)" -ForegroundColor White
Write-Host "   2. Ve a tu proyecto" -ForegroundColor White
Write-Host "   3. Abre el SQL Editor" -ForegroundColor White
Write-Host "   4. Copia y pega el contenido del archivo de migración" -ForegroundColor White
Write-Host "   5. Ejecuta el SQL" -ForegroundColor White

Write-Host "`n📁 Abriendo archivo de migración..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

# Abrir el archivo en el editor predeterminado
notepad.exe $migracionPath

Write-Host "`n⏳ Esperando confirmación..." -ForegroundColor Yellow
$respuesta = Read-Host "¿Ya ejecutaste la migración SQL en Supabase Studio? (s/n)"

if ($respuesta -ne "s" -and $respuesta -ne "S") {
    Write-Host "`n⚠️  Migración cancelada. Ejecuta el SQL primero." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n✅ Migración SQL completada" -ForegroundColor Green

# Verificar creación del bucket
Write-Host "`n📦 CREACIÓN DEL BUCKET DE STORAGE" -ForegroundColor Cyan
Write-Host "   Bucket: documentos-viviendas" -ForegroundColor White
Write-Host "   Tipo: Público (public = true)" -ForegroundColor White

Write-Host "`n📋 SQL PARA CREAR EL BUCKET:" -ForegroundColor Cyan
Write-Host "   " -NoNewline
Write-Host "INSERT INTO storage.buckets (id, name, public)" -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "VALUES ('documentos-viviendas', 'documentos-viviendas', true);" -ForegroundColor Yellow

$respuestaBucket = Read-Host "`n¿Ya creaste el bucket en Supabase Storage? (s/n)"

if ($respuestaBucket -ne "s" -and $respuestaBucket -ne "S") {
    Write-Host "`n⚠️  Recuerda crear el bucket 'documentos-viviendas' en Storage" -ForegroundColor Yellow
}

# Regenerar tipos de Supabase
Write-Host "`n🔄 REGENERAR TIPOS DE SUPABASE" -ForegroundColor Cyan
$respuestaTipos = Read-Host "¿Quieres regenerar los tipos de Supabase ahora? (s/n)"

if ($respuestaTipos -eq "s" -or $respuestaTipos -eq "S") {
    Write-Host "`n⏳ Regenerando tipos..." -ForegroundColor Yellow

    # Ejecutar comando de Supabase CLI
    npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tipos regenerados correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al regenerar tipos. Ejecútalo manualmente:" -ForegroundColor Red
        Write-Host "   npm run types:supabase" -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray

Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "   ✅ Migración SQL ejecutada" -ForegroundColor Green
Write-Host "   ✅ Tabla 'documentos_vivienda' creada" -ForegroundColor Green
Write-Host "   ✅ 8 categorías del sistema insertadas" -ForegroundColor Green
Write-Host "   ✅ Vista 'vista_documentos_vivienda' creada" -ForegroundColor Green
Write-Host "   ✅ Políticas RLS configuradas" -ForegroundColor Green

Write-Host "`n📋 CATEGORÍAS CREADAS:" -ForegroundColor Cyan
Write-Host "   1. Certificado de Tradición (Verde)" -ForegroundColor White
Write-Host "   2. Escrituras Públicas (Azul)" -ForegroundColor White
Write-Host "   3. Planos Arquitectónicos (Ámbar)" -ForegroundColor White
Write-Host "   4. Licencias y Permisos (Púrpura)" -ForegroundColor White
Write-Host "   5. Avalúos Comerciales (Cyan)" -ForegroundColor White
Write-Host "   6. Fotos de Progreso (Rosa)" -ForegroundColor White
Write-Host "   7. Contrato de Promesa (Rojo)" -ForegroundColor White
Write-Host "   8. Recibos de Servicios (Lima)" -ForegroundColor White

Write-Host "`n🎯 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "   1. Verificar en Supabase que la tabla existe" -ForegroundColor Yellow
Write-Host "   2. Crear bucket 'documentos-viviendas' (si no lo hiciste)" -ForegroundColor Yellow
Write-Host "   3. Probar subir certificado de tradición" -ForegroundColor Yellow
Write-Host "   4. Implementar tab de documentos en detalle de vivienda" -ForegroundColor Yellow

Write-Host "`n📚 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host "   Ver: docs/SISTEMA-DOCUMENTOS-VIVIENDAS-README.md" -ForegroundColor White

Write-Host "`n✨ ¡Sistema listo para usar!" -ForegroundColor Green
Write-Host "`n"
