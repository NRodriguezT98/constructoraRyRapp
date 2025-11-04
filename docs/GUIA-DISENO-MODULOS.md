# 🎨 GUÍA DE DISEÑO DE MÓDULOS - RyR Constructora

## ⚠️ OBLIGATORIO: Leer ANTES de crear cualquier módulo

Esta guía define el **estándar de diseño** que TODOS los módulos deben seguir para mantener consistencia visual y funcional en toda la aplicación.

---

## 📐 Dimensiones y Espaciado

### Container Principal
```tsx
className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100
           dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
           p-4 md:p-6 lg:p-8"
```

**Reglas:**
- ✅ Padding responsivo: `p-4` (móvil) → `md:p-6` (tablet) → `lg:p-8` (desktop)
- ✅ Altura mínima: `min-h-screen` (siempre pantalla completa)
- ✅ Fondo degradado con modo oscuro/claro

### Cards y Contenedores
```tsx
className="bg-white dark:bg-slate-900
           rounded-xl shadow-sm
           border border-slate-200 dark:border-slate-700
           overflow-hidden"
```

**Reglas:**
- ✅ Bordes redondeados: `rounded-xl` (12px)
- ✅ Sombra sutil: `shadow-sm`
- ✅ Borde visible en ambos modos
- ✅ `overflow-hidden` para contenido interno

### Header de Card
```tsx
className="px-4 md:px-6 py-4
           border-b border-slate-200 dark:border-slate-700
           bg-slate-50 dark:bg-slate-800/50"
```

**Reglas:**
- ✅ Padding horizontal responsivo
- ✅ Padding vertical fijo: `py-4`
- ✅ Borde inferior
- ✅ Fondo diferenciado

### Body de Card
```tsx
className="p-4 md:p-6"
```

**Reglas:**
- ✅ Padding responsivo
- ✅ Sin fondo (hereda del card)

---

## 🎨 Sistema de Colores

### Paleta Principal (Azul)
```tsx
// Botones primarios
'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'

// Texto primario
'text-blue-600 dark:text-blue-400'

// Fondo primario
'bg-blue-50 dark:bg-blue-900/20'

// Borde primario
'border-blue-200 dark:border-blue-800'
```

### Paleta Secundaria (Slate/Gris)
```tsx
// Texto normal
'text-slate-900 dark:text-slate-100'

// Texto secundario
'text-slate-600 dark:text-slate-400'

// Texto terciario
'text-slate-500 dark:text-slate-500'

// Fondo neutral
'bg-slate-50 dark:bg-slate-800/50'

// Bordes
'border-slate-200 dark:border-slate-700'
```

### Estados (Semánticos)
```tsx
// Éxito (Verde)
'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'

// Advertencia (Amarillo)
'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'

// Error (Rojo)
'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'

// Info (Azul)
'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
```

---

## 🧩 Componentes Base (USAR SIEMPRE)

### 1. ModuleContainer
```tsx
// src/shared/components/ModuleContainer.tsx
interface ModuleContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function ModuleContainer({
  children,
  maxWidth = '2xl'
}: ModuleContainerProps) {
  return (
    <div className={`
      min-h-screen
      bg-gradient-to-br from-slate-50 via-white to-slate-100
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
      p-4 md:p-6 lg:p-8
    `}>
      <div className={`mx-auto max-w-${maxWidth}`}>
        {children}
      </div>
    </div>
  )
}
```

### 2. ModuleHeader
```tsx
interface ModuleHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
}

export function ModuleHeader({
  title,
  description,
  icon,
  actions
}: ModuleHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
            {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 3. Card (Reutilizable)
```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`
      bg-white dark:bg-slate-900
      rounded-xl shadow-sm
      border border-slate-200 dark:border-slate-700
      overflow-hidden
      ${className}
    `}>
      <div className={noPadding ? '' : 'p-4 md:p-6'}>
        {children}
      </div>
    </div>
  )
}
```

### 4. Button (Estandarizado)
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
  secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
  danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  onClick,
  disabled = false,
  className = ''
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
```

---

## 📏 Reglas de Tipografía

### Títulos
```tsx
// H1 - Título principal del módulo
'text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100'

// H2 - Subtítulos de secciones
'text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100'

// H3 - Títulos de cards
'text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100'

// H4 - Subtítulos pequeños
'text-base md:text-lg font-medium text-slate-900 dark:text-slate-100'
```

### Texto
```tsx
// Texto normal
'text-sm md:text-base text-slate-700 dark:text-slate-300'

// Texto secundario
'text-xs md:text-sm text-slate-600 dark:text-slate-400'

// Texto pequeño (metadatos)
'text-xs text-slate-500 dark:text-slate-500'
```

---

## 🎯 Badges y Etiquetas

### Estados de Acción (Auditoría, etc.)
```tsx
const badgeVariants = {
  create: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  update: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  delete: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
}

<span className={`
  inline-flex items-center gap-1.5
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  border
  ${badgeVariants[variant]}
`}>
  {children}
</span>
```

### Estados de Registro
```tsx
const statusVariants = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
}
```

---

