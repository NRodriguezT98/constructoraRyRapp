# 🔒 Sistema de Validaciones - Módulo de Abonos

## ✅ Validaciones Implementadas

### 1. **Fuente de Pago Completamente Pagada** ⭐

**Lógica** (`useAbonosDetalle.ts`):
```typescript
const saldoPendiente = fuente.saldo_pendiente || 0
const estaCompletamentePagada = saldoPendiente === 0

if (estaCompletamentePagada) {
  puedeRegistrarAbono = false
  razonBloqueo = 'Fuente de pago completamente pagada'
}
```

**UI** (`fuente-pago-card.tsx`):
- ❌ Botón "Registrar Abono" oculto
- ✅ Badge verde "✓ Completada"
- 🎨 Card con fondo verde suave
- 🎨 Borde lateral verde
- 🎨 Opacidad 75% para distinguir visualmente

### 2. **Negociación Cerrada/Cancelada**

**Estados bloqueados**:
- `Cancelada` → "Negociación cancelada"
- `Renuncia` → "Cliente en proceso de renuncia"
- `Completada` → "Negociación completada"

**Comportamiento**:
- Todas las fuentes de pago se bloquean
- No se puede registrar ningún abono
- Mensaje claro de la razón

### 3. **Validación en Hook Centralizado**

```typescript
// ✅ Separación de responsabilidades
const validarFuentePago = useMemo(() => {
  // Lógica de validación
  return {
    puedeRegistrarAbono: boolean,
    estaCompletamentePagada: boolean,
    razonBloqueo?: string
  }
}, [negociacion])
```

---

## 🎯 Validaciones Adicionales Recomendadas

### 4. **Monto Excede Saldo Disponible** ⚠️

**Dónde**: `modal-registrar-abono/useModalRegistrarAbono.ts`

**Lógica**:
```typescript
const validarFormulario = (): boolean => {
  const newErrors: Record<string, string> = {}

  const monto = parseFloat(formData.monto)
  const saldoDisponible = fuentePreseleccionada?.saldo_pendiente || 0

  if (monto > saldoDisponible) {
    newErrors.monto = `El monto excede el saldo disponible (${formatCurrency(saldoDisponible)})`
    return false
  }

  // ... otras validaciones
}
```

**Estado**: ⏳ Por implementar

---

### 5. **Fecha de Abono No Puede Ser Futura** 📅

**Dónde**: `modal-registrar-abono/useModalRegistrarAbono.ts`

**Lógica**:
```typescript
import { getTodayDateString } from '@/lib/utils/date.utils'

const validarFormulario = (): boolean => {
  const newErrors: Record<string, string> = {}

  const fechaAbono = new Date(formData.fecha_abono)
  const hoy = new Date(getTodayDateString())

  if (fechaAbono > hoy) {
    newErrors.fecha_abono = 'La fecha del abono no puede ser futura'
    return false
  }

  // ... otras validaciones
}
```

**Estado**: ⏳ Por implementar

---

### 6. **Abono Mínimo (No Permitir $0)** 💰

**Dónde**: `modal-registrar-abono/useModalRegistrarAbono.ts`

**Lógica**:
```typescript
const MONTO_MINIMO = 1000 // $1,000 COP

const validarFormulario = (): boolean => {
  const newErrors: Record<string, string> = {}

  const monto = parseFloat(formData.monto)

  if (monto <= 0) {
    newErrors.monto = 'El monto debe ser mayor a cero'
    return false
  }

  if (monto < MONTO_MINIMO) {
    newErrors.monto = `El monto mínimo es ${formatCurrency(MONTO_MINIMO)}`
    return false
  }

  // ... otras validaciones
}
```

**Estado**: ⏳ Por implementar

---

### 7. **Número de Referencia Bancaria Requerido** 📄

**Dónde**: `modal-registrar-abono/useModalRegistrarAbono.ts`

