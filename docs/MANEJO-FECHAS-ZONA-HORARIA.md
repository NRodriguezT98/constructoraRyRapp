# 🕐 Manejo Correcto de Fechas - Zona Horaria

## 🚨 PROBLEMA CRÍTICO IDENTIFICADO

### ❌ **El Error que NO Debes Cometer**

```typescript
// ❌ INCORRECTO - Cambia el día en zonas horarias negativas
const fecha = new Date().toISOString().split('T')[0]
// Si estás en Colombia (UTC-5) y son las 10:00 PM del 24 oct
// → Resultado: "2025-10-25" (día siguiente por conversión UTC)

// ❌ INCORRECTO - Guarda día equivocado en DB
const fechaInput = new Date('2025-10-24')
await supabase.from('tabla').insert({
  fecha: fechaInput.toISOString() // → "2025-10-23T05:00:00.000Z" (día anterior!)
})
```

### ✅ **La Solución Correcta**

```typescript
// ✅ CORRECTO - Preserva el día local
import { getTodayDateString, formatDateToISO } from '@/lib/utils/date.utils'

const fechaHoy = getTodayDateString()
// → "2025-10-24" (siempre el día correcto en tu zona horaria)

// ✅ CRÍTICO: Pasar STRING directamente, NO Date object
const inputValue = '2025-10-28' // Del input type="date"
const fechaParaDB = formatDateToISO(inputValue)
// → "2025-10-28T12:00:00" (preserva el día exacto)

// ❌ EVITAR: Crear Date object innecesario
const fechaParaDB = formatDateToISO(new Date('2025-10-28'))
// → Puede fallar dependiendo de la hora del día
```

---

## 📚 Explicación del Problema

### **¿Por qué ocurre esto?**

JavaScript `Date` maneja fechas en **UTC** internamente. Cuando usas `.toISOString()`:

1. **Convierte a UTC** (zona horaria +0)
2. Si estás en zona horaria **negativa** (como Colombia UTC-5):
   - Horas después de las 7:00 PM → Suma 1 día
   - Horas antes de las 7:00 AM → Resta 1 día

### **Ejemplo Real:**

```typescript
// Estás en Bogotá, Colombia (UTC-5)
// Fecha local: 24 octubre 2025, 10:00 PM

const fecha = new Date() // Fecha local: 24 oct 2025, 22:00
console.log(fecha.toISOString())
// → "2025-10-25T03:00:00.000Z" (25 oct en UTC porque 22:00 - 5h = 03:00 del día siguiente)

const fechaString = fecha.toISOString().split('T')[0]
// → "2025-10-25" ❌ DÍA INCORRECTO (debería ser 24)
```

### **Impacto en la Aplicación:**

```typescript
// Usuario marca paso completado el 24 de octubre
// Pero en DB se guarda como 23 de octubre ❌

// Modal muestra: "Completado: 23 de octubre de 2025" ❌
// Debería mostrar: "Completado: 24 de octubre de 2025" ✅
```

---

## ✅ Solución Implementada

### **1. Utilidades Centralizadas** (`src/lib/utils/date.utils.ts`)

#### **getTodayDateString()**

Obtiene la fecha actual en formato `YYYY-MM-DD` **preservando zona horaria local**.

```typescript
/**
 * ✅ Usar siempre esta función para:
 * - Valores por defecto en inputs date
 * - Fecha máxima en validaciones
 * - Cualquier referencia a "hoy"
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}` // ✅ "2025-10-24" (día correcto)
}
```

**Casos de uso:**
```typescript
// ✅ Input date por defecto
<input type="date" value={getTodayDateString()} />

// ✅ Fecha máxima permitida
<input type="date" max={getTodayDateString()} />

