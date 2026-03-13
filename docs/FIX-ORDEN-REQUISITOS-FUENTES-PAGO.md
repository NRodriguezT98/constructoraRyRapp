# FIX: Orden Correcto de Requisitos en Fuentes de Pago

## 📋 Problema Identificado

**Reporte del Usuario:**
> "El orden en que se muestran los requisitos para permitir el desembolso debe ser en el mismo orden que está establecido. Por ejemplo en los requisitos está de primero configurado carta de aprobación, pero en los detalles de las fuentes de pago aparece como segundo"

**Análisis Técnico:**

El sistema tenía dos problemas relacionados:

1. **Campo `orden` faltante en tabla `pasos_fuente_pago`**
   - Los pasos se ordenaban alfabéticamente por el campo `paso` (VARCHAR)
   - No se respetaba el orden configurado en la tabla `requisitos_fuentes_pago_config`

2. **Configuración hardcoded vs. dinámica**
   - El servicio `crearPasosFuentePago` usaba configuración hardcoded de `config/requisitos-fuentes.ts`
   - La interfaz de admin guardaba en `requisitos_fuentes_pago_config`
   - Existía desincronización entre ambos sistemas

## ✅ Solución Implementada

### 1. Migración: Agregar campo `orden`

**Archivo:** `supabase/migrations/20251215_agregar_orden_pasos_fuente_pago.sql`

```sql
ALTER TABLE public.pasos_fuente_pago
ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_pasos_fuente_pago_orden
  ON public.pasos_fuente_pago(fuente_pago_id, orden);
```

**Actualización de datos existentes:**
```sql
-- Ejemplo: Crédito Hipotecario
UPDATE public.pasos_fuente_pago
SET orden = CASE
  WHEN paso = 'carta_aprobacion_credito' THEN 1
  WHEN paso = 'boleta_registro' THEN 2
  WHEN paso = 'solicitud_desembolso' THEN 3
  ELSE 999
END
WHERE fuente_pago_id IN (
  SELECT id FROM public.fuentes_pago WHERE tipo = 'Crédito Hipotecario'
);
```

### 2. Servicio: Usar configuración dinámica de BD

**Archivo:** `src/modules/fuentes-pago/services/pasos-fuente-pago.service.ts`

**Antes (❌ hardcoded):**
```typescript
import { obtenerRequisitosParaTipoFuente } from '../config/requisitos-fuentes'

const requisitos = obtenerRequisitosParaTipoFuente(tipo_fuente)
```

**Después (✅ dinámico):**
```typescript
const { data: requisitos } = await supabase
  .from('requisitos_fuentes_pago_config')
  .select('*')
  .eq('tipo_fuente', tipo_fuente)
  .eq('activo', true)
  .order('orden', { ascending: true }) // ← ORDEN CORRECTO
```

### 3. Consulta: Ordenar por campo `orden`

**Antes:**
```typescript
.order('paso', { ascending: true }) // Orden alfabético ❌
```

**Después:**
```typescript
.order('orden', { ascending: true }) // Orden configurado ✅
```

### 4. Script de Sincronización

**Archivo:** `supabase/migrations/20251215_sincronizar_orden_pasos_existentes.sql`

```sql
-- Sincroniza el orden de pasos existentes con la configuración actual
FOR r IN
  SELECT pfp.id, pfp.paso, fp.tipo
  FROM pasos_fuente_pago pfp
  JOIN fuentes_pago fp ON pfp.fuente_pago_id = fp.id
LOOP
  SELECT orden INTO v_orden
  FROM requisitos_fuentes_pago_config
  WHERE tipo_fuente = r.tipo
    AND paso_identificador = r.paso
    AND activo = true;

  UPDATE pasos_fuente_pago
  SET orden = v_orden
  WHERE id = r.id;
END LOOP;
```

## 🔄 Flujo Actualizado

