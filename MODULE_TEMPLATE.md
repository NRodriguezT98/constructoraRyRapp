# Template: Nuevo Módulo

> Plantilla para crear un nuevo módulo siguiendo la arquitectura estándar

## 📋 Checklist de Creación

### 1. Estructura de Carpetas

```bash
src/modules/[nombre-modulo]/
├── components/
├── hooks/
├── services/
├── store/
├── types/
├── constants/
├── styles/
└── README.md
```

### 2. Tipos (`types/index.ts`)

```typescript
/**
 * Tipos del módulo [NombreModulo]
 */

// Tipo principal de la entidad
export interface [NombreEntidad] {
  id: string
  nombre: string
  descripcion?: string
  estado: [NombreEntidad]Estado
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Estados posibles
export type [NombreEntidad]Estado = 'activo' | 'inactivo' | 'pendiente'

// Formulario (sin id, sin fechas)
export interface [NombreEntidad]FormData {
  nombre: string
  descripcion?: string
  estado: [NombreEntidad]Estado
}

// Filtros
export interface [NombreEntidad]Filtros {
  search?: string
  estado?: [NombreEntidad]Estado
}

// Vista (grid, list, etc)
export type [NombreEntidad]Vista = 'grid' | 'list'
```

### 3. Constantes (`constants/index.ts`)

```typescript
import type { [NombreEntidad]Estado } from '../types'

/**
 * Constantes del módulo [NombreModulo]
 */

// Colores por estado
export const ESTADO_COLORS: Record<[NombreEntidad]Estado, string> = {
  activo: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
  inactivo: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  pendiente: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
}

// Labels por estado
export const ESTADO_LABELS: Record<[NombreEntidad]Estado, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  pendiente: 'Pendiente',
}

// Valores por defecto
export const [NOMBRE_ENTIDAD]_DEFAULTS = {
  ESTADO_INICIAL: 'activo' as [NombreEntidad]Estado,
  ITEMS_POR_PAGINA: 12,
  VISTA_INICIAL: 'grid' as [NombreEntidad]Vista,
}

// Límites y validaciones
export const [NOMBRE_ENTIDAD]_LIMITES = {
  NOMBRE_MIN: 3,
  NOMBRE_MAX: 100,
  DESCRIPCION_MAX: 500,
}

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  stagger: 0.1,
  duration: 0.3,
}
```

### 4. Store (`store/[nombre].store.ts`)

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { [NombreEntidad], [NombreEntidad]Filtros, [NombreEntidad]Vista } from '../types'

interface [NombreModulo]Store {
  // Estado
  items: [NombreEntidad][]
  filtros: [NombreEntidad]Filtros
  vista: [NombreEntidad]Vista
  isLoading: boolean
  error: string | null

  // Acciones - Items
  setItems: (items: [NombreEntidad][]) => void
  addItem: (item: [NombreEntidad]) => void
  updateItem: (id: string, updates: Partial<[NombreEntidad]>) => void
  deleteItem: (id: string) => void

  // Acciones - Filtros
  setFiltros: (filtros: Partial<[NombreEntidad]Filtros>) => void
  resetFiltros: () => void

  // Acciones - Vista
  setVista: (vista: [NombreEntidad]Vista) => void

  // Acciones - Estado
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void

  // Reset
  reset: () => void
}

const initialState = {
  items: [],
  filtros: {},
  vista: 'grid' as [NombreEntidad]Vista,
  isLoading: false,
  error: null,
}

export const use[NombreModulo]Store = create<[NombreModulo]Store>()(
  persist(
    (set) => ({
      ...initialState,

      // Items
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      // Filtros
      setFiltros: (filtros) =>
        set((state) => ({
          filtros: { ...state.filtros, ...filtros },
        })),
      resetFiltros: () => set({ filtros: {} }),

      // Vista
      setVista: (vista) => set({ vista }),

      // Estado
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: '[nombre-modulo]-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        vista: state.vista,
        filtros: state.filtros,
      }),
    }
  )
)
```

### 5. Service (`services/[nombre].service.ts`)

```typescript
import type { [NombreEntidad], [NombreEntidad]FormData } from '../types'
import { delay } from '@/shared/utils'

