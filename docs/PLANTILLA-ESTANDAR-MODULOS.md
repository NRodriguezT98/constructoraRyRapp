# 🎯 Plantilla Estándar de Módulos - Basada en Proyectos

> **Última actualización:** 14 de noviembre de 2025
> **Versión:** 2.0 (incluye vista de tabla, confirmación de cambios, invalidación de queries)

## 📌 Principio Fundamental

> **El módulo de Proyectos es la PLANTILLA OFICIAL** para todos los nuevos módulos del sistema.
> TODO nuevo módulo (Clientes, Viviendas, Contratos, Inventario, etc.) DEBE seguir esta estructura.

**✅ LO ÚNICO QUE CAMBIA:** Colores (usando `moduleThemes`) y estructura de cards según entidad
**❌ LO QUE NO CAMBIA:** Tamaños, espaciado, fuentes, distribución, animaciones

---

## 🎨 Sistema de Colores (USAR THEMING)

**REGLA:** NUNCA hardcodear colores. SIEMPRE usar `moduleThemes[moduleName]`

```tsx
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

const theme = moduleThemes['proyectos']  // Verde/Esmeralda
const theme = moduleThemes['clientes']   // Cyan/Azul
const theme = moduleThemes['viviendas']  // Naranja/Ámbar
```

**Paleta de Colores por Módulo:**

| Módulo | Colores Principales | Gradiente Triple |
|--------|---------------------|------------------|
| **Proyectos** | Verde/Esmeralda/Teal | `from-green-600 via-emerald-600 to-teal-600` |
| **Clientes** | Cyan/Azul/Índigo | `from-cyan-600 via-blue-600 to-indigo-600` |
| **Viviendas** | Naranja/Ámbar/Amarillo | `from-orange-600 via-amber-600 to-yellow-600` |
| **Documentos** | Rojo/Rosa/Pink | `from-red-600 via-rose-600 to-pink-600` |
| **Negociaciones** | Rosa/Púrpura/Índigo | `from-pink-600 via-purple-600 to-indigo-600` |

Ver: `docs/SISTEMA-THEMING-MODULAR.md`

---

## 🔄 Tipos de Vista (NUEVO)

### Vista de Cards (Por defecto)
- Grid responsive: `md:grid-cols-2 lg:grid-cols-3`
- Cards con hover effect y animaciones
- Ideal para visualización rápida de información clave

### Vista de Tabla (Opcional)
- Componente `DataTable` genérico reutilizable
- Columnas personalizables por módulo
- Diseño compacto y alineado
- **Sistema de colores integrado** (encabezados, badges, botones)
- Sorting, filtering y paginación incluidos

**Implementación:**
```tsx
// Hook para preferencia de vista
const { vista, setVista } = useVistaPreference('proyectos') // 'cards' | 'tabla'

// Renderizado condicional
{vista === 'tabla' ? (
  <ProyectosTabla
    proyectos={proyectosFiltrados}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onView={handleView}
    canEdit={canEdit}
    canDelete={canDelete}
  />
) : (
  <ProyectosLista proyectos={proyectosFiltrados} />
)}
```

---

## 📐 Estructura de Página (ARQUITECTURA OBLIGATORIA)

### 1. **Componente Principal** (`[modulo]-page-main.tsx`)

**Tamaño:** ~350-400 líneas
**Responsabilidad:** Orquestar componentes hijos, manejo de estados y modales

```tsx
'use client'

export function [Modulo]Page({
  canCreate,
  canEdit,
  canDelete,
  canView,
  isAdmin,
}: [Modulo]PageProps) {
  // Estados locales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)

  // React Query hooks
  const { items, filtros, estadisticas } = use[Modulo]Query()

  return (
    <div className={styles.container.page}>
      <div className={styles.container.content}>
        {/* 1. HEADER */}
        <[Modulo]HeaderPremium
          totalItems={totalItems}
          onNuevo={handleAbrirModal}
          canCreate={canCreate}
        />

        {/* 2. MÉTRICAS */}
        <[Modulo]MetricasPremium estadisticas={estadisticas} />

        {/* 3. FILTROS */}
        <[Modulo]FiltrosPremium
          filtros={filtros}
          onFiltrosChange={actualizarFiltros}
        />

        {/* 4. LISTA/GRID */}
        {cargando ? (
          <[Modulo]Skeleton />
        ) : items.length === 0 ? (
          hayFiltros ? <[Modulo]NoResults /> : <[Modulo]Empty />
        ) : (
          <[Modulo]Lista items={items} />
        )}
      </div>
    </div>
  )
}
```

---

## 🎪 1. HEADER (Hero Premium Compacto)

### Especificaciones

| Propiedad | Valor Obligatorio |
|-----------|-------------------|
| **Padding** | `p-6` (24px) |
| **Border Radius** | `rounded-2xl` (16px) |
| **Gradiente** | `from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600` (triple) |
| **Altura Icono** | `w-10 h-10` (40px) |
| **Tamaño Título** | `text-2xl font-bold` |
| **Tamaño Descripción** | `text-xs` |
| **Shadow** | `shadow-2xl shadow-[COLOR]-500/20` |

### Código Referencia

```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.classes.gradient.triple} p-6 shadow-2xl`}
>
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

  <div className="relative z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Icono */}
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>

        {/* Título */}
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <p className="text-[COLOR]-100 dark:text-[COLOR]-200 text-xs">
            {totalItems} proyectos • Gestión completa
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Badge contador */}
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium">
          <Building2 className="w-3.5 h-3.5" />
          {totalItems}
        </span>

        {/* Botón primario */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme.classes.button.primary}`}
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </motion.button>
      </div>
    </div>
  </div>
</motion.div>
```

