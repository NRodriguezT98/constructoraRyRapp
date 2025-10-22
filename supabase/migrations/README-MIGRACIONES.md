# GUÍA DE EJECUCIÓN DE MIGRACIONES DE ESTADOS

> **Fecha:** 22 de octubre de 2025
> **Referencia:** docs/DEFINICION-ESTADOS-SISTEMA.md

---

## 📋 ORDEN DE EJECUCIÓN

**⚠️ IMPORTANTE:** Ejecutar en este orden exacto:

1. ✅ `001_actualizar_estados_clientes.sql`
2. ✅ `002_actualizar_estados_viviendas.sql`
3. ✅ `003_actualizar_estados_negociaciones.sql`
4. ✅ `004_actualizar_tabla_renuncias.sql`
5. ✅ `005_validaciones_finales.sql`

---

## 🚀 MÉTODOS DE EJECUCIÓN

### **OPCIÓN A: Desde Supabase Dashboard** (Recomendado)

1. Ir a: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

2. Copiar contenido de `001_actualizar_estados_clientes.sql`

3. Click en **"Run"**

4. Verificar que no hay errores

5. Repetir con cada archivo en orden

---

### **OPCIÓN B: Desde terminal local**

```powershell
# Configurar variables de entorno
$env:PGPASSWORD="tu-password-de-supabase"
$DB_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# Ejecutar migraciones en orden
psql $DB_URL -f "supabase/migrations/001_actualizar_estados_clientes.sql"
psql $DB_URL -f "supabase/migrations/002_actualizar_estados_viviendas.sql"
psql $DB_URL -f "supabase/migrations/003_actualizar_estados_negociaciones.sql"
psql $DB_URL -f "supabase/migrations/004_actualizar_tabla_renuncias.sql"
psql $DB_URL -f "supabase/migrations/005_validaciones_finales.sql"
```

---

### **OPCIÓN C: Script automatizado** (Crear si es necesario)

```powershell
# ejecutar-migraciones.ps1
$migrations = @(
    "001_actualizar_estados_clientes.sql",
    "002_actualizar_estados_viviendas.sql",
    "003_actualizar_estados_negociaciones.sql",
    "004_actualizar_tabla_renuncias.sql",
    "005_validaciones_finales.sql"
)

foreach ($migration in $migrations) {
    Write-Host "Ejecutando: $migration" -ForegroundColor Cyan
    psql $DB_URL -f "supabase/migrations/$migration"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en $migration" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ $migration completada" -ForegroundColor Green
}

Write-Host "🎉 Todas las migraciones ejecutadas exitosamente" -ForegroundColor Green
```

---

## ✅ VALIDACIÓN POST-MIGRACIÓN

Después de ejecutar TODAS las migraciones, ejecutar estas consultas:

```sql
-- 1. Verificar estados de todas las tablas
SELECT 'clientes' as tabla, estado, COUNT(*) as cantidad FROM clientes GROUP BY estado
UNION ALL
SELECT 'viviendas', estado, COUNT(*) FROM viviendas GROUP BY estado
UNION ALL
SELECT 'negociaciones', estado, COUNT(*) FROM negociaciones GROUP BY estado
UNION ALL
SELECT 'renuncias', estado, COUNT(*) FROM renuncias GROUP BY estado
ORDER BY tabla, estado;

-- 2. Verificar integridad de viviendas asignadas
SELECT COUNT(*) as viviendas_mal_asignadas
FROM viviendas
WHERE estado = 'Asignada' AND (cliente_id IS NULL OR negociacion_id IS NULL);
-- Resultado esperado: 0

-- 3. Verificar integridad de negociaciones completadas
SELECT COUNT(*) as negociaciones_inconsistentes
FROM negociaciones
WHERE estado = 'Completada' AND (porcentaje_completado != 100 OR fecha_completada IS NULL);
-- Resultado esperado: 0

-- 4. Verificar integridad de renuncias
SELECT COUNT(*) as renuncias_inconsistentes
FROM renuncias
WHERE requiere_devolucion = true AND monto_a_devolver = 0;
-- Resultado esperado: 0

-- 5. Verificar constraints creados
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname LIKE '%estado_check%'
ORDER BY conrelid::regclass::text;

-- 6. Verificar funciones creadas
SELECT
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN ('validar_cancelacion_renuncia', 'calcular_monto_devolver', 'obtener_snapshot_abonos');

-- 7. Verificar triggers creados
SELECT
  trigger_name,
  event_object_table as table_name,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_calcular_monto_devolver');

-- 8. Verificar vistas creadas
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_name IN ('v_negociaciones_completas', 'v_renuncias_pendientes');
```

---

## 🎯 RESULTADOS ESPERADOS

### **Estados de Clientes:**
- ✅ Interesado
- ✅ Activo
- ✅ En Proceso de Renuncia (nuevo)
- ✅ Inactivo
- ✅ Propietario (nuevo)

