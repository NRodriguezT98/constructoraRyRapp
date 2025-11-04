# 🚀 Guía de Ejecución: Optimización Viviendas

## 📊 Objetivo

Reducir el tiempo de carga del módulo Viviendas de **985ms a ~300ms** (70% de mejora).

## 🎯 Problema Identificado

### Antes (Código Actual)
El servicio `viviendas.service.ts` realiza **3-4 queries en cascada**:

```
1. SELECT * FROM viviendas + JOIN manzanas/proyectos
2. SELECT * FROM clientes WHERE id IN (...)       ← Query separada
3. SELECT * FROM abonos_historial WHERE negociacion_id IN (...)  ← Query separada
4. Transformaciones en cliente (reduce, forEach, map)  ← Lógica costosa
```

**Resultado**: 563-985ms por carga

### Después (Con Vista Optimizada)
Una sola query a `vista_viviendas_completas`:

```sql
SELECT * FROM vista_viviendas_completas
-- PostgreSQL hace todos los JOINs y cálculos de una vez
```

**Resultado esperado**: ~300ms

---

## 📝 PASO 1: Ejecutar SQL en Supabase

### Opción A: Supabase Dashboard (Recomendado)

1. **Abrir SQL Editor**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Menú lateral → **SQL Editor**

2. **Copiar el SQL**
   - Abre: `supabase/migrations/20251024_vista_viviendas_completas.sql`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)

3. **Ejecutar**
   - Pega en el editor SQL
   - Click en **"Run"** (o F5)

4. **Verificar Resultado**
   ```
   ✅ Success. No rows returned
   ```

### Opción B: Supabase CLI (Alternativa)

```powershell
# Desde la raíz del proyecto
npx supabase db push
```

---

## ✅ PASO 2: Verificar Creación

### En SQL Editor de Supabase:

```sql
-- 1. Verificar que la vista existe
SELECT * FROM vista_viviendas_completas LIMIT 5;

-- 2. Verificar índices creados
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE tablename IN ('viviendas', 'manzanas', 'abonos_historial')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 3. Contar registros
SELECT COUNT(*) as total_viviendas FROM vista_viviendas_completas;

-- 4. Verificar que los cálculos funcionan
SELECT
  id,
  numero,
  estado,
  valor_total,
  total_abonado,
  porcentaje_pagado,
  saldo_pendiente,
  cantidad_abonos
FROM vista_viviendas_completas
WHERE cliente_id IS NOT NULL
LIMIT 10;
```

**Resultados Esperados:**
- ✅ Vista retorna datos correctamente
- ✅ Aparecen 9 índices nuevos
- ✅ `total_abonado` y `porcentaje_pagado` tienen valores calculados
- ✅ `cantidad_abonos` muestra el conteo correcto

---

## 🔄 PASO 3: El Código Ya Está Actualizado

El archivo `src/modules/viviendas/services/viviendas.service.ts` ya fue refactorizado automáticamente:

### Cambios Implementados:

**ANTES** (~120 líneas):
```typescript
async listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
  // Query 1: viviendas + manzanas + proyectos
  const { data } = await supabase.from('viviendas').select(`
    *, manzanas (nombre, proyecto_id, proyectos (nombre))
  `)

  // Query 2: clientes separados
  const { data: clientesData } = await supabase
    .from('clientes')
    .select('*')
    .in('id', idsClientes)

  // Query 3: abonos separados
  const { data: abonosData } = await supabase
    .from('abonos_historial')
    .select('negociacion_id, monto')
    .in('negociacion_id', negociacionIds)

  // Transformaciones costosas (forEach, reduce, map)
  // ...100+ líneas de lógica...
}
```

**DESPUÉS** (~100 líneas):
```typescript
async listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
  // UNA SOLA QUERY a la vista optimizada
  const { data, error } = await supabase
    .from('vista_viviendas_completas')
    .select('*')

  // Transformación simple de flat a nested
  const viviendas = data.map(row => ({
    ...row,
    manzanas: { nombre: row.manzana_nombre, ... },
    clientes: { id: row.cliente_id_data, ... },
    // Cálculos ya vienen hechos de la vista
    total_abonado: row.total_abonado,
    porcentaje_pagado: row.porcentaje_pagado,
    ...
  }))
}
```

---

## 🧪 PASO 4: Probar la Optimización

### 1. Reiniciar Servidor (si está corriendo)

```powershell
# Detener servidor actual (Ctrl+C)
# Limpiar caché
Remove-Item -Recurse -Force .next

# Reiniciar
npm run dev
```

### 2. Hard Refresh en el Navegador

- Presiona: **Ctrl+Shift+F5** (Windows)
- O cierra y reabre el navegador completamente

### 3. Abrir Consola y Limpiar Métricas

```javascript
clearMetrics()
```

### 4. Navegar a Viviendas

- Ve a: http://localhost:3000/viviendas
- Espera a que cargue completamente

### 5. Ver Panel de Performance

- Presiona: **Ctrl+Shift+P**
- Deberías ver algo como:

```
📊 Performance Metrics
─────────────────────
✅ /viviendas: 287ms  🟢
```

### 6. Exportar Métricas

```javascript
exportMetricsReport()
```

Copia el JSON y comparte.

---