### Pattern Overlay (Grid)

**Obligatorio:** Incluir este elemento para efecto glassmorphism

```tsx
<div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
```

---

## 📊 2. MÉTRICAS (4 Cards Compactas)

### Especificaciones

| Propiedad | Valor Obligatorio |
|-----------|-------------------|
| **Grid** | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3` |
| **Padding Card** | `p-4` (16px) |
| **Border Radius** | `rounded-xl` (12px) |
| **Altura Icono** | `w-10 h-10` (40px) |
| **Tamaño Valor** | `text-xl font-bold` |
| **Tamaño Label** | `text-xs font-medium` |
| **Hover Effect** | `scale: 1.02, y: -4` |

### Código Referencia

```tsx
<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  {/* Métrica 1 */}
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
  >
    {/* Gradiente hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${theme.classes.gradient.background} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

    <div className="relative z-10 flex items-center gap-3">
      {/* Icono con gradiente */}
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.classes.gradient.primary} flex items-center justify-center shadow-lg shadow-[COLOR]-500/50`}>
        <Building2 className="w-5 h-5 text-white" />
      </div>

      {/* Valor y label */}
      <div className="flex-1">
        <p className={`text-xl font-bold bg-gradient-to-br ${theme.classes.gradient.triple} bg-clip-text text-transparent`}>
          {valor}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
          {label}
        </p>
      </div>
    </div>
  </motion.div>
</motion.div>
```

### Animaciones

- **Hover**: `scale: 1.02, y: -4`
- **Transition**: `type: 'spring', stiffness: 300`
- **Duración gradiente**: `300ms`

---

## 🔍 3. FILTROS (Sticky Horizontal Compacto)

### Especificaciones

| Propiedad | Valor Obligatorio |
|-----------|-------------------|
| **Position** | `sticky top-4 z-40` |
| **Padding** | `p-3` (12px) |
| **Border Radius** | `rounded-xl` (12px) |
| **Layout** | `flex items-center gap-2` (horizontal) |
| **Input Height** | `py-2` (8px vertical) |
| **Labels** | `sr-only` (solo accesibilidad) |
| **Backdrop** | `backdrop-blur-xl bg-white/90` |

### Código Referencia

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className={`sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border ${theme.classes.border.light} p-3 shadow-2xl`}
>
  <div className="flex items-center gap-2">
    {/* Búsqueda */}
    <div className="relative flex-1">
      <label htmlFor="buscar" className="sr-only">Buscar</label>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        id="buscar"
        type="text"
        className={`w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg ${theme.classes.focus.ring} transition-all text-sm placeholder:text-gray-400`}
        placeholder="Buscar..."
      />
    </div>

    {/* Selectores */}
    <select className={`px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg ${theme.classes.focus.ring} transition-all text-sm min-w-[180px]`}>
      <option>Todos</option>
    </select>
  </div>

  {/* Footer con contador */}
  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
      {count} resultados
    </p>
  </div>
</motion.div>
```

### Layout Horizontal (NO Grid)

❌ **PROHIBIDO:**
```tsx
<div className="grid grid-cols-3 gap-4">  // NO!
```

✅ **CORRECTO:**
```tsx
<div className="flex items-center gap-2">  // SÍ!
```

---

## 📇 4. LISTA/GRID (Responsive)

### Especificaciones Grid

| Breakpoint | Columnas |
|------------|----------|
| **Mobile** (< 640px) | 1 columna |
| **Tablet** (≥ 768px) | 2 columnas |
| **Desktop** (≥ 1024px) | 3 columnas |

### Código Referencia

```tsx
<motion.div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <[Modulo]Card item={item} moduleName={moduleName} />
    </motion.div>
  ))}
