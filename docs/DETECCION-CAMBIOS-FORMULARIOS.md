# ✅ Detección de Cambios en Formularios - Implementación Completa

## 🎯 Objetivo

**Problema:**
En formularios de edición, permitir guardar sin cambios es ilógico e innecesario. Se desperdician recursos y genera confusión.

**Solución Implementada:**
Sistema inteligente que:
1. ✅ Detecta cambios entre valores iniciales y actuales
2. ✅ Deshabilita botón "Guardar" si no hay cambios
3. ✅ Muestra badge informativo con lista de cambios
4. ✅ Marca visualmente campos modificados
5. ✅ Solo aplica en modo **edición** (en creación siempre puede guardar)

---

## 🎨 Experiencia de Usuario

### **Escenario 1: Sin Cambios**

```
┌─────────────────────────────────────────┐
│ Editar Proyecto                         │
│                                         │
│ Nombre: [Urbanización Los Pinos]        │
│ Ubicación: [Medellín]                   │
│ Descripción: [Proyecto de 50...]        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ℹ️ Sin cambios por guardar          │ │ ← Badge azul
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancelar] [Actualizar Proyecto] ←❌    │ DESHABILITADO
└─────────────────────────────────────────┘
```

**Comportamiento:**
- Badge azul informativo
- Botón deshabilitado (opacity 50%)
- Cursor `not-allowed`
- Usuario sabe que no puede guardar

---

### **Escenario 2: 1 Cambio Detectado**

```
┌─────────────────────────────────────────┐
│ Editar Proyecto                         │
│                                         │
│ Nombre: [Los Pinos 2025] ✏️ Modificado │ ← Indicador naranja
│ Ubicación: [Medellín]                   │
│ Descripción: [Proyecto de 50...]        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✏️ 1 cambio detectado:              │ │ ← Badge naranja expandible
│ │ • Nombre del Proyecto               │ │
│ │   "Urbanización..." → "Los Pinos..."│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancelar] [Actualizar Proyecto] ←✅    │ HABILITADO
└─────────────────────────────────────────┘
```

**Comportamiento:**
- Badge naranja con contador
- Lista expandible/colapsable de cambios
- Indicador "✏️ Modificado" en label del campo
- Borde naranja en campo modificado
- Botón habilitado

---

### **Escenario 3: Múltiples Cambios**

```
┌─────────────────────────────────────────┐
│ Editar Proyecto                         │
│                                         │
│ Nombre: [Los Pinos 2025] ✏️ Modificado │
│ Ubicación: [Cali, Valle] ✏️ Modificado │
│ Descripción: [Nueva desc...] ✏️ Modif. │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✏️ 3 cambios detectados: ▼          │ │ ← Expandido
│ │ • Nombre del Proyecto               │ │
│ │   "Urbanización..." → "Los Pinos..."│ │
│ │ • Ubicación                         │ │
│ │   "Medellín" → "Cali, Valle"        │ │
│ │ • Descripción                       │ │
│ │   "Proyecto de..." → "Nueva desc..."│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancelar] [Actualizar Proyecto] ←✅    │
└─────────────────────────────────────────┘
```

---

## 🔧 Arquitectura de Implementación

### **1. Hook Genérico: `useFormChanges`**

Archivo: `src/shared/hooks/useFormChanges.ts`

```typescript
const {
  hasChanges,      // Booleano: ¿hay cambios?
  changes,         // Array con detalles de cada cambio
  changesCount,    // Número de campos modificados
  isFieldChanged,  // Función: ¿campo X cambió?
} = useFormChanges(currentValues, initialValues, {
  fieldLabels: {
    nombre: 'Nombre del Proyecto',
    ubicacion: 'Ubicación',
  }
})
```

**Características:**
- ✅ Comparación profunda (deep equal)
- ✅ Ignora campos específicos (timestamps, IDs)
- ✅ Labels personalizables
- ✅ Reutilizable en cualquier formulario

---

### **2. Componente Visual: `FormChangesBadge`**

Archivo: `src/shared/components/forms/FormChangesBadge.tsx`

```tsx
<FormChangesBadge
  hasChanges={hasChanges}
  changes={changes}
  changesCount={changesCount}
/>
```

**Variantes:**
1. **Completa** - Badge con lista expandible
2. **Compacta** - Solo icono + contador
3. **Indicador por campo** - Dot naranja en campo específico

