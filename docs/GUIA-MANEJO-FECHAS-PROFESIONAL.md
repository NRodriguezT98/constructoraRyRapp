# 📅 Guía Profesional de Manejo de Fechas - RyR Constructora

## 🎯 Objetivo

Esta guía establece el **estándar PROFESIONAL** para manejo de fechas en toda la aplicación, evitando problemas de zona horaria (timezone) que causan errores comunes como:

- Fecha guardada: `2025-10-26` → Fecha mostrada: `2025-10-25` ❌
- Input date: `26/10/2025` → Base de datos: `2025-10-25T05:00:00Z` ❌
- Fecha creación muestra día anterior en Colombia (UTC-5) ❌

---

## 🚨 REGLA DE ORO (OBLIGATORIO)

**NUNCA usar `new Date()` directamente para parsear/formatear fechas**

❌ **PROHIBIDO:**
```typescript
// ❌ Causa timezone shift en UTC
new Date("2025-10-26")
format(new Date(fecha), "dd/MM/yyyy")
fecha.toISOString().split('T')[0]

// ❌ Convierte a UTC y puede cambiar el día
new Date().toISOString().split('T')[0]
```

✅ **CORRECTO:**
```typescript
// ✅ Usar SIEMPRE funciones de date.utils.ts
import {
  formatDateShort,           // dd/MM/yyyy (formato con barras)
  formatDateCompact,         // dd-MMM-yyyy (formato con mes abreviado: "16-feb-2023")
  formatDateForDisplay,      // "23 de octubre de 2025"
  formatDateForInput,        // YYYY-MM-DD para inputs
  formatDateForDB,           // Guardar en DB con hora del mediodía
  getTodayDateString         // Fecha actual sin timezone shift
} from '@/lib/utils/date.utils'
```

---

## 📚 Funciones Centralizadas (`@/lib/utils/date.utils`)

### 1️⃣ **`formatDateCompact(dateString)`** - Formato Compacto con Mes Abreviado ⭐

**Uso:** Mostrar fechas en formato compacto **dd-MMM-yyyy** (e.g., "16-feb-2023")

```typescript
import { formatDateCompact } from '@/lib/utils/date.utils'

// ✅ EJEMPLO
formatDateCompact("2023-02-16")
// → "16-feb-2023"

formatDateCompact("2023-02-16T12:00:00")
// → "16-feb-2023"

// ✅ En componente
<span>{formatDateCompact(documento.fecha_documento)}</span>
```

**Ventajas:**
- ✅ Formato unificado en toda la aplicación
- ✅ Mes en español (ene, feb, mar, etc.)
- ✅ Más compacto que dd/MM/yyyy
- ✅ Fácil de leer

---

### 2️⃣ **`formatDateShort(dateString)`** - Formato Compacto con Barras

**Uso:** Mostrar fechas en formato corto **dd/MM/yyyy**

**⚠️ NOTA:** Usar `formatDateCompact()` preferiblemente para consistencia en toda la app.

```typescript
import { formatDateShort } from '@/lib/utils/date.utils'

// ✅ EJEMPLO
formatDateShort("2025-10-26")              // → "26/10/2025"
formatDateShort("2025-10-26T12:00:00")     // → "26/10/2025"
formatDateShort(documento.fecha_documento)  // → "26/10/2025"
```

**Casos de uso:**
- Compatibilidad con código legacy
- Cuando se requiere explícitamente formato dd/MM/yyyy

---

### 3️⃣ **`formatDateForDisplay(dateString, options?)`** - Formato Largo

**Uso:** Mostrar fechas en formato legible **"23 de octubre de 2025"**

```typescript
import { formatDateForDisplay } from '@/lib/utils/date.utils'

// ✅ EJEMPLOS
formatDateForDisplay("2025-10-26")
// → "26 de octubre de 2025"

formatDateForDisplay("2025-10-26", { month: 'short' })
// → "26 oct 2025"

formatDateForDisplay("2025-10-26", {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})
// → "26/10/2025"
```

**Casos de uso:**
- Tooltips descriptivos
- Títulos de secciones
- Mensajes de notificación
- Detalles de formularios

---

### 3️⃣ **`formatDateForInput(dateString)`** - Para Inputs Date

**Uso:** Cargar fechas en `<input type="date" />` **SIN timezone shift**

```typescript
import { formatDateForInput } from '@/lib/utils/date.utils'

// ✅ EJEMPLO
const [fecha, setFecha] = useState(
  documento.fecha_documento
    ? formatDateForInput(documento.fecha_documento)
    : ''
)

// Resultado: "2025-10-26" (YYYY-MM-DD) sin cambiar de día
```

