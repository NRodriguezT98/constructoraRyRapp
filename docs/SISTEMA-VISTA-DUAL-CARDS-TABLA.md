# 🎯 Sistema de Vista Dual: Cards vs Tabla

## 📋 Descripción General

Sistema profesional de visualización dual implementado con **TanStack Table v8** que permite alternar entre:
- **Vista Cards** 🎴: Layout visual con glassmorphism (ideal para pocos registros)
- **Vista Tabla** 📊: Tabla interactiva con sorting y paginación (ideal para muchos datos)

La preferencia del usuario se persiste en `localStorage` por módulo.

---

## 🏗️ Arquitectura de Componentes

### 1️⃣ **Hook de Preferencia** (`useVistaPreference.ts`)
**Ubicación:** `src/shared/hooks/useVistaPreference.ts`

**Propósito:** Persistir y sincronizar preferencia de vista en `localStorage`

**Código:**
```typescript
import { useState, useEffect } from 'react'

export type TipoVista = 'cards' | 'tabla'

export function useVistaPreference(moduleKey: string): [TipoVista, (vista: TipoVista) => void] {
  const storageKey = `vista-${moduleKey}` // Key único por módulo

  const [vista, setVistaInternal] = useState<TipoVista>(() => {
    // SSR-safe: solo lee localStorage en cliente
    if (typeof window === 'undefined') return 'cards'
    const saved = localStorage.getItem(storageKey)
    return (saved === 'tabla' ? 'tabla' : 'cards') as TipoVista
  })

  const setVista = (newVista: TipoVista) => {
    setVistaInternal(newVista)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newVista)
    }
  }

  return [vista, setVista]
}
```

**Uso:**
```typescript
const [vista, setVista] = useVistaPreference({ moduleName: 'proyectos' }) // cards por defecto
const [vista, setVista] = useVistaPreference({ moduleName: 'clientes' })  // independiente
const [vista, setVista] = useVistaPreference({ moduleName: 'viviendas', defaultVista: 'tabla' }) // tabla por defecto
```

---

### 2️⃣ **Componente de Tabla Genérico** (`DataTable.tsx`)
**Ubicación:** `src/shared/components/table/DataTable.tsx`

**Propósito:** Tabla reutilizable con TanStack Table v8 para TODOS los módulos

**Features:**
- ✅ **Sorting** interactivo (click en headers)
- ✅ **Paginación** con controles (`< 1 2 3 >`)
- ✅ **Theming** dinámico por módulo (gradientColor)
- ✅ **Responsive** con overflow-x-auto
- ✅ **Dark mode** completo
- ✅ **Glassmorphism** en header/footer
- ✅ **Type-safe** con genéricos TypeScript

**Interfaz:**
```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]       // Definición de columnas (TanStack)
  data: TData[]                      // Datos a mostrar
  gradientColor?: string             // 'orange' | 'blue' | 'green' (theming)
  onEdit?: (item: TData) => void     // Handler de edición (opcional)
  onDelete?: (id: string) => void    // Handler de eliminación (opcional)
}
```

**Ejemplo de uso:**
```typescript
<DataTable
  columns={proyectosColumns}
  data={proyectos}
  gradientColor="orange"
  onEdit={handleEditarProyecto}
  onDelete={handleEliminarProyecto}
/>
```

**Estructura interna:**
```typescript
// 1. Configurar tabla con TanStack
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),      // Sorting
  getPaginationRowModel: getPaginationRowModel(), // Paginación
  state: { sorting },
  onSortingChange: setSorting,
})

// 2. Renderizar header con iconos de sorting
{headerGroup.headers.map(header => (
  <th onClick={header.column.getToggleSortingHandler()}>
    {/* ↑↓ Iconos de sorting */}
  </th>
))}

// 3. Renderizar filas con flexRender
{table.getRowModel().rows.map(row => (
  <tr>
    {row.getVisibleCells().map(cell => (
      <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
    ))}
  </tr>
))}

// 4. Footer con paginación
<div className="pagination-controls">
  <button onClick={() => table.previousPage()}>Anterior</button>
  <span>Página {pageIndex + 1} de {pageCount}</span>
  <button onClick={() => table.nextPage()}>Siguiente</button>
</div>
```