### **Estados de Viviendas:**
- ✅ Disponible
- ✅ Asignada
- ✅ Entregada (nuevo o renombrado)

### **Estados de Negociaciones:**
- ✅ Activa (migrado desde "En Proceso" y "Cierre Financiero")
- ✅ Suspendida (nuevo)
- ✅ Cerrada por Renuncia (migrado desde "Renuncia" y "Cancelada")
- ✅ Completada

### **Estados de Renuncias:**
- ✅ Pendiente Devolución (migrado desde "pendiente")
- ✅ Cerrada (migrado desde "aprobada")
- ✅ Cancelada (migrado desde "rechazada", nuevo)

---

## 🔄 ROLLBACK (EN CASO DE ERROR)

Cada archivo de migración incluye sección de ROLLBACK al final. Para revertir:

1. Copiar sección de ROLLBACK del archivo correspondiente
2. Ejecutar en Supabase SQL Editor
3. Verificar estado de datos antes de la migración

**Ejemplo de Rollback (001):**
```sql
ALTER TABLE public.clientes DROP CONSTRAINT clientes_estado_check;
ALTER TABLE public.clientes ADD CONSTRAINT clientes_estado_check CHECK (
  ((estado)::text = ANY ((ARRAY['Interesado'::character varying, 'Activo'::character varying, 'Inactivo'::character varying])::text[]))
);
```

---

## 🛡️ RESPALDO ANTES DE MIGRAR

**CRÍTICO:** Crear respaldo de base de datos antes de ejecutar migraciones:

### **Desde Supabase Dashboard:**
1. Settings → Database → Backups
2. Create manual backup
3. Nombrar: `backup-antes-migracion-estados-2025-10-22`

### **Desde terminal:**
```powershell
pg_dump $DB_URL > backup-antes-migracion-$(Get-Date -Format 'yyyy-MM-dd-HHmm').sql
```

---

## 📊 IMPACTO ESPERADO

### **Cambios en datos existentes:**
- ✅ Estados de clientes: Solo agregar nuevos valores, NO modificar existentes
- ✅ Estados de viviendas: Migrar "Reservada"→"Asignada", "Vendida"→"Entregada"
- ✅ Estados de negociaciones: Migrar "En Proceso"→"Activa", "Cierre Financiero"→"Activa", etc.
- ✅ Estados de renuncias: Migrar "pendiente"→"Pendiente Devolución", etc.

### **Nuevos campos agregados:**
- `viviendas.negociacion_id` (UUID)
- `viviendas.fecha_entrega` (TIMESTAMP)
- `negociaciones.fecha_renuncia_efectiva` (TIMESTAMP)
- `negociaciones.fecha_completada` (TIMESTAMP)
- `renuncias.negociacion_id` (UUID)
- `renuncias.vivienda_valor_snapshot` (NUMERIC)
- `renuncias.abonos_snapshot` (JSONB)
- `renuncias.requiere_devolucion` (BOOLEAN)
- `renuncias.fecha_devolucion` (TIMESTAMP)
- `renuncias.comprobante_devolucion_url` (TEXT)
- `renuncias.metodo_devolucion` (VARCHAR)
- `renuncias.numero_comprobante` (VARCHAR)
- `renuncias.fecha_cancelacion` (TIMESTAMP)
- `renuncias.motivo_cancelacion` (TEXT)
- `renuncias.usuario_cancelacion` (UUID)
- `renuncias.fecha_cierre` (TIMESTAMP)
- `renuncias.usuario_cierre` (UUID)

### **Nuevos constraints:**
- 15+ constraints de integridad
- 3 triggers automáticos
- 10+ índices de optimización
- 2 vistas para reportes

---

## 📞 SOPORTE

Si encuentras errores durante la migración:

1. **NO CONTINUAR** con siguientes archivos
2. Capturar mensaje de error completo
3. Verificar rollback disponible
4. Consultar docs/DEFINICION-ESTADOS-SISTEMA.md
5. Revisar logs de Supabase

---

## ✅ CHECKLIST DE EJECUCIÓN

- [ ] Respaldo de BD creado
- [ ] Migración 001 ejecutada y validada
- [ ] Migración 002 ejecutada y validada
- [ ] Migración 003 ejecutada y validada
- [ ] Migración 004 ejecutada y validada
- [ ] Migración 005 ejecutada y validada
- [ ] Consultas de validación ejecutadas (todas 0 errores)
- [ ] Vistas creadas correctamente
- [ ] Funciones disponibles
- [ ] Triggers activos
- [ ] Actualizar DATABASE-SCHEMA-REFERENCE.md

---

**Última actualización:** 22 de octubre de 2025
**Referencia:** docs/DEFINICION-ESTADOS-SISTEMA.md
**Estado:** ✅ LISTO PARA EJECUTAR
