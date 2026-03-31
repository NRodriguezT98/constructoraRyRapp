# Ejecutar migraciones de limpieza de pendientes huérfanos

Write-Host "🔧 1/3: Creando trigger de limpieza automática..." -ForegroundColor Cyan
node ejecutar-sql.js supabase/migrations/20251204_trigger_limpiar_pendientes_fuente.sql

Write-Host ""
Write-Host "🧹 2/3: Limpiando pendientes huérfanos existentes..." -ForegroundColor Cyan
node ejecutar-sql.js limpiar-pendientes-huerfanos.sql

Write-Host ""
Write-Host "Proceso completado. Presiona ENTER para cerrar..." -ForegroundColor Green
Read-Host