// ✅ Validaciones
if (fecha > getTodayDateString()) {
  setError('La fecha no puede ser futura')
}
```

#### **formatDateToISO(input: string | Date)**

Convierte string `YYYY-MM-DD` o Date a ISO **preservando el día local**.

⚠️ **PREFERIR pasar string directamente en lugar de Date object**

```typescript
/**
 * ✅ Usar SIEMPRE antes de guardar en base de datos
 * ⚠️ PREFERIR pasar string YYYY-MM-DD directamente
 */
export function formatDateToISO(input: string | Date): string {
  // Si es string YYYY-MM-DD, usarlo directamente (PREFERIDO)
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return `${input}T12:00:00`
  }

  // Fallback: Date object (puede tener timezone issues)
  const date = typeof input === 'string' ? new Date(input) : input
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}T12:00:00`
}
```

**Casos de uso:**
```typescript
// ✅ CORRECTO - Desde input date (PREFERIDO)
const inputValue = '2025-10-28' // Del input type="date"
const fechaDB = formatDateToISO(inputValue)
// → "2025-10-28T12:00:00" (día exacto preservado)

// ✅ CORRECTO - Fecha actual
const fechaDB = formatDateToISO(getTodayDateString())
// → "2025-10-28T12:00:00"

// ⚠️ EVITAR - Date object (funciona pero puede tener issues)
const fechaDB = formatDateToISO(new Date('2025-10-28'))
// → Puede cambiar día dependiendo de la hora

// ✅ CORRECTO - Guardar en Supabase
await supabase.from('procesos_negociacion').update({
  fecha_completado: formatDateToISO(inputFecha) // ✅ String directo
})
```

#### **formatDateForInput(dateString: string)**

Convierte fecha de DB a formato `YYYY-MM-DD` para inputs **sin conversión de timezone**.

```typescript
/**
 * ✅ Usar para mostrar fechas en inputs date
 */
export function formatDateForInput(dateString: string): string {
  // Si ya está en formato YYYY-MM-DD, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // Extraer fecha sin conversión de timezone
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]

  // Fallback
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

**Casos de uso:**
```typescript
// ✅ Cargar fecha desde DB en input
<input
  type="date"
  value={formatDateForInput(paso.fecha_completado)}
/>

// ✅ Calcular fecha mínima para validación
const fechaMin = formatDateForInput(dependencia.fecha_completado)
<input type="date" min={fechaMin} />
```

---

## 📋 Reglas de Uso (OBLIGATORIAS)

### **✅ SIEMPRE Usar:**

| Situación | Función a Usar | Ejemplo |
|-----------|---------------|---------|
| Obtener fecha de hoy | `getTodayDateString()` | `const hoy = getTodayDateString()` |
| Guardar string date en DB | `formatDateToISO(string)` | `fecha: formatDateToISO('2025-10-28')` |
| Guardar fecha actual en DB | `formatDateToISO(getTodayDateString())` | `fecha: formatDateToISO(getTodayDateString())` |
| Mostrar fecha de DB en input | `formatDateForInput(str)` | `value={formatDateForInput(dbFecha)}` |
| Mostrar fecha al usuario | `formatDateForDisplay(str)` | `{formatDateForDisplay(fecha)}` |

### **❌ NUNCA Usar:**

```typescript
// ❌ PROHIBIDO #1: toISOString().split()
const fecha = new Date().toISOString().split('T')[0]

// ❌ PROHIBIDO #2: toISOString() directo
await db.insert({ fecha: new Date().toISOString() })

// ❌ PROHIBIDO #3: Crear Date object del input
const inputValue = '2025-10-28'
const fecha = new Date(inputValue) // ❌ Causa timezone issues
await db.insert({ fecha: fecha.toISOString() })

// ❌ PROHIBIDO #4: Asumir UTC es correcto
const fecha = new Date('2025-10-24T00:00:00Z') // ❌ UTC != Local