```
┌─────────────────────────────────────────┐
│ Admin configura requisitos en UI        │
│ (Orden: 1. Carta, 2. Boleta, 3. Sol.)  │
└─────────────┬───────────────────────────┘
              │ INSERT/UPDATE
              ▼
┌─────────────────────────────────────────┐
│ requisitos_fuentes_pago_config          │
│ - carta_aprobacion_credito (orden: 1)   │
│ - boleta_registro (orden: 2)            │
│ - solicitud_desembolso (orden: 3)       │
└─────────────┬───────────────────────────┘
              │ SELECT con ORDER BY orden
              ▼
┌─────────────────────────────────────────┐
│ crearPasosFuentePago()                  │
│ (lee requisitos de BD, no hardcoded)    │
└─────────────┬───────────────────────────┘
              │ INSERT
              ▼
┌─────────────────────────────────────────┐
│ pasos_fuente_pago                       │
│ - carta_aprobacion_credito (orden: 1)   │
│ - boleta_registro (orden: 2)            │
│ - solicitud_desembolso (orden: 3)       │
└─────────────┬───────────────────────────┘
              │ SELECT con ORDER BY orden
              ▼
┌─────────────────────────────────────────┐
│ UI muestra pasos en orden correcto ✅   │
└─────────────────────────────────────────┘
```

## 📊 Verificación de la Solución

**Antes del fix:**
```
Crédito Hipotecario:
1. Boleta de Registro        ← orden alfabético (b < c < s)
2. Carta de Aprobación        ← incorrecto
3. Solicitud de Desembolso
```

**Después del fix:**
```
Crédito Hipotecario:
1. Carta de Aprobación de Crédito  ← orden configurado
2. Boleta de Registro               ← correcto
3. Solicitud de Desembolso          ← correcto
```

## 🎯 Resultados

### ✅ Problemas Resueltos
- [x] Campo `orden` agregado a `pasos_fuente_pago`
- [x] Servicio actualizado para usar configuración dinámica de BD
- [x] Consultas ordenan por campo `orden` en lugar de `paso`
- [x] Pasos existentes sincronizados con configuración actual
- [x] Sistema completamente dinámico (no más hardcoded)

### ✅ Beneficios
- **Consistencia**: Un solo punto de verdad (base de datos)
- **Flexibilidad**: Admin puede cambiar orden desde UI
- **Escalabilidad**: Nuevos tipos de fuente sin tocar código
- **Mantenibilidad**: No más desincronización entre código y BD

## 🧪 Pruebas Realizadas

```bash
# 1. Ejecutar migraciones
npm run db:exec supabase/migrations/20251215_agregar_orden_pasos_fuente_pago.sql
npm run db:exec supabase/migrations/20251215_sincronizar_orden_pasos_existentes.sql

# 2. Regenerar tipos TypeScript
npm run types:generate

# 3. Verificar configuración
npm run db:exec supabase/verification/verificar-requisitos-credito.sql
```

**Resultado:**
```
┌───────┬────────────────────────────────┬───────┐
│ orden │ titulo                         │ tipo  │
├───────┼────────────────────────────────┼───────┤
│ 1     │ Carta de Aprobación de Crédito │ ...   │
│ 2     │ Boleta de Registro             │ ...   │
│ 3     │ Solicitud de Desembolso        │ ...   │
└───────┴────────────────────────────────┴───────┘
```

## 📝 Archivos Modificados

### Migraciones SQL
- ✅ `supabase/migrations/20251215_agregar_orden_pasos_fuente_pago.sql`
- ✅ `supabase/migrations/20251215_sincronizar_orden_pasos_existentes.sql`

### Servicios TypeScript
- ✅ `src/modules/fuentes-pago/services/pasos-fuente-pago.service.ts`
  - Función `obtenerPasosFuentePago()` → ORDER BY orden
  - Función `crearPasosFuentePago()` → Usar BD en lugar de hardcoded
  - Función `validarPreDesembolso()` → Usar BD para validar

### Tipos
- ✅ `src/lib/supabase/database.types.ts` (regenerado automáticamente)

## 🚀 Deployment

**Pasos para producción:**

1. **Ejecutar migraciones en Supabase:**
   ```sql
   -- Migración 1: Agregar campo orden
   -- Migración 2: Sincronizar datos existentes
   ```

2. **Verificar que no haya errores:**
   ```bash
   npm run type-check
   ```

3. **Desplegar código actualizado**

4. **Verificar en UI:**
   - Abrir detalles de fuente de pago con Crédito Hipotecario
   - Verificar que "Carta de Aprobación" aparece primero

## 🔗 Referencias

- **Issue Original:** Orden incorrecto de requisitos en fuentes de pago
- **Tablas Afectadas:**
  - `pasos_fuente_pago` (agregado campo `orden`)
  - `requisitos_fuentes_pago_config` (fuente de verdad)
- **Documentación:**
  - `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
  - `docs/SISTEMA-VALIDACION-FUENTES-PAGO.md` (actualizar)

---

**Fecha:** 2025-12-15
**Autor:** Sistema de Desarrollo RyR
**Estado:** ✅ Completado y probado
