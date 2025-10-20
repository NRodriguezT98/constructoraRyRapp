# Arquitectura de la Aplicación - RyR Constructora

## 📐 Visión General

Sistema de gestión administrativa modular construido con Next.js 14, TypeScript, Supabase y Tailwind CSS. Arquitectura basada en **separación de responsabilidades** y **reutilización de código**.

## 🏗️ Estructura del Proyecto

```
constructoraRyR-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Landing page
│   └── (dashboard)/         # Grupo de rutas protegidas
│       ├── layout.tsx       # Layout del dashboard
│       ├── proyectos/       # Módulo proyectos
│       ├── viviendas/       # Módulo viviendas
│       ├── clientes/        # Módulo clientes
│       ├── abonos/          # Módulo abonos
│       ├── renuncias/       # Módulo renuncias
│       └── admin/           # Panel de administración
│
├── src/
│   ├── shared/              # Recursos globales compartidos
│   │   ├── hooks/          # Custom hooks
│   │   ├── constants/      # Configuraciones
│   │   ├── types/          # Tipos TypeScript
│   │   ├── utils/          # Utilidades
│   │   ├── styles/         # Animaciones y clases
│   │   └── components/     # Componentes UI
│   │
│   └── modules/            # Módulos de la aplicación
│       └── [modulo]/       # Estructura por módulo
│           ├── components/ # Componentes del módulo
│           ├── hooks/      # Hooks específicos
│           ├── services/   # Servicios (API, DB)
│           ├── store/      # Estado (Zustand)
│           ├── types/      # Tipos del módulo
│           ├── constants/  # Constantes
│           ├── styles/     # Estilos/animaciones
│           └── README.md   # Documentación
│
├── components/             # Componentes legacy (migrar)
├── lib/                   # Configuraciones
└── public/               # Recursos estáticos
```

## 🎯 Principios de Arquitectura

### 1. Separación de Responsabilidades

Cada aspecto del código tiene su lugar específico:

- **Componentes**: Solo UI y presentación
- **Hooks**: Lógica de negocio y efectos
- **Services**: Comunicación con APIs/DB
- **Store**: Estado global
- **Utils**: Funciones puras reutilizables
- **Constants**: Configuración centralizada

### 2. Reutilización de Código