</motion.div>
```

### Animaciones de Entrada

- **Container**: `opacity: 0 → 1`
- **Items**: `opacity: 0, y: 20 → opacity: 1, y: 0`
- **Delay escalonado**: `index * 0.05` (50ms por card)

---

## 📊 5. VISTA DE TABLA (NUEVO)

### Componente Base: DataTable

**Ubicación:** `src/shared/components/table/DataTable.tsx` (genérico reutilizable)
**Wrapper por módulo:** `src/modules/[modulo]/components/[Modulo]Tabla.tsx`

### Estructura de Implementación

```tsx
/**
 * [Modulo]Tabla.tsx - Vista de tabla para [entidades]
 * ✅ Usa DataTable genérico
 * ✅ Columnas específicas del módulo
 * ✅ Diseño compacto y alineado
 * ✅ Colores del módulo aplicados
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/table/DataTable'
import { moduleThemes } from '@/shared/config/module-themes'
import type { [Entidad] } from '../types'
import { [modulo]TablaStyles as styles } from './[Modulo]Tabla.styles'

interface [Modulo]TablaProps {
  [entidades]: [Entidad][]
  onEdit?: (item: [Entidad]) => void
  onDelete?: (id: string) => void
  onView?: (item: [Entidad]) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function [Modulo]Tabla({
  [entidades],
  onEdit,
  onDelete,
  onView,
  canEdit,
  canDelete,
}: [Modulo]TablaProps) {
  const theme = moduleThemes['[modulo]']

  const columns: ColumnDef<[Entidad]>[] = [
    // ... definición de columnas
  ]

  return <DataTable columns={columns} data={[entidades]} />
}
```

### Definición de Columnas (Ejemplo: Proyectos)

#### 1. Columna con Icono (Nombre/Título)

```tsx
{
  accessorKey: 'nombre',
  header: () => <div className={styles.header.wrapper}>Proyecto</div>,
  size: 220,
  cell: ({ row }) => (
    <div className={styles.nombre.container}>
      <div className={styles.iconContainer}>
        <Building2 className={styles.iconSvg} />
      </div>
      <span className={styles.nombre.text}>
        {row.original.nombre}
      </span>
    </div>
  ),
}
```

**Estilos (con theming):**
```typescript
iconContainer: 'w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md shadow-green-500/20',
iconSvg: 'w-4 h-4 text-white',
```

#### 2. Columna con Badge de Estado

```tsx
{
  accessorKey: 'estado',
  header: () => <div className={styles.header.wrapper}>Estado</div>,
  size: 140,
  cell: ({ row }) => {
    const estado = row.original.estado
    const esCompletado = estado === 'completado'
    const esEnProceso = estado === 'en_proceso' || estado === 'en_construccion'

    return (
      <div className={styles.cell.center}>
        <div className={cn(
          styles.badge.base,
          esCompletado && styles.badge.completado,
          esEnProceso && styles.badge.enProceso,
          !esEnProceso && !esCompletado && styles.badge.default
        )}>
          {esCompletado ? (
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          ) : esEnProceso ? (
            <Clock className="w-3 h-3 flex-shrink-0" />
          ) : null}
          <span>{formatearEstado(estado)}</span>
        </div>
      </div>
    )
  },
}
```

**Estilos de Badges (con colores del módulo):**
```typescript
badge: {
  base: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-[11px] whitespace-nowrap',
  completado: 'bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-300',
  enProceso: 'bg-blue-100 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800/50 text-blue-700 dark:text-blue-300',
  default: 'bg-gray-100 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-600/50 text-gray-700 dark:text-gray-300',
}
```

#### 3. Columna con Contador/Badge

```tsx
{
  id: 'manzanas',
  header: () => <div className={styles.header.wrapper}>Manzanas</div>,
  size: 90,
  cell: ({ row }) => (
    <div className={styles.cell.center}>
      <div className={styles.manzanasBadge}>
        <Building2 className={styles.manzanasIcon} />
        <span className={styles.manzanasCount}>
          {row.original.manzanas.length}
        </span>
      </div>
    </div>
  ),
}
```

**Estilos (con colores del módulo):**
```typescript
manzanasBadge: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50',
manzanasIcon: 'w-3 h-3 text-green-600 dark:text-green-400',
manzanasCount: 'font-bold text-green-700 dark:text-green-300 text-xs',
```

#### 4. Columna con Estadísticas Compuestas (Ejemplo: Viviendas)

```tsx
{
  id: 'viviendas_resumen',
  header: () => <div className={styles.header.wrapper}>Viviendas</div>,
  size: 200,
  cell: ({ row }) => <ViviendaEstadisticas proyecto={row.original} />,
}

// Componente interno
function ViviendaEstadisticas({ proyecto }: { proyecto: Proyecto }) {
  const stats = useProyectoTabla(proyecto) // Hook con lógica

  return (
    <div className={styles.viviendas.container}>
      {/* Grid de estadísticas */}
      <div className={styles.statsGrid.container}>
        <div className={styles.statsGrid.cell}>
          <div className={styles.statsGrid.label}>Disp.</div>
          <div className={cn(styles.statsGrid.value, styles.statsGrid.disponibles)}>
            {stats.totalDisponibles}
          </div>
        </div>
        <div className={styles.statsGrid.cell}>
          <div className={styles.statsGrid.label}>Asig.</div>
          <div className={cn(styles.statsGrid.value, styles.statsGrid.asignadas)}>
            {stats.totalAsignadas}
          </div>
        </div>
        <div className={styles.statsGrid.cell}>
          <div className={styles.statsGrid.label}>Vend.</div>
          <div className={cn(styles.statsGrid.value, styles.statsGrid.vendidas)}>
            {stats.totalVendidas}
          </div>
        </div>
      </div>

      {/* Barra de progreso con colores del módulo */}
      <div className={styles.progressBar.container}>
        <div className={styles.progressBar.track}>
          <div
            className={styles.progressBar.fillVendidas}
            style={{ width: `${stats.porcentajeVendidas}%` }}
          />
          <div
            className={styles.progressBar.fillAsignadas}
            style={{
              left: `${stats.porcentajeVendidas}%`,
              width: `${stats.porcentajeAsignadas}%`
            }}
          />
        </div>
        <span className={styles.progressBar.label}>
          {stats.totalVendidas + stats.totalAsignadas}/{stats.totalViviendas}
        </span>
      </div>
    </div>
  )
}
```

**Estilos de Estadísticas:**
```typescript
// Grid compacto
statsGrid: {
  container: 'grid grid-cols-3 gap-1.5 text-[10px]',
  cell: 'text-center',
  label: 'text-gray-500 dark:text-gray-500 font-medium mb-0.5',
  value: 'font-bold text-xs',
  disponibles: 'text-gray-700 dark:text-gray-300',
  asignadas: 'text-blue-600 dark:text-blue-400',
  vendidas: 'text-green-600 dark:text-green-400',
}

