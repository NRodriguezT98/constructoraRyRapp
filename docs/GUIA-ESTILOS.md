# Guía de Estilos - RyR Constructora

## 📐 Principios de Diseño

### 1. Separación de Responsabilidades

**REGLA DE ORO**: Los componentes deben ser **presentacionales**, la lógica debe vivir en **hooks**.

```tsx
// ❌ MAL - Lógica mezclada con UI
export function MiComponente() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // ... lógica compleja
  }, [])

  const handleClick = () => {
    // ... más lógica
  }

  return <div className='rounded... bg-white p-4'>...</div>
}

// ✅ BIEN - Lógica en hook, componente solo presenta
export function MiComponente() {
  const { data, loading, handleClick } = useMiComponente()

  return <div className={styles.container}>...</div>
}
```

---

### 2. Organización de Estilos

#### **Opción A: Archivo de estilos dedicado** (Recomendado para componentes complejos)

```
components/
├── mi-componente.tsx
└── mi-componente.styles.ts
```

```typescript
// mi-componente.styles.ts
export const miComponenteStyles = {
  container: 'bg-white dark:bg-gray-800 rounded-xl p-6...',
  header: 'flex items-center justify-between mb-4...',
  title: 'text-2xl font-bold text-gray-900 dark:text-white...',
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white...',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800...',
  },
}
```

```tsx
// mi-componente.tsx
import { miComponenteStyles as styles } from './mi-componente.styles'

export function MiComponente() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Título</h1>
      </div>
    </div>
  )
}
```

#### **Opción B: Estilos compartidos de módulo** (Para componentes relacionados)

```
modules/proyectos/
├── components/
│   ├── proyecto-card.tsx
│   └── proyecto-form.tsx
└── styles/
    ├── classes.ts      ← Estilos compartidos
    └── animations.ts   ← Animaciones compartidas
```

---

### 3. Estructura de Hooks

#### **Hook personalizado por componente**

```typescript
// hooks/useMiComponente.ts
import { useState, useCallback, useMemo } from 'react'

export function useMiComponente(props) {
  // Estados
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // Computed values (useMemo para cálculos pesados)
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data]
  )

  // Handlers (useCallback para optimización)
  const handleClick = useCallback(
    () => {
      // lógica...
    },
    [
      /* dependencias */
    ]
  )

  // Effects
  useEffect(() => {
    // cargar datos...
  }, [])

  // Retornar SOLO lo necesario para el componente
  return {
    data,
    loading,
    total,
    handleClick,
  }
}
```

---

### 4. Patrones de Componentes

#### **Componente Small (< 100 líneas)**

```tsx
'use client'

import { styles } from './styles'
import { useComponente } from './hooks'

interface Props {
  data: Data
  onAction: () => void
}

export function MiComponente({ data, onAction }: Props) {
  const { estado, handler } = useComponente(data)

  return <div className={styles.container}>{/* JSX simple */}</div>
}
```

#### **Componente Medium (100-200 líneas)**

Dividir en sub-componentes:

```tsx
'use client'

import { ComponenteHeader } from './componente-header'
import { ComponenteBody } from './componente-body'
import { ComponenteFooter } from './componente-footer'

export function MiComponente(props) {
  const logic = useComponente(props)

  return (
    <div>
      <ComponenteHeader {...logic.header} />
      <ComponenteBody {...logic.body} />
      <ComponenteFooter {...logic.footer} />
    </div>
  )
}
```

#### **Componente Large (> 200 líneas)**

**¡REFACTORIZAR!** Dividir en:

- Componente contenedor (orchestrator)
- Componentes presentacionales
- Hook personalizado
- Sub-componentes

---

### 5. Convenciones de Nombres

#### **Archivos**

- Componentes: `kebab-case.tsx` → `proyecto-card.tsx`
- Hooks: `camelCase.ts` → `useProyectos.ts`
- Estilos: `kebab-case.styles.ts` → `proyecto-card.styles.ts`
- Servicios: `kebab-case.service.ts` → `proyectos.service.ts`

#### **Variables y Funciones**

```typescript
// Estados
const [isOpen, setIsOpen] = useState(false)
const [data, setData] = useState<Data[]>([])

// Computed
const totalItems = useMemo(...)
const filteredData = useMemo(...)

// Handlers
const handleClick = useCallback(...)
const handleSubmit = useCallback(...)

// Flags booleanos
const isLoading = false
const hasError = false
const canEdit = true
```

---

### 6. Organización de Imports

```tsx
// 1. React y hooks de React
import { useState, useEffect, useMemo } from 'react'

// 2. Next.js
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 3. Librerías externas
import { motion } from 'framer-motion'
import { Building2, Calendar } from 'lucide-react'

// 4. Componentes compartidos
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'

// 5. Componentes del módulo
import { ProyectoCard } from '../components/proyecto-card'

// 6. Hooks
import { useProyectos } from '../hooks/useProyectos'

// 7. Servicios
import { ProyectosService } from '../services/proyectos.service'

// 8. Tipos
import type { Proyecto } from '../types'

// 9. Estilos
import { styles } from './styles'
```

---

### 7. TypeScript Best Practices

```typescript
// ✅ Definir interfaces claras
interface ProyectoCardProps {
  proyecto: Proyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
}

// ✅ Usar tipos específicos, no 'any'
function procesarDatos(datos: Data[]): ProcessedData[]

// ✅ Tipos para handlers
type HandleClick = (event: React.MouseEvent) => void

// ✅ Tipos condicionales para props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}
```

---

### 8. Performance Optimizations

```tsx
// ✅ useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return data.reduce(...)
}, [data])

// ✅ useCallback para funciones que se pasan como props
const handleClick = useCallback(() => {
  // ...
}, [dependencies])

// ✅ React.memo para componentes que rerenderean mucho
export const MiComponente = React.memo(({ data }) => {
  return <div>...</div>
})

// ✅ Lazy loading para componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

---

### 9. Tailwind CSS Guidelines

```tsx
// ❌ Evitar strings muy largos inline
<div className="flex items-center justify-between gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">

// ✅ Usar clsx/cn para condicionales
<div className={cn(
  styles.container,
  isActive && styles.active,
  hasError && 'border-red-500'
)}>

// ✅ Extraer a constantes
const containerClasses = "flex items-center gap-4 p-6"
const cardClasses = "bg-white dark:bg-gray-800 rounded-xl"

<div className={cn(containerClasses, cardClasses)}>
```

---

### 10. Testing Considerations

```tsx
// ✅ Componentes testables
export function MiComponente({ data, onAction }: Props) {
  // Lógica en hook (fácil de testear)
  const { state } = useMiComponente(data)

  // UI pura (fácil de testear snapshot)
  return <div data-testid="mi-componente">{state}</div>
}

// ✅ Hooks testeables
export function useM iComponente(data: Data) {
  // Sin dependencias de DOM
  // Lógica pura
  return { state, actions }
}
```

---

## 📋 Checklist al Crear un Componente

- [ ] ¿La lógica está en un hook personalizado?
- [ ] ¿Los estilos están en archivo separado o constantes?
- [ ] ¿El componente tiene menos de 150 líneas?
- [ ] ¿Usa TypeScript con tipos estrictos?
- [ ] ¿Los imports están organizados?
- [ ] ¿Usa useMemo/useCallback donde corresponde?
- [ ] ¿Tiene data-testid para testing?
- [ ] ¿El nombre del archivo sigue convenciones?

---

## 🎯 Ejemplo Completo

Ver `src/modules/proyectos/components/proyecto-card.tsx` como referencia de implementación.

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd")
**Versión**: 1.0.0
