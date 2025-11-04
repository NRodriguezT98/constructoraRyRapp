# 📐 TEMPLATE DE MÓDULO ESTANDARIZADO

## 📋 Estructura de Carpetas

```
src/modules/[nombre-modulo]/
├── components/
│   ├── [Nombre]View.tsx           # ✅ Componente principal
│   ├── tabs/                      # (opcional si usa tabs)
│   │   ├── [nombre]-tab.tsx
│   │   └── index.ts
│   └── index.ts                   # Barrel export
├── hooks/
│   ├── use[Nombre].ts             # ✅ Hook principal
│   └── index.ts
├── services/
│   └── [nombre].service.ts        # ✅ Lógica API/DB
├── types/
│   └── index.ts                   # ✅ Tipos TypeScript
└── styles/
    └── classes.ts                 # (opcional)
```

---

## 📄 TEMPLATE: Componente Principal

**Ubicación**: `src/modules/ejemplo/components/EjemploView.tsx`

```typescript
/**
 * EjemploView - Vista principal del módulo Ejemplo
 *
 * CUMPLE ESTÁNDARES:
 * ✅ Usa ModuleContainer para contenedor
 * ✅ Usa ModuleHeader para encabezado
 * ✅ Usa Card para secciones
 * ✅ Usa Button para acciones
 * ✅ Usa Badge para etiquetas
 * ✅ Usa LoadingState, EmptyState, ErrorState
 * ✅ Separación: lógica en hook, UI aquí
 * ✅ Modo oscuro en todos los componentes
 * ✅ Responsive design
 */

'use client'

import { Plus, Filter, Download } from 'lucide-react'
import {
  ModuleContainer,
  ModuleHeader,
  Card,
  Button,
  Badge,
  LoadingState,
  EmptyState,
  ErrorState,
} from '@/shared/components/layout'
import { useEjemplo } from '../hooks'

export function EjemploView() {
  const {
    // Estado
    items,
    loading,
    error,

    // Filtros
    filtros,
    setFiltros,

    // Acciones
    crearItem,
    actualizarItem,
    eliminarItem,

    // Paginación
    paginacion,
    irAPagina,
  } = useEjemplo()

  // Estado de carga
  if (loading) {
    return (
      <ModuleContainer>
        <LoadingState message="Cargando datos..." />
      </ModuleContainer>
    )
  }

  // Estado de error
  if (error) {
    return (
      <ModuleContainer>
        <ErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      </ModuleContainer>
    )
  }

  return (
    <ModuleContainer maxWidth="2xl">
      {/* Header con acciones */}
      <ModuleHeader
        title="Gestión de Ejemplos"
        description="Administra todos los ejemplos del sistema"
        icon={<Plus size={32} />}
        actions={
          <>
            <Button
              variant="ghost"
              size="md"
              icon={<Filter size={20} />}
              onClick={() => {/* Abrir filtros */}}
            >
              Filtros
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Download size={20} />}
              onClick={() => {/* Exportar */}}
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={20} />}
              onClick={crearItem}
            >
              Crear Ejemplo
            </Button>
          </>
        }
      />

      {/* Estadísticas (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card padding="md">
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Total
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {items.length}
            </p>
          </div>
        </Card>
        {/* Más tarjetas de estadísticas... */}
      </div>

      {/* Contenido principal */}
      <Card padding="none">
        {items.length === 0 ? (
          <EmptyState
            icon={<Plus size={48} />}
            title="No hay ejemplos"
            description="Crea tu primer ejemplo para comenzar"
            action={
              <Button
                variant="primary"
                onClick={crearItem}
                icon={<Plus size={20} />}
              >
                Crear Ejemplo
              </Button>
            }
          />
        ) : (
          <>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {item.nombre}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <Badge variant="success" size="sm">
                          {item.estado}
                        </Badge>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actualizarItem(item.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarItem(item.id)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación (si aplica) */}
            {paginacion.total > paginacion.limite && (
              <div className="px-4 md:px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Mostrando {paginacion.inicio} - {paginacion.fin} de {paginacion.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={paginacion.paginaActual === 1}
                      onClick={() => irAPagina(paginacion.paginaActual - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={paginacion.paginaActual === paginacion.totalPaginas}
                      onClick={() => irAPagina(paginacion.paginaActual + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </ModuleContainer>
  )
}
```