---

### **3. Integración en Hook del Formulario**

Archivo: `src/modules/proyectos/hooks/useProyectosForm.ts`

```typescript
// Detección de cambios
const {
  hasChanges,
  changes,
  changesCount,
  isFieldChanged,
} = useFormChanges(
  {
    nombre: watch('nombre'),
    ubicacion: watch('ubicacion'),
    descripcion: watch('descripcion'),
    manzanas: manzanasWatch,
  },
  {
    nombre: initialData?.nombre || '',
    ubicacion: initialData?.ubicacion || '',
    descripcion: initialData?.descripcion || '',
    manzanas: initialData?.manzanas || [],
  },
  {
    fieldLabels: {
      nombre: 'Nombre del Proyecto',
      ubicacion: 'Ubicación',
      descripcion: 'Descripción',
      manzanas: 'Manzanas',
    },
  }
)

// Control de guardado
const shouldShowChanges = isEditing
const canSave = isEditing ? hasChanges : true
```

---

### **4. UI en Componente del Formulario**

Archivo: `src/modules/proyectos/components/proyectos-form.tsx`

```tsx
{/* Badge de cambios */}
{shouldShowChanges && (
  <FormChangesBadge
    hasChanges={hasChanges}
    changes={changes}
    changesCount={changesCount}
  />
)}

{/* Botón con estado */}
<button
  type="submit"
  disabled={isLoading || !canSave}
  className={cn(
    styles.footer.submitButton,
    !canSave && 'opacity-50 cursor-not-allowed'
  )}
>
  Actualizar Proyecto
</button>

{/* Indicador en campo */}
<label>
  Nombre del Proyecto *
  {isEditing && isFieldChanged('nombre') && (
    <span className="ml-2 text-xs text-orange-600">
      ✏️ Modificado
    </span>
  )}
</label>
```

---

## 🎨 Estilos Visuales

### **Badge Sin Cambios**
```css
bg-blue-50 dark:bg-blue-950/20
border-blue-200 dark:border-blue-800
text-blue-700 dark:text-blue-300
```

### **Badge Con Cambios**
```css
bg-orange-50 dark:bg-orange-950/20
border-orange-200 dark:border-orange-800
text-orange-700 dark:text-orange-300
animate-pulse
```

### **Campo Modificado**
```css
border-orange-300 dark:border-orange-700
bg-orange-50/50 dark:bg-orange-950/20
```

### **Botón Deshabilitado**
```css
opacity-50
cursor-not-allowed
```

---

## 📊 Comparación con Otras Estrategias

### **Opción A: Siempre Habilitado**
```
[Actualizar] ← Siempre habilitado
```
- ❌ Permite guardados innecesarios
- ❌ No informa al usuario
- ✅ Simple de implementar

### **Opción B: Deshabilitar sin Feedback**
```
[Actualizar] ← Deshabilitado sin explicación
```
- ✅ Previene guardados innecesarios
- ❌ Usuario no sabe por qué
- ⚠️ Puede frustrar

### **Opción C: IMPLEMENTADA (Híbrida)** 🏆
```
ℹ️ Sin cambios por guardar
[Actualizar] ← Deshabilitado con explicación
```
- ✅ Previene guardados innecesarios
- ✅ Informa claramente al usuario
- ✅ Lista específica de cambios
- ✅ Indicadores visuales en campos
- ✅ UX transparente

---

## 🔍 Casos de Uso Cubiertos

### **1. Edición Sin Cambios**
```typescript
// Usuario abre modal de edición
// NO modifica nada
// Botón deshabilitado → Evita submit innecesario
```

### **2. Edición con Cambios Parciales**
```typescript
// Usuario cambia solo el nombre
// Badge: "1 cambio detectado"
// Botón habilitado → Puede guardar
```

### **3. Edición con Cambios Múltiples**
```typescript
// Usuario cambia nombre, ubicación y descripción
// Badge: "3 cambios detectados" con lista expandible
// Cada campo marcado con "✏️ Modificado"
```

### **4. Creación (Nuevo Proyecto)**
```typescript
// En modo creación, NO mostrar badge de cambios
// Botón siempre habilitado
// canSave = true
```

### **5. Cancelar con Cambios**
```typescript
// (Opcional) Confirmar antes de descartar
if (hasChanges) {
  confirm('¿Descartar cambios?')
}
```

---