---

### 3️⃣ **Componente de Tabla Específico** (`ProyectosTabla.tsx`)
**Ubicación:** `src/modules/proyectos/components/ProyectosTabla.tsx`

**Propósito:** Definir columnas específicas para el módulo de Proyectos

**Columnas implementadas:**
```typescript
const proyectosColumns: ColumnDef<Proyecto>[] = [
  {
    accessorKey: 'nombre',
    header: 'Nombre del Proyecto',
    size: 250,
    cell: ({ getValue }) => (
      <div className="font-semibold text-gray-900 dark:text-gray-100">
        {getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: 'ubicacion',
    header: 'Ubicación',
    size: 200,
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-orange-500" />
        <span>{getValue() as string}</span>
      </div>
    ),
  },
  {
    accessorKey: 'manzanas',
    header: 'Manzanas',
    size: 100,
    cell: ({ getValue }) => {
      const manzanas = getValue() as Manzana[]
      return (
        <span className="badge bg-orange-100 dark:bg-orange-900/30">
          {manzanas.length}
        </span>
      )
    },
  },
  {
    id: 'viviendas_total',
    header: 'Viviendas',
    size: 100,
    cell: ({ row }) => {
      const total = row.original.manzanas.reduce(
        (sum, m) => sum + m.totalViviendas,
        0
      )
      return <span className="badge">{total}</span>
    },
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    size: 300,
    cell: ({ getValue }) => {
      const desc = getValue() as string | null
      return (
        <div className="max-w-xs truncate text-gray-600 dark:text-gray-400">
          {desc || '-'}
        </div>
      )
    },
  },
  {
    id: 'acciones',
    header: 'Acciones',
    size: 120,
    cell: ({ row, table }) => (
      <div className="flex items-center gap-2">
        <button onClick={() => table.options.meta?.onEdit?.(row.original)}>
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => table.options.meta?.onDelete?.(row.original.id)}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
]
```

**Uso:**
```typescript
<ProyectosTabla
  proyectos={proyectos}
  onEdit={handleEditarProyecto}
  onDelete={handleEliminarProyecto}
  canEdit={canEdit}
  canDelete={canDelete}
/>
```

---

### 4️⃣ **Toggle de Vista en Filtros** (`ProyectosFiltrosPremium.tsx`)
**Ubicación:** `src/modules/proyectos/components/ProyectosFiltrosPremium.tsx`

**Propósito:** UI para alternar entre vistas (cards/tabla)

**Props agregadas:**
```typescript
interface ProyectosFiltrosPremiumProps {
  // ... props existentes
  vista?: TipoVista                        // Estado actual de vista
  onCambiarVista?: (vista: TipoVista) => void // Handler de cambio
}
```

**Código del toggle:**
```tsx
{/* Toggle Cards/Tabla */}
<div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
  <button
    onClick={() => onCambiarVista('cards')}
    className={cn(
      'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
      vista === 'cards'
        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    )}
    title="Vista de cards"
  >
    <LayoutGrid className="w-3.5 h-3.5" />
    <span>Cards</span>
  </button>
  <button
    onClick={() => onCambiarVista('tabla')}
    className={cn(
      'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
      vista === 'tabla'
        ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    )}
    title="Vista de tabla"
  >
    <Table className="w-3.5 h-3.5" />
    <span>Tabla</span>
  </button>
</div>
```

**Diseño visual:**
```
┌─────────────────────────────────────────────┐
│ ┌─────────┐ ┌──────────┐                    │
│ │ 🎴 Cards│ │ 📊 Tabla │                    │
│ └─────────┘ └──────────┘                    │
│     ↑ Activo       Inactivo                  │
└─────────────────────────────────────────────┘
```

---

### 5️⃣ **Integración en Página Principal** (`proyectos-page-main.tsx`)
**Ubicación:** `src/modules/proyectos/components/proyectos-page-main.tsx`