## 📊 Tablas (Diseño Estándar)

```tsx
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Columna
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
          Contenido
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Reglas:**
- ✅ `overflow-x-auto` en contenedor para scroll horizontal
- ✅ Header con fondo diferenciado
- ✅ Texto uppercase en headers
- ✅ Hover effect en filas
- ✅ Padding consistente: `px-4 py-3`

---

## 🔘 Inputs y Formularios

### Input de Texto
```tsx
<input
  type="text"
  className="
    w-full px-4 py-2
    border border-slate-300 dark:border-slate-600
    rounded-lg
    bg-white dark:bg-slate-900
    text-slate-900 dark:text-slate-100
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
    focus:border-blue-500 dark:focus:border-blue-400
    outline-none
    transition-all
  "
  placeholder="Placeholder..."
/>
```

### Select
```tsx
<select className="
  w-full px-4 py-2
  border border-slate-300 dark:border-slate-600
  rounded-lg
  bg-white dark:bg-slate-900
  text-slate-900 dark:text-slate-100
  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
  focus:border-blue-500 dark:focus:border-blue-400
  outline-none
  transition-all
">
  <option>Opción</option>
</select>
```

### Textarea
```tsx
<textarea className="
  w-full px-4 py-2
  border border-slate-300 dark:border-slate-600
  rounded-lg
  bg-white dark:bg-slate-900
  text-slate-900 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
  focus:border-blue-500 dark:focus:border-blue-400
  outline-none
  transition-all
  min-h-[100px]
" />
```

---

## 📱 Responsividad (OBLIGATORIO)

### Grid Responsivo
```tsx
// Cards en grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"

// Estadísticas en grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
```

### Flex Responsivo
```tsx
// Stack en móvil, row en desktop
className="flex flex-col md:flex-row gap-4"

// Ocultar en móvil
className="hidden md:block"

// Mostrar solo en móvil
className="block md:hidden"
```

### Tamaños de Fuente
```tsx
// Siempre con breakpoints
text-sm md:text-base      // Texto normal
text-base md:text-lg      // Texto grande
text-2xl md:text-3xl      // Títulos
```

---

## 🎭 Estados de Loading y Error

### Loading Spinner
```tsx
<div className="flex items-center justify-center py-12">
  <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <div className="mb-4 text-slate-300 dark:text-slate-600">
    {/* Icono grande */}
    <Icon className="w-16 h-16 mx-auto" />
  </div>
  <p className="text-slate-600 dark:text-slate-400">
    No se encontraron resultados
  </p>
</div>
```

### Error State
```tsx
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
    <AlertTriangle className="w-5 h-5" />
    <span className="font-medium">Error</span>
  </div>
  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
    {errorMessage}
  </p>
</div>
```

---

## ✅ Checklist de Validación

**ANTES de considerar un módulo completo, verificar:**

### Diseño Visual
- [ ] Container con padding responsivo `p-4 md:p-6 lg:p-8`
- [ ] Fondo degradado con modo oscuro
- [ ] Cards con `rounded-xl shadow-sm`
- [ ] Borders visibles en modo oscuro
- [ ] Todos los colores tienen variante dark

### Tipografía
- [ ] Títulos con tamaños responsivos
- [ ] Texto con modo oscuro (`text-slate-900 dark:text-slate-100`)
- [ ] Texto secundario más claro
- [ ] Font weights apropiados (bold, semibold, medium)

### Componentes
- [ ] Botones con hover states
- [ ] Inputs con focus ring
- [ ] Selects con estilos consistentes
- [ ] Badges con colores semánticos
- [ ] Tablas con hover en filas

### Responsividad
- [ ] Grid responsivo en móvil/tablet/desktop
- [ ] Texto con breakpoints
- [ ] Padding/margin responsivos
- [ ] Elementos ocultos/visibles según pantalla
- [ ] Overflow-x en tablas

### Estados
- [ ] Loading state con spinner
- [ ] Empty state con mensaje
- [ ] Error state con color rojo
- [ ] Success state con color verde

### Modo Oscuro
- [ ] TODOS los colores tienen variante dark
- [ ] Contraste legible en modo oscuro
- [ ] Borders visibles en modo oscuro
- [ ] Hover states visibles en modo oscuro
- [ ] Focus states visibles en modo oscuro

---

## 🚫 PROHIBIDO

❌ Usar colores sin variante dark
❌ Texto sin responsividad
❌ Cards sin bordes redondeados
❌ Inputs sin focus ring
❌ Tablas sin overflow-x
❌ Grids sin breakpoints
❌ Botones sin hover states
❌ Componentes > 500 líneas
❌ Colores hardcodeados (usar Tailwind)
❌ Espaciado fijo sin responsividad

---

## 📚 Recursos

- **Template completo**: `docs/TEMPLATE-MODULO-ESTANDAR.md`
- **Componentes base**: `src/shared/components/`
- **Ejemplo perfecto**: `src/modules/proyectos/`
- **Sistema de colores**: Este documento, sección "Sistema de Colores"

---

**🎨 ¡Diseño consistente = Aplicación profesional!**
