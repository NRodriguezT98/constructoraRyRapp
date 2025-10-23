# 📅 Guía de Manejo de Fechas - RyR Constructora

## 🎯 Problema Resuelto

Cuando trabajamos con fechas en aplicaciones web, enfrentamos el problema de **conversión de zona horaria**:

- Input date: `2025-10-19` → JavaScript: `2025-10-19T00:00:00-05:00` (Colombia)
- Al guardar en DB (UTC): `2025-10-18T19:00:00Z` ❌ (día anterior!)
- Al mostrar: "18 de octubre" (incorrecto)

## ✅ Solución: Utilidades Centralizadas

Hemos creado utilidades en `src/lib/utils/date.utils.ts` que SIEMPRE debes usar:

---

## 📖 Guía de Uso

### 1️⃣ **Guardar fecha en la base de datos**

```typescript
import { formatDateForDB } from '@/lib/utils/date.utils'

// ✅ CORRECTO
const fechaParaDB = formatDateForDB(formData.fecha) // "2025-10-19T12:00:00"

await supabase.from('tabla').insert({
  fecha_campo: fechaParaDB  // ✅ Se guardará el día correcto
})

// ❌ INCORRECTO (causa cambio de día)
await supabase.from('tabla').insert({
  fecha_campo: formData.fecha  // ❌ "2025-10-19" → se guarda día anterior
})
```

### 2️⃣ **Mostrar fecha en la UI**

```typescript
import { formatDateForDisplay } from '@/lib/utils/date.utils'

// ✅ CORRECTO
<span>{formatDateForDisplay(abono.fecha_abono)}</span>
// → "23 de octubre de 2025"

// Formato personalizado
<span>{formatDateForDisplay(abono.fecha, { month: 'short' })}</span>
// → "23 oct 2025"

// ❌ INCORRECTO (puede mostrar día incorrecto)
<span>{new Date(abono.fecha_abono).toLocaleDateString()}</span>
```

### 3️⃣ **Obtener fecha de hoy para input**

```typescript
import { getTodayDateString } from '@/lib/utils/date.utils'

// ✅ CORRECTO
const [formData, setFormData] = useState({
  fecha: getTodayDateString()  // "2025-10-23"
})

// ❌ INCORRECTO
const [formData, setFormData] = useState({
  fecha: new Date().toISOString().split('T')[0]  // Puede fallar con zona horaria
})
```

### 4️⃣ **Convertir fecha de DB para editar en input**

```typescript
import { formatDateForInput } from '@/lib/utils/date.utils'

// ✅ CORRECTO
<input
  type="date"
  value={formatDateForInput(data.fecha_desde_db)}  // DB → input
/>

// ❌ INCORRECTO
<input
  type="date"
  value={data.fecha_desde_db}  // Puede mostrar mal
/>
```

### 5️⃣ **Mostrar fecha con hora**

```typescript
import { formatDateTimeForDisplay } from '@/lib/utils/date.utils'

// ✅ Para timestamps completos
<span>{formatDateTimeForDisplay(audit.created_at)}</span>
// → "23 de octubre de 2025, 02:30 p.m."
```

### 6️⃣ **Fechas relativas (hace X días)**

```typescript
import { formatRelativeDate } from '@/lib/utils/date.utils'

// ✅ Para mostrar "hace X tiempo"
<span>{formatRelativeDate(comentario.fecha)}</span>
// → "hace 2 días"
```

---

## 🚨 Reglas de Oro

### ✅ SIEMPRE hacer:

1. **Usar `formatDateForDB()`** antes de INSERT/UPDATE en DB
2. **Usar `formatDateForDisplay()`** para mostrar fechas en UI
3. **Usar `getTodayDateString()`** para valores default de inputs
4. **Importar utilidades** en lugar de crear funciones locales

### ❌ NUNCA hacer:

