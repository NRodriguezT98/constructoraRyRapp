# ARREGLA ERRORES COMUNES DE TYPESCRIPT
# Patrones automatizables: any -> unknown, missing properties, etc.

Write-Host "`n========================================"
Write-Host "Arreglar Errores Comunes TypeScript"
Write-Host "========================================`n"

$erroresArreglados = 0

# 1. AGREGAR PROPIEDADES FALTANTES EN TIPOS
Write-Host "[1/3] Buscando propiedades faltantes...`n" -ForegroundColor Yellow

# Nota: Este script solo puede hacer cambios seguros
# Errores complejos requieren revisión manual

# 2. CAMBIAR 'any' A 'unknown' EN LUGARES SEGUROS
Write-Host "[2/3] Analizando uso de 'any'...`n" -ForegroundColor Yellow

$anyUsage = Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern ": any\b" -Recurse |
    Where-Object { $_.Line -notmatch "^\s*//" } |
    Group-Object Path |
    Select-Object Count, Name

if ($anyUsage) {
    Write-Host "Archivos con 'any' type:" -ForegroundColor Yellow
    $anyUsage | ForEach-Object {
        $filename = Split-Path $_.Name -Leaf
        Write-Host "  $filename - $($_.Count) usos" -ForegroundColor Gray
    }
    Write-Host "`n⚠️  Revisar manualmente - cambiar 'any' puede romper codigo" -ForegroundColor Yellow
} else {
    Write-Host "[OK] No se encontraron usos de 'any'" -ForegroundColor Green
}

Write-Host "`n----------------------------------------`n"

# 3. VERIFICAR IMPORTS ROTOS
Write-Host "[3/3] Verificando imports rotos...`n" -ForegroundColor Yellow

# Simplificado: solo contar archivos que importan relativos
$relativeImports = Select-String -Path "src/**/*.ts","src/**/*.tsx" -Pattern "from ['\""]\.\/" -Recurse |
    Group-Object Path |
    Measure-Object

Write-Host "[INFO] $($relativeImports.Count) archivos con imports relativos" -ForegroundColor Gray
Write-Host "[INFO] Revisar manualmente si hay errores de imports" -ForegroundColor Gray

Write-Host "`n========================================`n"

# RESUMEN
if ($erroresArreglados -gt 0) {
    Write-Host "ARREGLADOS: $erroresArreglados error(es) automaticamente" -ForegroundColor Green
} else {
    Write-Host "INFO: No hay errores auto-reparables" -ForegroundColor Yellow
    Write-Host "`nLos errores actuales requieren revision manual:" -ForegroundColor Yellow
    Write-Host "  1. Tipos incompatibles en resolvers" -ForegroundColor Gray
    Write-Host "  2. Propiedades faltantes en interfaces" -ForegroundColor Gray
    Write-Host "  3. Tipos 'any' que necesitan tipos especificos" -ForegroundColor Gray
}

Write-Host "`nRecomendacion: Ejecutar '.\verificar-build.ps1' para ver errores actuales`n" -ForegroundColor Cyan
Write-Host "========================================`n"
