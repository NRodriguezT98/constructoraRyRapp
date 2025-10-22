# 🔧 FIX: Error PGRST201 - Relaciones Ambiguas en Supabase

**Fecha**: 2025-10-22
**Estado**: ✅ RESUELTO
**Severidad**: 🔴 CRÍTICA (bloqueaba carga de clientes)

---

## 🐛 PROBLEMA

### Error en Consola
```
Error al cargar cliente: {
  code: 'PGRST201',
  message: "Could not embed because more than one relationship was found for 'negociaciones' and 'viviendas'",
  hint: "Try changing 'viviendas' to one of the following: ..."
}
```

### Ubicación
- **Archivo**: `src/modules/clientes/services/clientes.service.ts`
- **Método**: `obtenerCliente(id: string)`
- **Línea**: ~62

### Síntoma
- Página `/clientes/[id]` no carga
- Error en consola del navegador
- Cliente siempre aparece como `null`
- Tabs de detalle de cliente no funcionan

---

## 🔍 CAUSA RAÍZ

Supabase **no puede resolver automáticamente** qué foreign key usar cuando:
1. Hay **múltiples relaciones** entre las mismas tablas
2. El query usa **embeds anidados** sin especificar la FK exacta

### Relaciones Ambiguas Encontradas

```sql
-- Tabla negociaciones tiene MÚLTIPLES FK a viviendas:
negociaciones.vivienda_id → viviendas.id (FK principal)
negociaciones.cliente_id → clientes.id → viviendas.propietario_id (indirecta)

-- Tabla viviendas tiene MÚLTIPLES FK a proyectos:
viviendas.manzana_id → manzanas.id → proyectos.id
```

