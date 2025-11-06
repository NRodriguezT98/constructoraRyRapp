# Script para detectar patrones de bucles infinitos en hooks

Write-Host "`n🔍 BUSCANDO PATRONES DE BUCLES INFINITOS EN HOOKS...`n" -ForegroundColor Cyan

$patronesProblematicos = @()

# Buscar archivos con useCallback seguido de useEffect con esa función
Get-ChildItem -Path "src/modules" -Recurse -Filter "*.ts" -Exclude "*.d.ts" | ForEach-Object {
    $contenido = Get-Content $_.FullName -Raw

    # Patrón 1: useCallback con useEffect([callback])
    if ($contenido -match 'const\s+(\w+)\s*=\s*useCallback.*\n.*useEffect.*\[\s*\1\s*\]') {
        $patronesProblematicos += [PSCustomObject]@{
            Archivo = $_.FullName.Replace($PWD.Path + "\", "")
            Problema = "useCallback + useEffect con callback en dependencias"
            Funcion = $Matches[1]
        }
    }

    # Patrón 2: useEffect con objeto en dependencias (filtros, params, etc)
    if ($contenido -match 'useEffect.*\[\s*(filtros|params|config|options)\s*\]') {
        $patronesProblematicos += [PSCustomObject]@{
            Archivo = $_.FullName.Replace($PWD.Path + "\", "")
            Problema = "useEffect con objeto completo en dependencias"
            Funcion = $Matches[1]
        }
    }
}

if ($patronesProblematicos.Count -eq 0) {
    Write-Host "✅ No se encontraron patrones problemáticos" -ForegroundColor Green
} else {
    Write-Host "❌ Se encontraron $($patronesProblematicos.Count) posibles bucles infinitos:`n" -ForegroundColor Red
    $patronesProblematicos | Format-Table -AutoSize

    Write-Host "`n📝 SOLUCIONES RECOMENDADAS:" -ForegroundColor Yellow
    Write-Host "1. Mover lógica de useCallback dentro de useEffect"
    Write-Host "2. Usar propiedades específicas del objeto en dependencias: [filtros.search, filtros.estado]"
    Write-Host "3. Usar useMemo para objetos de configuración"
    Write-Host "4. Agregar cleanup function (return () => { mounted = false })"
}

Write-Host ""
