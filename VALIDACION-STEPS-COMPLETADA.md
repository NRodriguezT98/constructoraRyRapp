# ✅ Validación por Steps - Implementación Completada

## 🎯 Objetivo Alcanzado

Se implementó un sistema de **validación por steps** en el formulario multi-paso de clientes para:

- ✅ Prevenir que el usuario avance sin completar campos obligatorios
- ✅ Validar cada step individualmente antes de permitir continuar
- ✅ Requerir "al menos uno" entre teléfono o email
- ✅ Proveer feedback inmediato de errores por step

---

## 📋 Reglas de Validación Implementadas

### **Step 0: Información Personal** (Obligatorio)

**Campos requeridos:**
- ✅ `nombres` - No puede estar vacío
- ✅ `apellidos` - No puede estar vacío
- ✅ `tipo_documento` - Debe seleccionar (CC, TI, CE, Pasaporte)
- ✅ `numero_documento` - No puede estar vacío + solo números

**Validaciones adicionales:**
- `fecha_nacimiento` - Opcional

**Resultado:** El usuario **NO puede avanzar** al Step 1 sin completar todos estos campos.

---

### **Step 1: Información de Contacto** (Al menos uno)

**Regla principal:** **Teléfono OR Email** (al menos uno válido)

**Validaciones:**
1. Si tiene `telefono`:
   - Validar formato: solo números, +, -, espacios, ()
   - Ejemplo válido: `+57 300 123 4567`, `3001234567`

2. Si tiene `email`:
   - Validar formato: `usuario@dominio.com`
   - Ejemplo válido: `juan@gmail.com`

3. **Si NO tiene telefono NI email:**
   - ❌ Error: "Requerido: teléfono o email" en ambos campos
   - **Bloquea avanzar al Step 2**

**Campos opcionales:**
- `telefono_alternativo`
- `direccion`
- `ciudad`
- `departamento`

**Resultado:** El usuario **debe tener al menos teléfono O email válido** para avanzar.

---

### **Step 2: Interés en Proyectos/Viviendas** (Opcional)

**Validaciones:**
- Todo el step es **opcional** - el usuario puede saltar sin seleccionar nada
- Si selecciona `vivienda` → debe tener `proyecto` primero
  - Error: "Debe seleccionar un proyecto primero"

**Campos:**
- `proyecto_id` (opcional)
- `vivienda_id` (opcional, requiere proyecto)
- `notas_interes` (opcional)

**Resultado:** Puede avanzar al Step 3 sin seleccionar nada.

---

### **Step 3: Información Adicional** (Opcional)

**Validaciones:** Ninguna - todo es opcional

**Campos:**
- `origen` (opcional)
- `referido_por` (opcional, condicional a origen)
- `notas` (opcional)

**Resultado:** Siempre válido, puede crear el cliente directamente.

---

## 🔧 Archivos Modificados

### 1. **Hook de Formulario** - `useFormularioCliente.ts`

**Funciones agregadas:**

```typescript
// Validar Step 0: Personal
const validarStep0 = useCallback((): boolean => {
  // Valida: nombres, apellidos, tipo_documento, numero_documento
  return esValido
}, [formData])

// Validar Step 1: Contacto (AL MENOS UNO)
const validarStep1 = useCallback((): boolean => {
  const tieneTelefono = formData.telefono && formData.telefono.trim() !== ''
  const tieneEmail = formData.email && formData.email.trim() !== ''

  if (!tieneTelefono && !tieneEmail) {
    // ❌ Error: debe tener al menos uno
    return false
  }

  // Validar formatos si existen
  return esValido
}, [formData])

// Validar Step 2: Interés
const validarStep2 = useCallback((): boolean => {
  // Si tiene vivienda pero no proyecto → error
  return esValido
}, [formData])

// Validar Step 3: Adicional
const validarStep3 = useCallback((): boolean => {
  return true // Siempre válido
}, [])
```

**Return actualizado:**
```typescript
return {
  // ... otros
  validarStep0,
  validarStep1,
  validarStep2,
  validarStep3,
}
```

---

### 2. **Componente de Formulario** - `formulario-cliente-modern.tsx`

**Props agregadas:**