**⚠️ CRÍTICO:** Esta función extrae `YYYY-MM-DD` directamente del string ISO sin crear objetos `Date`, evitando conversiones de timezone.

---

### 4️⃣ **`formatDateForDB(dateString)`** - Guardar en Base de Datos

**Uso:** Preparar fechas para guardar en PostgreSQL **SIN timezone shift**

```typescript
import { formatDateForDB } from '@/lib/utils/date.utils'

// ✅ EJEMPLO
const updateData = {
  fecha_documento: formatDateForDB(inputValue),
  // "2025-10-26" → "2025-10-26T12:00:00"
}

await supabase.from('documentos_proyecto').update(updateData)
```

**¿Por qué hora del mediodía (12:00:00)?**
- Evita que conversiones UTC cambien el día
- Colombia es UTC-5, entonces `2025-10-26T12:00:00` en local = `2025-10-26T17:00:00Z` en UTC
- Al leer, siempre será día 26 independiente de la hora local

---

### 5️⃣ **`getTodayDateString()`** - Fecha Actual

**Uso:** Obtener fecha de HOY en formato `YYYY-MM-DD` **SIN timezone shift**

```typescript
import { getTodayDateString } from '@/lib/utils/date.utils'

// ✅ EJEMPLO - Hoy es 26 octubre 2025, 11:00 PM en Colombia
getTodayDateString() // → "2025-10-26" ✅

// ❌ PROHIBIDO
new Date().toISOString().split('T')[0] // → "2025-10-27" ❌ (UTC suma 5 horas)
```

**Casos de uso:**
- Valores por defecto en inputs
- Fechas de creación
- Filtros de "hoy"
- Comparaciones temporales

---

### 6️⃣ **`formatDateTimeForDisplay(dateString)`** - Fecha + Hora

**Uso:** Mostrar timestamp completo **"23 de octubre de 2025, 02:30 p.m."**

```typescript
import { formatDateTimeForDisplay } from '@/lib/utils/date.utils'

// ✅ EJEMPLO
formatDateTimeForDisplay("2025-10-26T14:30:00")
// → "26 de octubre de 2025, 02:30 p. m."
```

**Casos de uso:**
- Fecha de creación/actualización
- Logs de auditoría
- Historial de cambios

---

## 🏗️ Patrones de Uso por Escenario

### 📝 **Formulario de Edición**

```typescript
'use client'

import { formatDateForInput, formatDateForDB } from '@/lib/utils/date.utils'
import { useState } from 'react'

export function FormularioDocumento({ documento }: Props) {
  // ✅ Cargar fecha en input
  const [fecha, setFecha] = useState(
    documento.fecha_documento
      ? formatDateForInput(documento.fecha_documento)
      : ''
  )

  const handleSubmit = async () => {
    const updateData = {
      // ✅ Guardar con hora del mediodía
      fecha_documento: fecha ? formatDateForDB(fecha) : null
    }

    await supabase.from('documentos_proyecto').update(updateData)
  }

  return (
    <input
      type="date"
      value={fecha}
      onChange={(e) => setFecha(e.target.value)}
    />
  )
}
```

---

### 🎴 **Card de Visualización**

```typescript
'use client'

import { formatDateCompact } from '@/lib/utils/date.utils'

export function DocumentoCard({ documento }: Props) {
  return (
    <div>
      {/* ✅ Formato compacto unificado: dd-MMM-yyyy */}
      <span className="text-sm">
        {formatDateCompact(documento.fecha_documento)}
        {/* → "16-feb-2023" */}
      </span>

      {/* ✅ Tooltip con mismo formato */}
      <span title={`Fecha: ${formatDateCompact(documento.fecha_documento)}`}>
        📅 Fecha del documento
      </span>
    </div>
  )
}
```

---

### 📊 **Tabla de Datos**

```typescript
'use client'

import { formatDateShort } from '@/lib/utils/date.utils'

export function TablaDocumentos({ documentos }: Props) {
  return (
    <table>
      <tbody>
        {documentos.map(doc => (
          <tr key={doc.id}>
            <td>{doc.titulo}</td>
            {/* ✅ Formato compacto para tablas */}
            <td>{formatDateShort(doc.fecha_creacion)}</td>
            <td>{formatDateShort(doc.fecha_vencimiento)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

### 🔍 **Filtros de Fecha**

```typescript
'use client'

import { getTodayDateString, formatDateForDB } from '@/lib/utils/date.utils'
import { useState } from 'react'