---

## 🪝 TEMPLATE: Hook Principal

**Ubicación**: `src/modules/ejemplo/hooks/useEjemplo.ts`

```typescript
/**
 * useEjemplo - Hook principal del módulo Ejemplo
 *
 * RESPONSABILIDADES:
 * - Estado del módulo
 * - Lógica de negocio
 * - Filtros y búsqueda
 * - Paginación
 * - Comunicación con servicio
 *
 * SEPARACIÓN: Toda la lógica está aquí, NO en el componente
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { ejemploService } from '../services/ejemplo.service'
import type { Ejemplo, FiltrosEjemplo } from '../types'

export function useEjemplo() {
  // ==================== ESTADO ====================
  const [items, setItems] = useState<Ejemplo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosEjemplo>({
    busqueda: '',
    estado: 'todos',
    orden: 'recientes',
  })

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const ITEMS_POR_PAGINA = 10

  // ==================== CARGAR DATOS ====================
  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await ejemploService.obtenerEjemplos(filtros)
      setItems(data)
    } catch (err) {
      console.error('Error cargando ejemplos:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  // ==================== FILTROS ====================
  const itemsFiltrados = useMemo(() => {
    let resultado = [...items]

    // Búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(item =>
        item.nombre.toLowerCase().includes(busqueda)
      )
    }

    // Estado
    if (filtros.estado !== 'todos') {
      resultado = resultado.filter(item => item.estado === filtros.estado)
    }

    // Orden
    switch (filtros.orden) {
      case 'recientes':
        resultado.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'antiguos':
        resultado.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        break
      case 'nombre':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
    }

    return resultado
  }, [items, filtros])

  // ==================== PAGINACIÓN ====================
  const paginacion = useMemo(() => {
    const total = itemsFiltrados.length
    const totalPaginas = Math.ceil(total / ITEMS_POR_PAGINA)
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA + 1
    const fin = Math.min(paginaActual * ITEMS_POR_PAGINA, total)

    return {
      total,
      totalPaginas,
      paginaActual,
      inicio,
      fin,
      limite: ITEMS_POR_PAGINA,
    }
  }, [itemsFiltrados.length, paginaActual])

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA
    const fin = inicio + ITEMS_POR_PAGINA
    return itemsFiltrados.slice(inicio, fin)
  }, [itemsFiltrados, paginaActual])

  const irAPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina)
  }, [])

  // ==================== ACCIONES ====================
  const crearItem = useCallback(async (datos: Partial<Ejemplo>) => {
    try {
      const nuevo = await ejemploService.crearEjemplo(datos)
      setItems(prev => [nuevo, ...prev])
      return nuevo
    } catch (err) {
      console.error('Error creando ejemplo:', err)
      throw err
    }
  }, [])

  const actualizarItem = useCallback(async (id: string, datos: Partial<Ejemplo>) => {
    try {
      const actualizado = await ejemploService.actualizarEjemplo(id, datos)
      setItems(prev => prev.map(item =>
        item.id === id ? actualizado : item
      ))
      return actualizado
    } catch (err) {
      console.error('Error actualizando ejemplo:', err)
      throw err
    }
  }, [])

  const eliminarItem = useCallback(async (id: string) => {
    try {
      await ejemploService.eliminarEjemplo(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Error eliminando ejemplo:', err)
      throw err
    }
  }, [])

  // ==================== RETORNO ====================
  return {
    // Estado
    items: itemsPaginados,
    loading,
    error,

    // Filtros
    filtros,
    setFiltros,

    // Paginación
    paginacion,
    irAPagina,

    // Acciones
    crearItem,
    actualizarItem,
    eliminarItem,

    // Utilidades
    recargar: cargarDatos,
  }
}
```