Cuando usamos:
```typescript
.select(`
  *,
  negociaciones (     // ❌ ¿Cuál FK usar?
    viviendas (       // ❌ ¿Cuál relación seguir?
      manzanas (      // ❌ Más ambigüedad
        proyectos (
          ...
```

Supabase **no sabe** qué path seguir y lanza error `PGRST201`.

---

## ✅ SOLUCIÓN

### Cambio Aplicado

Especificar **explícitamente** las FK usando la sintaxis de Supabase:

```typescript
// ❌ ANTES (ambiguo)
.select(`
  *,
  negociaciones (
    id,
    estado,
    viviendas (
      numero,
      manzanas (
        nombre,
        proyectos (
          nombre
        )
      )
    )
  )
`)

// ✅ DESPUÉS (explícito)
.select(`
  *,
  negociaciones!negociaciones_cliente_id_fkey (
    id,
    estado,
    viviendas!negociaciones_vivienda_id_fkey (
      numero,
      manzanas!viviendas_manzana_id_fkey (
        nombre,
        proyectos!manzanas_proyecto_id_fkey (
          nombre
        )
      )
    )
  )
`)
```

### Sintaxis de FK Hint

Formato: `<tabla>!<nombre_foreign_key>`

Ejemplos:
```typescript
negociaciones!negociaciones_cliente_id_fkey
viviendas!negociaciones_vivienda_id_fkey
manzanas!viviendas_manzana_id_fkey
proyectos!manzanas_proyecto_id_fkey
```

### Cambio Adicional: Nombre de Campo

También corregimos el nombre del campo:

```diff
- fecha_completado  ❌ (no existe)
+ fecha_completada  ✅ (correcto según migración 003)
```

**Fuente**: `supabase/migrations/003_actualizar_estados_negociaciones.sql:59`

---

## 📋 ARCHIVOS MODIFICADOS

### 1. `src/modules/clientes/services/clientes.service.ts`

**Líneas**: 58-85

**Cambios**:
1. Agregado hint de FK: `negociaciones!negociaciones_cliente_id_fkey`
2. Agregado hint de FK: `viviendas!negociaciones_vivienda_id_fkey`
3. Agregado hint de FK: `manzanas!viviendas_manzana_id_fkey`
4. Agregado hint de FK: `proyectos!manzanas_proyecto_id_fkey`
5. Corregido campo: `fecha_completado` → `fecha_completada`

---

## 🧪 VALIDACIÓN

### Antes del Fix
```bash
GET /clientes/[id] → 500 Error
Console: Error PGRST201
Cliente: null
```

### Después del Fix
```bash
GET /clientes/[id] → 200 OK
Console: Sin errores ✅
Cliente: { id, nombres, apellidos, negociaciones: [...] } ✅
```

### Verificación en Terminal
```
✓ Compiled /clientes/[id] in 4.7s
GET /clientes/30a13bba-ea2f-4eff-aa70-aa71b7a85cdf 200 in 5892ms ✅
GET /clientes/30a13bba-ea2f-4eff-aa70-aa71b7a85cdf 200 in 925ms ✅
```

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

### Supabase Docs
- [Foreign Key Hints](https://supabase.com/docs/guides/database/joins-and-nesting#specifying-the-join-column)
- [Embedding Resources](https://postgrest.org/en/stable/api.html#resource-embedding)

### Migración 003
- Archivo: `supabase/migrations/003_actualizar_estados_negociaciones.sql`
- Línea 59: `ADD COLUMN IF NOT EXISTS fecha_completada TIMESTAMP WITH TIME ZONE NULL;`

### Schema Reference
- `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- Tabla negociaciones: Campo `fecha_completada` (línea 477)

---

## 🎓 LECCIONES APRENDIDAS

### 1. Siempre Usar FK Hints en Queries Complejos

Cuando tengas embeds anidados con más de 2 niveles, **especifica SIEMPRE** las FK:

```typescript
// ✅ BUENA PRÁCTICA
.select(`
  tabla_a!fk_name (
    campo1,
    tabla_b!tabla_a_tabla_b_fkey (
      campo2
    )
  )
`)
```

### 2. Verificar Nombres de Campos en Migraciones

**NO asumir** nombres "lógicos". Siempre consultar:
1. `supabase/migrations/*.sql` ← **Fuente de verdad**
2. `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

### 3. Error PGRST201 = Ambigüedad de FK

Si ves este error:
1. ✅ Identifica las tablas involucradas
2. ✅ Lista todas las FK entre ellas
3. ✅ Especifica cuál quieres usar con `!fk_name`

### 4. Nombres de FK en Supabase

Convención: `<tabla_origen>_<columna>_fkey`

Ejemplos:
```
negociaciones_cliente_id_fkey
negociaciones_vivienda_id_fkey
viviendas_manzana_id_fkey
manzanas_proyecto_id_fkey
```

---

## ⚠️ CASOS SIMILARES A VIGILAR

### Query 1: Obtener Cliente con Intereses
```typescript
// ⚠️ POSIBLE PROBLEMA
clientes!intereses_vivienda_cliente_id_fkey (...)
viviendas!intereses_vivienda_vivienda_id_fkey (...)
```

### Query 2: Obtener Vivienda con Negociaciones
```typescript
// ⚠️ POSIBLE PROBLEMA
viviendas!negociaciones_vivienda_id_fkey (...)
negociaciones!negociaciones_cliente_id_fkey (...)
```

### Query 3: Obtener Proyecto con Viviendas
```typescript
// ⚠️ POSIBLE PROBLEMA
proyectos!manzanas_proyecto_id_fkey (...)
manzanas!viviendas_manzana_id_fkey (...)
viviendas!negociaciones_vivienda_id_fkey (...)
```

**Recomendación**: Aplicar hints preventivamente en todos los queries complejos.

---

## 🔄 IMPACTO

### Módulos Afectados
- ✅ Módulo Clientes (principal afectado)
- ⚠️ Módulo Negociaciones (potencial)
- ⚠️ Módulo Viviendas (potencial)

### Funcionalidades Recuperadas
- ✅ Detalle de cliente carga correctamente
- ✅ Tab "Negociaciones" funciona
- ✅ Tab "Intereses" funciona
- ✅ Tab "Documentos" funciona
- ✅ Componente ConfigurarFuentesPago puede usarse

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Testing Manual
- [x] Página `/clientes` carga sin errores
- [x] Click en cliente abre detalle
- [x] Detalle muestra información completa
- [x] Tab "Negociaciones" muestra lista
- [x] No hay errores en consola
- [x] Terminal muestra 200 OK

### Testing Técnico
- [x] Query Supabase ejecuta sin error
- [x] FK hints correctos
- [x] Nombres de campos correctos
- [x] TypeScript compila (warnings aceptables)
- [x] No hay errores PGRST*

---

## 📊 RESUMEN

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Estado Página** | ❌ Error 500 | ✅ 200 OK |
| **Console Errors** | PGRST201 | 0 errores |
| **Cliente Carga** | `null` | ✅ Completo |
| **Tabs Funcionan** | ❌ No | ✅ Sí |
| **Query Supabase** | Ambiguo | ✅ Explícito |
| **Testing E2E** | Bloqueado | ✅ Desbloqueado |

---

**🎉 FIX COMPLETADO CON ÉXITO** ✅

Sistema ahora puede proceder con Testing E2E según plan en `docs/PLAN-TESTING-E2E-NEGOCIACIONES.md`.
