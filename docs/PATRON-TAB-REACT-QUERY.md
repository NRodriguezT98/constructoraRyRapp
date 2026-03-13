# 🎯 PATRÓN ESTÁNDAR: Tab con React Query

**Basado en:** `negociaciones-tab.tsx` (Score: 9.8/10) ⭐
**Autor:** GitHub Copilot
**Fecha:** 5 de diciembre de 2025

---

## 📐 ARQUITECTURA OBLIGATORIA

```
src/modules/[modulo]/
├── hooks/
│   ├── use[Modulo]Query.ts          # ⭐ Query principal (React Query)
│   ├── use[Modulo]Detalle.ts        # Query de detalle (opcional)
│   └── use[Modulo]Mutation.ts       # Mutations (CREATE/UPDATE/DELETE)
├── services/
│   └── [modulo].service.ts          # Llamadas API/DB puras
└── types/
    └── index.ts                     # Tipos TypeScript

src/app/[ruta]/tabs/
├── [nombre]-tab.tsx                 # Componente presentacional
├── [nombre]-tab.styles.ts           # Estilos centralizados
└── [nombre]/                        # Subcomponentes (si > 200 líneas)
    └── components/
        ├── Card.tsx
        ├── Section.tsx
        └── Modal.tsx
```

---

## ✅ PASO A PASO: Crear Tab con React Query

### PASO 1: Crear QueryKeys (Centralizar)

**Archivo:** `src/modules/[modulo]/hooks/use[Modulo]Query.ts`

```typescript
// ============================================
// QUERY KEYS (Centralizar para invalidación)
// ============================================

export const [modulo]QueryKeys = {
  all: ['[modulo]'] as const,
  lists: () => [...[modulo]QueryKeys.all, 'list'] as const,
  list: (filtros: Record<string, any>) =>
    [...[modulo]QueryKeys.lists(), filtros] as const,
  details: () => [...[modulo]QueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...[modulo]QueryKeys.details(), id] as const,
}

// Ejemplo: negociacionesQueryKeys
export const negociacionesQueryKeys = {
  all: ['negociaciones'] as const,
  byCliente: (clienteId: string) =>
    [...negociacionesQueryKeys.all, 'cliente', clienteId] as const,
  detalle: (negociacionId: string) =>
    [...negociacionesQueryKeys.all, 'detalle', negociacionId] as const,
  fuentesPago: (negociacionId: string) =>
    ['fuentesPago', negociacionId] as const,
}
```

**Ventajas:**
- ✅ Invalidación selectiva fácil
- ✅ Type-safe
- ✅ Autocomplete en VS Code
- ✅ Evita typos en queryKeys

---

### PASO 2: Crear Service (Capa de Datos)

**Archivo:** `src/modules/[modulo]/services/[modulo].service.ts`