**Lógica**:
```typescript
const validarFormulario = (): boolean => {
  const newErrors: Record<string, string> = {}

  // Solo para transferencias y consignaciones
  if (['Transferencia', 'Consignación'].includes(formData.metodo_pago)) {
    if (!formData.numero_referencia || formData.numero_referencia.trim() === '') {
      newErrors.numero_referencia = 'El número de referencia es obligatorio para transferencias'
      return false
    }
  }

  // ... otras validaciones
}
```

**Estado**: ⏳ Por implementar
**Nota**: Requiere agregar campo en el formulario

---

### 8. **Límite de Abonos por Día** 🕐

**Dónde**: API Route `/api/abonos/registrar/route.ts`

**Lógica**:
```typescript
const LIMITE_ABONOS_DIA = 5

// Verificar cuántos abonos se han registrado hoy
const hoy = getTodayDateString()
const { count } = await supabase
  .from('abonos_historial')
  .select('*', { count: 'exact', head: true })
  .eq('negociacion_id', negociacion_id)
  .gte('fecha_abono', `${hoy}T00:00:00`)
  .lte('fecha_abono', `${hoy}T23:59:59`)

if (count && count >= LIMITE_ABONOS_DIA) {
  return NextResponse.json(
    { error: `Se ha alcanzado el límite de ${LIMITE_ABONOS_DIA} abonos por día` },
    { status: 429 }
  )
}
```

**Estado**: ⏳ Por implementar
**Propósito**: Prevenir errores o fraudes

---

### 9. **Validación de Comprobante de Pago** 📎

**Dónde**: `modal-registrar-abono` (formulario)

**Lógica**:
```typescript
// Para montos superiores a X, exigir comprobante
const MONTO_REQUIERE_COMPROBANTE = 5000000 // $5M COP

const validarFormulario = (): boolean => {
  const newErrors: Record<string, string> = {}

  const monto = parseFloat(formData.monto)

  if (monto >= MONTO_REQUIERE_COMPROBANTE && !formData.comprobante_url) {
    newErrors.comprobante = `Para montos superiores a ${formatCurrency(MONTO_REQUIERE_COMPROBANTE)} se requiere adjuntar comprobante`
    return false
  }

  // ... otras validaciones
}
```

**Estado**: ⏳ Por implementar
**Nota**: Requiere implementar subida de archivos

---

### 10. **Confirmación para Abonos Grandes** ⚠️

**Dónde**: `modal-registrar-abono` (UI)

**Lógica**:
```typescript
const MONTO_REQUIERE_CONFIRMACION = 10000000 // $10M COP

const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const monto = parseFloat(formData.monto)

  // Si es monto grande y no ha confirmado, mostrar modal
  if (monto >= MONTO_REQUIERE_CONFIRMACION && !mostrarConfirmacion) {
    setMostrarConfirmacion(true)
    return
  }

  // Proceder con el registro...
}
```

**Estado**: ⏳ Por implementar
**Propósito**: Prevenir errores costosos

---

## 📊 Resumen de Implementación

| # | Validación | Estado | Ubicación | Prioridad |
|---|-----------|--------|-----------|-----------|
| 1 | Fuente pagada 100% | ✅ Implementada | Hook | Alta |
| 2 | Negociación cerrada | ✅ Implementada | Hook | Alta |
| 3 | Separación de responsabilidades | ✅ Implementada | Arquitectura | Alta |
| 4 | Monto excede saldo | ⏳ Pendiente | Modal Hook | Alta |
| 5 | Fecha futura | ⏳ Pendiente | Modal Hook | Media |
| 6 | Abono mínimo | ⏳ Pendiente | Modal Hook | Media |
| 7 | Referencia bancaria | ⏳ Pendiente | Modal Hook | Media |
| 8 | Límite abonos/día | ⏳ Pendiente | API | Baja |
| 9 | Comprobante obligatorio | ⏳ Pendiente | Modal | Baja |
| 10 | Confirmación montos grandes | ⏳ Pendiente | Modal | Baja |

