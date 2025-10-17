# 🎯 Modal de Confirmación Estándar - Guía de Uso

## 📋 Descripción

Componente **reutilizable** para confirmaciones de acciones importantes o destructivas en toda la aplicación.

Reemplaza el uso de `window.confirm()` y `window.alert()` con una interfaz moderna, animada y consistente.

---

## 🎨 Características

- ✅ **4 variantes visuales**: danger, warning, info, success
- ✅ **Animaciones suaves** con Framer Motion
- ✅ **Glassmorphism** y diseño moderno
- ✅ **Loading state** automático durante confirmación
- ✅ **Soporte async/await** en la función de confirmación
- ✅ **Accesibilidad**: ESC para cerrar, click fuera para cancelar
- ✅ **Responsive**: Se adapta a mobile y desktop
- ✅ **Dark mode** compatible

---

## 📦 Ubicación

```
src/shared/components/modal-confirmacion.tsx
src/shared/hooks/useModalConfirmacion.ts
```

---

## 🚀 Uso Básico

### **Opción 1: Uso directo del componente**

```tsx
import { ModalConfirmacion } from '@/shared'
import { useState } from 'react'

function MiComponente() {
  const [modalAbierto, setModalAbierto] = useState(false)

  const handleEliminar = async () => {
    await eliminarDatos()
    // El modal se cierra automáticamente después
  }

  return (
    <>
      <button onClick={() => setModalAbierto(true)}>
        Eliminar
      </button>

      <ModalConfirmacion
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirm={handleEliminar}
        title="Eliminar Proyecto"
        message="¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
```

---

### **Opción 2: Con el hook `useModalConfirmacion`** (Recomendado)

```tsx
import { ModalConfirmacion, useModalConfirmacion } from '@/shared'

function MiComponente() {
  const {
    modalAbierto,
    abrirModal,
    cerrarModal,
    confirmar,
    isLoading
  } = useModalConfirmacion({
    onConfirm: async () => {
      await eliminarProyecto(id)
    },
    onSuccess: () => {
      console.log('¡Eliminado exitosamente!')
    },
    onError: (error) => {
      console.error('Error:', error)
    }
  })

  return (
    <>
      <button onClick={abrirModal}>Eliminar</button>

      <ModalConfirmacion
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onConfirm={confirmar}
        isLoading={isLoading}
        title="Eliminar Proyecto"
        message="¿Estás seguro?"
        variant="danger"
      />
    </>
  )
}
```

---

### **Opción 3: Con JSX personalizado en el mensaje** (Más visual)

```tsx
<ModalConfirmacion
  isOpen={modalAbierto}
  onClose={cerrar}
  onConfirm={confirmar}
  title="Eliminar Cliente"
  message={
    <div className="space-y-4">
      <p>¿Estás seguro de eliminar a <strong>{cliente.nombre}</strong>?</p>

      {/* Advertencia con estilo */}
      <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span>⚠️</span>
          <h4 className="font-bold text-amber-900">Restricciones</h4>
        </div>
        <ul className="space-y-2 text-sm">
          <li>▸ Solo clientes en estado "Interesado"</li>
          <li>▸ Sin viviendas asignadas</li>
          <li>▸ Sin negociaciones</li>
        </ul>
      </div>

      {/* Recomendación */}
      <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-3">
        <p className="text-sm">
          💡 <strong>Alternativa:</strong> Usa "Inactivo" en lugar de eliminar.
        </p>
      </div>
    </div>
  }
  variant="danger"
/>
```

---

## 🎨 Variantes Disponibles

### 1. **Danger** (Rojo) - Para eliminaciones

```tsx
<ModalConfirmacion
  variant="danger"
  title="Eliminar Cliente"
  message="Esta acción no se puede deshacer"
  confirmText="Eliminar"
/>
```

**Visual:**
- Gradiente rojo/rosa
- Ícono: Trash2
- Uso: Eliminar registros, datos permanentes

---

### 2. **Warning** (Ámbar) - Para advertencias