// Barra de progreso (con gradientes del módulo)
progressBar: {
  container: 'flex items-center gap-1.5',
  track: 'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative',
  fillVendidas: 'absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all',
  fillAsignadas: 'absolute top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all',
  label: 'text-[10px] font-bold text-gray-600 dark:text-gray-400 min-w-[35px] text-right',
}
```

#### 5. Columna de Acciones

```tsx
{
  id: 'acciones',
  header: () => <div className={styles.header.wrapper}>Acciones</div>,
  size: 120,
  cell: ({ row }) => (
    <div className={styles.actions.container}>
      {onView && (
        <button
          onClick={() => onView(row.original)}
          className={cn(styles.actions.button.base, styles.actions.button.view)}
          title="Ver detalles"
        >
          <Eye className={styles.actions.icon} />
        </button>
      )}
      {canEdit && onEdit && (
        <button
          onClick={() => onEdit(row.original)}
          className={cn(styles.actions.button.base, styles.actions.button.edit)}
          title="Editar"
        >
          <Edit2 className={styles.actions.icon} />
        </button>
      )}
      {canDelete && onDelete && (
        <button
          onClick={() => onDelete(row.original.id)}
          className={cn(styles.actions.button.base, styles.actions.button.delete)}
          title="Eliminar"
        >
          <Trash2 className={styles.actions.icon} />
        </button>
      )}
    </div>
  ),
}
```

**Estilos de Acciones (con colores del módulo):**
```typescript
actions: {
  container: 'flex items-center justify-center gap-1.5',
  button: {
    base: 'group p-1.5 rounded-md transition-all hover:scale-105',
    view: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50',
    edit: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50',
    delete: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50',
  },
  icon: 'w-3.5 h-3.5',
}
```

### Archivo de Estilos de Tabla

**Ubicación:** `src/modules/[modulo]/components/[Modulo]Tabla.styles.ts`

**Estructura completa:**
```typescript
export const [modulo]TablaStyles = {
  // Iconos y avatares (con colores del módulo)
  iconContainer: 'w-8 h-8 rounded-lg bg-gradient-to-br from-[COLOR]-500 to-[COLOR]-500 flex items-center justify-center shadow-md shadow-[COLOR]-500/20',
  iconSvg: 'w-4 h-4 text-white',

  // Badges de estado (con colores apropiados)
  badge: { /* ... */ },

  // Headers de columnas
  header: {
    wrapper: 'text-center',
  },

  // Contenedores de celdas
  cell: {
    center: 'flex justify-center',
  },

  // Acciones
  actions: { /* ... */ },

  // Estadísticas
  statsGrid: { /* ... */ },
  progressBar: { /* ... */ },
}
```

### Características de la Tabla

✅ **Sorting**: Click en headers para ordenar
✅ **Responsive**: Scroll horizontal en móviles
✅ **Dark mode**: Todos los elementos soportan modo oscuro
✅ **Accesibilidad**: ARIA labels, keyboard navigation
✅ **Hover states**: Filas y botones con efectos hover
✅ **Compact design**: Tamaños de fuente pequeños (text-xs, text-[11px], text-[10px])
✅ **Color coding**: Badges y estadísticas con colores semánticos
✅ **Module theming**: Colores principales del módulo aplicados

### Tamaños de Columna Recomendados

| Tipo de Columna | Tamaño (px) |
|-----------------|-------------|
| **Nombre/Título principal** | 200-220 |
| **Ubicación/Descripción** | 180-200 |
| **Estado (badge)** | 130-150 |
| **Contador simple** | 80-100 |
| **Estadísticas compuestas** | 180-220 |
| **Acciones (2-3 botones)** | 100-130 |

---

## 🃏 6. CARDS (Estructura Reutilizable)

### Especificaciones

| Propiedad | Valor Obligatorio |
|-----------|-------------------|
| **Padding** | `p-4` (16px) |
| **Border Radius** | `rounded-xl` (12px) |
| **Hover Effect** | `y: -2` |
| **Transición** | `duration-300` |
| **Shadow** | `shadow-sm hover:shadow-lg` |

### Código Base Card

```tsx
<motion.div
  whileHover={{ y: -2 }}
  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
>
  <div className="flex flex-1 flex-col p-4">
    {/* Header: Icon + Título */}
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icono con gradiente dinámico */}
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${theme.classes.gradient.background}`}>
          <Icon className={`w-5 h-5 ${theme.classes.text.primary}`} />
        </div>

        {/* Título */}
        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
          {titulo}
        </h3>
      </div>

      {/* Menú acciones */}
      <button className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
        <MoreVertical size={16} />
      </button>
    </div>

    {/* Contenido específico del módulo */}
    {/* ... */}

    {/* Acciones */}
    <div className="mt-auto flex gap-2">
      <button className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg ${theme.classes.button.primary} px-3 py-2 text-sm font-medium`}>
        <Eye size={14} />
        Ver
      </button>
    </div>
  </div>
</motion.div>
```

### Icono de Card

✅ **USAR gradiente dinámico:**
```tsx
<div className={`bg-gradient-to-br ${theme.classes.gradient.background}`}>
  <Icon className={theme.classes.text.primary} />
</div>
```

❌ **NO hardcodear:**
```tsx
<div className="bg-green-100">  // ❌ MAL
  <Icon className="text-green-600" />
