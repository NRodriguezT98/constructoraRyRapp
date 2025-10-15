# Módulo de Proyectos - Arquitectura Limpia

## 📁 Estructura del Módulo

```
src/modules/proyectos/
├── components/           # Componentes de presentación
│   ├── proyectos-page-new.tsx    # Página principal
│   ├── lista-proyectos-new.tsx   # Lista de proyectos
│   ├── proyecto-card.tsx         # Card individual
│   ├── empty-state.tsx           # Estado vacío
│   ├── search-bar.tsx            # Barra de búsqueda
│   ├── page-header.tsx           # Header de página
│   └── index.ts                  # Exportaciones
├── hooks/                # Custom hooks
│   └── useProyectos.ts
├── services/             # Lógica de negocio
│   └── proyectos.service.ts
├── store/                # Estado global
│   └── proyectos.store.ts
├── types/                # Definiciones TypeScript
│   └── index.ts
├── constants/            # Constantes y configuración
│   └── index.ts
├── styles/               # Estilos y animaciones
│   ├── animations.ts           # Variantes de Framer Motion
│   ├── classes.ts              # Clases de estilos
│   └── index.ts                # Exportaciones
└── index.ts              # Exportaciones principales
```

## 🎯 Principios de Arquitectura

### 1. Separación de Responsabilidades

- **Components**: Solo presentación, sin lógica de negocio
- **Hooks**: Lógica reutilizable y gestión de estado
- **Services**: Interacción con API/base de datos
- **Store**: Estado global centralizado
- **Constants**: Configuración y valores estáticos
- **Styles**: Animaciones y estilos reutilizables

### 2. Componentes Atómicos

#### `ProyectoCard`

Card individual de proyecto con toda su información y acciones.

**Props:**

```typescript
{
  proyecto: Proyecto
  onEdit?: (proyecto: Proyecto) => void
  onDelete?: (id: string) => void
  onView?: (proyecto: Proyecto) => void
}
```

#### `EmptyState`

Componente genérico para estados vacíos.

**Props:**

```typescript
{
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  Icon?: React.ComponentType
}
```

#### `SearchBar`

Barra de búsqueda con filtros y vista toggle.

**Props:**

```typescript
{
  searchValue: string
  onSearchChange: (value: string) => void
  isGridView: boolean
  onToggleView: () => void
  onFilterClick?: () => void
}
```

#### `PageHeader`

Header reutilizable para páginas.

**Props:**

```typescript
{
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}
```

### 3. Hooks Especializados

#### `useProyectos()`

Hook principal para gestión de proyectos.

**Retorna:**

```typescript
{
  proyectos: Proyecto[]
  cargando: boolean
  error?: string
  crearProyecto: (data) => Promise<Proyecto>
  actualizarProyecto: (id, data) => Promise<Proyecto>
  eliminarProyecto: (id) => Promise<void>
  refrescar: () => Promise<void>
  limpiarError: () => void
}
```

#### `useProyectosFiltrados()`

Hook para filtrado y búsqueda.

**Retorna:**

```typescript
{
  proyectos: Proyecto[]          // Proyectos filtrados
  filtros: FiltroProyecto
  cargando: boolean
  actualizarFiltros: (filtros) => void
  limpiarFiltros: () => void
  totalProyectos: number
  proyectosFiltrados: number
}
```

#### `useVistaProyectos()`

Hook para control de vista.

**Retorna:**

```typescript
{
  vista: 'grid' | 'lista'
  esGrid: boolean
  esLista: boolean
  setVista: (vista) => void
  cambiarVista: () => void
}
```

#### `useEstadisticasProyectos()`

Hook para métricas.

**Retorna:**

```typescript
{
  total: number
  enPlanificacion: number
  enConstruccion: number
  completados: number
  pausados: number
  presupuestoTotal: number
  progresoPromedio: number
}
```

### 4. Constantes Centralizadas

#### Estados

```typescript
ESTADO_COLORS: Record<EstadoProyecto, string>
ESTADO_LABELS: Record<EstadoProyecto, string>
ESTADO_ICONS: Record<EstadoProyecto, string>
```