1. ❌ `new Date().toISOString().split('T')[0]` → Usar `getTodayDateString()`
2. ❌ `new Date(fecha).toLocaleDateString()` → Usar `formatDateForDisplay(fecha)`
3. ❌ Insertar fechas directamente del input → Usar `formatDateForDB(fecha)`
4. ❌ Crear funciones de fecha locales → Usar utilidades centralizadas

---

## 📝 Ejemplos Completos

### Ejemplo 1: Formulario de registro

```typescript
import { getTodayDateString, formatDateForDB } from '@/lib/utils/date.utils'

function FormularioAbono() {
  const [fecha, setFecha] = useState(getTodayDateString())

  const handleSubmit = async () => {
    await supabase.from('abonos').insert({
      fecha_abono: formatDateForDB(fecha),  // ✅
      // ... otros campos
    })
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

### Ejemplo 2: Mostrar lista de registros

```typescript
import { formatDateForDisplay } from '@/lib/utils/date.utils'

function ListaAbonos({ abonos }) {
  return (
    <>
      {abonos.map(abono => (
        <div key={abono.id}>
          <span>{formatDateForDisplay(abono.fecha_abono)}</span>
          {/* → "23 de octubre de 2025" */}
        </div>
      ))}
    </>
  )
}
```

### Ejemplo 3: Editar registro existente

```typescript
import { formatDateForInput, formatDateForDB } from '@/lib/utils/date.utils'

function EditarAbono({ abono }) {
  // Convertir fecha de DB → input
  const [fecha, setFecha] = useState(formatDateForInput(abono.fecha_abono))

  const handleUpdate = async () => {
    await supabase
      .from('abonos')
      .update({
        fecha_abono: formatDateForDB(fecha)  // input → DB
      })
      .eq('id', abono.id)
  }

  return <input type="date" value={fecha} onChange={...} />
}
```

---

## 🔍 Verificación

Antes de hacer commit, verifica:

- [ ] ¿Usaste `formatDateForDB()` antes de INSERT/UPDATE?
- [ ] ¿Usaste `formatDateForDisplay()` para mostrar fechas?
- [ ] ¿Usaste `getTodayDateString()` para defaults?
- [ ] ¿Importaste utilidades en lugar de crear funciones locales?

---

## 📚 API Completa

| Función | Uso | Entrada | Salida |
|---------|-----|---------|--------|
| `formatDateForDB(date)` | Guardar en DB | `"2025-10-23"` | `"2025-10-23T12:00:00"` |
| `formatDateForDisplay(date)` | Mostrar en UI | `"2025-10-23T12:00:00"` | `"23 de octubre de 2025"` |
| `formatDateTimeForDisplay(date)` | Mostrar fecha+hora | `"2025-10-23T14:30:00"` | `"23 de octubre de 2025, 02:30 p.m."` |
| `getTodayDateString()` | Fecha de hoy | - | `"2025-10-23"` |
| `formatDateForInput(date)` | DB → input | `"2025-10-23T12:00:00"` | `"2025-10-23"` |
| `formatRelativeDate(date)` | Fechas relativas | `"2025-10-21"` | `"hace 2 días"` |
| `getDaysDifference(d1, d2)` | Diferencia de días | `"2025-10-23", "2025-10-20"` | `3` |
| `isValidDate(date)` | Validar fecha | `"2025-10-23"` | `true` |

---

## 🎓 Preguntas Frecuentes

**P: ¿Por qué T12:00:00?**
R: Para evitar que la conversión UTC cambie el día. Mediodía es seguro en todas las zonas horarias.

**P: ¿Qué pasa con fechas antiguas?**
R: Se mostrarán correctamente. Solo nuevas inserciones usan el nuevo formato.

**P: ¿Debo migrar fechas existentes?**
R: No es necesario. Las utilidades funcionan con cualquier formato de timestamp.

**P: ¿Puedo usar estas funciones en Server Components?**
R: Sí, todas son funciones puras sin dependencias de navegador.

---

**✅ Aplicado en**: Módulo de Abonos
**📅 Fecha**: Octubre 2025
**🎯 Próximos módulos**: Negociaciones, Renuncias, Documentos