</div>
```

---

## 📱 7. VISTA DE DETALLE (`[id]/page.tsx`)

### Componente Principal: `[modulo]-detalle-client.tsx`

**Responsabilidades:**
- Orquestar tabs y modales
- Manejo de estados (editar, eliminar, confirmar cambios)
- Invalidación de queries React Query
- Integración con sistema de permisos

### Estructura Base

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/shared/components/ui/Modal'
import { ConfirmarCambiosModal } from '@/modules/[modulo]/components/ConfirmarCambiosModal'
import { use[Modulo]Query, use[Modulo]ConValidacion } from '@/modules/[modulo]/hooks'
import { useDetectarCambios } from '@/modules/[modulo]/hooks/useDetectarCambios'

export default function [Modulo]DetalleClient({ [modulo]Id }: Props) {
  const router = useRouter()

  // React Query hooks
  const { [modulo], cargando } = use[Modulo]Query([modulo]Id)
  const { actualizar[Modulo], eliminar[Modulo], actualizando } = use[Modulo]sQuery()

  // Estados para modales
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [modalConfirmarCambios, setModalConfirmarCambios] = useState(false)

  // Estados para confirmación de cambios
  const [datosEdicion, setDatosEdicion] = useState<[Modulo]FormData | null>(null)
  const [datosConfirmacion, setDatosConfirmacion] = useState<{
    [modulo]Id: string
    data: [Modulo]FormData
  } | null>(null)

  // ✅ Hook optimizado: Carga con validación (solo cuando modal está abierto)
  const { data: [modulo]ConValidacion } = use[Modulo]ConValidacion(
    modalEditar ? [modulo]Id : undefined
  )

  // ✅ Hook para detectar cambios
  const [modulo]Editar: [Modulo] | null = [modulo] || null
  const cambiosDetectados = useDetectarCambios([modulo]Editar, datosEdicion)

  // ✅ Handler de actualización (abre modal de confirmación)
  const handleActualizar[Modulo] = async (data: [Modulo]FormData) => {
    setDatosEdicion(data)
    setDatosConfirmacion({ [modulo]Id, data })
    setModalConfirmarCambios(true) // ← Abre modal de confirmación
  }

  // ✅ Confirmación final (ejecuta actualización)
  const confirmarActualizacion = async () => {
    if (!datosConfirmacion) return

    try {
      await actualizar[Modulo](datosConfirmacion.[modulo]Id, datosConfirmacion.data)
      // ✅ React Query invalida automáticamente queries necesarias
      setModalConfirmarCambios(false)
      setModalEditar(false)
      setDatosEdicion(null)
      setDatosConfirmacion(null)
    } catch (error) {
      // Error manejado por React Query con toast
    }
  }

  return (
    <>
      {/* Header con badge de estado y acciones */}
      <[Modulo]DetailHeader
        [modulo]={[modulo]}
        onEdit={() => setModalEditar(true)}
        onDelete={() => setModalEliminar(true)}
      />

      {/* Tabs de información */}
      <Tabs defaultValue="informacion">
        <TabsList>
          <TabsTrigger value="informacion">Información</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          {/* ... más tabs */}
        </TabsList>

        <TabsContent value="informacion">
          <InformacionTab [modulo]={[modulo]} />
        </TabsContent>
      </Tabs>

      {/* ✅ MODAL DE EDICIÓN (size="xl", headerExtra con badges) */}
      <Modal
        isOpen={modalEditar}
        onClose={() => setModalEditar(false)}
        title={`Editar ${[modulo]?.nombre}`}
        size="xl"
        gradientColor="[color-modulo]"
        headerExtra={
          [modulo]ConValidacion && (
            <[Modulo]BadgesResumen [modulo]={[modulo]ConValidacion} />
          )
        }
      >
        {[modulo]ConValidacion ? (
          <[Modulo]Form
            modo="editar"
            datosIniciales={[modulo]ConValidacion}
            onSubmit={handleActualizar[Modulo]}
            onCancelar={() => setModalEditar(false)}
            isSubmitting={actualizando}
          />
        ) : (
          <div>Cargando...</div>
        )}
      </Modal>

      {/* ✅ MODAL DE CONFIRMACIÓN DE CAMBIOS */}
      <ConfirmarCambiosModal
        isOpen={modalConfirmarCambios}
        onClose={() => setModalConfirmarCambios(false)}
        onConfirm={confirmarActualizacion}
        cambios={cambiosDetectados}
        isLoading={actualizando}
        titulo={[modulo]?.nombre}
      />

      {/* Modal de eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        title="Confirmar eliminación"
        size="sm"
      >
        {/* Contenido de confirmación */}
      </Modal>
    </>
  )
}
```

### Header de Detalle con Badge de Estado

```tsx
<motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600 p-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-7 h-7 text-white" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">{[modulo].nombre}</h1>

        {/* ✅ Badge de estado con colores del módulo */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
            estadoColors[estado]
          )}>
            <Icon className="w-3 h-3" />
            {estadoLabels[estado]}
          </span>
        </div>
      </div>
    </div>

    {/* Botones de acción */}
    <div className="flex gap-2">
      <button onClick={onEdit} className="...">
        <Edit2 className="w-4 h-4" />
        Editar
      </button>
      <button onClick={onDelete} className="...">
        <Trash2 className="w-4 h-4" />
        Eliminar
      </button>
    </div>
  </div>
</motion.div>
```

### Tabs de Información (Ejemplo: Proyectos)

