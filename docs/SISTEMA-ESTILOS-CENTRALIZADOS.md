# 🎨 Sistema de Estilos Centralizados - Módulo Clientes

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Estructura](#estructura)
- [Categorías de Estilos](#categorías-de-estilos)
- [Guía de Uso](#guía-de-uso)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Beneficios](#beneficios)

---

## 🎯 Visión General

Sistema centralizado de estilos con Tailwind CSS que elimina la duplicación de código y asegura consistencia visual en todo el módulo de Clientes.

### Antes vs Después

**❌ ANTES (Inline largo)**:
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
  <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
    {/* ... */}
  </div>
</div>
```

**✅ DESPUÉS (Estilos centralizados)**:
```tsx
import { sharedModalStyles } from '@/modules/clientes/styles'

<div className={sharedModalStyles.overlay}>
  <div className={sharedModalStyles.container.medium}>
    {/* ... */}
  </div>
</div>
```

---

## 📁 Estructura

```
src/modules/clientes/
├── components/styles/
│   ├── shared.styles.ts           # Estilos globales (modales, botones, cards)
│   └── formulario-cliente.styles.ts # Estilos de formularios
├── documentos/styles/
│   └── documentos.styles.ts       # Estilos de documentos
└── styles/
    └── index.ts                   # Barrel export (punto único de importación)
```

---

## 🎨 Categorías de Estilos

### 1. **Modales** (`sharedModalStyles`)

```ts
import { sharedModalStyles } from '@/modules/clientes/styles'

// Overlay backdrop
sharedModalStyles.overlay

// Contenedores
sharedModalStyles.container.small   // max-w-md
sharedModalStyles.container.medium  // max-w-2xl
sharedModalStyles.container.large   // max-w-4xl
sharedModalStyles.container.xlarge  // max-w-6xl

// Header
sharedModalStyles.header.wrapper
sharedModalStyles.header.iconContainer
sharedModalStyles.header.title
sharedModalStyles.header.closeButton

// Footer
sharedModalStyles.footer.wrapper
sharedModalStyles.footer.content
```

**Ejemplo**:
```tsx
<div className={sharedModalStyles.overlay}>
  <div className={sharedModalStyles.container.medium}>
    <div className={sharedModalStyles.header.wrapper}>
      <h2 className={sharedModalStyles.header.title}>Título</h2>
      <button className={sharedModalStyles.header.closeButton}>×</button>
    </div>
    <div className={sharedModalStyles.content}>
      {/* Contenido */}
    </div>
    <div className={sharedModalStyles.footer.wrapper}>
      {/* Botones */}
    </div>
  </div>
</div>
```

---

### 2. **Botones** (`sharedButtonStyles`)

```ts
import { sharedButtonStyles } from '@/modules/clientes/styles'

sharedButtonStyles.primary         // Gradiente morado-rosa
sharedButtonStyles.primaryViolet   // Gradiente morado-violeta
sharedButtonStyles.secondary       // Gris outline
sharedButtonStyles.danger          // Rojo outline
sharedButtonStyles.outline         // Neutro outline
sharedButtonStyles.icon            // Solo icono
sharedButtonStyles.loading         // Estado de carga
```

**Ejemplo**:
```tsx
<button className={sharedButtonStyles.primary}>
  Guardar
</button>
<button className={sharedButtonStyles.secondary}>
  Cancelar
</button>
<button className={sharedButtonStyles.danger}>
  Eliminar
</button>
```

---

### 3. **Cards** (`sharedCardStyles`)

```ts
import { sharedCardStyles } from '@/modules/clientes/styles'

// Variantes de color
sharedCardStyles.base + ' ' + sharedCardStyles.purple
sharedCardStyles.base + ' ' + sharedCardStyles.blue
sharedCardStyles.base + ' ' + sharedCardStyles.green

// Con gradiente
sharedCardStyles.gradientPurple
sharedCardStyles.gradientBlue

// Cards de información
sharedCardStyles.info      // Azul
sharedCardStyles.warning   // Amarillo
sharedCardStyles.error     // Rojo
sharedCardStyles.success   // Verde
```

**Ejemplo**:
```tsx
<div className={sharedCardStyles.base + ' ' + sharedCardStyles.purple}>
  <h3>Card Morado</h3>
</div>

<div className={sharedCardStyles.info}>
  <p>Información importante</p>
</div>
```

---

### 4. **Inputs** (`sharedInputStyles`)

```ts
import { sharedInputStyles } from '@/modules/clientes/styles'

sharedInputStyles.label          // Label consistente
sharedInputStyles.base           // Input text/email/tel
sharedInputStyles.select         // Select
sharedInputStyles.textarea       // Textarea
sharedInputStyles.error          // Input con error
sharedInputStyles.disabled       // Input deshabilitado
sharedInputStyles.errorMessage   // Mensaje de error
```

**Ejemplo**:
```tsx
<label className={sharedInputStyles.label}>
  Nombre
</label>
<input
  type="text"
  className={sharedInputStyles.base}
  placeholder="Ingresa tu nombre"
/>
{error && (
  <p className={sharedInputStyles.errorMessage}>{error}</p>
)}
```

---

### 5. **Badges** (`sharedBadgeStyles`)

```ts
import { sharedBadgeStyles } from '@/modules/clientes/styles'

sharedBadgeStyles.base + ' ' + sharedBadgeStyles.purple
sharedBadgeStyles.base + ' ' + sharedBadgeStyles.blue
sharedBadgeStyles.base + ' ' + sharedBadgeStyles.green
sharedBadgeStyles.base + ' ' + sharedBadgeStyles.yellow
sharedBadgeStyles.base + ' ' + sharedBadgeStyles.red
```

**Ejemplo**:
```tsx
<span className={sharedBadgeStyles.base + ' ' + sharedBadgeStyles.purple}>
  Activo
</span>
```

---

### 6. **Alertas** (`sharedAlertStyles`)

```ts
import { sharedAlertStyles } from '@/modules/clientes/styles'

sharedAlertStyles.base + ' ' + sharedAlertStyles.info
sharedAlertStyles.base + ' ' + sharedAlertStyles.warning
sharedAlertStyles.base + ' ' + sharedAlertStyles.error
sharedAlertStyles.base + ' ' + sharedAlertStyles.success
```

**Ejemplo**:
```tsx
<div className={sharedAlertStyles.base + ' ' + sharedAlertStyles.error}>
  <AlertIcon className={sharedAlertStyles.icon} />
  <div className={sharedAlertStyles.content}>
    <p className={sharedAlertStyles.title}>Error</p>
    <p className={sharedAlertStyles.message}>Mensaje de error</p>
  </div>
</div>
```

---

### 7. **Estados Vacíos** (`sharedEmptyStateStyles`)

```ts
import { sharedEmptyStateStyles } from '@/modules/clientes/styles'

sharedEmptyStateStyles.container
sharedEmptyStateStyles.icon
sharedEmptyStateStyles.title
sharedEmptyStateStyles.description
```

**Ejemplo**:
```tsx
<div className={sharedEmptyStateStyles.container}>
  <FileX className={sharedEmptyStateStyles.icon} />
  <h3 className={sharedEmptyStateStyles.title}>
    No hay documentos
  </h3>
  <p className={sharedEmptyStateStyles.description}>
    Sube documentos para comenzar
  </p>
</div>
```

---

### 8. **Documentos** (`uploadStyles`, `listStyles`, `filterStyles`)

```ts
import { uploadStyles, listStyles, filterStyles } from '@/modules/clientes/styles'

// Upload
uploadStyles.container
uploadStyles.dropzone.idle
uploadStyles.dropzone.active
uploadStyles.filePreview

// Lista
listStyles.grid
listStyles.list
listStyles.empty

// Filtros
filterStyles.searchInput
filterStyles.categorySelect
filterStyles.importantToggle.active
```

---

## 📖 Guía de Uso

### Paso 1: Importar estilos

```tsx
// Importación individual
import { sharedModalStyles } from '@/modules/clientes/styles'

// Importación múltiple
import {
  sharedModalStyles,
  sharedButtonStyles,
  sharedCardStyles
} from '@/modules/clientes/styles'
```

### Paso 2: Aplicar en componente

```tsx
export function MiComponente() {
  return (
    <div className={sharedModalStyles.overlay}>
      <div className={sharedModalStyles.container.medium}>
        {/* Contenido */}
      </div>
    </div>
  )
}
```

### Paso 3: Combinar estilos (cuando sea necesario)

```tsx
// Concatenar strings
<div className={sharedCardStyles.base + ' ' + sharedCardStyles.purple}>

// Con conditional (className dinámico)
<button
  className={`${sharedButtonStyles.primary} ${loading ? sharedButtonStyles.loading : ''}`}
>
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Modal Completo

```tsx
import { sharedModalStyles, sharedButtonStyles } from '@/modules/clientes/styles'

export function MiModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={sharedModalStyles.overlay}>
          <div className={sharedModalStyles.container.medium}>
            {/* Header */}
            <div className={sharedModalStyles.header.wrapper}>
              <div className={sharedModalStyles.header.titleSection}>
                <div className={sharedModalStyles.header.iconContainer}>
                  <Icon />
                </div>
                <h2 className={sharedModalStyles.header.title}>
                  Título del Modal
                </h2>
              </div>
              <button
                onClick={onClose}
                className={sharedModalStyles.header.closeButton}
              >
                <X />
              </button>
            </div>

            {/* Contenido */}
            <div className={sharedModalStyles.content}>
              {/* Tu contenido aquí */}
            </div>

            {/* Footer */}
            <div className={sharedModalStyles.footer.wrapper}>
              <div className={sharedModalStyles.footer.content}>
                <button className={sharedButtonStyles.secondary}>
                  Cancelar
                </button>
                <button className={sharedButtonStyles.primary}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
```

### Ejemplo 2: Formulario con Inputs

```tsx
import { sharedInputStyles } from '@/modules/clientes/styles'

export function MiFormulario() {
  return (
    <form>
      <div>
        <label className={sharedInputStyles.label}>
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={sharedInputStyles.base}
          placeholder="Ingresa tu nombre"
        />
      </div>

      <div>
        <label className={sharedInputStyles.label}>País</label>
        <select className={sharedInputStyles.select}>
          <option>Colombia</option>
          <option>Venezuela</option>
        </select>
      </div>

      <div>
        <label className={sharedInputStyles.label}>Comentarios</label>
        <textarea
          className={sharedInputStyles.textarea}
          rows={4}
        />
      </div>
    </form>
  )
}
```

### Ejemplo 3: Card con Badge

```tsx
import { sharedCardStyles, sharedBadgeStyles } from '@/modules/clientes/styles'

export function ClienteCard({ cliente }) {
  return (
    <div className={sharedCardStyles.base + ' ' + sharedCardStyles.purple}>
      <div className="flex items-center justify-between">
        <h3>{cliente.nombre}</h3>
        <span className={sharedBadgeStyles.base + ' ' + sharedBadgeStyles.green}>
          Activo
        </span>
      </div>
      <p>{cliente.email}</p>
    </div>
  )
}
```

---

## ✅ Beneficios

### 1. **Consistencia Visual**
- Mismo look & feel en todo el módulo
- Design system unificado
- Menos sorpresas visuales

### 2. **Mantenibilidad**
- Cambios en un solo lugar
- Refactorización fácil
- Actualización global instantánea

### 3. **Productividad**
- No reinventar la rueda
- Copy-paste de ejemplos
- Menos tiempo en estilos

### 4. **Legibilidad**
- Componentes más limpios
- Intención clara
- Fácil de entender

### 5. **Escalabilidad**
- Agregar variantes fácilmente
- Crear temas globales
- Soportar dark mode consistente

---

## 🔧 Mantenimiento

### Agregar Nueva Variante

**En `shared.styles.ts`**:
```ts
export const sharedButtonStyles = {
  // ... existentes
  success: 'rounded-xl bg-green-600 text-white hover:bg-green-700', // ⭐ NUEVA
}
```

**Usar en componente**:
```tsx
<button className={sharedButtonStyles.success}>
  Éxito
</button>
```

### Actualizar Estilo Global

**Cambio en `shared.styles.ts`**:
```ts
// ❌ ANTES
primary: 'bg-purple-600 text-white'

// ✅ DESPUÉS
primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
```

**Resultado**: Todos los botones primarios se actualizan automáticamente en toda la app.

---

## 📚 Referencias

- **Documentación Tailwind**: https://tailwindcss.com/docs
- **Guía de estilos del proyecto**: `docs/GUIA-ESTILOS.md`
- **Ejemplos**: `src/modules/clientes/components/modals/modal-registrar-interes.tsx`

---

## 🎯 Próximos Pasos

1. ✅ Sistema de estilos creado
2. ✅ Modal de ejemplo refactorizado
3. 🔄 Refactorizar resto de modales
4. 🔄 Refactorizar formularios
5. 🔄 Refactorizar documentos
6. 📝 Agregar más variantes según necesidades

---

**💡 TIP**: Siempre consulta los estilos existentes antes de crear nuevos. Si necesitas algo que no existe, agrégalo al sistema para que otros lo reutilicen.
