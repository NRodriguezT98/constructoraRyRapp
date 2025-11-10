# 🎯 Plantilla Estándar de Módulos - Basada en Proyectos

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

Ver: `docs/SISTEMA-THEMING-MODULAR.md`

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

## 🃏 5. CARDS (Estructura Reutilizable)

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

## 📱 6. VISTA DE DETALLE (`[id]/page.tsx`)

### Estructura de Tabs

**Componente:** `proyecto-detalle-client.tsx` (referencia)

```tsx
<div className="space-y-4">
  {/* 1. Header de detalle */}
  <ProyectoDetailHeader proyecto={proyecto} />

  {/* 2. Tabs */}
  <Tabs defaultValue="informacion" className="w-full">
    <TabsList className="grid w-full grid-cols-4 gap-2 bg-gray-100/50 p-1 dark:bg-gray-800/50">
      <TabsTrigger value="informacion">Información</TabsTrigger>
      <TabsTrigger value="manzanas">Manzanas</TabsTrigger>
      <TabsTrigger value="documentos">Documentos</TabsTrigger>
      <TabsTrigger value="historial">Historial</TabsTrigger>
    </TabsList>

    <TabsContent value="informacion">
      <InformacionTab proyecto={proyecto} />
    </TabsContent>
    {/* ... más tabs */}
  </Tabs>
</div>
```

### Tabs con Theming

```tsx
<TabsTrigger
  value="documentos"
  className={`data-[state=active]:${theme.classes.bg.light} data-[state=active]:${theme.classes.text.primary}`}
>
  Documentos
</TabsTrigger>
```

---

## 🎭 7. ESTADOS ESPECIALES

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

- [ ] **Colores**: Usar `moduleThemes[moduleName]`, NO hardcodear
- [ ] **Header**: `p-6`, `rounded-2xl`, gradiente triple
- [ ] **Métricas**: 4 cards, `p-4`, `gap-3`, hover `scale: 1.02, y: -4`
- [ ] **Filtros**: Sticky `top-4`, layout horizontal `flex gap-2`, inputs `py-2`
- [ ] **Cards**: `p-4`, `rounded-xl`, hover `y: -2`
- [ ] **Grid**: `md:grid-cols-2 lg:grid-cols-3`
- [ ] **Tipografía**: Título `text-2xl`, descripción `text-xs`
- [ ] **Animaciones**: Delay escalonado `index * 0.05`
- [ ] **Estados**: Loading, Empty, NoResults
- [ ] **Responsive**: Mobile-first, breakpoints `md:` y `lg:`
- [ ] **Dark mode**: Todas las clases con `dark:`
- [ ] **Accesibilidad**: Labels con `sr-only`, ARIA attributes

---

## 📚 Archivos de Referencia

### Estructura Completa (Proyectos)

```
src/app/proyectos/
├── page.tsx                          # Server Component
src/modules/proyectos/
├── components/
│   ├── proyectos-page-main.tsx       # ⭐ Orquestador principal
│   ├── ProyectosHeaderPremium.tsx    # ⭐ Header con hero
│   ├── ProyectosMetricasPremium.tsx  # ⭐ 4 métricas
│   ├── ProyectosFiltrosPremium.tsx   # ⭐ Filtros sticky
│   ├── proyectos-lista.tsx           # Grid de cards
│   ├── proyectos-card.tsx            # Card individual
│   ├── proyectos-empty.tsx           # Estado vacío
│   ├── proyectos-no-results.tsx      # Sin resultados
│   └── proyectos-skeleton.tsx        # Loading state
├── hooks/
│   └── useProyectosQuery.ts          # React Query
├── styles/
│   └── proyectos-page.styles.ts      # Estilos centralizados
└── types/
    └── index.ts                      # TypeScript types
```

---

## ⚠️ ERRORES COMUNES QUE EVITAR

❌ **NO hacer:**
- Hardcodear colores (`bg-green-500`)
- Usar padding inconsistente (`p-8` en lugar de `p-6`)
- Grid layout en filtros (usar `flex` horizontal)
- Labels visibles en filtros (usar `sr-only`)
- Títulos grandes (`text-3xl` → usar `text-2xl`)
- Espaciado vertical excesivo (`space-y-8` → usar `space-y-4`)
- Cards sin hover effect
- Olvidar animaciones de entrada
- No usar `sticky` en filtros
- Duplicar componentes por módulo

✅ **SÍ hacer:**
- Importar `moduleThemes` con prop `moduleName`
- Seguir medidas exactas de la tabla
- Layout horizontal en filtros
- Usar componentes de referencia
- Copiar estructura de Proyectos
- Personalizar solo colores y contenido
- Reutilizar cards con theming
- Aplicar todas las animaciones
- Validar con checklist

---

## 🎯 Regla de Oro

> **Si no está en Proyectos, no lo agregues a tu módulo.**
> **Si está en Proyectos, cópialo exactamente (excepto colores).**

**Documentación relacionada:**
- `docs/SISTEMA-THEMING-MODULAR.md` - Sistema de colores
- `docs/ESTANDAR-DISENO-VISUAL-MODULOS.md` - Diseño visual compacto
- `src/modules/proyectos/` - Código de referencia
