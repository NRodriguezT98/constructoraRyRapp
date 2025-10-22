# Script para verificar schema usando Supabase CLI
# Requiere: npx supabase instalado

Write-Host ""
Write-Host "VERIFICAR SCHEMA CON SUPABASE CLI" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

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

Write-Host "Generando archivo con resultados..." -ForegroundColor Yellow
Write-Host ""

$output = "# SCHEMA COMPLETO DE LA BASE DE DATOS`n"
$output += "# Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"

foreach ($tabla in $tablas) {
    Write-Host "Procesando tabla: $tabla" -ForegroundColor Green

    $query = @"
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = '$tabla'
  AND table_schema = 'public'
ORDER BY ordinal_position;
"@

    $output += "## TABLA: $tabla`n"
    $output += "``````sql`n$query`n``````"
    $output += "`n`n---`n`n"
}

$output | Out-File -FilePath "queries-para-cli.txt" -Encoding UTF8

Write-Host ""
Write-Host "Archivo generado: queries-para-cli.txt" -ForegroundColor Green
Write-Host ""
Write-Host "COMO USAR:" -ForegroundColor Yellow
Write-Host "  npx supabase db remote query 'SELECT ...' --json" -ForegroundColor Gray
Write-Host ""