- **Shared**: Recursos usados por múltiples módulos
- **Module-specific**: Recursos específicos de un módulo
- **DRY (Don't Repeat Yourself)**: Evitar duplicación

### 3. Modularidad

Cada módulo es independiente y autocontenido:

```
modules/proyectos/
├── components/       # UI específica
├── hooks/           # Lógica del módulo
├── services/        # CRUD operations
├── store/           # Estado del módulo
└── types/           # Tipos específicos
```

### 4. Type Safety

TypeScript en todo el proyecto:

- Tipos compartidos en `shared/types/`
- Tipos específicos en cada módulo
- Validación con Zod en formularios

### 5. Performance

- Code splitting automático con Next.js
- Lazy loading de componentes pesados
- Memoización con `useMemo`/`useCallback`
- Optimización de re-renders

## 📦 Módulos

### Estructura Estándar de un Módulo

```typescript
modules/[nombre-modulo]/
├── components/
│   ├── [modulo]-page.tsx           # Página principal
│   ├── lista-[items].tsx           # Lista de items
│   ├── [item]-card.tsx             # Card individual
│   ├── [item]-form.tsx             # Formulario
│   ├── empty-state.tsx             # Estado vacío
│   ├── search-bar.tsx              # Búsqueda
│   └── page-header.tsx             # Header
│
├── hooks/
│   ├── use[Modulo].ts              # Hook principal
│   ├── use[Modulo]Filtrados.ts     # Hook de filtrado
│   └── useVista[Modulo].ts         # Hook de vista
│
├── services/
│   └── [modulo].service.ts         # CRUD operations
│
├── store/
│   └── [modulo].store.ts           # Zustand store
│
├── types/
│   └── index.ts                    # Tipos del módulo
│
├── constants/
│   └── index.ts                    # Constantes
│
├── styles/
│   ├── animations.ts               # Framer Motion
│   └── classes.ts                  # Tailwind classes
│
└── README.md                       # Documentación
```

### Flujo de Datos

```
User Interaction (Component)
    ↓
Custom Hook (useXxx)
    ↓
Service (API/DB call)
    ↓
Store (Update state)
    ↓
Component (Re-render)
```

## 🎨 UI/UX Patterns

### Componentes Atómicos

**Atoms**: Elementos básicos

```tsx
<Button />
<Input />
<Badge />
```

**Molecules**: Grupos de átomos

```tsx
<SearchBar />
<FormField />
<CardHeader />
```

**Organisms**: Componentes complejos

```tsx
<ProjectCard />
<ProjectForm />
<ProjectList />
```

**Templates**: Layouts de página

```tsx
<ProjectsPage />
<DashboardLayout />
```

### Animaciones

Todas las animaciones usando Framer Motion:

```tsx
import { fadeInUp, staggerContainer } from '@/shared'

<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
>
```

### Temas

Sistema de temas con `next-themes`:

```tsx
// Soporte automático dark/light mode
className = 'bg-white dark:bg-gray-800'
className = 'text-gray-900 dark:text-white'
```

## 🔧 Stack Tecnológico

### Core

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **React 18**: UI library

### Styling

- **Tailwind CSS**: Utility-first CSS
- **Framer Motion**: Animaciones
- **CSS Variables**: Temas dinámicos

### State Management

- **Zustand**: Estado global ligero
- **React Hook Form**: Formularios
- **Zod**: Validación de esquemas

### Backend

- **Supabase**: BaaS (PostgreSQL + Auth + Storage)
- **Supabase Realtime**: Sincronización en tiempo real

### UI Components

- **Radix UI**: Componentes accesibles
- **Lucide React**: Iconos
- **date-fns**: Manejo de fechas

## 📝 Convenciones de Código

### Nomenclatura

**Archivos**:

```
PascalCase: Component.tsx, Page.tsx
camelCase: utils.ts, helpers.ts
kebab-case: proyecto-card.tsx, empty-state.tsx
```

**Variables y Funciones**:

```typescript
// camelCase
const userName = 'John'
function getUserData() {}

// PascalCase para componentes
function UserCard() {}

// UPPER_SNAKE_CASE para constantes
const API_URL = 'https://...'
```

**Tipos**:

```typescript
// PascalCase
type UserData = {}
interface ProjectProps {}
```

### Imports

Orden de imports:

```typescript
// 1. Externos
import { useState } from 'react'
import { motion } from 'framer-motion'

// 2. Shared
import { useDebounce, formatCurrency } from '@/shared'

// 3. Módulo
import { useProyectos } from '../hooks/useProyectos'
import { ProyectoCard } from './proyecto-card'

// 4. Tipos
import type { Proyecto } from '../types'
```

### Componentes

```typescript
// ✅ Buena práctica
interface ComponentProps {
  title: string
  onSubmit: () => void
  isLoading?: boolean
}

export function Component({ title, onSubmit, isLoading = false }: ComponentProps) {
  // Hooks primero
  const [state, setState] = useState()
  const custom = useCustomHook()

  // Handlers
  const handleClick = () => {}

  // Effects
  useEffect(() => {}, [])

  // Render
  return <div>{title}</div>
}
```

### Hooks Personalizados

```typescript
// ✅ Buena práctica
export function useCustomHook() {
  const [state, setState] = useState()

  // Lógica del hook

  return {
    // Valores y funciones útiles
    state,
    updateState: setState,
    // Más propiedades...
  }
}
```

## 🚀 Workflow de Desarrollo

### Crear un Nuevo Módulo

1. **Crear estructura**:

```bash
src/modules/nombre-modulo/
├── components/
├── hooks/
├── services/
├── store/
├── types/
├── constants/
├── styles/
└── README.md
```

2. **Definir tipos** en `types/index.ts`
3. **Crear store** en `store/nombre.store.ts`
4. **Implementar service** en `services/nombre.service.ts`
5. **Crear hooks** en `hooks/useNombre.ts`
6. **Desarrollar componentes** en `components/`
7. **Crear página** en `app/(dashboard)/nombre/page.tsx`

### Agregar una Feature

1. **Identificar el módulo** afectado
2. **Actualizar tipos** si es necesario
3. **Modificar store** para el estado
4. **Actualizar service** para API/DB
5. **Crear/modificar hooks**
6. **Actualizar componentes**
7. **Probar en la UI**

## 🧪 Testing Strategy

### Unit Tests

- Utilidades (`utils/`)
- Hooks personalizados
- Funciones puras

### Integration Tests

- Flujos completos de usuario
- Interacción entre componentes
- Llamadas a APIs

### E2E Tests

- Flujos críticos de negocio
- Procesos completos

## 📊 Performance Optimization

### Code Splitting

```typescript
// Lazy loading de componentes
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
})
```

### Memoization

```typescript
// useMemo para cálculos costosos
const filteredData = useMemo(() => data.filter(item => item.active), [data])

// useCallback para funciones
const handleClick = useCallback(() => {
  // handler
}, [dependencies])
```

### React Server Components

```typescript
// Server Components por defecto en App Router
export default async function Page() {
  const data = await fetchData() // Fetch en el servidor
  return <ClientComponent data={data} />
}
```

## 🔒 Seguridad

### Autenticación

- Supabase Auth
- Protected routes con middleware
- Role-based access control (RBAC)

### Validación

- Input validation con Zod
- Sanitización de datos
- CSRF protection

### Auditoría

- Logs de acciones críticas
- Versionado de documentos
- Tracking de cambios

## 📈 Escalabilidad

### Horizontal

- Diseño modular permite agregar módulos fácilmente
- Shared resources evitan duplicación
- Clear separation of concerns

### Vertical

- Optimización de queries (Supabase)
- Caching strategies
- CDN para assets estáticos

## 🎓 Recursos de Aprendizaje

### Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Guías Internas

- `src/shared/README.md`: Recursos compartidos
- Cada módulo tiene su `README.md`
- Este documento (ARCHITECTURE.md)

---

**Mantenido por**: Equipo de Desarrollo RyR
**Última actualización**: Enero 2025
**Versión**: 1.0.0