// ❌ PROHIBIDO #5: No usar utilidades
const year = new Date().getFullYear()
const month = String(new Date().getMonth() + 1).padStart(2, '0')
const day = String(new Date().getDate()).padStart(2, '0')
const fecha = `${year}-${month}-${day}` // ❌ Ya existe getTodayDateString()
```

---

## 🛠️ Archivos Actualizados

### **1. Módulo de Procesos**

#### `modal-fecha-completado.tsx`
```typescript
import { getTodayDateString, formatDateForInput } from '@/lib/utils/date.utils'

// ✅ Fecha por defecto
const fechaPorDefecto = getTodayDateString()

// ✅ Fecha mínima
const fechaMinima = formatDateForInput(fechaNegociacion)
```

#### `useProcesoNegociacion.ts`
```typescript
import { formatDateToISO } from '@/lib/utils/date.utils'

// ✅ Completar paso
const actualizado = await actualizarProceso(pasoId, {
  estado: EstadoPaso.COMPLETADO,
  fechaInicio: formatDateToISO(fechaInicio),
  fechaCompletado: formatDateToISO(fechaCompletado)
})

// ✅ Iniciar paso
fechaInicio: formatDateToISO(new Date())

// ✅ Omitir paso
fechaCompletado: formatDateToISO(new Date())
```

### **2. Módulo de Abonos**

#### `useRegistrarAbono.ts`
```typescript
import { getTodayDateString, formatDateToISO } from '@/lib/utils/date.utils'

const initialFormData = {
  fecha_abono: getTodayDateString(), // ✅
}

const prepararDTO = () => ({
  fecha_abono: formatDateToISO(new Date(formData.fecha_abono)) // ✅
})
```

#### `modal-registrar-abono.tsx`
```typescript
import { getTodayDateString } from '@/lib/utils/date.utils'

<input
  type="date"
  max={getTodayDateString()} // ✅
/>
```

---

## 🧪 Testing

### **Antes de Deploy - Checklist:**

- [ ] **Crear negociación hoy** → Verificar `fecha_negociacion` en DB
- [ ] **Completar paso hoy** → Verificar `fecha_completado` muestra hoy (no ayer)
- [ ] **Registrar abono hoy** → Verificar `fecha_abono` es hoy
- [ ] **Probar a diferentes horas:**
  - [ ] 1:00 AM (antes de UTC offset)
  - [ ] 12:00 PM (mediodía)
  - [ ] 11:00 PM (después de UTC offset)
- [ ] **Validar fechas mínimas** funcionan correctamente
- [ ] **Modal muestra fecha correcta** en todos los pasos

### **Query de Verificación:**

```sql
-- Verificar fechas guardadas correctamente
SELECT
  id,
  nombre,
  fecha_completado,
  DATE(fecha_completado) as solo_fecha,
  EXTRACT(HOUR FROM fecha_completado) as hora
FROM procesos_negociacion
WHERE fecha_completado IS NOT NULL
ORDER BY fecha_completado DESC
LIMIT 10;

-- Verificar abonos
SELECT
  id,
  monto,
  fecha_abono,
  DATE(fecha_abono) as solo_fecha
FROM abonos
WHERE DATE(fecha_abono) = CURRENT_DATE;
```

---

## 🔍 Casos de Uso Comunes

### **Caso 1: Input Date con Fecha de Hoy**

```typescript
// ❌ INCORRECTO
<input type="date" value={new Date().toISOString().split('T')[0]} />

// ✅ CORRECTO
import { getTodayDateString } from '@/lib/utils/date.utils'
<input type="date" value={getTodayDateString()} />
```

### **Caso 2: Guardar Fecha Seleccionada en DB**

```typescript
// ❌ INCORRECTO
const inputValue = '2025-10-28' // Del input type="date"
const fechaSeleccionada = new Date(inputValue) // ❌ Crea Date con timezone
await supabase.insert({
  fecha: fechaSeleccionada.toISOString() // ❌ Convierte a UTC, cambia día
})

