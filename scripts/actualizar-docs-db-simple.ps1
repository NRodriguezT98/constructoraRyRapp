# =====================================================
# SCRIPT: Actualizar Documentacion de Base de Datos
# =====================================================
# Extrae la estructura completa de la BD desde Supabase
# y actualiza el archivo DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
# =====================================================

Write-Host ""
Write-Host "[*] Actualizando documentacion de Base de Datos..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# 1. VERIFICAR .env.local
# =====================================================
$envFile = ".env.local"
if (-Not (Test-Path $envFile)) {
    Write-Host "[ERROR] No se encontro el archivo .env.local" -ForegroundColor Red
    Write-Host "   Asegurate de tener configuradas las variables de entorno" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Archivo .env.local encontrado" -ForegroundColor Green

# Cargar variables de entorno
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$DATABASE_URL = $env:DATABASE_URL

if (-Not $DATABASE_URL) {
    Write-Host "[ERROR] Variable DATABASE_URL no encontrada en .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] DATABASE_URL cargada correctamente" -ForegroundColor Green
Write-Host ""

# =====================================================
# 2. VERIFICAR PSQL
# =====================================================
Write-Host "[*] Verificando instalacion de PostgreSQL..." -ForegroundColor Cyan

$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Source

if (-Not $psqlPath) {
    Write-Host "[ERROR] psql no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar PostgreSQL:" -ForegroundColor Yellow
    Write-Host "   1. Descarga desde: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   2. Instala PostgreSQL (incluye psql)" -ForegroundColor White
    Write-Host "   3. Agrega al PATH: C:\Program Files\PostgreSQL\16\bin" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "[OK] psql encontrado: $psqlPath" -ForegroundColor Green
Write-Host ""

# =====================================================
# 3. CREAR ARCHIVO DE SALIDA
# =====================================================
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$outputFile = "docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md"

Write-Host "[*] Creando documento de salida..." -ForegroundColor Cyan

# Crear header del documento
"# DATABASE SCHEMA REFERENCE - RyR Constructora" | Out-File -FilePath $outputFile -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"**Ultima actualizacion:** $timestamp" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"**Generado automaticamente desde la base de datos**" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"---" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"## TABLAS Y CAMPOS" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8

Write-Host "[OK] Header creado" -ForegroundColor Green

# =====================================================
# 4. EXTRAER TABLAS Y COLUMNAS
# =====================================================
Write-Host ""
Write-Host "[*] Extrayendo estructura de tablas..." -ForegroundColor Cyan

$queryTablas = "SELECT c.table_name, c.column_name, c.data_type, CASE WHEN c.character_maximum_length IS NOT NULL THEN c.character_maximum_length::text WHEN c.numeric_precision IS NOT NULL THEN c.numeric_precision::text ELSE '' END as max_length, CASE WHEN c.is_nullable = 'YES' THEN 'true' ELSE 'false' END as is_nullable, COALESCE(c.column_default, '') as column_default, COALESCE(col_desc.description, '') as description, c.ordinal_position FROM information_schema.columns c LEFT JOIN pg_catalog.pg_statio_all_tables st ON c.table_schema = st.schemaname AND c.table_name = st.relname LEFT JOIN pg_catalog.pg_description col_desc ON col_desc.objoid = st.relid AND col_desc.objsubid = c.ordinal_position WHERE c.table_schema = 'public' AND c.table_name NOT LIKE 'pg_%' AND c.table_name NOT LIKE 'sql_%' ORDER BY c.table_name, c.ordinal_position;"

# Ejecutar query y guardar en CSV temporal
$tempCsv = "temp_schema.csv"
$queryTablas | psql $DATABASE_URL -t -A -F"," -o $tempCsv 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] al ejecutar query de tablas" -ForegroundColor Red
    exit 1
}

# Leer CSV y formatear como Markdown
$currentTable = ""
Import-Csv $tempCsv -Header "table_name","column_name","data_type","max_length","is_nullable","column_default","description","ordinal_position" | ForEach-Object {
    if ($_.table_name -ne $currentTable) {
        if ($currentTable -ne "") {
            "" | Out-File -FilePath $outputFile -Append -Encoding UTF8
            "" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        }

        $currentTable = $_.table_name
        "### TABLA: ``$currentTable``" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        "" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        "| Campo | Tipo | Nullable | Default | Descripcion |" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        "| ----- | ---- | -------- | ------- | ----------- |" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }

    $tipo = $_.data_type
    if ($_.max_length) {
        $tipo += "($($_.max_length))"
    }

    $nullable = if ($_.is_nullable -eq "true") { "Si" } else { "**NO (Requerido)**" }
    $default = if ($_.column_default) { "``$($_.column_default)``" } else { "-" }
    $desc = if ($_.description) { $_.description } else { "-" }

    "| ``$($_.column_name)`` | $tipo | $nullable | $default | $desc |" | Out-File -FilePath $outputFile -Append -Encoding UTF8
}

Remove-Item $tempCsv -ErrorAction SilentlyContinue
Write-Host "[OK] Tablas extraidas correctamente" -ForegroundColor Green

# =====================================================
# 5. EXTRAER ENUMs
# =====================================================
Write-Host ""
Write-Host "[*] Extrayendo ENUMs..." -ForegroundColor Cyan

"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"---" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"## ENUMS (Tipos Personalizados)" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8

$queryEnums = "SELECT t.typname as enum_name, string_agg(e.enumlabel, '|' ORDER BY e.enumsortorder) as valores FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid JOIN pg_enum e ON e.enumtypid = t.oid WHERE n.nspname = 'public' AND t.typtype = 'e' GROUP BY t.typname ORDER BY t.typname;"

$tempEnums = "temp_enums.csv"
$queryEnums | psql $DATABASE_URL -t -A -F"," -o $tempEnums 2>$null

if (Test-Path $tempEnums) {
    Import-Csv $tempEnums -Header "enum_name","valores" | ForEach-Object {
        "### ``$($_.enum_name)``" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        "" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        "**Valores permitidos:**" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        $_.valores -split '\|' | ForEach-Object {
            "- ``$_``" | Out-File -FilePath $outputFile -Append -Encoding UTF8
        }
        "" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
    Remove-Item $tempEnums -ErrorAction SilentlyContinue
    Write-Host "[OK] ENUMs extraidos correctamente" -ForegroundColor Green
} else {
    "No se encontraron ENUMs definidos" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    Write-Host "[INFO] No se encontraron ENUMs" -ForegroundColor Yellow
}

# =====================================================
# 6. EXTRAER FOREIGN KEYS
# =====================================================
Write-Host ""
Write-Host "[*] Extrayendo relaciones (Foreign Keys)..." -ForegroundColor Cyan

"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"---" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"## RELACIONES ENTRE TABLAS (Foreign Keys)" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8

$queryFKs = "SELECT tc.table_name as tabla_origen, kcu.column_name as columna_origen, ccu.table_name as tabla_destino, ccu.column_name as columna_destino, tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' ORDER BY tc.table_name, kcu.column_name;"

$tempFKs = "temp_fks.csv"
$queryFKs | psql $DATABASE_URL -t -A -F"," -o $tempFKs 2>$null

"| Tabla Origen | Campo | Tabla Destino | Campo Destino |" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"| ------------ | ----- | ------------- | ------------- |" | Out-File -FilePath $outputFile -Append -Encoding UTF8

if (Test-Path $tempFKs) {
    Import-Csv $tempFKs -Header "tabla_origen","columna_origen","tabla_destino","columna_destino","constraint_name" | ForEach-Object {
        "| ``$($_.tabla_origen)`` | ``$($_.columna_origen)`` | ``$($_.tabla_destino)`` | ``$($_.columna_destino)`` |" | Out-File -FilePath $outputFile -Append -Encoding UTF8
    }
    Remove-Item $tempFKs -ErrorAction SilentlyContinue
    Write-Host "[OK] Foreign Keys extraidas correctamente" -ForegroundColor Green
} else {
    Write-Host "[INFO] No se encontraron Foreign Keys" -ForegroundColor Yellow
}

# =====================================================
# 7. FOOTER
# =====================================================
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"---" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"## Resumen" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"- **Generado:** $timestamp" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"- **Script:** ``scripts/actualizar-docs-db.ps1``" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"- **Base de datos:** Supabase PostgreSQL" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"---" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"" | Out-File -FilePath $outputFile -Append -Encoding UTF8
"**Nota:** Este archivo es generado automaticamente. No editar manualmente." | Out-File -FilePath $outputFile -Append -Encoding UTF8
"Para actualizar, ejecuta: ``.\scripts\actualizar-docs-db.ps1``" | Out-File -FilePath $outputFile -Append -Encoding UTF8

# =====================================================
# FINALIZAR
# =====================================================
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "[OK] Documentacion actualizada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo generado: $outputFile" -ForegroundColor White
Write-Host ""
Write-Host "Abre el archivo para ver la estructura completa de la BD" -ForegroundColor Cyan
Write-Host ""