```typescript
interface FormularioClienteProps {
  // ... props existentes
  validarStep0?: () => boolean
  validarStep1?: () => boolean
  validarStep2?: () => boolean
  validarStep3?: () => boolean
}
```

**Lógica de nextStep modificada:**

```typescript
const nextStep = () => {
  // Validar el step actual antes de avanzar
  let esValido = true

  if (currentStep === 0 && validarStep0) {
    esValido = validarStep0()
  } else if (currentStep === 1 && validarStep1) {
    esValido = validarStep1()
  } else if (currentStep === 2 && validarStep2) {
    esValido = validarStep2()
  } else if (currentStep === 3 && validarStep3) {
    esValido = validarStep3()
  }

  // Solo avanzar si es válido
  if (esValido && currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1)
  }
}
```

**Comportamiento:**
- Al hacer click en "Siguiente", se ejecuta la validación del step actual
- Si es inválido (retorna `false`), **NO avanza** y muestra los errores
- Si es válido, avanza normalmente con animación

---

### 3. **Container** - `formulario-cliente-container.tsx`

**Destructuring actualizado:**

```typescript
const {
  // ... otros
  validarStep0,
  validarStep1,
  validarStep2,
  validarStep3,
} = useFormularioCliente({ ... })
```

**Props pasadas:**

```typescript
<FormularioCliente
  // ... props existentes
  validarStep0={validarStep0}
  validarStep1={validarStep1}
  validarStep2={validarStep2}
  validarStep3={validarStep3}
/>
```

---

## 🧪 Casos de Prueba

### ✅ Test 1: Bloqueo Step 0 → Step 1

**Escenario:** Usuario intenta avanzar sin completar campos obligatorios

**Pasos:**
1. Abrir formulario de nuevo cliente
2. Dejar campos vacíos en Step 0
3. Hacer click en "Siguiente"

**Resultado esperado:**
- ❌ NO avanza al Step 1
- Muestra errores:
  - "Los nombres son requeridos"
  - "Los apellidos son requeridos"
  - "El tipo de documento es requerido"
  - "El número de documento es requerido"

---

### ✅ Test 2: Bloqueo Step 1 → Step 2 (sin teléfono ni email)

**Escenario:** Usuario completa Step 0 pero no pone teléfono ni email

**Pasos:**
1. Completar Step 0 correctamente
2. Avanzar a Step 1
3. Dejar `telefono` y `email` vacíos
4. Hacer click en "Siguiente"

**Resultado esperado:**
- ❌ NO avanza al Step 2
- Muestra error en ambos campos:
  - `telefono`: "Requerido: teléfono o email"
  - `email`: "Requerido: teléfono o email"

---

### ✅ Test 3: Paso con solo teléfono (válido)

**Escenario:** Usuario completa teléfono pero no email

**Pasos:**
1. Completar Step 0
2. En Step 1, ingresar teléfono: `3001234567`
3. Dejar email vacío
4. Hacer click en "Siguiente"

**Resultado esperado:**
- ✅ Avanza al Step 2 correctamente
- No muestra errores

---

### ✅ Test 4: Paso con solo email (válido)

**Escenario:** Usuario completa email pero no teléfono

**Pasos:**
1. Completar Step 0
2. En Step 1, ingresar email: `juan@gmail.com`
3. Dejar teléfono vacío
4. Hacer click en "Siguiente"

**Resultado esperado:**
- ✅ Avanza al Step 2 correctamente
- No muestra errores

---

### ✅ Test 5: Formato inválido en teléfono

**Escenario:** Usuario ingresa texto en teléfono

**Pasos:**
1. En Step 1, ingresar teléfono: `abc123xyz`
2. Hacer click en "Siguiente"

**Resultado esperado:**
- ❌ NO avanza
- Muestra error: "Teléfono inválido"

---

### ✅ Test 6: Formato inválido en email

**Escenario:** Usuario ingresa email sin @

**Pasos:**
1. En Step 1, ingresar email: `juangmail.com`
2. Hacer click en "Siguiente"

**Resultado esperado:**
- ❌ NO avanza
- Muestra error: "Email inválido"

---

### ✅ Test 7: Step 2 y 3 opcionales

**Escenario:** Usuario completa solo Step 0 y 1, deja vacíos Step 2 y 3