**Tab General:**
- Card de Progreso/Estadísticas (con métricas clave)
- Card de Descripción
- Card de Ubicación/Contacto
- Card de Cronograma/Fechas
- Grid de elementos relacionados (ej: Manzanas)

**Orden de Cards (Proyectos):**
1. Progreso de Ventas (si aplica)
2. Descripción
3. Ubicación
4. Cronograma
5. Grid de Manzanas (adaptativo según cantidad)

**Grid Adaptativo de Elementos:**
```tsx
<div className={cn(
  'grid gap-4',
  manzanas.length === 1 && 'grid-cols-1 max-w-md mx-auto',
  manzanas.length === 2 && 'grid-cols-1 md:grid-cols-2',
  manzanas.length === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  manzanas.length === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  manzanas.length >= 5 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
)}>
  {manzanas.map(m => <ManzanaCard key={m.id} manzana={m} />)}
</div>
```

### Modal de Confirmación de Cambios (NUEVO)

**Funcionalidad:**
- Detecta cambios entre datos originales y editados
- Muestra diff visual de campos modificados
- Permite revisar antes de confirmar actualización
- Mismo comportamiento en gestión principal y vista de detalle

**Hook de Detección:**
```tsx
// hooks/useDetectarCambios.ts
export function useDetectarCambios(
  datosOriginales: [Modulo] | null,
  datosEditados: [Modulo]FormData | null
) {
  return useMemo(() => {
    if (!datosOriginales || !datosEditados) return []

    const cambios: Cambio[] = []

    // Comparar campos
    if (datosOriginales.nombre !== datosEditados.nombre) {
      cambios.push({
        campo: 'Nombre',
        valorAnterior: datosOriginales.nombre,
        valorNuevo: datosEditados.nombre
      })
    }

    // ... más comparaciones

    return cambios
  }, [datosOriginales, datosEditados])
}
```

**Componente de Confirmación:**
```tsx
<ConfirmarCambiosModal
  isOpen={modalConfirmarCambios}
  onClose={() => setModalConfirmarCambios(false)}
  onConfirm={confirmarActualizacion}
  cambios={cambiosDetectados}
  isLoading={actualizando}
  titulo="Proyecto XYZ"
/>
```

---

## ⚡ React Query: Invalidación de Queries (CRÍTICO)

### Problema

Cuando actualizas datos (ej: agregar manzana a proyecto), la vista se actualiza pero el **formulario de edición NO** muestra los cambios hasta recargar la página.

### Causa

El hook `use[Modulo]ConValidacion` usa cache de React Query. Al actualizar, solo se invalida la query principal (`detail`), pero NO la query de validación (`[modulo]-validacion`).

### Solución: Invalidar TODAS las queries relacionadas

**En `use[Modulo]sQuery.ts`:**
```tsx
const actualizar[Modulo]Mutation = useMutation({
  mutationFn: ({ id, data }) => [modulo]sService.actualizar[Modulo](id, data),
  onSuccess: ([modulo]Actualizado) => {
    // ✅ Invalidar query principal (para vista)
    await queryClient.invalidateQueries({
      queryKey: [modulo]sKeys.detail([modulo]Actualizado.id),
      refetchType: 'all'
    })

    // ✅ NUEVO: Invalidar query de validación (para formulario de edición)
    await queryClient.invalidateQueries({
      queryKey: ['[modulo]-validacion', [modulo]Actualizado.id],
      refetchType: 'all'
    })

    toast.success('[Modulo] actualizado')
  }
})
```

### Beneficio

✅ Vista de detalle actualizada ✅
✅ **Formulario de edición actualizado** (sin reload) ✅
✅ Datos sincronizados en toda la aplicación ✅

---

## 🎭 8. ESTADOS ESPECIALES

### Loading (Skeleton)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {[1, 2, 3, 4, 5, 6].map(i => (
    <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="animate-pulse space-y-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  ))}
</div>
```

### Empty State

```tsx
<EmptyState
  icon={Building2}
  title="No hay proyectos"
  description="Comienza creando tu primer proyecto"
  action={{
    label: "Crear proyecto",
    onClick: handleNuevo
  }}
/>
```

### No Results (con filtros)

```tsx
<EmptyState
  icon={Search}
  title="No se encontraron resultados"
  description="Intenta con otros filtros"
  action={{
    label: "Limpiar filtros",
    onClick: limpiarFiltros
  }}
/>
```

---

## 📏 TABLA DE MEDIDAS ESTÁNDAR

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| **Container padding** | `px-4` | `px-6` | `px-8` |
| **Vertical spacing** | `space-y-4` | `space-y-4` | `space-y-4` |
| **Grid gap** | `gap-3` | `gap-3` | `gap-4` |
| **Header height** | Auto | Auto | Auto |
| **Card padding** | `p-4` | `p-4` | `p-4` |
| **Icon size (header)** | `w-6 h-6` | `w-6 h-6` | `w-6 h-6` |
| **Icon container** | `w-10 h-10` | `w-10 h-10` | `w-10 h-10` |

---

## ✍️ TIPOGRAFÍA ESTÁNDAR

| Elemento | Clase Tailwind | Tamaño |
|----------|---------------|--------|
| **Título Header** | `text-2xl font-bold` | 24px |
| **Descripción Header** | `text-xs` | 12px |
| **Valor Métrica** | `text-xl font-bold` | 20px |
| **Label Métrica** | `text-xs font-medium` | 12px |
| **Título Card** | `text-sm font-semibold` | 14px |
| **Texto Card** | `text-xs` | 12px |
| **Botón Texto** | `text-sm font-medium` | 14px |

---

## 🎨 ESPACIADO Y PADDING

### Jerarquía de Spacing

```
Page Container  → py-6        (24px vertical)
Sections        → space-y-4   (16px entre secciones)
Header          → p-6         (24px interno)
Métricas        → p-4         (16px interno)
Filtros         → p-3         (12px interno)
Cards           → p-4         (16px interno)
Buttons         → px-3 py-1.5 (12px×6px)
```

---

## 🚀 ANIMACIONES ESTÁNDAR

### Framer Motion Variants

```tsx
// Fade in desde arriba
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Fade in desde abajo
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}

