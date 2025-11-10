# 🎯 Respuesta: ¿Cuándo Mostrar Errores en Formularios?

## ❓ Tu Pregunta Original

> "Si el usuario escribe '$' en el campo nombre de proyecto (que solo permite letras y números), ¿debo mostrar el error **instantáneamente** o **hasta que intente guardar**?"

---

## ✅ Respuesta Directa

**NO mostrar el error instantáneamente mientras escribe.**

**Mostrar el error SOLO cuando:**
1. **Sale del campo** (`onBlur`) ← **Primera vez**
2. **Mientras corrige** (`onChange`) ← **Solo si ya hay error**

---

## 🎬 Ejemplo Visual de Flujo

### ❌ **INCORRECTO** (molesta al usuario)
```
Usuario escribe: "P"
✅ Sin error

Usuario escribe: "r"
✅ Sin error

Usuario escribe: "o"
✅ Sin error

Usuario escribe: "y"
✅ Sin error

Usuario escribe: "$"
❌ ERROR INMEDIATO ← MOLESTO, está escribiendo!
"Solo se permiten letras y números"
```

### ✅ **CORRECTO** (validación progresiva)
```
Usuario escribe: "Proy$"
✅ Sin error (está escribiendo)

Usuario SALE DEL CAMPO (hace clic afuera)
❌ AHORA SÍ MOSTRAR ERROR
"Solo se permiten letras y números"

Usuario VUELVE al campo y borra "$"
Usuario escribe: "ecto"
✅ ERROR SE OCULTA INMEDIATAMENTE (ahora sí validar en tiempo real)
"Proy" → "Proye" → "Proyec" → "Proyecto" ✓ Verde
```

---

## 📋 Configuración React Hook Form

```typescript
const form = useForm({
  mode: 'onBlur',           // ← Validar SOLO al salir del campo
  reValidateMode: 'onChange' // ← Si ya hay error, validar mientras corrige
})
```

### ¿Qué significa esto?

1. **`mode: 'onBlur'`**
   - Usuario escribe libremente sin ver errores
   - Cuando sale del campo → Validar
   - Si hay error → Mostrarlo

2. **`reValidateMode: 'onChange'`**
   - Si ya hay un error visible
   - Validar cada tecla que presione
   - Para confirmar en tiempo real que lo está corrigiendo

---

## 🔄 Estados del Campo

### **Estado 1: Usuario escribiendo (primera vez)**
```
┌─────────────────────────────┐
│ Nombre del Proyecto         │
│ ┌─────────────────────────┐ │
│ │ Proy$                   │ │ ← Escribiendo
│ └─────────────────────────┘ │
│ Solo letras y números       │ ← Hint, NO error
└─────────────────────────────┘
```
- Borde: Gris neutral
- Sin iconos
- Sin mensajes de error

---

### **Estado 2: Usuario sale del campo (onBlur)**
```
┌─────────────────────────────┐
│ Nombre del Proyecto *       │
│ ┌─────────────────────────┐ │
│ │ Proy$                 ❌│ │ ← Error visible
│ └─────────────────────────┘ │
│ ❌ Solo letras y números... │ ← Mensaje específico
└─────────────────────────────┘
```
- Borde: Rojo
- Fondo: Rojo suave
- Icono: ❌ rojo
- Mensaje: Error específico

---

### **Estado 3: Usuario corrige (onChange activo)**
```
┌─────────────────────────────┐
│ Nombre del Proyecto *       │
│ ┌─────────────────────────┐ │
│ │ Proyecto              ✓ │ │ ← Validando en tiempo real
│ └─────────────────────────┘ │
│                             │ ← Error desapareció
└─────────────────────────────┘
```
- Borde: Verde
- Fondo: Verde suave
- Icono: ✓ verde
- Sin mensaje de error

---

## 🎯 ¿Por Qué Esta Estrategia?

### ❌ **Problema de validar mientras escribe:**
```typescript
mode: 'onChange' // ← EVITAR

// Usuario escribe: "P"
// Error: "Mínimo 3 caracteres" ← MOLESTO!

// Usuario escribe: "Pr"
// Error: "Mínimo 3 caracteres" ← MOLESTO!

// Usuario escribe: "Pro"
// ✓ Válido ← Recién ahora puede escribir tranquilo
```

### ✅ **Beneficio de validar al salir:**
```typescript
mode: 'onBlur' // ← CORRECTO

// Usuario escribe: "P" → Sin error
// Usuario escribe: "Pr" → Sin error
// Usuario escribe: "Proy$ecto" → Sin error
// Usuario SALE del campo → Ahora sí validar y mostrar error
```

---

## 📊 Comparación de Estrategias

| Estrategia | Cuándo valida | UX | Recomendado |
|------------|---------------|-----|-------------|
| `mode: 'onChange'` | Cada tecla | ❌ Molesta | ❌ NO |
| `mode: 'onBlur'` | Al salir del campo | ✅ Respetuosa | ✅ SÍ |
| `mode: 'onSubmit'` | Al guardar | ❌ Muy tarde | ❌ NO |
| **`onBlur` + `onChange` (si hay error)** | **Primero al salir, luego cada tecla** | **✅ PERFECTA** | **✅ SÍ** |

---

## 💻 Código Ejemplo

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  nombre: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(
      /^[a-zA-ZáéíóúñÑ0-9\s\-]+$/,
      'Solo letras, números, espacios y guiones'
    )
})

export function MiFormulario() {
  const { register, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',           // ← Validar al salir
    reValidateMode: 'onChange' // ← Si hay error, validar mientras corrige
  })

  const hasError = touchedFields.nombre && errors.nombre

  return (
    <div>
      <input
        {...register('nombre')}
        className={hasError ? 'border-red-500' : 'border-gray-300'}
      />
      {hasError && (
        <p className="text-red-500">{errors.nombre.message}</p>
      )}
    </div>
  )
}
```

---

## 🔑 Reglas de Oro

1. ✅ **Dejar escribir tranquilo** (sin errores mientras escribe)
2. ✅ **Validar al salir** del campo (`onBlur`)
3. ✅ **Mostrar error específico** ("Solo letras...", no "Error")
4. ✅ **Validar en tiempo real** si ya hay error (para confirmar corrección)
5. ✅ **Feedback positivo** (✓ verde cuando es válido)

---

## 📱 Casos Especiales

### **Campos únicos (matrícula, email):**
- Validar al salir (`onBlur`)
- Esperar 500ms de inactividad (debouncing)
- Mostrar spinner mientras valida
- Mostrar error específico si existe

### **Campos numéricos (precios, áreas):**
- Validar al salir
- Formatear automáticamente (separadores de miles)
- Validar rangos mínimos/máximos

### **Selects/Dropdowns:**
- Validar en `onChange` (es un solo clic)
- Mostrar error inmediatamente si es inválido

---

## ✅ Respuesta Final

**¿Mostrar error instantáneamente cuando escribe "$"?**

### ❌ NO
Espera a que **salga del campo**. Mientras escribe, déjalo tranquilo.

### ✅ SÍ
Muestra el error **solo cuando:**
1. Sale del campo (primera validación)
2. Vuelve a editar Y ya hay un error (validación en tiempo real para confirmar corrección)

---

## 🎓 Documentación Completa

Ver: `docs/VALIDACION-FORMULARIOS-UX.md`
Ver: `src/shared/components/forms/FormInput.tsx` (componente genérico)
Ver: `src/modules/proyectos/components/ejemplos/FormularioProyectoReal.tsx` (ejemplo completo)
