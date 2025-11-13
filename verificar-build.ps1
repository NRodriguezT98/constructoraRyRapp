# VERIFICADOR DE ERRORES PRE-BUILD
# Ejecuta validaciones locales antes de deploy a Vercel

Write-Host "`n========================================"
Write-Host "RyR Constructora - Verificador Pre-Build"
Write-Host "========================================`n"

# 1. TYPESCRIPT TYPE-CHECK
Write-Host "[1/3] Verificando tipos TypeScript...`n" -ForegroundColor Yellow

$tscOutput = & npx tsc --noEmit 2>&1
$tscExitCode = $LASTEXITCODE

if ($tscExitCode -eq 0) {
    Write-Host "[OK] Sin errores de tipos`n" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Errores de TypeScript:`n" -ForegroundColor Red
    Write-Host $tscOutput
    Write-Host ""
}

Write-Host "----------------------------------------`n"

# 2. CARPETAS PROBLEMATICAS
Write-Host "[2/3] Verificando nombres de carpetas...`n" -ForegroundColor Yellow

$problematic = @()
Get-ChildItem -Path "src" -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Name -match '``' -or $_.Name -match '\s') {
        $problematic += $_.FullName
    }
}

if ($problematic.Count -gt 0) {
    Write-Host "[ERROR] Carpetas problematicas:" -ForegroundColor Red
    foreach ($folder in $problematic) {
        Write-Host "  - $folder" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "[OK] Nombres correctos`n" -ForegroundColor Green
}

Write-Host "----------------------------------------`n"

# 3. BUILD LOCAL
Write-Host "[3/3] Ejecutando build completo...`n" -ForegroundColor Yellow

$buildOutput = & npm run build 2>&1
$buildExitCode = $LASTEXITCODE

if ($buildExitCode -eq 0) {
    Write-Host "[OK] Build exitoso`n" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Build fallo:`n" -ForegroundColor Red
    $buildOutput | Select-Object -Last 80 | Write-Host
    Write-Host ""
}

# RESUMEN
Write-Host "========================================`n"

$errors = 0
if ($tscExitCode -ne 0) { $errors++ }
if ($problematic.Count -gt 0) { $errors++ }
if ($buildExitCode -ne 0) { $errors++ }

if ($errors -eq 0) {
    Write-Host "EXITO: Listo para deploy!" -ForegroundColor Green
    Write-Host "`nEjecuta: vercel --prod`n"
} else {
    Write-Host "FALLO: $errors error(es) encontrado(s)" -ForegroundColor Red
    Write-Host "`nCorregir antes de deploy`n"
}

Write-Host "========================================`n"