```tsx
<ModalConfirmacion
  variant="warning"
  title="Cambiar Estado"
  message="El cliente pasará a estado Inactivo y no recibirá notificaciones"
  confirmText="Continuar"
/>
```

**Visual:**
- Gradiente ámbar/naranja
- Ícono: AlertTriangle
- Uso: Cambios importantes, acciones con consecuencias

---

### 3. **Info** (Azul) - Para confirmaciones informativas

```tsx
<ModalConfirmacion
  variant="info"
  title="Enviar Notificación"
  message="Se enviará un email a todos los clientes activos"
  confirmText="Enviar"
/>
```

**Visual:**
- Gradiente azul/cyan
- Ícono: Info
- Uso: Confirmaciones generales, acciones reversibles

---

### 4. **Success** (Verde) - Para acciones positivas

```tsx
<ModalConfirmacion
  variant="success"
  title="Aprobar Negociación"
  message="¿Confirmar aprobación de la negociación?"
  confirmText="Aprobar"
/>
```

**Visual:**
- Gradiente verde/esmeralda
- Ícono: CheckCircle
- Uso: Aprobaciones, finalizaciones exitosas

---

## 📋 Props Disponibles

```typescript
interface ModalConfirmacionProps {
  /** Control de apertura del modal */
  isOpen: boolean

  /** Función para cerrar el modal */
  onClose: () => void

  /** Función a ejecutar al confirmar (puede ser async) */
  onConfirm: () => void | Promise<void>

  /** Título del modal */
  title: string

  /** Mensaje descriptivo de la acción (puede ser string o JSX/ReactNode) */
  message: string | ReactNode

  /** Texto del botón de confirmación (default: "Confirmar") */
  confirmText?: string

  /** Texto del botón de cancelación (default: "Cancelar") */
  cancelText?: string

  /** Variante del modal */
  variant?: 'danger' | 'warning' | 'info' | 'success'

  /** Mostrar loading mientras se ejecuta onConfirm */
  isLoading?: boolean
}
```

---

## 🔧 Hook `useModalConfirmacion`

### Props del Hook

```typescript
interface UseModalConfirmacionOptions {
  /** Función a ejecutar al confirmar */
  onConfirm: () => void | Promise<void>

  /** Callback después de confirmar exitosamente */
  onSuccess?: () => void

  /** Callback si hay error */
  onError?: (error: unknown) => void
}
```

### Return del Hook

```typescript
{
  modalAbierto: boolean        // Estado del modal
  abrirModal: () => void        // Abrir modal
  cerrarModal: () => void       // Cerrar modal
  confirmar: () => Promise<void> // Ejecutar confirmación
  isLoading: boolean           // Estado de carga
}
```

---

## 💡 Ejemplos de Uso por Módulo

### **Clientes - Eliminar Cliente**

```tsx
// src/modules/clientes/components/clientes-page-main.tsx
import { ModalConfirmacion } from '@/shared'

const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null)

const handleEliminar = (cliente: Cliente) => {
  setClienteAEliminar(cliente)
  setModalEliminarAbierto(true)
}

const confirmarEliminacion = async () => {
  await eliminarCliente(clienteAEliminar.id)
  setModalEliminarAbierto(false)
}

// JSX:
<ModalConfirmacion
  isOpen={modalEliminarAbierto}
  onClose={() => setModalEliminarAbierto(false)}
  onConfirm={confirmarEliminacion}
  title="Eliminar Cliente"
  message={`¿Estás seguro de eliminar a ${clienteAEliminar?.nombre_completo}? Esto eliminará también negociaciones y documentos asociados.`}
  confirmText="Eliminar Cliente"
  variant="danger"
/>
```

---

### **Proyectos - Cambiar Estado**

```tsx
// src/modules/proyectos/...
const cambiarEstadoProyecto = async () => {
  await actualizarProyecto(id, { estado: 'Completado' })
}

<ModalConfirmacion
  isOpen={modalAbierto}
  onClose={cerrarModal}
  onConfirm={cambiarEstadoProyecto}
  title="Completar Proyecto"
  message="¿Marcar el proyecto como completado? Las viviendas pendientes pasarán a estado final."
  confirmText="Completar Proyecto"
  variant="warning"
/>
```