---

## 📡 TEMPLATE: Servicio

**Ubicación**: `src/modules/ejemplo/services/ejemplo.service.ts`

```typescript
/**
 * EjemploService - Servicio para gestión de ejemplos
 *
 * RESPONSABILIDADES:
 * - Comunicación con Supabase
 * - Queries y mutaciones
 * - Transformación de datos
 * - Auditoría (si aplica)
 */

import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'
import type { Ejemplo, FiltrosEjemplo } from '../types'

class EjemploService {
  private tableName = 'ejemplos' // ✅ VERIFICAR nombre en DATABASE-SCHEMA-REFERENCE.md

  /**
   * Obtener ejemplos con filtros
   */
  async obtenerEjemplos(filtros?: FiltrosEjemplo): Promise<Ejemplo[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')

      // Aplicar filtros si existen
      if (filtros?.estado && filtros.estado !== 'todos') {
        query = query.eq('estado', filtros.estado) // ✅ VERIFICAR nombre de columna
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error obteniendo ejemplos:', error)
      throw error
    }
  }

  /**
   * Obtener ejemplo por ID
   */
  async obtenerEjemplo(id: string): Promise<Ejemplo | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error obteniendo ejemplo:', error)
      throw error
    }
  }

  /**
   * Crear ejemplo
   */
  async crearEjemplo(datos: Partial<Ejemplo>): Promise<Ejemplo> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(datos)
        .select()
        .single()

      if (error) throw error

      // ✅ AUDITORÍA
      await auditService.auditarCreacion(
        this.tableName,
        data.id,
        data,
        { modulo: 'ejemplos' }
      )

      return data
    } catch (error) {
      console.error('Error creando ejemplo:', error)
      throw error
    }
  }

  /**
   * Actualizar ejemplo
   */
  async actualizarEjemplo(id: string, datos: Partial<Ejemplo>): Promise<Ejemplo> {
    try {
      // Obtener estado anterior para auditoría
      const anterior = await this.obtenerEjemplo(id)

      const { data, error } = await supabase
        .from(this.tableName)
        .update(datos)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // ✅ AUDITORÍA
      if (anterior) {
        await auditService.auditarActualizacion(
          this.tableName,
          id,
          anterior,
          data,
          { modulo: 'ejemplos' }
        )
      }

      return data
    } catch (error) {
      console.error('Error actualizando ejemplo:', error)
      throw error
    }
  }

  /**
   * Eliminar ejemplo
   */
  async eliminarEjemplo(id: string): Promise<void> {
    try {
      // Obtener datos antes de eliminar para auditoría
      const eliminado = await this.obtenerEjemplo(id)

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      // ✅ AUDITORÍA
      if (eliminado) {
        await auditService.auditarEliminacion(
          this.tableName,
          id,
          eliminado,
          { modulo: 'ejemplos' }
        )
      }
    } catch (error) {
      console.error('Error eliminando ejemplo:', error)
      throw error
    }
  }
}

export const ejemploService = new EjemploService()
```

---

## 📝 TEMPLATE: Tipos

**Ubicación**: `src/modules/ejemplo/types/index.ts`

```typescript
/**
 * Tipos TypeScript del módulo Ejemplo
 */

export interface Ejemplo {
  id: string
  nombre: string // ✅ VERIFICAR nombres en DATABASE-SCHEMA-REFERENCE.md
  estado: EstadoEjemplo
  created_at: string
  updated_at: string
  // ... más campos
}

export type EstadoEjemplo = 'Activo' | 'Inactivo' | 'Pendiente' // ✅ VERIFICAR en ENUMS

export interface FiltrosEjemplo {
  busqueda?: string
  estado?: EstadoEjemplo | 'todos'
  orden?: 'recientes' | 'antiguos' | 'nombre'
}

export interface PaginacionEjemplo {
  total: number
  totalPaginas: number
  paginaActual: number
  inicio: number
  fin: number
  limite: number
}
```