## 📈 Métricas Esperadas

### Antes de la Optimización
```json
{
  "route": "/viviendas",
  "totalTime": 985.29,    // ← 985ms 🔴
  "renderCount": 2
}
```

### Después de la Optimización
```json
{
  "route": "/viviendas",
  "totalTime": 287.15,    // ← ~300ms ✅
  "renderCount": 2
}
```

**Mejora esperada**: 70% más rápido (985ms → ~300ms)

---

## 🔍 Troubleshooting

### ❌ Error: "relation vista_viviendas_completas does not exist"

**Causa**: La vista no se creó correctamente en Supabase

**Solución**:
1. Ve al SQL Editor en Supabase Dashboard
2. Ejecuta manualmente el archivo `20251024_vista_viviendas_completas.sql`
3. Verifica con: `SELECT * FROM vista_viviendas_completas LIMIT 1`

---

### ❌ Error: "permission denied for view vista_viviendas_completas"

**Causa**: Faltan permisos en la vista

**Solución**: Ejecuta en SQL Editor:
```sql
ALTER VIEW vista_viviendas_completas OWNER TO postgres;
GRANT SELECT ON vista_viviendas_completas TO authenticated;
GRANT SELECT ON vista_viviendas_completas TO anon;
```

---

### ❌ Tiempo sigue alto (~900ms)

**Causa**: Caché del navegador o Next.js

**Solución**:
```powershell
# 1. Limpiar caché Next.js
Remove-Item -Recurse -Force .next

# 2. Reiniciar servidor
npm run dev

# 3. Hard refresh en navegador (Ctrl+Shift+F5)
```

---

### ❌ Los cálculos de abonos están en 0

**Causa**: No hay datos de abonos o la relación negociacion_id es null

**Verificación**:
```sql
-- Ver viviendas con negociaciones
SELECT
  id,
  numero,
  negociacion_id,
  total_abonado,
  cantidad_abonos
FROM vista_viviendas_completas
WHERE negociacion_id IS NOT NULL;

-- Ver abonos asociados
SELECT
  v.numero,
  ah.monto,
  ah.fecha_abono
FROM viviendas v
JOIN abonos_historial ah ON v.negociacion_id = ah.negociacion_id
LIMIT 10;
```

---

## 📊 Diagrama de Optimización

### ANTES (3-4 queries en cascada)
```
Browser
  ↓ Request
Next.js Server
  ↓ Query 1: viviendas + manzanas + proyectos
Supabase ← 150ms
  ↓ Query 2: clientes
Supabase ← 120ms
  ↓ Query 3: abonos_historial
Supabase ← 180ms
  ↓ Transformaciones JS (forEach, reduce)
Next.js ← 200ms (lógica cliente)
  ↓ Response
Browser ← TOTAL: 985ms 🔴
```

### DESPUÉS (1 query optimizada)
```
Browser
  ↓ Request
Next.js Server
  ↓ Query única: vista_viviendas_completas
Supabase ← 250ms (JOINs + GROUP BY optimizados)
  ↓ Transformación simple (map)
Next.js ← 30ms (lógica mínima)
  ↓ Response
Browser ← TOTAL: ~300ms ✅
```

**Ventajas**:
- ✅ PostgreSQL hace JOINs en el servidor (optimizado con índices)
- ✅ Cálculos (SUM, COUNT) hechos en SQL (más rápido que JS)
- ✅ 1 round-trip de red vs 3-4
- ✅ Código más simple y mantenible

---

## ✅ Checklist de Ejecución

- [ ] SQL ejecutado en Supabase (Success. No rows returned)
- [ ] Vista verificada: `SELECT * FROM vista_viviendas_completas LIMIT 5`
- [ ] Índices verificados: 9 índices nuevos creados
- [ ] Código ya está actualizado (automático)
- [ ] Caché Next.js limpiado: `Remove-Item -Recurse -Force .next`
- [ ] Servidor reiniciado: `npm run dev`
- [ ] Hard refresh en navegador: Ctrl+Shift+F5
- [ ] Métricas limpiadas: `clearMetrics()`
- [ ] Navegado a /viviendas
- [ ] Performance panel abierto: Ctrl+Shift+P
- [ ] Tiempo verificado: ~300ms ✅
- [ ] Métricas exportadas: `exportMetricsReport()`

---

## 🎯 Próximos Pasos

Una vez validada la optimización de Viviendas:

1. **Regenerar types de Supabase** (opcional):
   ```powershell
   npx supabase gen types typescript --project-id <ID> > src/lib/supabase/database.types.ts
   ```
   Esto eliminará los `@ts-ignore` en el código.

2. **Monitorear performance continua**:
   - Usa el panel de performance (Ctrl+Shift+P)
   - Objetivo: Todos los módulos < 500ms

3. **Documentar mejoras**:
   - Actualizar `docs/ESTADO-ACTUAL-APP.md`
   - Agregar a changelog

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la sección de **Troubleshooting** arriba
2. Verifica logs en consola del navegador (F12)
3. Verifica logs de Supabase Dashboard → Logs → Database
4. Comparte el JSON de `exportMetricsReport()`

---

**Fecha**: 2025-10-24
**Versión**: 1.0
**Módulo**: Viviendas Performance Optimization
