# Generador de Documentacion DB - Metodo Simple

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  GENERADOR DE DOCUMENTACION DB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Lista de tablas
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

Write-Host "TABLAS A DOCUMENTAR:" -ForegroundColor Yellow
Write-Host ""
for ($i = 0; $i -lt $tablas.Count; $i++) {
    Write-Host "   $($i + 1). $($tablas[$i])" -ForegroundColor White
}
Write-Host ""

Write-Host "OPCIONES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [1] Generar queries individuales (RECOMENDADO)" -ForegroundColor Green
Write-Host "  [2] Ver instrucciones manual" -ForegroundColor Yellow
Write-Host "  [3] Salir" -ForegroundColor Gray
Write-Host ""
$opcion = Read-Host "Elige una opcion (1-3)"

if ($opcion -eq "1") {
    Write-Host ""
    Write-Host "Generando queries individuales..." -ForegroundColor Green
    Write-Host ""

    $outputFile = ".\queries-verificacion-tablas.sql"

    # Crear archivo con todas las queries
    $content = "-- =====================================================`n"
    $content += "-- QUERIES INDIVIDUALES PARA CADA TABLA`n"
    $content += "-- =====================================================`n"
    $content += "--`n"
    $content += "-- Ejecuta cada query por separado en Supabase`n"
    $content += "-- Copia los resultados de cada una`n"
    $content += "--`n"
    $content += "-- =====================================================`n`n"

    foreach ($tabla in $tablas) {
        $content += "-- ============================================`n"
        $content += "-- TABLA: $tabla`n"
        $content += "-- ============================================`n`n"
        $content += "SELECT `n"
        $content += "  ordinal_position as numero,`n"
        $content += "  column_name as columna,`n"
        $content += "  data_type as tipo,`n"
        $content += "  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable,`n"
        $content += "  COALESCE(column_default, '') as valor_default`n"
        $content += "FROM information_schema.columns`n"
        $content += "WHERE table_name = '$tabla' AND table_schema = 'public'`n"
        $content += "ORDER BY ordinal_position;`n`n`n"
    }

    $content | Out-File -FilePath $outputFile -Encoding UTF8

    Write-Host "Archivo generado: queries-verificacion-tablas.sql" -ForegroundColor Green
    Write-Host ""
    Write-Host "El archivo contiene $($tablas.Count) queries individuales" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PASOS:" -ForegroundColor Yellow
    Write-Host "1. Abre el archivo en VS Code" -ForegroundColor White
    Write-Host "2. Copia cada query (una a la vez)" -ForegroundColor White
    Write-Host "3. Pega y ejecuta en Supabase" -ForegroundColor White
    Write-Host "4. Copia los resultados" -ForegroundColor White
    Write-Host "5. Actualiza DATABASE-SCHEMA-REFERENCE.md" -ForegroundColor White
    Write-Host ""

    code $outputFile

    Write-Host "Deseas abrir Supabase? (S/N)" -ForegroundColor Yellow
    $abrir = Read-Host
    if ($abrir -eq "S" -or $abrir -eq "s") {
        Start-Process "https://app.supabase.com"
        Write-Host "Supabase abierto" -ForegroundColor Green
    }

    # Abrir documentacion
    code ".\docs\DATABASE-SCHEMA-REFERENCE.md"
    code ".\docs\DATABASE-SCHEMA-REFERENCE-TEMPLATE.md"
}
elseif ($opcion -eq "2") {
    Write-Host ""
    Write-Host "INSTRUCCIONES MANUALES:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Abre Supabase SQL Editor" -ForegroundColor White
    Write-Host "2. Ejecuta esta query cambiando el nombre de la tabla:" -ForegroundColor White
    Write-Host ""
    Write-Host "SELECT ordinal_position, column_name, data_type," -ForegroundColor Gray
    Write-Host "  CASE WHEN is_nullable = 'YES' THEN 'Opcional' ELSE 'Obligatorio' END as nullable" -ForegroundColor Gray
    Write-Host "FROM information_schema.columns" -ForegroundColor Gray
    Write-Host "WHERE table_name = 'clientes' AND table_schema = 'public'" -ForegroundColor Yellow
    Write-Host "ORDER BY ordinal_position;" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Cambia 'clientes' por cada tabla de la lista" -ForegroundColor White
    Write-Host "4. Copia los resultados" -ForegroundColor White
    Write-Host "5. Actualiza DATABASE-SCHEMA-REFERENCE.md" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "Saliendo..." -ForegroundColor Cyan
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "Listo!" -ForegroundColor Green
Write-Host ""
