# 🚀 Quick Start: Vista Dual Cards/Tabla

## ⚡ Guía Rápida de Implementación

### 📋 Checklist de 5 Pasos

#### **1️⃣ Crear Componente de Tabla**
Archivo: `src/modules/[modulo]/components/[Modulo]Tabla.tsx`

```typescript
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/components/table/DataTable'

const columns: ColumnDef<TuTipo>[] = [
  { accessorKey: 'nombre', header: 'Nombre', size: 200 },
  { accessorKey: 'email', header: 'Email', size: 250 },
  // ... más columnas
]

export function ModuloTabla({ datos, onEdit, onDelete }) {
  return (
    <DataTable
      columns={columns}
      data={datos}
      gradientColor="blue" // Color del módulo
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
```

---

#### **2️⃣ Agregar Hook en Página Principal**
Archivo: `src/modules/[modulo]/components/[modulo]-page-main.tsx`

```typescript
// Import
import { useVistaPreference } from '@/shared/hooks/useVistaPreference'
import { ModuloTabla } from './ModuloTabla'

// Hook
const [vista, setVista] = useVistaPreference({ moduleName: 'modulo' })
```

---

#### **3️⃣ Conectar Toggle en Filtros**
Archivo: `src/modules/[modulo]/components/[Modulo]FiltrosPremium.tsx`

```typescript
// Interface (agregar props)
interface FiltrosProps {
  // ... props existentes
  vista?: TipoVista
  onCambiarVista?: (vista: TipoVista) => void
}

// Component (pasar a ProyectosFiltrosPremium)
<ModuloFiltrosPremium
  {...otherProps}
  vista={vista}
  onCambiarVista={setVista}
/>
```

**Toggle UI (copiar de ProyectosFiltrosPremium):**
```tsx
<div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
  <button
    onClick={() => onCambiarVista('cards')}
    className={cn(
      'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
      vista === 'cards'
        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    )}
  >
    <LayoutGrid className="w-3.5 h-3.5" />
    <span>Cards</span>
  </button>
  <button
    onClick={() => onCambiarVista('tabla')}
    className={cn(
      'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
      vista === 'tabla'
        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    )}
  >
    <Table className="w-3.5 h-3.5" />
    <span>Tabla</span>
  </button>
</div>
```

---

#### **4️⃣ Renderizado Condicional**
Archivo: `src/modules/[modulo]/components/[modulo]-page-main.tsx`

```typescript
{cargando ? (
  <ModuloSkeleton />
) : datos.length === 0 ? (
  <ModuloEmpty />
) : vista === 'cards' ? (
  <ModuloLista datos={datos} onEdit={onEdit} onDelete={onDelete} />
) : (
  <ModuloTabla datos={datos} onEdit={onEdit} onDelete={onDelete} />
)}
```

---

#### **5️⃣ Verificar TypeScript**
```bash
npm run type-check
```

---

## 📦 Definición de Columnas (Referencia Rápida)

### **Columna Básica**
```typescript
{
  accessorKey: 'nombre',
  header: 'Nombre',
  size: 200,
}
```

### **Columna con Ícono**
```typescript
{
  accessorKey: 'email',
  header: 'Email',
  size: 250,
  cell: ({ getValue }) => (
    <div className="flex items-center gap-2">
      <Mail className="w-4 h-4 text-blue-500" />
      <span>{getValue() as string}</span>
    </div>
  ),
}
```

### **Columna con Badge**
```typescript
{
  accessorKey: 'estado',
  header: 'Estado',
  size: 120,
  cell: ({ getValue }) => {
    const estado = getValue() as string
    return (
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        estado === 'Activo'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      )}>
        {estado}
      </span>
    )
  },
}
```

### **Columna Calculada**
```typescript
{
  id: 'total_viviendas',
  header: 'Total',
  size: 100,
  cell: ({ row }) => {
    const total = row.original.manzanas.reduce(
      (sum, m) => sum + m.totalViviendas,
      0
    )
    return <span>{total}</span>
  },
}
```

### **Columna Truncada**
```typescript
{
  accessorKey: 'descripcion',
  header: 'Descripción',
  size: 300,
  cell: ({ getValue }) => {
    const desc = getValue() as string | null
    return (
      <div className="max-w-xs truncate text-gray-600">
        {desc || '-'}
      </div>
    )
  },
}
```

### **Columna de Acciones**
```typescript
{
  id: 'acciones',
  header: 'Acciones',
  size: 120,
  cell: ({ row, table }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => table.options.meta?.onEdit?.(row.original)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        title="Editar"
      >
        <Edit2 className="w-4 h-4 text-blue-600" />
      </button>
      <button
        onClick={() => table.options.meta?.onDelete?.(row.original.id)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  ),
}
```

---

## 🎨 Paleta de Colores por Módulo

```typescript
const gradientColors = {
  proyectos: 'orange',
  clientes: 'blue',
  viviendas: 'amber',
  contratos: 'green',
  negociaciones: 'purple',
  abonos: 'indigo',
}
```

**Uso:**
```typescript
<DataTable gradientColor="blue" />
```

---

## ✅ Testing Rápido

### **1. Verificar Toggle**
- Click en "Cards" → Muestra vista de cards
- Click en "Tabla" → Muestra vista de tabla
- Recargar página → Mantiene preferencia

### **2. Verificar Sorting**
- Click en header de columna → Ordena ascendente
- Click de nuevo → Ordena descendente
- Click tercera vez → Resetea orden

### **3. Verificar Paginación**
- Botón "Siguiente" → Página 2
- Botón "Anterior" → Página 1
- Texto muestra "Página X de Y"

### **4. Verificar Acciones**
- Botón editar → Abre modal de edición
- Botón eliminar → Abre confirmación

---

## 🔧 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Toggle no cambia vista | Verificar que `vista` y `setVista` estén conectados correctamente |
| Tabla no muestra datos | Verificar que `accessorKey` coincida con nombre de campo |
| Sorting no funciona | Asegurar que `getSortedRowModel` esté en `useReactTable` |
| Preferencia no persiste | Verificar que `moduleName` sea único |
| Botones de acción no funcionan | Pasar handlers en `meta` de la tabla |

---

## 📚 Referencias

- **Documentación completa:** `docs/SISTEMA-VISTA-DUAL-CARDS-TABLA.md`
- **Componente DataTable:** `src/shared/components/table/DataTable.tsx`
- **Hook useVistaPreference:** `src/shared/hooks/useVistaPreference.ts`
- **Ejemplo completo:** `src/modules/proyectos/components/ProyectosTabla.tsx`

---

## 🎯 Comandos Útiles

```bash
# Verificar tipos
npm run type-check

# Ejecutar desarrollo
npm run dev

# Build producción
npm run build
```

---

**¿Necesitas ayuda?** Consulta `SISTEMA-VISTA-DUAL-CARDS-TABLA.md` para ejemplos detallados.
