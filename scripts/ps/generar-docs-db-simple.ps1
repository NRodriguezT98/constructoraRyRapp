# =====================================================
# 🔄 GENERADOR DE DOCUMENTACIÓN DB - MÉTODO SIMPLE
# =====================================================
#
# Este script te ayuda a generar la documentación
# tabla por tabla (más fácil en Supabase)
#
# =====================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 GENERADOR DE DOCUMENTACIÓN DB - MÉTODO SIMPLE         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Lista de tablas a documentar
$tablas = @(
    "clientes",
    "proyectos",
    "manzanas",
    "viviendas",
    "negociaciones",
    "fuentes_pago",
    "abonos_historial",
    "renuncias",
    "documentos",
    "categorias_documentos"
)

Write-Host "📋 TABLAS A DOCUMENTAR:" -ForegroundColor Yellow
Write-Host ""
for ($i = 0; $i -lt $tablas.Count; $i++) {
    Write-Host "   $($i + 1). $($tablas[$i])" -ForegroundColor White
}
Write-Host ""

Write-Host "🎯 PROCESO RECOMENDADO:" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPCIÓN 1: Verificación tabla por tabla (RECOMENDADO)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Abre Supabase SQL Editor" -ForegroundColor White
Write-Host "   2. Abre: supabase/migrations/VERIFICAR-TABLA-SIMPLE.sql" -ForegroundColor White
Write-Host "   3. Para cada tabla:" -ForegroundColor White
Write-Host "      a) Cambia el nombre de la tabla" -ForegroundColor Gray
Write-Host "      b) Ejecuta con Ctrl + Enter" -ForegroundColor Gray
Write-Host "      c) Copia los resultados" -ForegroundColor Gray
Write-Host "      d) Actualiza DATABASE-SCHEMA-REFERENCE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "OPCIÓN 2: Script completo (puede no funcionar en Supabase)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Usa: GENERAR-DOCUMENTACION-DB-V2.sql" -ForegroundColor White
Write-Host "   2. Ejecuta TODO el script" -ForegroundColor White
Write-Host "   3. Copia el resultado completo" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "¿Qué opción prefieres?" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Tabla por tabla (FÁCIL - RECOMENDADO)" -ForegroundColor Green
Write-Host "  [2] Script completo (puede tener problemas)" -ForegroundColor Yellow
Write-Host "  [3] Generar queries individuales automáticamente" -ForegroundColor Cyan
Write-Host "  [4] Salir" -ForegroundColor Gray
Write-Host ""
$opcion = Read-Host "Elige una opción (1-4)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "✅ Opción tabla por tabla seleccionada" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Pasos a seguir:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Abre Supabase en tu navegador" -ForegroundColor White
        Write-Host "2. Ve a SQL Editor" -ForegroundColor White
        Write-Host "3. Ejecuta esta query para cada tabla:" -ForegroundColor White
        Write-Host ""

        Write-Host "-- QUERY PARA VERIFICAR UNA TABLA --" -ForegroundColor Gray
        Write-Host ""
        Write-Host "SELECT " -ForegroundColor White
        Write-Host "  ordinal_position as numero," -ForegroundColor White
        Write-Host "  column_name as columna," -ForegroundColor White
        Write-Host "  data_type as tipo," -ForegroundColor White
        Write-Host "  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable" -ForegroundColor White
        Write-Host "FROM information_schema.columns" -ForegroundColor White
        Write-Host "WHERE table_name = 'NOMBRE_TABLA' AND table_schema = 'public'" -ForegroundColor Yellow
        Write-Host "ORDER BY ordinal_position;" -ForegroundColor White
        Write-Host ""

        Write-Host "4. Reemplaza NOMBRE_TABLA con:" -ForegroundColor White
        foreach ($tabla in $tablas) {
            Write-Host "   • $tabla" -ForegroundColor Gray
        }
        Write-Host ""

        Write-Host "¿Deseas abrir Supabase ahora? (S/N)" -ForegroundColor Yellow
        $abrir = Read-Host
        if ($abrir -eq "S" -or $abrir -eq "s") {
            Start-Process "https://app.supabase.com"
            Write-Host "✅ Supabase abierto en el navegador" -ForegroundColor Green
        }
    }

    "2" {
        Write-Host ""
        Write-Host "✅ Script completo seleccionado" -ForegroundColor Green
        Write-Host ""

        # Abrir el script V2
        code ".\supabase\migrations\GENERAR-DOCUMENTACION-DB-V2.sql"

        Write-Host "📄 Script abierto en VS Code" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Pasos:" -ForegroundColor Yellow
        Write-Host "1. Copia TODO el contenido del script" -ForegroundColor White
        Write-Host "2. Pega en Supabase SQL Editor" -ForegroundColor White
        Write-Host "3. Ejecuta" -ForegroundColor White
        Write-Host "4. Copia los resultados" -ForegroundColor White
        Write-Host ""

        Write-Host "¿Copiar script al clipboard? (S/N)" -ForegroundColor Yellow
        $copiar = Read-Host
        if ($copiar -eq "S" -or $copiar -eq "s") {
            Get-Content ".\supabase\migrations\GENERAR-DOCUMENTACION-DB-V2.sql" | Set-Clipboard
            Write-Host "✅ Script copiado al clipboard" -ForegroundColor Green
            Write-Host "   Pega en Supabase con Ctrl+V" -ForegroundColor Cyan
        }

        Write-Host ""
        Write-Host "¿Abrir Supabase? (S/N)" -ForegroundColor Yellow
        $abrir = Read-Host
        if ($abrir -eq "S" -or $abrir -eq "s") {
            Start-Process "https://app.supabase.com"
            Write-Host "✅ Supabase abierto" -ForegroundColor Green
        }
    }

    "3" {
        Write-Host ""
        Write-Host "✅ Generando queries individuales..." -ForegroundColor Green
        Write-Host ""

        $outputFile = ".\queries-verificacion-tablas.sql"

        # Crear archivo con todas las queries
        $content = "-- =====================================================`n"
        $content += "-- 📊 QUERIES INDIVIDUALES PARA CADA TABLA`n"
        $content += "-- =====================================================`n"
        $content += "--`n"
        $content += "-- Ejecuta cada query por separado en Supabase`n"
        $content += "-- Copia los resultados de cada una`n"
        $content += "--`n"
        $content += "-- =====================================================`n`n"

        foreach ($tabla in $tablas) {
            $content += "-- ═══════════════════════════════════════════`n"
            $content += "-- TABLA: $tabla`n"
            $content += "-- ═══════════════════════════════════════════`n`n"
            $content += "SELECT `n"
            $content += "  ordinal_position as '#',`n"
            $content += "  column_name as 'COLUMNA',`n"
            $content += "  data_type as 'TIPO',`n"
            $content += "  CASE WHEN is_nullable = 'YES' THEN '✅ Opcional' ELSE '❌ Obligatorio' END as 'NULLABLE',`n"
            $content += "  COALESCE(column_default, '') as 'DEFAULT'`n"
            $content += "FROM information_schema.columns`n"
            $content += "WHERE table_name = '$tabla' AND table_schema = 'public'`n"
            $content += "ORDER BY ordinal_position;`n`n`n"
        }

        $content | Out-File -FilePath $outputFile -Encoding UTF8

        Write-Host "✅ Archivo generado: queries-verificacion-tablas.sql" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 El archivo contiene $($tablas.Count) queries individuales" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Pasos:" -ForegroundColor Yellow
        Write-Host "1. Abre el archivo en VS Code" -ForegroundColor White
        Write-Host "2. Copia cada query (una a la vez)" -ForegroundColor White
        Write-Host "3. Pega y ejecuta en Supabase" -ForegroundColor White
        Write-Host "4. Copia los resultados" -ForegroundColor White
        Write-Host "5. Actualiza DATABASE-SCHEMA-REFERENCE.md" -ForegroundColor White
        Write-Host ""

        code $outputFile

        Write-Host "¿Abrir Supabase? (S/N)" -ForegroundColor Yellow
        $abrir = Read-Host
        if ($abrir -eq "S" -or $abrir -eq "s") {
            Start-Process "https://app.supabase.com"
            Write-Host "✅ Supabase abierto" -ForegroundColor Green
        }
    }

    "4" {
        Write-Host ""
        Write-Host "Hasta luego!" -ForegroundColor Cyan
        Write-Host ""
        exit
    }

    default {
        Write-Host ""
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📚 Documentación abierta en VS Code" -ForegroundColor Cyan
Write-Host ""

# Abrir archivos de referencia
code ".\docs\DATABASE-SCHEMA-REFERENCE.md"
code ".\docs\DATABASE-SCHEMA-REFERENCE-TEMPLATE.md"

Write-Host "✅ Listo para documentar!" -ForegroundColor Green
Write-Host ""