/**
 * Servicio para operaciones CRUD de [NombreEntidad]
 *
 * TODO: Conectar con Supabase
 */

class [NombreModulo]Service {
  // Simulación temporal con localStorage
  private STORAGE_KEY = '[nombre-modulo]'

  private getItems(): [NombreEntidad][] {
    const data = localStorage.getItem(this.STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveItems(items: [NombreEntidad][]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
  }

  async getAll(): Promise<[NombreEntidad][]> {
    await delay(500) // Simular latencia
    return this.getItems()
  }

  async getById(id: string): Promise<[NombreEntidad] | null> {
    await delay(300)
    const items = this.getItems()
    return items.find((item) => item.id === id) || null
  }

  async create(data: [NombreEntidad]FormData): Promise<[NombreEntidad]> {
    await delay(800)
    const items = this.getItems()

    const newItem: [NombreEntidad] = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    items.push(newItem)
    this.saveItems(items)

    return newItem
  }

  async update(id: string, data: Partial<[NombreEntidad]FormData>): Promise<[NombreEntidad]> {
    await delay(800)
    const items = this.getItems()

    const index = items.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('[NombreEntidad] no encontrado')

    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date(),
    }

    items[index] = updatedItem
    this.saveItems(items)

    return updatedItem
  }

  async delete(id: string): Promise<void> {
    await delay(500)
    const items = this.getItems()
    const filtered = items.filter((item) => item.id !== id)
    this.saveItems(filtered)
  }

  async updateEstado(id: string, estado: [NombreEntidad]Estado): Promise<[NombreEntidad]> {
    return this.update(id, { estado })
  }
}

export const [nombre]Service = new [NombreModulo]Service()
```

### 6. Hooks (`hooks/use[NombreModulo].ts`)

```typescript
import { useEffect, useCallback } from 'react'
import { use[NombreModulo]Store } from '../store/[nombre].store'
import { [nombre]Service } from '../services/[nombre].service'
import type { [NombreEntidad], [NombreEntidad]FormData } from '../types'

/**
 * Hook principal para gestionar [NombreModulo]
 */
export function use[NombreModulo]() {
  const {
    items,
    filtros,
    vista,
    isLoading,
    error,
    setItems,
    addItem,
    updateItem: updateItemStore,
    deleteItem: deleteItemStore,
    setLoading,
    setError,
  } = use[NombreModulo]Store()

  // Cargar items al montar
  useEffect(() => {
    loadItems()
  }, [])

  // Cargar todos los items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await [nombre]Service.getAll()
      setItems(data)
    } catch (err) {
      setError('Error al cargar [nombre-modulo]')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [setItems, setLoading, setError])

