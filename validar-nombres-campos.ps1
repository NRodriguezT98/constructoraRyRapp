<#
.SYNOPSIS
    Validador de Nombres de Campos - Pre-commit Hook

.DESCRIPTION
    Este script valida que el código no use nombres de campos incorrectos
    que sabemos que generan errores 400 en Supabase.

    Se ejecuta automáticamente antes de hacer commit.

.EXAMPLE
    .\validar-nombres-campos.ps1
#>

Write-Host "🔍 Validando nombres de campos en código..." -ForegroundColor Cyan
Write-Host ""

# Patrones de errores comunes que NO deben aparecer
$patronesProhibidos = @{
    'estado_interes' = @{
        mensaje = "❌ Usar 'estado' en vez de 'estado_interes'"
        correcto = "estado"
    }
    'vivienda_precio' = @{
        mensaje = "❌ Usar 'vivienda_valor' en vez de 'vivienda_precio'"
        correcto = "vivienda_valor"
    }
    'proyecto_ubicacion' = @{
        mensaje = "❌ Usar 'proyecto_estado' en vez de 'proyecto_ubicacion'"
        correcto = "proyecto_estado"
    }
    'cliente\.nombre[^s]' = @{
        mensaje = "❌ Usar 'cliente.nombres' (plural) en vez de 'cliente.nombre'"
        correcto = "cliente.nombres"
    }
}

# Archivos a validar (TypeScript y JavaScript)
$extensiones = @("*.ts", "*.tsx", "*.js", "*.jsx")
$directoriosValidar = @(
    "src/modules/clientes",
    "src/shared/services",
    "src/services"
)

$erroresEncontrados = 0

foreach ($directorio in $directoriosValidar) {
    if (Test-Path $directorio) {
        Write-Host "📂 Validando: $directorio" -ForegroundColor Yellow

        foreach ($extension in $extensiones) {
            $archivos = Get-ChildItem -Path $directorio -Filter $extension -Recurse -File

            foreach ($archivo in $archivos) {
                $contenido = Get-Content $archivo.FullName -Raw

                foreach ($patron in $patronesProhibidos.Keys) {
                    if ($contenido -match $patron) {
                        $erroresEncontrados++
                        $info = $patronesProhibidos[$patron]

                        Write-Host ""
                        Write-Host "⚠️  ERROR en: $($archivo.Name)" -ForegroundColor Red
                        Write-Host "   $($info.mensaje)" -ForegroundColor Red
                        Write-Host "   ✅ Corrección: usar '$($info.correcto)'" -ForegroundColor Green
                        Write-Host "   📄 Archivo: $($archivo.FullName)" -ForegroundColor Gray
                    }
                }
            }
        }
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($erroresEncontrados -eq 0) {
    Write-Host "✅ Validación exitosa - No se encontraron errores" -ForegroundColor Green
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ Se encontraron $erroresEncontrados error(es)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📚 Consulta: docs/DATABASE-SCHEMA-REFERENCE.md" -ForegroundColor Yellow
    Write-Host "📋 Checklist: docs/DESARROLLO-CHECKLIST.md" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🛠️  Corrige los errores antes de hacer commit" -ForegroundColor Red
    Write-Host ""
    exit 1
}