```typescript
import { createClient } from '@/lib/supabase/client'

export const [modulo]Service = {
  /**
   * Obtener lista completa
   */
  async obtenerTodos(filtros?: Record<string, any>) {
    const supabase = createClient()

    // ✅ Select ESPECÍFICO (NUNCA select('*'))
    let query = supabase
      .from('[tabla]')
      .select(`
        id,
        campo1,
        campo2,
        relacion:tabla_relacionada!foreign_key(
          id,
          nombre
        )
      `)

    // Aplicar filtros
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error en [modulo]Service.obtenerTodos:', error)
      throw error
    }

    return data || []
  },

  /**
   * Obtener detalle por ID
   */
  async obtenerPorId(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('[tabla]')
      .select(`
        id,
        campo1,
        campo2,
        campo_fecha,
        relacion:tabla_relacionada!foreign_key(id, nombre)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crear nuevo registro
   */
  async crear(datos: Partial<[Tipo]>) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('[tabla]')
      .insert(datos)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar registro
   */
  async actualizar(id: string, datos: Partial<[Tipo]>) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('[tabla]')
      .update(datos)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Eliminar registro
   */
  async eliminar(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('[tabla]')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
```

**Reglas:**
- ✅ Funciones puras (no state interno)
- ✅ Select específico SIEMPRE
- ✅ Error handling consistente
- ✅ Console.log para debugging
- ✅ Async/await

---

### PASO 3: Crear Hook con React Query

**Archivo:** `src/modules/[modulo]/hooks/use[Modulo]Query.ts`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { [modulo]Service } from '../services/[modulo].service'
import { [modulo]QueryKeys } from './queryKeys' // Importar keys

// ============================================
// CACHE CONFIG (ESTÁNDAR)
// ============================================

const CACHE_CONFIG = {
  // Data estática (proyectos, clientes)
  STATIC: {
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30,    // 30 minutos
  },

  // Data dinámica (abonos, negociaciones)
  DYNAMIC: {
    staleTime: 1000 * 60 * 2,  // 2 minutos
    gcTime: 1000 * 60 * 5,     // 5 minutos
  },

  // Data real-time (documentos, estado)
  REALTIME: {
    staleTime: 1000 * 30,      // 30 segundos
    gcTime: 1000 * 60 * 2,     // 2 minutos
  },
}

// ============================================
// TYPES
// ============================================

interface Use[Modulo]QueryProps {
  filtros?: Record<string, any>
  enabled?: boolean
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function use[Modulo]Query({
  filtros = {},
  enabled = true
}: Use[Modulo]QueryProps) {
  const queryClient = useQueryClient()

  // =====================================================
  // QUERY: Lista de registros
  // =====================================================

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [modulo]QueryKeys.list(filtros),
    queryFn: () => [modulo]Service.obtenerTodos(filtros),
    enabled: enabled,
    ...CACHE_CONFIG.DYNAMIC, // ✅ Usar config estándar
  })

  // =====================================================
  // COMPUTED: Estadísticas y valores derivados
  // =====================================================

  const stats = useMemo(() => ({
    total: items.length,
    activos: items.filter(i => i.estado === 'Activo').length,
    completados: items.filter(i => i.estado === 'Completado').length,
  }), [items])

  // =====================================================
  // INVALIDACIÓN DE CACHE
  // =====================================================

  /**
   * Invalidar cache de este módulo
   */
  const invalidar = useCallback(() => {
    console.log('🔄 Invalidando cache de [modulo]')
    queryClient.invalidateQueries({
      queryKey: [modulo]QueryKeys.lists()
    })
  }, [queryClient])

  /**
   * Invalidar TODO el módulo
   */
  const invalidarTodo = useCallback(() => {
    console.log('🔄 Invalidando TODO el módulo [modulo]')
    queryClient.invalidateQueries({
      queryKey: [modulo]QueryKeys.all
    })
  }, [queryClient])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Data
    items,
    stats,

    // Estados
    isLoading,
    error,

    // Acciones
    refetch,
    invalidar,
    invalidarTodo,
  }
}
```

---

### PASO 4: Hook de Detalle (Opcional)

```typescript
// ============================================
// HOOK: Detalle de registro
// ============================================

interface Use[Modulo]DetalleProps {
  id: string | null
  enabled?: boolean
}

export function use[Modulo]Detalle({
  id,
  enabled = true
}: Use[Modulo]DetalleProps) {
  const {
    data: detalle,
    isLoading,
    error,
  } = useQuery({
    queryKey: [modulo]QueryKeys.detail(id || ''),
    queryFn: () => [modulo]Service.obtenerPorId(id!),
    enabled: enabled && !!id,
    ...CACHE_CONFIG.STATIC,
  })

  return { detalle, isLoading, error }
}
```

---

### PASO 5: Mutations (CREATE/UPDATE/DELETE)

**Archivo:** `src/modules/[modulo]/hooks/use[Modulo]Mutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { [modulo]Service } from '../services/[modulo].service'
import { [modulo]QueryKeys } from './queryKeys'

// ============================================
// MUTATION: Crear
// ============================================

export function useCrear[Modulo]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: Partial<[Tipo]>) =>
      [modulo]Service.crear(datos),

    onSuccess: () => {
      console.log('✅ [Modulo] creado exitosamente')

      // Invalidar cache
      queryClient.invalidateQueries({
        queryKey: [modulo]QueryKeys.lists()
      })
    },

    onError: (error) => {
      console.error('❌ Error creando [modulo]:', error)
    },
  })
}

// ============================================
// MUTATION: Actualizar con Optimistic Update
// ============================================

export function useActualizar[Modulo]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: Partial<[Tipo]> }) =>
      [modulo]Service.actualizar(id, datos),

    // ✅ OPTIMISTIC UPDATE
    onMutate: async ({ id, datos }) => {
      // Cancelar refetch en progreso
      await queryClient.cancelQueries({
        queryKey: [modulo]QueryKeys.detail(id)
      })

      // Snapshot del valor anterior
      const previous = queryClient.getQueryData([modulo]QueryKeys.detail(id))

      // Actualizar optimistamente
      queryClient.setQueryData([modulo]QueryKeys.detail(id), (old: any) => ({
        ...old,
        ...datos,
      }))

      return { previous }
    },

    // Si falla, revertir
    onError: (err, { id }, context) => {
      console.error('❌ Error actualizando:', err)
      queryClient.setQueryData(
        [modulo]QueryKeys.detail(id),
        context?.previous
      )
    },

    // Refetch final
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [modulo]QueryKeys.detail(id)
      })
      queryClient.invalidateQueries({
        queryKey: [modulo]QueryKeys.lists()
      })
    },
  })
}

// ============================================
// MUTATION: Eliminar
// ============================================

export function useEliminar[Modulo]() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => [modulo]Service.eliminar(id),

    onSuccess: () => {
      console.log('✅ [Modulo] eliminado')
      queryClient.invalidateQueries({
        queryKey: [modulo]QueryKeys.all
      })
    },
  })
}
```

---

### PASO 6: Componente Tab (Presentacional Puro)

**Archivo:** `src/app/[ruta]/tabs/[nombre]-tab.tsx`

```tsx
'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Tab de [Modulo] - Patrón React Query
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - TODA la lógica está en use[Modulo]Query hook
 * - Este componente SOLO renderiza UI
 */

import { AnimatePresence } from 'framer-motion'
import { Plus, AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { use[Modulo]Query, use[Modulo]Detalle } from '@/modules/[modulo]/hooks'
import { LoadingState, EmptyState } from '@/shared/components/layout'

interface [Modulo]TabProps {
  entidadId: string
}

export function [Modulo]Tab({ entidadId }: [Modulo]TabProps) {
  // =====================================================
  // REACT QUERY HOOKS (Separación de Responsabilidades)
  // =====================================================

  const { items, stats, isLoading, invalidar } = use[Modulo]Query({
    filtros: { entidad_id: entidadId },
  })

  // =====================================================
  // ESTADO LOCAL (Solo UI - Modal y vista activa)
  // =====================================================

  const [itemActivo, setItemActivo] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // =====================================================
  // REACT QUERY: Detalle de item activo
  // =====================================================

  const { detalle, isLoading: isLoadingDetalle } = use[Modulo]Detalle({
    id: itemActivo,
    enabled: !!itemActivo,
  })

  // =====================================================
  // HANDLERS (Solo navegación y cambios de vista)
  // =====================================================

  const verDetalle = (id: string) => {
    setItemActivo(id)
  }

  const volverALista = () => {
    setItemActivo(null)
  }

  const abrirModal = () => {
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false)
  }

  // =====================================================
  // RENDER: Loading State
  // =====================================================

  if (isLoading) {
    return <LoadingState message="Cargando [modulo]..." />
  }

  // =====================================================
  // RENDER: Vista Detallada (si hay item activo)
  // =====================================================

  if (itemActivo && detalle) {
    return (
      <div className="space-y-4">
        {/* Header con botón volver */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{detalle.nombre}</h3>
          <button onClick={volverALista} className="btn-secondary">
            Volver a la lista
          </button>
        </div>

        {/* Contenido del detalle */}
        {isLoadingDetalle ? (
          <LoadingState message="Cargando detalles..." />
        ) : (
          <div className="space-y-3">
            {/* ... renderizar detalle ... */}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // RENDER: Vista de Lista
  // =====================================================

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">[Modulo] ({stats.total})</h3>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-green-600">{stats.activos} Activos</span>
            <span className="text-gray-400">•</span>
            <span className="text-blue-600">{stats.completados} Completados</span>
          </div>
        </div>

        <button onClick={abrirModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Crear Nuevo
        </button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-12 h-12 text-gray-400" />}
          title="Sin registros"
          description="No hay [modulo] registrados todavía."
        />
      ) : (
        <div className="space-y-2">
          {/* Lista de items */}
          {items.map((item) => (
            <div key={item.id} onClick={() => verDetalle(item.id)}>
              {/* ... renderizar card ... */}
            </div>
          ))}
        </div>
      )}

      {/* Modal (si aplica) */}
      <AnimatePresence>
        {showModal && (
          <Modal isOpen={showModal} onClose={cerrarModal}>
            {/* ... formulario ... */}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## 🎯 REGLAS DE ORO

### ✅ SIEMPRE HACER

1. **QueryKeys centralizados** en objeto separado
2. **Service layer puro** (sin estado, solo async functions)
3. **Select específico** (NUNCA `select('*')`)
4. **Cache config estándar** (STATIC/DYNAMIC/REALTIME)
5. **Enabled flag** en queries condicionales
6. **Optimistic updates** en mutations importantes
7. **Console.log** para debugging
8. **TypeScript estricto** (no `any`)
9. **Componente < 200 líneas** (dividir si excede)
10. **Invalidación selectiva** (no invalidar todo)

### ❌ NUNCA HACER

1. **NUNCA llamadas directas a Supabase en componentes**
2. **NUNCA `useState` + `useEffect` para fetching**
3. **NUNCA `select('*')`**
4. **NUNCA queries sin `staleTime`/`gcTime`**
5. **NUNCA lógica de negocio en `.tsx`**
6. **NUNCA mutations sin invalidar cache**
7. **NUNCA `router.refresh()` (usar invalidación)**
8. **NUNCA componentes > 200 líneas sin dividir**

---

## 📊 CHECKLIST DE VALIDACIÓN

Antes de aprobar un tab como "completo":

- [ ] **QueryKeys centralizados** en objeto exportado
- [ ] **Service con select específico** (no `select('*')`)
- [ ] **Hook con React Query** (`useQuery`/`useMutation`)
- [ ] **Cache config definido** (staleTime + gcTime)
- [ ] **Enabled flag** en queries condicionales
- [ ] **Invalidación correcta** en mutations
- [ ] **Componente presentacional** (< 200 líneas)
- [ ] **No hay lógica de negocio** en `.tsx`
- [ ] **TypeScript sin `any`**
- [ ] **Dark mode completo**
- [ ] **Loading/Error states**
- [ ] **Console.log para debugging**
- [ ] **Probado con React Query DevTools**

---

## 🔍 DEBUGGING CON REACT QUERY DEVTOOLS

```typescript
// src/app/layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ✅ DevTools solo en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Ventajas:**
- 🔍 Ver todas las queries activas
- ⏱️ Ver tiempo de cache (stale/fresh)
- 🔄 Refetch manual para testing
- 📊 Ver tamaño de data en cache
- 🐛 Detectar queries duplicadas

---

## 📚 EJEMPLOS DE REFERENCIA

### ✅ PERFECTO: negociaciones-tab.tsx

- **Ubicación:** `src/app/clientes/[id]/tabs/negociaciones-tab.tsx`
- **Score:** 9.8/10 ⭐
- **QueryKeys:** Centralizados
- **Service:** Select específico
- **Cache:** DYNAMIC (2min stale)
- **Mutations:** Con invalidación
- **Componente:** Organizado (536 líneas, pero modularizado)

### ✅ EXCELENTE: historial-tab.tsx

- **Ubicación:** `src/app/clientes/[id]/tabs/historial-tab.tsx`
- **Score:** 9.3/10
- **Componente:** Orquestador perfecto (< 100 líneas)
- **Subcomponentes:** Extraídos en carpeta
- **Hook:** `useHistorialCliente` completo
- **Cache:** DYNAMIC (5min stale)

### ⚠️ MEJORAR: intereses-tab.tsx

- **Problema:** Sin React Query
- **Solución:** Seguir este patrón
- **Estimado:** 2 horas

---

**Autor:** GitHub Copilot (Claude Sonnet 4.5)
**Fecha:** 5 de diciembre de 2025
**Versión:** 1.0.0