---

### **Viviendas - Asignar Cliente**

```tsx
// src/modules/viviendas/...
const asignarClienteAVivienda = async () => {
  await asignarCliente(viviendaId, clienteId)
}

<ModalConfirmacion
  isOpen={modalAbierto}
  onClose={cerrarModal}
  onConfirm={asignarClienteAVivienda}
  title="Asignar Vivienda"
  message={`¿Asignar la vivienda a ${cliente.nombre}? El estado cambiará a "Asignada".`}
  confirmText="Asignar"
  variant="success"
/>
```

---

### **Abonos - Eliminar Abono**

```tsx
// src/modules/abonos/...
const eliminarAbono = async () => {
  await eliminarAbonoService(abonoId)
}

<ModalConfirmacion
  isOpen={modalAbierto}
  onClose={cerrarModal}
  onConfirm={eliminarAbono}
  title="Eliminar Abono"
  message="¿Eliminar este registro de abono? Esta acción no se puede deshacer y afectará el saldo del cliente."
  confirmText="Eliminar Abono"
  variant="danger"
/>
```

---

## ✅ Ventajas vs `window.confirm()`

| Aspecto | `window.confirm()` | `ModalConfirmacion` |
|---------|-------------------|---------------------|
| **Diseño** | Nativo del navegador (feo) | Moderno, animado, branded |
| **Personalización** | Ninguna | 4 variantes + textos custom |
| **UX** | Bloquea la UI | No bloquea, glassmorphism |
| **Loading** | No soporta | Loading automático |
| **Async/Await** | No funciona bien | Totalmente compatible |
| **Dark Mode** | No | Sí |
| **Mobile** | No responsive | Totalmente responsive |

---

## 🎯 Casos de Uso Recomendados

### ✅ **Usar `ModalConfirmacion`** cuando:

- Eliminar registros permanentemente
- Cambiar estados importantes (Completado, Cancelado, etc.)
- Enviar notificaciones masivas
- Aprobar/rechazar solicitudes
- Realizar acciones con consecuencias significativas

### ❌ **NO usar** para:

- Mensajes informativos simples (usar toast/notification)
- Confirmaciones triviales (mejor UX sin confirmación)
- Acciones reversibles fácilmente

---

## 🚀 Checklist de Implementación

Para agregar confirmación en un nuevo módulo:

- [ ] Importar `ModalConfirmacion` desde `@/shared`
- [ ] Agregar estados: `modalAbierto`, `itemAEliminar`
- [ ] Crear función `handleEliminar(item)` que abra el modal
- [ ] Crear función `confirmarEliminacion()` con lógica async
- [ ] Agregar `<ModalConfirmacion>` en el JSX
- [ ] Configurar props: title, message, variant
- [ ] Probar: abrir, cancelar, confirmar, loading

---

## 📚 Recursos Adicionales

- **Componente:** `src/shared/components/modal-confirmacion.tsx`
- **Hook:** `src/shared/hooks/useModalConfirmacion.ts`
- **Ejemplo completo:** `src/modules/clientes/components/clientes-page-main.tsx`
- **Iconos:** [Lucide Icons](https://lucide.dev)

---

## 🎨 Personalización Futura

Si necesitas más variantes o estilos:

1. Edita `variantConfig` en `modal-confirmacion.tsx`
2. Agrega nuevos tipos al type `variant`
3. Define gradiente, ícono y colores

```typescript
// Ejemplo: variante "purple" para acciones especiales
purple: {
  icon: Sparkles,
  gradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
  buttonBg: 'bg-purple-600 hover:bg-purple-700',
  iconBg: 'bg-purple-100 dark:bg-purple-900/30',
  iconColor: 'text-purple-600 dark:text-purple-400',
  ringColor: 'ring-purple-500/20',
}
```

---

**¡Modal de confirmación listo para usar en toda la aplicación! 🎉**