## ✨ Ventajas de la Implementación

### **1. Rendimiento**
- ✅ Evita requests innecesarios a la DB
- ✅ Reduce carga del servidor
- ✅ Ahorra ancho de banda

### **2. UX**
- ✅ Usuario sabe exactamente qué cambió
- ✅ No hay confusión sobre por qué está deshabilitado
- ✅ Feedback visual claro (colores, iconos)
- ✅ Lista de cambios para revisión antes de guardar

### **3. Mantenibilidad**
- ✅ Hook reutilizable (`useFormChanges`)
- ✅ Componente genérico (`FormChangesBadge`)
- ✅ Lógica centralizada
- ✅ Fácil de testear

### **4. Escalabilidad**
- ✅ Funciona con cualquier formulario
- ✅ Soporta objetos anidados (manzanas)
- ✅ Comparación deep automática
- ✅ Extensible con opciones personalizadas

---

## 🧪 Casos de Prueba

### **Test 1: Sin Cambios**
1. Abrir modal de edición
2. NO modificar ningún campo
3. **Esperado:**
   - Badge azul: "Sin cambios por guardar"
   - Botón deshabilitado
   - Opacity 50%

### **Test 2: Cambiar Nombre**
1. Cambiar nombre de "Proyecto A" a "Proyecto B"
2. **Esperado:**
   - Badge naranja: "1 cambio detectado"
   - Label: "Nombre del Proyecto * ✏️ Modificado"
   - Borde naranja en input
   - Botón habilitado

### **Test 3: Múltiples Cambios**
1. Cambiar nombre, ubicación y descripción
2. **Esperado:**
   - Badge: "3 cambios detectados"
   - Lista expandible con detalles
   - Los 3 campos marcados como modificados

### **Test 4: Cambiar y Revertir**
1. Cambiar nombre
2. Volver al valor original
3. **Esperado:**
   - Badge vuelve a "Sin cambios"
   - Botón deshabilitado nuevamente

### **Test 5: Modo Creación**
1. Crear nuevo proyecto
2. **Esperado:**
   - NO mostrar badge de cambios
   - Botón siempre habilitado

---

## 📁 Archivos Creados/Modificados

### **Nuevos Archivos:**
1. `src/shared/hooks/useFormChanges.ts` - Hook genérico
2. `src/shared/components/forms/FormChangesBadge.tsx` - Componente visual

### **Archivos Modificados:**
1. `src/modules/proyectos/hooks/useProyectosForm.ts`
   - Import `useFormChanges`
   - Detección de cambios
   - Export `hasChanges`, `changes`, etc.

2. `src/modules/proyectos/components/proyectos-form.tsx`
   - Import `FormChangesBadge`
   - Badge antes del footer
   - Indicadores "✏️ Modificado" en labels
   - Botón con `disabled={!canSave}`

---

## 🚀 Uso en Otros Formularios

### **Aplicar a cualquier formulario:**

```tsx
import { useFormChanges } from '@/shared/hooks/useFormChanges'
import { FormChangesBadge } from '@/shared/components/forms/FormChangesBadge'

function MiFormulario() {
  const formValues = watch()

  const { hasChanges, changes, changesCount } = useFormChanges(
    formValues,
    initialData,
    {
      fieldLabels: {
        campo1: 'Campo 1',
        campo2: 'Campo 2',
      }
    }
  )

  return (
    <form>
      {/* Campos... */}

      {isEditing && (
        <FormChangesBadge
          hasChanges={hasChanges}
          changes={changes}
          changesCount={changesCount}
        />
      )}

      <button disabled={isEditing && !hasChanges}>
        Guardar
      </button>
    </form>
  )
}
```

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ Aplicar a formulario de **Viviendas**
2. ✅ Aplicar a formulario de **Clientes**
3. ✅ Aplicar a formulario de **Negociaciones**
4. ✅ Agregar confirmación al cancelar con cambios
5. ✅ Agregar animación de pulso en badge de cambios
6. ✅ Crear variante compacta para espacios reducidos

---

## 📚 Documentación Relacionada

- `docs/VALIDACION-CARACTERES-PROYECTOS.md` - Validación de caracteres
- `docs/VALIDACION-FORMULARIOS-UX.md` - UX de validación progresiva
- `docs/CUANDO-MOSTRAR-ERRORES-FORMULARIOS.md` - Estrategia de errores