// Hover card
whileHover={{ y: -2, scale: 1.02 }}
transition={{ type: 'spring', stiffness: 300 }}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

Al crear un nuevo módulo, verificar:

### Gestión Principal (Vista de Cards y Tabla)
- [ ] **Colores**: Usar `moduleThemes[moduleName]`, NO hardcodear
- [ ] **Header**: `p-6`, `rounded-2xl`, gradiente triple con colores del módulo
- [ ] **Métricas**: 4 cards, `p-4`, `gap-3`, hover `scale: 1.02, y: -4`
- [ ] **Filtros**: Sticky `top-4`, layout horizontal `flex gap-2`, inputs `py-2`
- [ ] **Vista Cards**: `p-4`, `rounded-xl`, hover `y: -2`
- [ ] **Vista Tabla**: Columnas con estilos centralizados, badges con colores del módulo
- [ ] **Toggle Vista**: Implementar `useVistaPreference` para cambiar entre cards/tabla
- [ ] **Grid Cards**: `md:grid-cols-2 lg:grid-cols-3`
- [ ] **Tipografía**: Título `text-2xl`, descripción `text-xs`
- [ ] **Animaciones**: Delay escalonado `index * 0.05`
- [ ] **Estados**: Loading, Empty, NoResults
- [ ] **Responsive**: Mobile-first, breakpoints `md:` y `lg:`
- [ ] **Dark mode**: Todas las clases con `dark:`
- [ ] **Accesibilidad**: Labels con `sr-only`, ARIA attributes

### Vista de Detalle
- [ ] **Header Detalle**: Badge de estado con colores del módulo
- [ ] **Botones Acción**: Edit y Delete funcionales (NO `console.log`)
- [ ] **Modal Edición**: `size="xl"`, `gradientColor` del módulo, `headerExtra` con badges
- [ ] **Hook Validación**: `use[Modulo]ConValidacion` solo cuando modal abierto
- [ ] **Modal Confirmación**: `ConfirmarCambiosModal` con `useDetectarCambios`
- [ ] **Flujo Actualización**: Edit → Show Changes → Confirm → Update
- [ ] **Invalidación Queries**: Invalidar `detail` Y `[modulo]-validacion` después de actualizar
- [ ] **Tabs**: Información, Documentos, Historial (según aplique)
- [ ] **Cards Info**: Orden lógico (Estadísticas → Descripción → Ubicación → Cronograma → Grid)
- [ ] **Grid Adaptativo**: 1-5+ elementos con clases condicionales

### React Query (CRÍTICO)
- [ ] **Query Principal**: `use[Modulo]Query(id)` para vista
- [ ] **Query Validación**: `use[Modulo]ConValidacion(id)` para formulario
- [ ] **Mutation Actualizar**: Invalida `detail` Y `validacion` queries
- [ ] **Mutation Crear**: Invalida listas
- [ ] **Mutation Eliminar**: Invalida listas y remove detail
- [ ] **Cache Strategy**: `staleTime: 3 * 60 * 1000` (3 min para detalles)
- [ ] **Error Handling**: Toast notifications automáticas

### Separación de Responsabilidades
- [ ] **Hooks**: Lógica de negocio separada (< 200 líneas)
- [ ] **Componentes**: UI presentacional pura (< 150 líneas)
- [ ] **Estilos**: Centralizados en `.styles.ts` (strings > 80 chars)
- [ ] **Services**: API/DB en `.service.ts` (< 300 líneas)
- [ ] **Types**: Interfaces TypeScript estrictas (sin `any`)

---

## 📚 Archivos de Referencia

### Estructura Completa (Proyectos)