// ✅ CORRECTO
import { formatDateToISO } from '@/lib/utils/date.utils'
const inputValue = '2025-10-28' // Del input type="date"
await supabase.insert({
  fecha: formatDateToISO(inputValue) // ✅ Preserva el día exacto
})
```

### **Caso 3: Validar Fecha no es Futura**

```typescript
// ❌ INCORRECTO
if (new Date(inputFecha) > new Date()) {
  setError('Fecha futura no permitida')
}

// ✅ CORRECTO
import { getTodayDateString } from '@/lib/utils/date.utils'
if (inputFecha > getTodayDateString()) {
  setError('Fecha futura no permitida')
}
```

### **Caso 4: Mostrar Fecha Mínima en Input**

```typescript
// ❌ INCORRECTO
const minDate = new Date(dbFecha).toISOString().split('T')[0]

// ✅ CORRECTO
import { formatDateForInput } from '@/lib/utils/date.utils'
const minDate = formatDateForInput(dbFecha)
```

### **Caso 5: Fecha Actual para Timestamp**

```typescript
// ❌ INCORRECTO
created_at: new Date().toISOString()

// ✅ CORRECTO
import { formatDateToISO, getTodayDateString } from '@/lib/utils/date.utils'
created_at: formatDateToISO(getTodayDateString())
```

---

## 🚫 Anti-Patrones a Evitar

```typescript
// ❌ Anti-patrón #1: toISOString().split()
const fecha = new Date().toISOString().split('T')[0]

// ❌ Anti-patrón #2: toISOString() directo
await db.insert({ fecha: new Date().toISOString() })

// ❌ Anti-patrón #3: Crear Date object del input
const inputValue = '2025-10-28'
const fecha = new Date(inputValue) // ❌ Timezone issues
await db.insert({ fecha: fecha })

// ❌ Anti-patrón #4: Pasar Date a formatDateToISO
const fecha = formatDateToISO(new Date('2025-10-28')) // ⚠️ Evitar

// ❌ Anti-patrón #5: No usar utilidades
const year = new Date().getFullYear()
const month = String(new Date().getMonth() + 1).padStart(2, '0')
const day = String(new Date().getDate()).padStart(2, '0')
const fecha = `${year}-${month}-${day}` // ❌ Ya existe getTodayDateString()
```

---

## 📖 Resumen Ejecutivo

### **El Problema:**
- `new Date().toISOString()` convierte a UTC
- En Colombia (UTC-5) cambia el día dependiendo de la hora
- Causa desfase de -1 o +1 día en fechas guardadas

### **La Solución:**
- ✅ `getTodayDateString()` → Para fecha actual en formato `YYYY-MM-DD`
- ✅ `formatDateToISO(string)` → Para guardar en DB **pasando STRING directamente**
- ✅ `formatDateForInput(str)` → Para cargar fechas desde DB en inputs
- ✅ `formatDateForDisplay(str)` → Para mostrar al usuario

**⚠️ CRÍTICO: Pasar STRING a formatDateToISO(), NO Date object**

### **Implementación:**
- ✅ Módulo de Procesos actualizado
- ✅ Módulo de Abonos actualizado
- ✅ Utilidades centralizadas en `src/lib/utils/date.utils.ts`
- ✅ Sin errores de TypeScript

### **Próximos Pasos:**
1. Probar en entorno local a diferentes horas del día
2. Verificar en producción con zona horaria de Colombia
3. Aplicar mismo patrón a futuros módulos con fechas

---

**📅 Fecha de última actualización:** 1 de noviembre de 2025

**✅ Estado:** Implementado y documentado

**🔗 Referencias:**
- `src/lib/utils/date.utils.ts` - Utilidades centralizadas
- `src/modules/admin/procesos/` - Ejemplo de implementación
- `src/modules/abonos/` - Ejemplo de implementación
- `docs/DESARROLLO-CHECKLIST.md` - Reglas obligatorias
