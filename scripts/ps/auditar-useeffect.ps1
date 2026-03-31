# 🔍 Script: Auditar useEffect sin Cleanup

Write-Host "🔍 AUDITORÍA: useEffect sin cleanup en módulos" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Patrones problemáticos a buscar
$patronesProblematicos = @(
    "useEffect\(\(\) => \{"
    "useEffect\(async"
)

# Rutas a analizar
$rutasAnalizar = @(
    "src/modules/proyectos",
    "src/modules/viviendas",
    "src/modules/clientes",
    "src/modules/abonos",
    "src/modules/auditorias",
    "src/modules/renuncias",
    "src/modules/reportes",
    "src/modules/procesos",
    "src/modules/configuracion"
)

$archivosProblematicos = @()

foreach ($ruta in $rutasAnalizar) {
    if (Test-Path $ruta) {
        Write-Host "📂 Analizando: $ruta" -ForegroundColor Yellow

        # Buscar archivos .tsx y .ts
        $archivos = Get-ChildItem -Path $ruta -Recurse -Include *.tsx,*.ts -File

        foreach ($archivo in $archivos) {
            $contenido = Get-Content $archivo.FullName -Raw

            # Buscar useEffect
            if ($contenido -match "useEffect") {
                # Extraer todos los useEffect
                $matches = [regex]::Matches($contenido, "useEffect\s*\([^)]*\)\s*=>?\s*\{[^\}]*\}", [System.Text.RegularExpressions.RegexOptions]::Singleline)

                foreach ($match in $matches) {
                    $useEffectCode = $match.Value

                    # Verificar si tiene return con cleanup
                    if ($useEffectCode -notmatch "return\s*\(\s*\)\s*=>") {
                        # Verificar si hace queries async
                        if ($useEffectCode -match "(await|\.then|fetch|supabase|service\.|cargar|obtener)") {
                            $archivoProblematico = @{
                                Ruta = $archivo.FullName.Replace((Get-Location).Path + "\", "")
                                Linea = ($contenido.Substring(0, $match.Index) -split "`n").Count
                                Codigo = $useEffectCode.Substring(0, [Math]::Min(200, $useEffectCode.Length))
                            }
                            $archivosProblematicos += $archivoProblematico
                        }
                    }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "📊 RESULTADOS DE AUDITORÍA" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

if ($archivosProblematicos.Count -eq 0) {
    Write-Host "✅ No se encontraron useEffect problemáticos" -ForegroundColor Green
} else {
    Write-Host "⚠️  Se encontraron $($archivosProblematicos.Count) useEffect sin cleanup" -ForegroundColor Red
    Write-Host ""

    foreach ($item in $archivosProblematicos) {
        Write-Host "📄 Archivo: $($item.Ruta)" -ForegroundColor Yellow
        Write-Host "   Línea: $($item.Linea)" -ForegroundColor Gray
        Write-Host "   Código:" -ForegroundColor Gray
        Write-Host "   $($item.Codigo)..." -ForegroundColor DarkGray
        Write-Host ""
    }

    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "🛠️  ACCIÓN REQUERIDA:" -ForegroundColor Cyan
    Write-Host "   1. Revisar cada archivo listado" -ForegroundColor White
    Write-Host "   2. Agregar cleanup pattern:" -ForegroundColor White
    Write-Host ""
    Write-Host "      useEffect(() => {" -ForegroundColor DarkGray
    Write-Host "        let cancelado = false" -ForegroundColor DarkGray
    Write-Host "        " -ForegroundColor DarkGray
    Write-Host "        const cargarDatos = async () => {" -ForegroundColor DarkGray
    Write-Host "          // ... lógica async ..." -ForegroundColor DarkGray
    Write-Host "        }" -ForegroundColor DarkGray
    Write-Host "        " -ForegroundColor DarkGray
    Write-Host "        cargarDatos()" -ForegroundColor DarkGray
    Write-Host "        " -ForegroundColor DarkGray
    Write-Host "        return () => {" -ForegroundColor Green
    Write-Host "          cancelado = true  // ← AGREGAR ESTO" -ForegroundColor Green
    Write-Host "        }" -ForegroundColor Green
    Write-Host "      }, [])" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "📚 Referencia: docs/SOLUCION-LOADING-INFINITO-DEV.md" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
