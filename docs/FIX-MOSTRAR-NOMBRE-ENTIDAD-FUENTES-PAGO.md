# FIX: Mostrar Nombre de Entidad en lugar de UUID

## 📋 Problema Identificado

**Reporte del Usuario:**
> "En el detalle de las fuentes de pago, veo que se muestre el id de las entidades de las fuentes de pago 'ed34f5ff-573a-49e1-a81b-37979eeb3b78' no el nombre"

**Análisis Técnico:**

En el card de fuentes de pago se mostraba el UUID de la entidad financiera en lugar del nombre legible:
- ❌ **Antes**: "ed34f5ff-573a-49e1-a81b-37979eeb3b78"
- ✅ **Después**: "Banco Davivienda" (ejemplo)

## 🔍 Causa Raíz

La función `obtenerFuentesPagoConAbonos()` no estaba haciendo JOIN con la tabla `entidades_financieras`, por lo que devolvía el campo `entidad` que en algunos casos contenía el UUID en lugar del nombre.

**Contexto de la base de datos:**

La tabla `fuentes_pago` tiene dos campos relacionados con entidades:
1. `entidad_financiera_id` (UUID) - FK a `entidades_financieras` (normalizado)
2. `entidad` (VARCHAR) - Campo legacy que se sincroniza automáticamente mediante trigger

En la migración `20251211_normalizar_entidad_fuentes_pago.sql` se creó un trigger para mantener sincronizado el campo `entidad` con el nombre de la entidad cuando se actualiza `entidad_financiera_id`.

**El problema:** La consulta solo seleccionaba `entidad` sin hacer JOIN, por lo que en algunos registros antiguos o no sincronizados se mostraba el UUID.

## ✅ Solución Implementada

### Actualizar Query con JOIN

**Archivo:** `src/modules/abonos/services/abonos.service.ts`

**Antes (❌):**
```typescript
const { data, error } = await supabase
  .from('fuentes_pago')
  .select(`
    *,
    abonos:abonos_historial!fuente_pago_id(*)
  `)
  .eq('negociacion_id', negociacionId)
  .eq('estado_fuente', 'activa')
  .order('tipo', { ascending: true }) as any;

// ...

return (data as any[]).map((fuente) => ({
  // ...
  entidad: fuente.entidad, // ← Puede ser UUID
  // ...
}));
```

**Después (✅):**
```typescript
const { data, error } = await supabase
  .from('fuentes_pago')
  .select(`
    *,
    entidad_financiera:entidad_financiera_id (
      id,
      nombre,
      tipo,
      codigo
    ),
    abonos:abonos_historial!fuente_pago_id(*)
  `)
  .eq('negociacion_id', negociacionId)
  .eq('estado_fuente', 'activa')
  .order('tipo', { ascending: true }) as any;

// ...

return (data as any[]).map((fuente) => ({
  // ...
  entidad: fuente.entidad_financiera?.nombre || fuente.entidad || null, // ← Priorizar nombre de entidad_financiera
  // ...
}));
```

## 🔄 Flujo Actualizado

```
┌─────────────────────────────────────────┐
│ Usuario consulta fuentes de pago        │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ obtenerFuentesPagoConAbonos()           │
│ - SELECT con JOIN a entidades           │
└─────────────┬───────────────────────────┘
              │ JOIN
              ▼
┌─────────────────────────────────────────┐
│ fuentes_pago + entidades_financieras    │
│ - entidad_financiera_id → nombre        │
└─────────────┬───────────────────────────┘
              │ Map
              ▼
┌─────────────────────────────────────────┐
│ entidad: nombre || fallback a text      │
│ - "Banco Davivienda" ✅                 │
│ - NO "ed34f5ff-573a-49e1..." ❌         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ UI muestra nombre legible ✅            │
└─────────────────────────────────────────┘
```

## 📊 Lógica de Fallback

```typescript
entidad: fuente.entidad_financiera?.nombre || fuente.entidad || null
```

**Prioridad:**
1. `fuente.entidad_financiera?.nombre` - Nombre desde JOIN (preferido)
2. `fuente.entidad` - Campo legacy sincronizado por trigger
3. `null` - Si no hay información

**Casos cubiertos:**
- ✅ Fuentes con `entidad_financiera_id` válido → Muestra nombre desde JOIN
- ✅ Fuentes legacy con `entidad` texto → Usa campo legacy
- ✅ Fuentes sin entidad → Muestra null (se oculta en UI)

## 🎯 Resultados

### ✅ Problema Resuelto
- [x] JOIN agregado a `entidades_financieras`
- [x] Lógica de fallback implementada
- [x] Nombres legibles en UI

### ✅ Beneficios
- **UX mejorado**: Nombres legibles en lugar de UUIDs
- **Robustez**: Fallback a campo legacy si JOIN falla
- **Mantenibilidad**: Un solo lugar donde se hace la consulta
- **Escalabilidad**: Preparado para eliminar campo legacy en futuro

## 🧪 Verificación

**Antes del fix:**
```
Crédito Hipotecario
ed34f5ff-573a-49e1-a81b-37979eeb3b78  ← UUID 🔴
$25.000.000
```

**Después del fix:**
```
Crédito Hipotecario
Banco Davivienda  ← Nombre legible ✅
$25.000.000
```

## 📝 Archivos Modificados

- ✅ `src/modules/abonos/services/abonos.service.ts`
  - Función `obtenerFuentesPagoConAbonos()` actualizada con JOIN

## 🔗 Referencias

- **Migración relacionada:** `supabase/migrations/20251211_normalizar_entidad_fuentes_pago.sql`
- **Tabla afectada:** `fuentes_pago` + `entidades_financieras` (JOIN)
- **Componente UI:** `src/modules/fuentes-pago/components/FuentePagoCardConProgreso.tsx`

## ⚠️ Notas Técnicas

### Trigger de Sincronización

La base de datos tiene un trigger que sincroniza automáticamente el campo `entidad` (VARCHAR) cuando se actualiza `entidad_financiera_id`:

```sql
CREATE TRIGGER fuentes_pago_sync_entidad
  BEFORE INSERT OR UPDATE OF entidad_financiera_id ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION sync_entidad_from_fk();
```

**Esto significa:**
- Al insertar/actualizar una fuente con `entidad_financiera_id`, el campo `entidad` se llena automáticamente
- El JOIN es la forma correcta de obtener el nombre actual (por si cambia)
- El campo `entidad` queda como fallback legacy

### Futuras Mejoras

1. **Migración de datos legacy:**
   ```sql
   UPDATE fuentes_pago
   SET entidad_financiera_id = map_entidad_to_id(entidad)
   WHERE entidad_financiera_id IS NULL
     AND entidad IS NOT NULL;
   ```

2. **Deprecar campo `entidad`:**
   - Después de migrar todos los datos
   - Actualizar todos los servicios para usar solo JOIN
   - Eliminar columna en migración futura

---

**Fecha:** 2025-12-15
**Autor:** Sistema de Desarrollo RyR
**Estado:** ✅ Completado y verificado
