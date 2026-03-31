#!/usr/bin/env pwsh
# Aplica las politicas de Storage para documentos-viviendas
# Lee el archivo SQL y lo muestra para copiar y ejecutar en Supabase SQL Editor

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACION STORAGE - DOCUMENTOS VIVIENDAS" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

$sqlFile = "supabase\storage\storage-documentos-viviendas.sql"

if (!(Test-Path $sqlFile)) {
    Write-Host "ERROR: No se encontro el archivo $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Archivo SQL:" -ForegroundColor Yellow
Write-Host "   $sqlFile" -ForegroundColor White
Write-Host ""

Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "   1. Abre Supabase SQL Editor" -ForegroundColor White
Write-Host "   2. Copia el SQL que se mostrara a continuacion" -ForegroundColor White
Write-Host "   3. Pegalo en el editor y ejecutalo (Ctrl+Enter)" -ForegroundColor White
Write-Host "   4. Verifica que se ejecute sin errores" -ForegroundColor White
Write-Host ""

Write-Host "Presiona cualquier tecla para ver el SQL..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   SQL PARA COPIAR Y PEGAR" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Get-Content $sqlFile | Write-Host -ForegroundColor White

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "El SQL tambien se copio al portapapeles" -ForegroundColor Green
Get-Content $sqlFile | Set-Clipboard

Write-Host ""
Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host "   Pega el SQL en Supabase SQL Editor y ejecutalo" -ForegroundColor White
Write-Host ""