**Pasos:**
1. Completar Step 0 y Step 1
2. En Step 2, no seleccionar proyecto ni vivienda
3. Avanzar a Step 3
4. No completar información adicional
5. Hacer click en "Crear Cliente"

**Resultado esperado:**
- ✅ Cliente creado exitosamente
- No muestra errores
- Cliente creado sin interés inicial

---

### ✅ Test 8: Vivienda sin proyecto (error)

**Escenario:** Usuario selecciona vivienda sin seleccionar proyecto primero

**Pasos:**
1. En Step 2, ir directo al select de vivienda
2. Intentar seleccionar una vivienda

**Resultado esperado:**
- El select de vivienda está deshabilitado si no hay proyecto
- O bien, si hay un bug y permite seleccionar:
  - ❌ Muestra error: "Debe seleccionar un proyecto primero"

---

## 🎨 Mejoras Futuras (Opcional)

### 1. **Indicadores visuales en los badges de steps**

Agregar íconos de estado:
- ✅ Verde con check → Step completado
- ⚠️ Rojo con x → Step con errores
- ⭕ Gris → Step pendiente

```tsx
const StepBadge = ({ step, currentStep, isValid }) => {
  const isActive = currentStep === step.id
  const isCompleted = currentStep > step.id
  const hasErrors = !isValid && isActive

  return (
    <div className={cn(
      'step-badge',
      isCompleted && 'bg-green-500',
      hasErrors && 'bg-red-500',
      isActive && 'bg-purple-500'
    )}>
      {isCompleted && <Check />}
      {hasErrors && <X />}
    </div>
  )
}
```

### 2. **Tracking de steps completados**

Guardar en estado qué steps ya fueron validados:

```typescript
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

const nextStep = () => {
  if (validateCurrentStep()) {
    setCompletedSteps(prev => new Set(prev).add(currentStep))
    setCurrentStep(currentStep + 1)
  }
}
```

### 3. **Permitir saltar a steps completados**

Click en el badge del step para volver:

```tsx
<button
  onClick={() => setCurrentStep(step.id)}
  disabled={!completedSteps.has(step.id) && step.id !== currentStep}
>
  {step.label}
</button>
```

---

## 📊 Resumen de Implementación

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Validaciones por step** | ✅ Completado | 4 funciones: validarStep0-3 |
| **Lógica "al menos uno"** | ✅ Completado | Teléfono OR Email en Step 1 |
| **Bloqueo de navegación** | ✅ Completado | nextStep valida antes de avanzar |
| **Manejo de errores** | ✅ Completado | setErrors() con mensajes claros |
| **TypeScript** | ✅ 0 Errores | Tipos correctos en props |
| **Integración completa** | ✅ Completado | Hook → Component → Container |

---

## 🚀 Siguiente Paso: Pruebas End-to-End

1. **Abrir aplicación** en navegador
2. **Ir a módulo de Clientes**
3. **Hacer click en "Nuevo Cliente"**
4. **Probar cada caso de prueba** de la sección anterior
5. **Verificar que:**
   - No se puede avanzar sin completar Step 0
   - No se puede avanzar sin teléfono O email
   - Se puede crear cliente solo con teléfono
   - Se puede crear cliente solo con email
   - Step 2 y 3 son opcionales

---

## 📝 Notas Técnicas

- **Separación de responsabilidades:** ✅ Lógica en hook, UI en componente
- **Inmutabilidad:** ✅ `useCallback` para prevenir re-renders innecesarios
- **UX:** ✅ Feedback inmediato al intentar avanzar
- **Flexibilidad:** ✅ Steps 2 y 3 opcionales para agilizar registro rápido
- **Consistencia:** ✅ Misma validación en submit final (validarFormulario)

---

## ✅ Checklist de Completitud

- [x] Función `validarStep0()` creada
- [x] Función `validarStep1()` con lógica "al menos uno"
- [x] Función `validarStep2()` creada
- [x] Función `validarStep3()` creada
- [x] Exportadas desde hook
- [x] Props agregadas a FormularioClienteProps
- [x] nextStep() valida antes de avanzar
- [x] Container pasa validaciones
- [x] 0 errores de TypeScript
- [x] Documentación completada

---

**Estado final:** ✅ **SISTEMA DE VALIDACIÓN POR STEPS - 100% COMPLETADO**

Listo para pruebas end-to-end en navegador. 🎉