---

## 📄 TEMPLATE: Página

**Ubicación**: `src/app/ejemplo/page.tsx`

```typescript
/**
 * Página del módulo Ejemplo
 *
 * ✅ Usa RequireView para permisos
 * ✅ Solo renderiza el componente principal
 */

import { RequireView } from '@/components/permissions/RequireView'
import { EjemploView } from '@/modules/ejemplo/components'

export default function EjemploPage() {
  return (
    <RequireView modulo="ejemplo">
      <EjemploView />
    </RequireView>
  )
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de considerar completo un módulo, verificar:

### Estructura
- [ ] Carpetas: components/, hooks/, services/, types/
- [ ] Barrel exports (index.ts) en cada carpeta
- [ ] Nombres consistentes (PascalCase para componentes, camelCase para hooks/services)

### Componentes Estandarizados
- [ ] Usa `ModuleContainer` como contenedor principal
- [ ] Usa `ModuleHeader` para encabezado
- [ ] Usa `Card` para secciones
- [ ] Usa `Button` para acciones
- [ ] Usa `Badge` para etiquetas
- [ ] Usa `LoadingState` para carga
- [ ] Usa `EmptyState` para vacío
- [ ] Usa `ErrorState` para errores

### Diseño
- [ ] Modo oscuro en TODOS los elementos
- [ ] Responsive: móvil, tablet, desktop
- [ ] Padding consistente (p-4 md:p-6 lg:p-8)
- [ ] Bordes redondeados (rounded-xl)
- [ ] Sombras sutiles (shadow-sm)
- [ ] Transiciones suaves (transition-*)
- [ ] Hover states en elementos interactivos

### Lógica
- [ ] Hook separado con toda la lógica
- [ ] Componente solo renderiza UI
- [ ] useMemo para valores calculados
- [ ] useCallback para funciones
- [ ] 'use client' en archivos que usan hooks

### Base de Datos
- [ ] Nombres de tablas verificados en `DATABASE-SCHEMA-REFERENCE.md`
- [ ] Nombres de columnas verificados
- [ ] Estados/enums verificados
- [ ] Auditoría implementada (CREATE, UPDATE, DELETE)

### TypeScript
- [ ] Tipos estrictos (no `any`)
- [ ] Interfaces para todos los datos
- [ ] Props tipadas en componentes

### Permisos
- [ ] Módulo agregado a tipo `Modulo`
- [ ] Permisos en `PERMISOS_POR_ROL`
- [ ] Descripción en `DESCRIPCION_PERMISOS`
- [ ] RequireView en página

### Navegación
- [ ] Ruta agregada al sidebar
- [ ] Icono apropiado
- [ ] Color consistente

---

## 🚫 ERRORES COMUNES A EVITAR

1. ❌ **Lógica en componente** → ✅ Toda lógica va en hook
2. ❌ **Strings largos de Tailwind inline** → ✅ Usar componentes estandarizados
3. ❌ **Asumir nombres de campos DB** → ✅ Verificar en `DATABASE-SCHEMA-REFERENCE.md`
4. ❌ **Olvidar modo oscuro** → ✅ dark:* en TODOS los elementos
5. ❌ **No responsive** → ✅ md:* lg:* en dimensiones
6. ❌ **Sin estados de carga/error** → ✅ Usar LoadingState/ErrorState
7. ❌ **Sin auditoría** → ✅ Implementar en CREATE/UPDATE/DELETE
8. ❌ **Componente > 150 líneas** → ✅ Dividir en subcomponentes

---

## 🎯 PRÓXIMOS PASOS

1. Copiar este template al crear un nuevo módulo
2. Reemplazar "Ejemplo" con el nombre real del módulo
3. Verificar nombres de campos en `DATABASE-SCHEMA-REFERENCE.md`
4. Implementar lógica específica en hook
5. Usar componentes estandarizados
6. Validar con checklist completo
7. Probar en móvil, tablet y desktop
8. Probar modo oscuro y claro