#### Defaults

```typescript
PROYECTO_DEFAULTS: {
  presupuesto: number
  diasEstimados: number
  responsable: string
  telefono: string
  email: string
  ...
}
```

#### Límites

```typescript
PROYECTO_LIMITES: {
  nombreMin: number
  nombreMax: number
  ...
}
```

#### Animaciones

```typescript
ANIMATION_CONFIG: {
  duration: { fast, normal, slow }
  spring: { stiffness, damping }
  ...
}
```

### 5. Estilos Reutilizables

#### Variantes de Animación

- `containerVariants`: Contenedores con stagger
- `itemVariants`: Items individuales
- `fadeInVariants`: Fade in simple
- `slideDownVariants`: Slide desde arriba
- `slideUpVariants`: Slide desde abajo
- `scaleVariants`: Escala con spring
- `cardHoverVariants`: Hover en cards
- `buttonTapVariants`: Tap en botones

#### Clases de Estilos

- `cardStyles`: Estilos para cards
- `buttonStyles`: Estilos para botones
- `inputStyles`: Estilos para inputs
- `badgeStyles`: Estilos para badges
- `containerStyles`: Estilos para contenedores
- `textStyles`: Estilos para textos
- `emptyStateStyles`: Estilos para estados vacíos
- `progressBarStyles`: Estilos para barras de progreso
- `gridStyles`: Estilos para grids
- `iconStyles`: Estilos para iconos

## 🔄 Flujo de Datos

```
Usuario Interactúa
       ↓
Componente (onClick, onChange)
       ↓
Hook (useProyectos, useProyectosFiltrados)
       ↓
Store (Zustand)
       ↓
Service (API Call)
       ↓
Store (Actualización)
       ↓
Componente (Re-render)
```

## 📦 Exportaciones

El módulo exporta todo lo necesario desde `index.ts`:

```typescript
import {
  // Componentes
  ProyectosPage,
  ListaProyectos,
  ProyectoCard,
  EmptyState,
  SearchBar,
  PageHeader,

  // Hooks
  useProyectos,
  useProyectosFiltrados,
  useVistaProyectos,
  useEstadisticasProyectos,

  // Tipos
  Proyecto,
  ProyectoFormData,
  EstadoProyecto,

  // Constantes
  ESTADO_COLORS,
  ESTADO_LABELS,
  PROYECTO_DEFAULTS,

  // Estilos
  containerVariants,
  itemVariants,
  cardStyles,
  buttonStyles,
} from '@/modules/proyectos'
```

## 🎨 Uso de Componentes

### Ejemplo: Usar ProyectoCard

```tsx
import { ProyectoCard } from '@/modules/proyectos'

;<ProyectoCard
  proyecto={proyecto}
  onView={p => navigate(`/proyectos/${p.id}`)}
  onEdit={p => openEditModal(p)}
  onDelete={id => deleteProyecto(id)}
/>
```

### Ejemplo: Usar EmptyState

```tsx
import { EmptyState } from '@/modules/proyectos'

;<EmptyState
  title='No hay proyectos'
  description='Comienza creando tu primer proyecto'
  actionLabel='Crear Proyecto'
  onAction={() => setModalOpen(true)}
/>
```

## 🚀 Ventajas de Esta Arquitectura

1. **Mantenibilidad**: Código organizado y fácil de mantener
2. **Reutilización**: Componentes y hooks reutilizables
3. **Testabilidad**: Cada parte puede probarse independientemente
4. **Escalabilidad**: Fácil de extender y agregar funcionalidades
5. **Performance**: Optimizado con React y Zustand
6. **TypeScript**: Completamente tipado
7. **Developer Experience**: Imports limpios y organizados
8. **Consistency**: Estilos y animaciones consistentes

## 📝 Próximos Pasos

1. Conectar con Supabase en `proyectos.service.ts`
2. Agregar tests unitarios
3. Implementar módulos similares (viviendas, clientes, etc.)
4. Agregar más hooks especializados según necesidades
5. Extender constants con configuraciones de producción
