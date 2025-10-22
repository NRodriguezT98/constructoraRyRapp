# 🔧 Migración: Permitir múltiples negociaciones por cliente-vivienda

## 📋 Problema
El constraint `UNIQUE(cliente_id, vivienda_id)` impide crear nuevas negociaciones incluso cuando las anteriores están **Canceladas** o **Completadas**.

**Ejemplo del error:**
```
Cliente tiene negociación CANCELADA → Intenta crear nueva → ❌ ERROR 23505
"duplicate key value violates unique constraint negociaciones_cliente_vivienda_unica"
```

## ✅ Solución
Cambiar el constraint a un **índice único parcial** que solo aplique a negociaciones **activas**.

Estados activos (solo 1 permitido): `'En Proceso'`, `'Cierre Financiero'`, `'Activa'`
Estados inactivos (permiten nueva): `'Completada'`, `'Cancelada'`, `'Renuncia'`

---

## 🚀 Cómo ejecutar la migración

### Opción 1: Desde Supabase Dashboard (RECOMENDADO)

1. Abre **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: **constructoraRyR**
3. Ve a **SQL Editor** en el menú izquierdo
4. Crea una nueva query
5. Copia y pega el contenido de: `supabase/migrations/fix-negociaciones-constraint-activas.sql`
6. Ejecuta la query (botón RUN o Ctrl+Enter)

### Opción 2: Desde la terminal (con Supabase CLI)

```powershell
# Navegar al directorio del proyecto
cd d:\constructoraRyRapp

# Ejecutar migración
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

---

## 🔍 Verificación post-migración

Ejecuta esta query para confirmar que se aplicó:

```sql
-- Ver índices únicos en la tabla negociaciones
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'negociaciones'
  AND indexdef LIKE '%UNIQUE%';
```

**Resultado esperado:**
- ❌ No debe aparecer: `negociaciones_cliente_vivienda_unica` (constraint eliminado)
- ✅ Debe aparecer: `idx_negociaciones_activas_cliente_vivienda_unica` (índice parcial)

---

## 📝 Qué cambia después de la migración

### ANTES ❌
```
Cliente A + Vivienda 1 → Negociación 1 (Cancelada)
Cliente A + Vivienda 1 → Negociación 2 (En Proceso) ❌ ERROR
```

### DESPUÉS ✅
```
Cliente A + Vivienda 1 → Negociación 1 (Cancelada) ✅
Cliente A + Vivienda 1 → Negociación 2 (En Proceso) ✅
Cliente A + Vivienda 1 → Negociación 3 (Completada) ✅
Cliente A + Vivienda 1 → Negociación 4 (En Proceso) ✅
```

### SIGUE BLOQUEADO ❌ (correcto)
```
Cliente A + Vivienda 1 → Negociación 1 (En Proceso) ✅
Cliente A + Vivienda 1 → Negociación 2 (En Proceso) ❌ ERROR
(No puede haber 2 negociaciones activas simultáneas)
```

---

## ⚠️ Importante
- La migración es **segura**: usa `IF EXISTS` y `IF NOT EXISTS`
- No afecta datos existentes
- Solo cambia la lógica del constraint
- Después de ejecutar, **prueba crear una nueva negociación** para el cliente con negociación cancelada

---

## 🐛 Troubleshooting

### Error: "index already exists"
La migración ya se ejecutó antes. Está bien, puedes ignorar este error.

### Error: "constraint does not exist"
El constraint ya fue eliminado antes. Está bien, continúa con el resto de la migración.

### Hay conflictos de negociaciones activas duplicadas
Ejecuta la query de verificación incluida en el script para identificar duplicados y decide manualmente cuál cancelar.

---

## 📞 Soporte
Si tienes problemas ejecutando la migración, revisa los logs de Supabase o contacta al equipo de desarrollo.
