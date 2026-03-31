# Limpieza de base de datos via API REST de Supabase
$SUPABASE_URL = "https://jqfbnggglbdiqbqtkubu.supabase.co"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmJuZ2dnbGJkaXFicXRrdWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODU5MTk5NSwiZXhwIjoyMDQ0MTY3OTk1fQ.Dt7F5dTKOL8dDXa2eP4CWnJ5MqZTSrAJzw28gB3MtFQ"

Write-Host "`nLIMPIANDO BASE DE DATOS..." -ForegroundColor Yellow

# Orden correcto de eliminacion (de hijos a padres)
$tablas = @(
    "auditoria_errores",
    "auditoria_cambios",
    "auditoria_acciones",
    "documentos",
    "abonos",
    "renuncias",
    "negociaciones",
    "viviendas",
    "manzanas",
    "proyectos",
    "clientes",
    "categorias_documentos"
)

foreach ($tabla in $tablas) {
    Write-Host "Limpiando $tabla..." -NoNewline

    try {
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$tabla" -Method DELETE -Headers @{
            "apikey" = $SUPABASE_SERVICE_KEY
            "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
            "Prefer" = "return=minimal"
        }
        Write-Host " OK" -ForegroundColor Green
    }
    catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nLIMPIEZA COMPLETADA!" -ForegroundColor Green
Write-Host "Todas las tablas han sido vaciadas.`n" -ForegroundColor Cyan