  // Crear item
  const createItem = useCallback(
    async (data: [NombreEntidad]FormData) => {
      try {
        setLoading(true)
        setError(null)
        const newItem = await [nombre]Service.create(data)
        addItem(newItem)
        return newItem
      } catch (err) {
        setError('Error al crear [nombre-entidad]')
        console.error(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addItem, setLoading, setError]
  )

  // Actualizar item
  const updateItem = useCallback(
    async (id: string, data: Partial<[NombreEntidad]FormData>) => {
      try {
        setLoading(true)
        setError(null)
        const updated = await [nombre]Service.update(id, data)
        updateItemStore(id, updated)
        return updated
      } catch (err) {
        setError('Error al actualizar [nombre-entidad]')
        console.error(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [updateItemStore, setLoading, setError]
  )

  // Eliminar item
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)
        await [nombre]Service.delete(id)
        deleteItemStore(id)
      } catch (err) {
        setError('Error al eliminar [nombre-entidad]')
        console.error(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [deleteItemStore, setLoading, setError]
  )

  return {
    // Estado
    items,
    filtros,
    vista,
    isLoading,
    error,

    // Acciones
    loadItems,
    createItem,
    updateItem,
    deleteItem,
  }
}

/**
 * Hook para filtrar items
 */
export function use[NombreModulo]Filtrados() {
  const { items, filtros } = use[NombreModulo]Store()

  return items.filter((item) => {
    // Filtro por búsqueda
    if (filtros.search) {
      const searchLower = filtros.search.toLowerCase()
      const matchSearch =
        item.nombre.toLowerCase().includes(searchLower) ||
        item.descripcion?.toLowerCase().includes(searchLower)
      if (!matchSearch) return false
    }

    // Filtro por estado
    if (filtros.estado && item.estado !== filtros.estado) {
      return false
    }

    return true
  })
}

/**
 * Hook para gestionar vista
 */
export function useVista[NombreModulo]() {
  const { vista, setVista } = use[NombreModulo]Store()

  const toggleVista = useCallback(() => {
    setVista(vista === 'grid' ? 'list' : 'grid')
  }, [vista, setVista])

  return {
    vista,
    setVista,
    toggleVista,
    isGrid: vista === 'grid',
    isList: vista === 'list',
  }
}
```

### 7. Componentes

#### Página Principal (`components/[nombre]-page.tsx`)

```typescript
'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { staggerContainer } from '@/shared'
import { use[NombreModulo], use[NombreModulo]Filtrados } from '../hooks/use[NombreModulo]'
import { PageHeader } from './page-header'
import { SearchBar } from './search-bar'
import { Lista[NombreEntidad] } from './lista-[nombre-entidad]'
import { EmptyState } from './empty-state'

export function [NombreModulo]Page() {
  const { isLoading } = use[NombreModulo]()
  const itemsFiltrados = use[NombreModulo]Filtrados()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <PageHeader
          title="[Nombre Módulo]"
          description="Gestiona [nombre-modulo]"
          action={{
            label: 'Nuevo [Nombre Entidad]',
            icon: Plus,
            onClick: () => {/* TODO: abrir modal */},
          }}
        />

        <SearchBar />

        {isLoading ? (
          <div>Cargando...</div>
        ) : itemsFiltrados.length === 0 ? (
          <EmptyState />
        ) : (
          <Lista[NombreEntidad] items={itemsFiltrados} />
        )}
      </motion.div>
    </div>
  )
}
```

### 8. Página de Next.js (`app/(dashboard)/[nombre-modulo]/page.tsx`)

```typescript
import { [NombreModulo]Page } from '@/modules/[nombre-modulo]/components/[nombre]-page'

export default function Page() {
  return <[NombreModulo]Page />
}
```

### 9. README del Módulo

````markdown
# Módulo: [Nombre Módulo]

> Descripción del módulo

## Funcionalidades

- ✅ Listar [nombre-entidad]
- ✅ Crear nuevo [nombre-entidad]
- ✅ Editar [nombre-entidad]
- ✅ Eliminar [nombre-entidad]
- ✅ Filtrar por estado
- ✅ Búsqueda
- ✅ Cambiar vista (grid/list)

## Estructura

- `components/`: Componentes UI
- `hooks/`: Lógica de negocio
- `services/`: Comunicación API/DB
- `store/`: Estado global (Zustand)
- `types/`: Tipos TypeScript
- `constants/`: Configuración
- `styles/`: Animaciones y clases

## Uso

```typescript
import { use[NombreModulo] } from '@/modules/[nombre-modulo]/hooks'

function MyComponent() {
  const { items, createItem, isLoading } = use[NombreModulo]()

  // ...
}
```
````

## TODO

- [ ] Conectar con Supabase
- [ ] Añadir paginación
- [ ] Implementar exportación
- [ ] Tests unitarios

```

---

## 🚀 Pasos para Usar este Template

1. **Buscar y Reemplazar**:
   - `[nombre-modulo]` → nombre real (ej: `viviendas`)
   - `[NombreModulo]` → PascalCase (ej: `Viviendas`)
   - `[NombreEntidad]` → entidad principal (ej: `Vivienda`)
   - `[nombre-entidad]` → entidad lowercase (ej: `vivienda`)
   - `[NOMBRE_ENTIDAD]` → entidad uppercase (ej: `VIVIENDA`)

2. **Crear estructura de carpetas**

3. **Copiar y adaptar archivos** del template

4. **Personalizar tipos** según necesidades del módulo

5. **Implementar lógica específica** del módulo

6. **Probar** en la aplicación

---

**Ejemplo real**: Ver `src/modules/proyectos/` para referencia completa
```