export function FiltrosFecha() {
  // ✅ Fecha actual sin timezone shift
  const [fechaDesde, setFechaDesde] = useState(getTodayDateString())
  const [fechaHasta, setFechaHasta] = useState(getTodayDateString())

  const filtrar = async () => {
    const { data } = await supabase
      .from('documentos_proyecto')
      .select('*')
      .gte('fecha_documento', formatDateForDB(fechaDesde))
      .lte('fecha_documento', formatDateForDB(fechaHasta))

    return data
  }

  return (
    <div>
      <input
        type="date"
        value={fechaDesde}
        onChange={(e) => setFechaDesde(e.target.value)}
      />
      <input
        type="date"
        value={fechaHasta}
        onChange={(e) => setFechaHasta(e.target.value)}
      />
    </div>
  )
}
```

---

## 🧪 Validación de Fechas

```typescript
import { isValidDate, getDaysDifference } from '@/lib/utils/date.utils'

// ✅ Validar si una fecha es válida
if (isValidDate(inputValue)) {
  // Fecha válida
}

// ✅ Calcular diferencia en días
const diasRestantes = getDaysDifference(
  documento.fecha_vencimiento,
  getTodayDateString()
)

if (diasRestantes < 0) {
  // Vencido
}
```

---

## ❌ Errores Comunes y Soluciones

| ❌ Error Común | ✅ Solución Correcta |
|---------------|---------------------|
| `new Date("2025-10-26")` | `formatDateShort("2025-10-26")` |
| `format(new Date(fecha), "dd/MM/yyyy")` | `formatDateShort(fecha)` |
| `new Date().toISOString().split('T')[0]` | `getTodayDateString()` |
| `fecha.toLocaleDateString()` | `formatDateForDisplay(fecha)` |
| Guardar `inputValue` directo | `formatDateForDB(inputValue)` |
| `<input value={new Date(fecha)} />` | `<input value={formatDateForInput(fecha)} />` |

---

## 📖 Resumen de API

```typescript
// 📥 IMPORTAR
import {
  formatDateShort,           // dd/MM/yyyy (más común)
  formatDateForDisplay,      // "23 de octubre de 2025"
  formatDateForInput,        // YYYY-MM-DD para inputs
  formatDateForDB,           // Guardar con T12:00:00
  getTodayDateString,        // Fecha actual YYYY-MM-DD
  formatDateTimeForDisplay,  // Fecha + hora completa
  isValidDate,               // Validar fecha
  getDaysDifference,         // Diferencia en días
  formatRelativeDate         // "hace 2 días"
} from '@/lib/utils/date.utils'

// 🎯 CASOS DE USO
formatDateShort(fecha)              // Mostrar en UI (tablas, cards)
formatDateForDisplay(fecha)         // Mostrar formato largo (tooltips)
formatDateForInput(fecha)           // Cargar en <input type="date" />
formatDateForDB(inputValue)         // Guardar en PostgreSQL
getTodayDateString()                // Fecha actual sin timezone shift
```

---

## 🔐 Reglas de Copilot Instructions

Estas reglas ya están integradas en `.github/copilot-instructions.md`:

1. ✅ **NUNCA usar** `new Date()` directo con fechas de DB
2. ✅ **SIEMPRE importar** funciones de `date.utils.ts`
3. ✅ **USAR** `formatDateShort()` para formato compacto
4. ✅ **USAR** `formatDateForInput()` en inputs date
5. ✅ **USAR** `formatDateForDB()` antes de guardar
6. ✅ **USAR** `getTodayDateString()` para fecha actual

---

## 📚 Referencias

- **Implementación:** `src/lib/utils/date.utils.ts`
- **Ejemplo de uso:** `src/modules/documentos/components/lista/documento-card.tsx`
- **Hook ejemplo:** `src/modules/documentos/hooks/useDocumentoEditar.ts`
- **Modal ejemplo:** `src/modules/documentos/components/modals/DocumentoEditarMetadatosModal.tsx`

---

## ✅ Checklist de Revisión

Antes de hacer commit, verificar:

- [ ] ¿Importé funciones de `date.utils.ts`?
- [ ] ¿Usé `formatDateShort()` para mostrar fechas compactas?
- [ ] ¿Usé `formatDateForInput()` en inputs date?
- [ ] ¿Usé `formatDateForDB()` antes de guardar en BD?
- [ ] ¿NO usé `new Date()` directo?
- [ ] ¿NO usé `toISOString().split('T')[0]`?
- [ ] ¿Probé en navegador que las fechas se muestran correctamente?

---

**📌 NOTA IMPORTANTE:** Esta guía es el **estándar oficial** de la aplicación. Cualquier código que maneje fechas de otra forma debe ser refactorizado para seguir estos patrones.