---

## 🎨 Cambios Visuales Aplicados

### Card Completada (Fuente Pagada 100%)

**Antes**:
```tsx
<motion.div className={fuentesStyles.card}>
  <Button>Registrar Abono</Button>
</motion.div>
```

**Después**:
```tsx
<motion.div className={`${fuentesStyles.card} ${fuentesStyles.cardCompletada}`}>
  <div className="badge-verde">✓ Completada</div>
</motion.div>
```

**Estilos Aplicados**:
- ✅ Fondo verde suave (`bg-gradient-to-br from-green-50 to-emerald-50`)
- ✅ Borde verde (`border-green-200`)
- ✅ Opacidad 75% (`opacity-75`)
- ✅ Borde lateral verde intenso
- ✅ Badge verde "✓ Completada"
- ✅ Hover menos intenso (scale: 1.01 vs 1.02)

---

## 🔍 Cómo Usar el Sistema de Validaciones

### En el Hook (`useAbonosDetalle.ts`):

```typescript
// 1. Definir validaciones
const validarFuentePago = useMemo(() => {
  const validaciones = {}

  fuentes.forEach(fuente => {
    validaciones[fuente.id] = {
      puedeRegistrarAbono: true,
      estaCompletamentePagada: false,
      razonBloqueo: undefined
    }

    // Aplicar lógica de validación...
  })

  return validaciones
}, [dependencias])

// 2. Exportar validaciones
return {
  validarFuentePago,
  // ... otros valores
}
```

### En el Componente (`page.tsx`):

```typescript
// 1. Obtener validaciones del hook
const { validarFuentePago } = useAbonosDetalle(clienteId)

// 2. Pasar a componentes hijos
<FuentePagoCard
  fuente={fuente}
  validacion={validarFuentePago[fuente.id]}
/>
```

### En la Card (`fuente-pago-card.tsx`):

```typescript
// 1. Recibir validación como prop
interface Props {
  validacion?: {
    puedeRegistrarAbono: boolean
    estaCompletamentePagada: boolean
    razonBloqueo?: string
  }
}

// 2. Aplicar lógica condicional
{validacion?.puedeRegistrarAbono ? (
  <Button>Registrar Abono</Button>
) : (
  <Badge>✓ Completada</Badge>
)}

// 3. Aplicar estilos condicionales
const cardClassName = validacion?.estaCompletamentePagada
  ? `${styles.card} ${styles.cardCompletada}`
  : styles.card
```

---

## 📝 Próximas Implementaciones

### **Paso 1: Validaciones del Modal** (Alta Prioridad)

Implementar validaciones #4, #5, #6 en `useModalRegistrarAbono.ts`:
- Monto excede saldo
- Fecha no futura
- Abono mínimo

### **Paso 2: Campo de Referencia Bancaria** (Media Prioridad)

Agregar campo opcional/obligatorio según método de pago:
- Diseño UI
- Lógica de validación
- Guardar en DB (ya existe el campo)

### **Paso 3: Subida de Comprobantes** (Baja Prioridad)

Implementar sistema de upload de archivos:
- Integración con Supabase Storage
- Preview de imágenes/PDFs
- Validación de tipos de archivo

---

## ✅ Checklist de Validación (Para Nuevas Features)

Cuando agregues nueva lógica de validación:

- [ ] **Lógica en el hook** (no en el componente)
- [ ] **Usa `useMemo`** para optimizar cálculos
- [ ] **Retorna objeto** con todas las validaciones necesarias
- [ ] **Mensajes claros** de error para el usuario
- [ ] **Estilos condicionales** en archivo `.styles.ts`
- [ ] **Props tipadas** en TypeScript
- [ ] **Documentación** en este archivo

---

**✅ Sistema implementado**: Octubre 2025
**🎯 Módulo**: Abonos
**👨‍💻 Arquitectura**: Clean Architecture + Separation of Concerns
