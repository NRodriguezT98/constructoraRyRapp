# =====================================================
# 🔄 SCRIPT DE ACTUALIZACIÓN DE DOCUMENTACIÓN DB
# =====================================================
#
# PROPÓSITO: Facilitar el proceso de actualización de la documentación
#            de base de datos después de ejecutar el script SQL
#
# USO:
#   1. Ejecuta GENERAR-DOCUMENTACION-COMPLETA-DB.sql en Supabase
#   2. Copia los resultados al clipboard
#   3. Ejecuta este script: .\actualizar-docs-db.ps1
#
# =====================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 ACTUALIZACIÓN DE DOCUMENTACIÓN DE BASE DE DATOS       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# PASO 1: Verificar que existe el script SQL
# =====================================================

$scriptSQL = ".\supabase\migrations\GENERAR-DOCUMENTACION-COMPLETA-DB.sql"

if (-not (Test-Path $scriptSQL)) {
    Write-Host "❌ ERROR: No se encontró el script SQL" -ForegroundColor Red
    Write-Host "   Ruta esperada: $scriptSQL" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Script SQL encontrado" -ForegroundColor Green

# =====================================================
# PASO 2: Abrir archivos necesarios en VS Code
# =====================================================

Write-Host ""
Write-Host "📂 Abriendo archivos necesarios..." -ForegroundColor Cyan

# Abrir el script SQL
code $scriptSQL

# Abrir la documentación actual
$docActual = ".\docs\DATABASE-SCHEMA-REFERENCE.md"
if (Test-Path $docActual) {
    code $docActual
}

# Abrir el template
$docTemplate = ".\docs\DATABASE-SCHEMA-REFERENCE-TEMPLATE.md"
if (Test-Path $docTemplate) {
    code $docTemplate
}

# Abrir la guía
$guia = ".\docs\GUIA-DOCUMENTACION-DB.md"
if (Test-Path $guia) {
    code $guia
}

Start-Sleep -Seconds 2

Write-Host "✅ Archivos abiertos en VS Code" -ForegroundColor Green

# =====================================================
# PASO 3: Mostrar instrucciones
# =====================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  📋 INSTRUCCIONES PASO A PASO                             ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  Ve a Supabase Dashboard:" -ForegroundColor Cyan
Write-Host "    https://app.supabase.com" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Abre SQL Editor:" -ForegroundColor Cyan
Write-Host "    Menú lateral → SQL Editor → + New query" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Copia el contenido del archivo:" -ForegroundColor Cyan
Write-Host "    GENERAR-DOCUMENTACION-COMPLETA-DB.sql" -ForegroundColor White
Write-Host "    (Ya está abierto en VS Code)" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Pega en Supabase SQL Editor y ejecuta (Ctrl + Enter)" -ForegroundColor Cyan
Write-Host ""

Write-Host "5️⃣  Copia TODOS los resultados:" -ForegroundColor Cyan
Write-Host "    - Haz scroll para ver todas las tablas de resultados" -ForegroundColor White
Write-Host "    - Usa Ctrl + A para seleccionar todo" -ForegroundColor White
Write-Host "    - Copia al clipboard" -ForegroundColor White
Write-Host ""

Write-Host "6️⃣  Actualiza DATABASE-SCHEMA-REFERENCE.md:" -ForegroundColor Cyan
Write-Host "    - Usa DATABASE-SCHEMA-REFERENCE-TEMPLATE.md como guía" -ForegroundColor White
Write-Host "    - Reemplaza la información con los datos REALES copiados" -ForegroundColor White
Write-Host "    - Actualiza la fecha de última actualización" -ForegroundColor White
Write-Host ""

Write-Host "7️⃣  Guarda y haz commit:" -ForegroundColor Cyan
Write-Host "    git add docs/DATABASE-SCHEMA-REFERENCE.md" -ForegroundColor White
Write-Host "    git commit -m 'docs: actualizar schema de base de datos'" -ForegroundColor White
Write-Host ""

# =====================================================
# PASO 4: Ofrecer abrir Supabase
# =====================================================

Write-Host ""
Write-Host "¿Deseas abrir Supabase en el navegador ahora? (S/N)" -ForegroundColor Yellow
$respuesta = Read-Host

if ($respuesta -eq "S" -or $respuesta -eq "s") {
    Write-Host ""
    Write-Host "🌐 Abriendo Supabase Dashboard..." -ForegroundColor Cyan
    Start-Process "https://app.supabase.com"
    Start-Sleep -Seconds 2
    Write-Host "✅ Navegador abierto" -ForegroundColor Green
}

# =====================================================
# PASO 5: Copiar comando SQL al clipboard (opcional)
# =====================================================

Write-Host ""
Write-Host "¿Deseas copiar el contenido del script SQL al clipboard? (S/N)" -ForegroundColor Yellow
$respuesta2 = Read-Host

if ($respuesta2 -eq "S" -or $respuesta2 -eq "s") {
    Get-Content $scriptSQL | Set-Clipboard
    Write-Host ""
    Write-Host "✅ Script SQL copiado al clipboard" -ForegroundColor Green
    Write-Host "   Pega directamente en Supabase SQL Editor (Ctrl + V)" -ForegroundColor Cyan
}

# =====================================================
# FINALIZAR
# =====================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ PREPARACIÓN COMPLETADA                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Consulta GUIA-DOCUMENTACION-DB.md para más detalles" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# RECORDATORIO
# =====================================================

Write-Host "💡 RECORDATORIO:" -ForegroundColor Yellow
Write-Host "   Después de actualizar la documentación:" -ForegroundColor White
Write-Host "   - Verifica que todos los nombres de campos estén correctos" -ForegroundColor White
Write-Host "   - Marca los campos opcionales vs obligatorios" -ForegroundColor White
Write-Host "   - Actualiza la fecha de última modificación" -ForegroundColor White
Write-Host "   - Haz commit de los cambios" -ForegroundColor White
Write-Host ""