```
src/app/proyectos/
├── page.tsx                          # Server Component (permisos)
├── [id]/
│   ├── page.tsx                      # Server Component
│   ├── proyecto-detalle-client.tsx   # ⭐ Client Component principal
│   ├── proyecto-detalle.styles.ts    # Estilos centralizados
│   └── tabs/
│       ├── general-tab.tsx           # ⭐ Tab de información general
│       └── documentos-tab.tsx        # Tab de documentos

src/modules/proyectos/
├── components/
│   ├── proyectos-page-main.tsx       # ⭐ Orquestador principal
│   ├── ProyectosHeaderPremium.tsx    # ⭐ Header con hero
│   ├── ProyectosMetricasPremium.tsx  # ⭐ 4 métricas
│   ├── ProyectosFiltrosPremium.tsx   # ⭐ Filtros sticky
│   ├── proyectos-lista.tsx           # Grid de cards
│   ├── proyectos-card.tsx            # Card individual
│   ├── ProyectosTabla.tsx            # ⭐ Vista de tabla (NUEVO)
│   ├── ProyectosTabla.styles.ts      # ⭐ Estilos de tabla (NUEVO)
│   ├── ConfirmarCambiosModal.tsx     # ⭐ Modal de confirmación (NUEVO)
│   ├── ProyectosBadgesResumen.tsx    # Badges para header de modal
│   ├── proyectos-form.tsx            # Formulario de creación/edición
│   ├── proyectos-empty.tsx           # Estado vacío
│   ├── proyectos-no-results.tsx      # Sin resultados
│   └── proyectos-skeleton.tsx        # Loading state
├── hooks/
│   ├── useProyectosQuery.ts          # ⭐ React Query principal
│   ├── useProyectoQuery.ts           # Query individual
│   ├── useProyectoConValidacion.ts   # ⭐ Query con validación (NUEVO)
│   ├── useDetectarCambios.ts         # ⭐ Detección de cambios (NUEVO)
│   ├── useProyectosFiltradosQuery.ts # Filtrado
│   ├── useEstadisticasProyectosQuery.ts # Estadísticas
│   └── useProyectoTabla.ts           # ⭐ Lógica para tabla (NUEVO)
├── services/
│   └── proyectos.service.ts          # API/DB
├── styles/
│   └── proyectos-page.styles.ts      # Estilos centralizados
├── types/
│   └── index.ts                      # TypeScript types
└── utils/
    └── estado.utils.ts               # Helpers (formateo, validación)
```

---

## ⚠️ ERRORES COMUNES QUE EVITAR

### Colores y Theming
❌ Hardcodear colores (`bg-green-500`)
✅ Usar `moduleThemes[moduleName]`

❌ Duplicar componentes por módulo
✅ Componente único con prop `moduleName`

### Diseño y Layout
❌ Usar padding inconsistente (`p-8` en lugar de `p-6`)
✅ Seguir tabla de medidas estándar

❌ Grid layout en filtros
✅ Flex horizontal con `gap-2`

❌ Labels visibles en filtros
✅ Labels con `sr-only` (accesibilidad)

❌ Títulos grandes (`text-3xl`)
✅ Títulos compactos (`text-2xl`)

❌ Espaciado vertical excesivo (`space-y-8`)
✅ Espaciado compacto (`space-y-4`)

### Vista de Tabla
❌ Hardcodear colores en badges de tabla
✅ Usar estilos centralizados con colores del módulo

❌ Columnas sin alineación
✅ Headers y celdas con `text-center` / `flex justify-center`

❌ Tamaños de fuente inconsistentes
✅ Usar `text-xs`, `text-[11px]`, `text-[10px]` según jerarquía

### Vista de Detalle
❌ Botón Edit solo con `console.log`
✅ Implementar modal funcional

❌ Botón Delete con `window.confirm`
✅ Usar Modal profesional

❌ Modal de edición pequeño (`size="md"`)
✅ Usar `size="xl"` con `headerExtra`

❌ Actualizar sin mostrar cambios
✅ Implementar `ConfirmarCambiosModal`

### React Query
❌ Invalidar solo query `detail` después de actualizar
✅ Invalidar `detail` Y `[modulo]-validacion`

❌ Cargar query de validación siempre
✅ Cargar solo cuando modal está abierto (`modalEditar ? id : undefined`)

❌ No usar `refetchType: 'all'`
✅ Incluir `refetchType: 'all'` al invalidar

### Separación de Responsabilidades
❌ Lógica en componentes
✅ Lógica en hooks separados

❌ Fetch/axios directo en componentes
✅ Usar services y React Query

❌ Strings de Tailwind > 80 chars inline
✅ Extraer a `.styles.ts`

---

## 🎯 Regla de Oro

> **Si no está en Proyectos, no lo agregues a tu módulo.**
> **Si está en Proyectos, cópialo exactamente (excepto colores).**

---

## 📖 Documentación Relacionada

- **Sistema de theming**: `docs/SISTEMA-THEMING-MODULAR.md`
- **Diseño visual compacto**: `docs/ESTANDAR-DISENO-VISUAL-MODULOS.md`
- **Separación de responsabilidades**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
- **Schema de base de datos**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- **Código de referencia**: `src/modules/proyectos/`

---

## 🆕 Novedades en Versión 2.0

### Vista de Tabla
- **Componente genérico**: `DataTable` reutilizable
- **Estilos por módulo**: `[Modulo]Tabla.styles.ts`
- **Columnas personalizables**: Badges, estadísticas, acciones
- **Sistema de colores**: Integrado con `moduleThemes`
- **Hook de preferencia**: `useVistaPreference` para alternar vistas

### Confirmación de Cambios
- **Modal de confirmación**: `ConfirmarCambiosModal`
- **Detección automática**: `useDetectarCambios` hook
- **Diff visual**: Campos modificados con valores anterior/nuevo
- **Consistencia**: Mismo flujo en gestión y detalle

### React Query Optimizado
- **Query de validación**: `use[Modulo]ConValidacion` para formularios
- **Invalidación múltiple**: `detail` y `validacion` queries
- **Cache strategy**: Tiempos optimizados por tipo de query
- **Background refetch**: Datos siempre actualizados

### Vista de Detalle Mejorada
- **Header con badges**: Estado del módulo visible
- **Modal XL**: Formulario completo con resumen
- **Acciones funcionales**: Edit/Delete implementados correctamente
- **Grid adaptativo**: Elementos relacionados (1-5+ items)

---

**Última actualización:** 14 de noviembre de 2025
**Versión:** 2.0
**Mantenido por:** Equipo de Desarrollo RyR Constructora