**Cambios realizados:**

#### **1. Imports agregados:**
```typescript
import { useVistaPreference } from '@/shared/hooks/useVistaPreference'
import { ProyectosTabla } from './ProyectosTabla'
```

#### **2. Hook de vista:**
```typescript
// Hook para preferencia de vista (cards vs tabla)
const [vista, setVista] = useVistaPreference('proyectos')
```

#### **3. Props al componente de filtros:**
```typescript
<ProyectosFiltrosPremium
  totalResultados={proyectos.length}
  filtros={filtros}
  onActualizarFiltros={actualizarFiltros}
  onLimpiarFiltros={limpiarFiltros}
  vista={vista}                    // ← Estado actual
  onCambiarVista={setVista}       // ← Handler de cambio
/>
```

#### **4. Renderizado condicional:**
```typescript
{cargando ? (
  <ProyectosSkeleton />
) : proyectos.length === 0 ? (
  hayFiltrosActivos ? <ProyectosNoResults /> : <ProyectosEmpty />
) : vista === 'cards' ? (
  <ProyectosLista          // ← Vista de cards (existente)
    proyectos={proyectos}
    onEdit={canEdit ? handleEditarProyecto : undefined}
    onDelete={canDelete ? handleEliminarProyecto : undefined}
    canEdit={canEdit}
    canDelete={canDelete}
  />
) : (
  <ProyectosTabla          // ← Vista de tabla (nueva)
    proyectos={proyectos}
    onEdit={canEdit ? handleEditarProyecto : undefined}
    onDelete={canDelete ? handleEliminarProyecto : undefined}
    canEdit={canEdit}
    canDelete={canDelete}
  />
)}
```

---

## 🎨 Theming y Diseño

### **Paleta de Colores por Módulo**
```typescript
const moduleColors = {
  proyectos: 'orange',   // Naranja/Ámbar
  clientes: 'blue',      // Azul/Cyan
  viviendas: 'amber',    // Ámbar/Amarillo
  contratos: 'green',    // Verde/Esmeralda
}
```

### **Estilos de Tabla (DataTable)**
```tsx
{/* Header con gradiente */}
<thead className="bg-gradient-to-r from-orange-500 to-amber-500">
  <tr>
    <th className="text-white font-semibold">Columna</th>
  </tr>
</thead>

{/* Filas con hover */}
<tbody>
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <td className="border-b border-gray-200 dark:border-gray-700">
      Contenido
    </td>
  </tr>
</tbody>

{/* Footer con glassmorphism */}
<div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 p-4">
  Paginación
</div>
```

---

## 📦 Instalación y Dependencias

### **1. Instalar TanStack Table**
```bash
npm install @tanstack/react-table
```

### **2. Verificar package.json**
```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.20.6"
  }
}
```

### **3. Archivos creados**
```
src/
├── shared/
│   ├── components/
│   │   └── table/
│   │       └── DataTable.tsx          # ✅ Componente genérico
│   └── hooks/
│       └── useVistaPreference.ts      # ✅ Hook de persistencia
└── modules/
    └── proyectos/
        └── components/
            ├── ProyectosTabla.tsx     # ✅ Definición de columnas
            ├── ProyectosFiltrosPremium.tsx  # ✅ Toggle UI
            └── proyectos-page-main.tsx      # ✅ Integración
```

---

## 🚀 Cómo Agregar Vista Dual a Otro Módulo

### **Ejemplo: Módulo de Clientes**

#### **1. Crear componente de tabla** (`ClientesTabla.tsx`)
```typescript
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/table/DataTable'
import { Cliente } from '../types'

const clientesColumns: ColumnDef<Cliente>[] = [
  { accessorKey: 'nombres', header: 'Nombre', size: 200 },
  { accessorKey: 'cedula', header: 'Cédula', size: 150 },
  { accessorKey: 'email', header: 'Email', size: 250 },
  { accessorKey: 'telefono', header: 'Teléfono', size: 150 },
  // ... más columnas
]

export function ClientesTabla({ clientes, onEdit, onDelete }) {
  return (
    <DataTable
      columns={clientesColumns}
      data={clientes}
      gradientColor="blue"  // ← Color del módulo
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
```

#### **2. Agregar hook en página principal**
```typescript
const [vista, setVista] = useVistaPreference({ moduleName: 'clientes' })
```

#### **3. Agregar toggle en filtros**
```tsx
<ClientesFiltrosPremium
  vista={vista}
  onCambiarVista={setVista}
/>
```

#### **4. Renderizado condicional**
```typescript
{vista === 'cards' ? (
  <ClientesLista clientes={clientes} />
) : (
  <ClientesTabla clientes={clientes} />
)}
```

---

## 🧪 Testing y Validación

### **Checklist de Testing**
- [ ] Toggle alterna correctamente entre vistas
- [ ] Preferencia se persiste en `localStorage`
- [ ] Sorting funciona en todas las columnas
- [ ] Paginación muestra páginas correctas
- [ ] Botones de editar/eliminar funcionan
- [ ] Dark mode se aplica correctamente
- [ ] Responsive (tabla tiene scroll horizontal en móvil)
- [ ] Theming correcto por módulo

### **LocalStorage Debugging**
```javascript
// Verificar valor guardado
localStorage.getItem('proyectos_vista_preference') // → "cards" o "tabla"

// Cambiar manualmente
localStorage.setItem('proyectos_vista_preference', 'tabla')

// Limpiar
localStorage.removeItem('proyectos_vista_preference')
```

---

## ⚠️ Troubleshooting

### **Problema: Tabla no muestra datos**
✅ **Solución:** Verificar que `data` no esté vacío y que `columns` tenga `accessorKey` correcto

### **Problema: Sorting no funciona**
✅ **Solución:** Asegurarse de tener `getSortedRowModel` en `useReactTable`

### **Problema: Paginación rota**
✅ **Solución:** Verificar que `getPaginationRowModel` esté importado y configurado

### **Problema: Preferencia no persiste**
✅ **Solución:** Verificar que `moduleKey` en `useVistaPreference` sea único

### **Problema: Botones de editar/eliminar no funcionan**
✅ **Solución:** Pasar handlers correctamente en `meta` de la tabla:
```typescript
const table = useReactTable({
  // ...
  meta: {
    onEdit: props.onEdit,
    onDelete: props.onDelete,
  }
})
```

---

## 📚 Referencias

- **TanStack Table Docs:** https://tanstack.com/table/latest
- **ColumnDef API:** https://tanstack.com/table/latest/docs/api/core/column-def
- **Sorting Guide:** https://tanstack.com/table/latest/docs/guide/sorting
- **Pagination Guide:** https://tanstack.com/table/latest/docs/guide/pagination

---

## ✅ Ventajas del Sistema

1. **Escalable:** Un componente `DataTable` para todos los módulos
2. **Type-safe:** TypeScript detecta errores en columnas
3. **Profesional:** TanStack Table es el estándar de la industria
4. **Persistente:** Preferencia guardada por módulo
5. **Flexible:** Fácil agregar columnas, sorting, filtros
6. **Reutilizable:** Componentes compartidos entre módulos
7. **Mantenible:** Cambios en un lugar afectan todos los módulos

---

## 📝 Próximos Pasos Sugeridos

- [ ] Agregar filtros avanzados en tabla (search por columna)
- [ ] Agregar selección múltiple con checkboxes
- [ ] Agregar exportación a CSV/Excel
- [ ] Agregar columnas personalizables (mostrar/ocultar)
- [ ] Agregar resizing de columnas
- [ ] Agregar sticky header en scroll
- [ ] Implementar en módulo de Clientes
- [ ] Implementar en módulo de Viviendas
- [ ] Implementar en módulo de Contratos

---

**Última actualización:** 26 de octubre de 2025
**Autor:** Sistema de Gestión RyR
**Versión:** 1.0.0
