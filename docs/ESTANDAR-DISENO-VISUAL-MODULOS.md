# 🎨 ESTÁNDAR DE DISEÑO VISUAL - MÓDULOS RyR

**Fecha**: 4 de noviembre de 2025
**Actualización**: Vista compacta optimizada
**Basado en**: Módulo de Viviendas (Referencia visual optimizada)
**Objetivo**: Unificar diseño de header, métricas y filtros en todos los módulos con máxima eficiencia de espacio

---

## 📐 ESPECIFICACIONES EXACTAS (COMPACTAS)

### 1️⃣ HEADER HERO (COMPACTO)

**Estructura obligatoria**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[COLOR_1] via-[COLOR_2] to-[COLOR_3] dark:from-[DARK_1] dark:via-[DARK_2] dark:to-[DARK_3] p-6 shadow-2xl shadow-[COLOR]/20"
>
  {/* Pattern overlay */}
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

  {/* Content */}
  <div className="relative z-10">
    <div className="flex items-center justify-between">
      {/* Left: Icon + Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-white">Título del Módulo</h1>
          <p className="text-[COLOR]-100 dark:text-[COLOR]-200 text-xs">Descripción breve • Contexto</p>
        </div>
      </div>

      {/* Right: Badge + Botón */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium">
          <Icon className="w-3.5 h-3.5" />
          {count} Items
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Acción Principal
        </motion.button>
      </div>
    </div>
  </div>
</motion.div>
```

**Dimensiones clave**:
- Padding: `p-6` (antes: p-8)
- Border radius: `rounded-2xl` (antes: rounded-3xl)
- Icon circle: `w-10 h-10` (antes: w-12 h-12)
- Icon: `w-6 h-6` (antes: w-7 h-7)
- Título: `text-2xl` (antes: text-3xl)
- Subtítulo: `text-xs` (antes: text-sm)
- Gap: `gap-3` (antes: gap-4)
- Badge: `px-3 py-1.5` (antes: px-4 py-2)
- **Sin mb-4**: Todo en una línea

---

### 2️⃣ TARJETAS DE MÉTRICAS (4 CARDS - COMPACTAS)

**Grid obligatorio**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
>
```

**Card individual** (estructura exacta):
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
>
  {/* Glow effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-[COLOR]/20 to-[COLOR]/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

  {/* Content */}
  <div className="relative z-10 flex items-center gap-3">
    {/* Icon circle */}
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[COLOR]-500 to-[COLOR]-600 flex items-center justify-center shadow-lg shadow-[COLOR]-500/50">
      <Icon className="w-5 h-5 text-white" />
    </div>

    {/* Text */}
    <div className="flex-1">
      <p className="text-xl font-bold bg-gradient-to-br from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
        Label
      </p>
    </div>
  </div>
</motion.div>
```

**Dimensiones clave**:
- Padding card: `p-4` (antes: p-6)
- Border radius: `rounded-xl` (antes: rounded-2xl)
- Icon circle: `w-10 h-10 rounded-lg` (antes: w-12 h-12 rounded-xl)
- Icon: `w-5 h-5` (antes: w-6 h-6)
- Valor: `text-xl` (antes: text-2xl)
- Gap content: `gap-3` (antes: gap-4)
- Grid gap: `gap-3` (antes: gap-4)
- Margin label: `mt-0.5` (antes: mt-1)
---

### 3️⃣ FILTROS / BÚSQUEDA (COMPACTOS - UNA LÍNEA)

**Estructura obligatoria** (filtros horizontales):
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
  className="sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-[COLOR]-500/10"
>
  {/* Filtros en línea horizontal */}
  <div className="flex items-center gap-2">
    {/* Campo de búsqueda (flex-1) */}
    <div className="relative flex-1">
      <label className="sr-only">Buscar</label>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>

    {/* Select Proyecto */}
    <div className="relative">
      <label className="sr-only">Proyecto</label>
      <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm min-w-[180px]">
        <option>Todos los proyectos</option>
      </select>
    </div>

    {/* Select Estado */}
    <div className="relative">
      <label className="sr-only">Estado</label>
      <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm min-w-[180px]">
        <option>Todos los estados</option>
      </select>
    </div>
  </div>

  {/* Footer con contador */}
  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
      {count} resultados
    </p>
    {hasFilters && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[COLOR]-600 dark:text-[COLOR]-400 hover:text-[COLOR]-700 dark:hover:text-[COLOR]-300 transition-colors cursor-pointer rounded-lg hover:bg-[COLOR]-50 dark:hover:bg-[COLOR]-900/20"
      >
        <X className="w-4 h-4" />
        Limpiar filtros
      </motion.button>
    )}
  </div>
</motion.div>
```

**Dimensiones clave**:
- Container padding: `p-3` (antes: p-4)
- Border radius: `rounded-xl` (antes: rounded-2xl)
- Layout: `flex items-center gap-2` (antes: grid)
- Input padding: `py-2` (antes: py-3)
- Input icon: `w-4 h-4` left-3 (antes: w-5 h-5 left-4)
- Input border radius: `rounded-lg` (antes: rounded-xl)
- Labels: `sr-only` (ocultos, solo accesibilidad)
- Select min-width: `min-w-[180px]`
- Footer margin: `mt-2 pt-2` (antes: mt-3 pt-3)
- Clear button: `px-2 py-1` con hover background

**Características**:
- **Sticky**: `sticky top-4 z-40`
- **Glassmorphism**: `backdrop-blur-xl bg-white/90`
- **Responsive**: En móvil se puede ajustar a flex-wrap
- **Labels ocultos**: Usar `sr-only` para accesibilidad
- **Footer separado**: Contador de resultados y botón limpiar

---

### 4️⃣ ESPACIADO GENERAL (COMPACTO)

**Container principal**:
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-[COLOR]-50 to-[COLOR]-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
    {/* Header */}
    {/* Métricas */}
    {/* Filtros */}
    {/* Contenido */}
  </div>
</div>
```

**Dimensiones clave**:
- Padding vertical: `py-6` (antes: py-8)
- Espacio entre secciones: `space-y-4` (antes: space-y-6)

---

## 📁 ARCHIVO DE ESTILOS CENTRALIZADO

**Ubicación**: `src/modules/[nombre-modulo]/styles/[modulo].styles.ts`

**Template completo** (copiar y ajustar colores):

```typescript
/**
 * 🎨 ESTILOS CENTRALIZADOS - [NOMBRE MÓDULO]
 *
 * Sistema de diseño compacto premium con glassmorphism.
 * Color principal: [COLOR] (para diferenciar de otros módulos)
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes vibrantes
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Vista compacta optimizada
 */

export const [modulo]Styles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-[COLOR]-50 to-[COLOR]-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4'
  },

  // 🎨 HEADER HERO (compacto)
  header: {
    container: 'relative overflow-hidden rounded-2xl bg-gradient-to-br from-[COLOR]-600 via-[COLOR2]-600 to-[COLOR3]-600 dark:from-[COLOR]-700 dark:via-[COLOR2]-700 dark:to-[COLOR3]-800 p-6 shadow-2xl shadow-[COLOR]-500/20',
    pattern: 'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    topRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-3',
    iconCircle: 'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    titleWrapper: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-[COLOR]-100 dark:text-[COLOR]-200 text-xs',
    badge: 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    buttonGroup: 'flex items-center gap-2',
    button: 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg'
  },

  // 📊 MÉTRICAS (4 cards - compactas)
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300',
    cardGlow: 'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-3',
    iconCircle: 'w-10 h-10 rounded-lg flex items-center justify-center shadow-lg',
    icon: 'w-5 h-5 text-white',
    textGroup: 'flex-1',
    value: 'text-xl font-bold bg-gradient-to-br bg-clip-text text-transparent',
    label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium'
  },

  // 🔍 FILTROS (compactos en una línea)
  filtros: {
    container: 'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-[COLOR]-500/10',
    searchWrapper: 'relative flex-1',
    searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput: 'w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    grid: 'flex items-center gap-2',
    selectWrapper: 'relative',
    label: 'sr-only',
    select: 'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm min-w-[180px]',
    footer: 'flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    clearButton: 'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[COLOR]-600 dark:text-[COLOR]-400 hover:text-[COLOR]-700 dark:hover:text-[COLOR]-300 transition-colors cursor-pointer rounded-lg hover:bg-[COLOR]-50 dark:hover:bg-[COLOR]-900/20'
  }
}
```

---

## 🎨 PALETA DE COLORES POR MÓDULO

### 🏠 Viviendas (Naranja/Ámbar) - ⭐ REFERENCIA COMPACTA
```typescript
// Gradientes de 3 colores para header
from-orange-600 via-amber-600 to-yellow-600
dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800

// Métricas (cada card con gradiente único)
Total:      from-orange-500 to-amber-600   // Naranja
Disponibles: from-green-500 to-emerald-600  // Verde
Asignadas:   from-blue-500 to-indigo-600    // Azul
Entregadas:  from-purple-500 to-pink-600    // Púrpura

// Focus states en filtros
focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
```

### 📋 Auditorías (Azul/Índigo/Púrpura):
```typescript
// Header
from-blue-600 via-indigo-600 to-purple-600
dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800

// Métricas
Total:   from-blue-500 to-indigo-600
Creates: from-green-500 to-emerald-600
Updates: from-purple-500 to-pink-600
Deletes: from-orange-500 to-amber-600

// Focus
focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
```

### 🏗️ Proyectos (Verde/Esmeralda/Teal):
```typescript
// Header
from-green-600 via-emerald-600 to-teal-600
dark:from-green-700 dark:via-emerald-700 dark:to-teal-800

// Focus
focus:border-green-500 focus:ring-2 focus:ring-green-500/20
```

### 👥 Clientes (Cyan/Azul/Índigo):
```typescript
// Header
from-cyan-600 via-blue-600 to-indigo-600
dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800

// Focus
focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
```

### 🤝 Negociaciones (Rosa/Púrpura/Índigo):
```typescript
// Header
from-pink-600 via-purple-600 to-indigo-600
dark:from-pink-700 dark:via-purple-700 dark:to-indigo-800

// Focus
focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20
```

### 💰 Abonos (Azul/Índigo/Púrpura):
```typescript
// Header
from-blue-600 via-indigo-600 to-purple-600
dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800

// Focus
focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
```

### 📄 Documentos (Rojo/Rosa/Pink):
```typescript
// Header
from-red-600 via-rose-600 to-pink-600
dark:from-red-700 dark:via-rose-700 dark:to-pink-800

// Focus
focus:border-red-500 focus:ring-2 focus:ring-red-500/20
```

---
  gradient: 'from-green-600 via-emerald-600 to-teal-600',
  dark: 'dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
  shadow: 'shadow-green-500/20'
}

metricas: {
  m1: 'from-green-500 to-emerald-600',
  m2: 'from-teal-500 to-cyan-600',
  m3: 'from-blue-500 to-indigo-600',
  m4: 'from-purple-500 to-pink-600'
}
```

### Viviendas (Naranja/Ámbar):
```typescript
header: {
  gradient: 'from-orange-600 via-amber-600 to-yellow-600',
  dark: 'dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800',
  shadow: 'shadow-orange-500/20'
}

metricas: {
  m1: 'from-orange-500 to-amber-600',
  m2: 'from-yellow-500 to-orange-600',
  m3: 'from-red-500 to-rose-600',
  m4: 'from-green-500 to-emerald-600'
}
```

### Clientes (Cyan/Azul):
```typescript
header: {
  gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
  dark: 'dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800',
  shadow: 'shadow-cyan-500/20'
}

metricas: {
  m1: 'from-cyan-500 to-blue-600',
  m2: 'from-blue-500 to-indigo-600',
  m3: 'from-purple-500 to-pink-600',
  m4: 'from-orange-500 to-amber-600'
}
```

### Negociaciones (Rosa/Púrpura):
```typescript
header: {
  gradient: 'from-pink-600 via-purple-600 to-indigo-600',
  dark: 'dark:from-pink-700 dark:via-purple-700 dark:to-indigo-800',
  shadow: 'shadow-pink-500/20'
}

metricas: {
  m1: 'from-pink-500 to-purple-600',
  m2: 'from-purple-500 to-indigo-600',
  m3: 'from-orange-500 to-amber-600',
  m4: 'from-green-500 to-emerald-600'
}
```

### Abonos (Azul/Índigo - REFERENCIA):
```typescript
header: {
  gradient: 'from-blue-600 via-indigo-600 to-purple-600',
  dark: 'dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800',
  shadow: 'shadow-blue-500/20'
}

metricas: {
  clientes: 'from-blue-500 to-indigo-600',
  abonado: 'from-green-500 to-emerald-600',
  ventas: 'from-purple-500 to-pink-600',
  pendiente: 'from-orange-500 to-amber-600'
}
```

### Documentos (Rojo/Rosa):
```typescript
header: {
  gradient: 'from-red-600 via-rose-600 to-pink-600',
  dark: 'dark:from-red-700 dark:via-rose-700 dark:to-pink-800',
  shadow: 'shadow-red-500/20'
}

metricas: {
  m1: 'from-red-500 to-rose-600',
  m2: 'from-pink-500 to-purple-600',
  m3: 'from-orange-500 to-amber-600',
  m4: 'from-blue-500 to-indigo-600'
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN (ESTÁNDAR COMPACTO)

### Header:
- [ ] Usa `rounded-2xl` (compacto)
- [ ] Padding `p-6` (compacto)
- [ ] Gradiente de 3 colores (from-via-to)
- [ ] Icon circle `w-10 h-10 rounded-xl bg-white/20` (compacto)
- [ ] Icon `w-6 h-6` (compacto)
- [ ] Título `text-2xl font-bold text-white` (compacto)
- [ ] Subtítulo `text-xs` con bullet `•` (compacto)
- [ ] Badge `px-3 py-1.5 text-xs` en esquina derecha (compacto)
- [ ] Botón acción `px-3 py-1.5 rounded-lg` (compacto)
- [ ] Pattern overlay con `bg-grid-white/10`
- [ ] Shadow `shadow-2xl shadow-[COLOR]/20`
- [ ] **Sin `mb-4`**: Todo en una línea horizontal

### Métricas:
- [ ] Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- [ ] Gap `gap-3` (compacto)
- [ ] Card `rounded-xl p-4` (compacto)
- [ ] Icon circle `w-10 h-10 rounded-lg` (compacto)
- [ ] Icon `w-5 h-5` (compacto)
- [ ] Valor `text-xl font-bold` con gradient (compacto)
- [ ] Label `text-xs mt-0.5 font-medium` (compacto)
- [ ] Gap content `gap-3` (compacto)
- [ ] Hover animation `scale: 1.02, y: -4`
- [ ] Glow effect en hover

### Filtros:
- [ ] Sticky `sticky top-4 z-40`
- [ ] Backdrop blur `backdrop-blur-xl`
- [ ] Padding `p-3` (compacto)
- [ ] Border radius `rounded-xl` (compacto)
- [ ] Layout horizontal `flex items-center gap-2` (compacto)
- [ ] Labels ocultos `sr-only` (accesibilidad)
- [ ] Search input `flex-1 py-2 pl-10` (compacto)
- [ ] Search icon `w-4 h-4 left-3` (compacto)
- [ ] Selects `min-w-[180px] py-2` (compacto)
- [ ] Border radius inputs `rounded-lg` (compacto)
- [ ] Footer `mt-2 pt-2` (compacto)
- [ ] Clear button con hover background

### Espaciado General:
- [ ] Container padding `py-6` (compacto)
- [ ] Espacio entre secciones `space-y-4` (compacto)

---

## 📊 COMPARACIÓN: ANTES vs AHORA

| Elemento | Antes | Ahora (Compacto) | Reducción |
|----------|-------|------------------|-----------|
| **Header padding** | p-8 | p-6 | 25% |
| **Header border** | rounded-3xl | rounded-2xl | Más sutil |
| **Header icon** | w-12 h-12 | w-10 h-10 | 17% |
| **Título** | text-3xl | text-2xl | 25% |
| **Métricas padding** | p-6 | p-4 | 33% |
| **Métricas border** | rounded-2xl | rounded-xl | Más sutil |
| **Métricas icon** | w-12 h-12 | w-10 h-10 | 17% |
| **Métricas valor** | text-2xl | text-xl | 17% |
| **Métricas gap** | gap-4 | gap-3 | 25% |
| **Filtros padding** | p-4 | p-3 | 25% |
| **Filtros layout** | Grid 3 cols | Flex horizontal | Más compacto |
| **Input padding** | py-3 | py-2 | 33% |
| **Container py** | py-8 | py-6 | 25% |
| **Space-y** | space-y-6 | space-y-4 | 33% |
| **Espacio vertical total** | ~100% | ~70% | **30% menos** |

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Viviendas** - Implementado con estándar compacto (referencia)
2. ⏳ **Auditorías** - Actualizar a estándar compacto
3. ⏳ **Proyectos** - Aplicar estándar compacto
4. ⏳ **Clientes** - Aplicar estándar compacto
5. ⏳ **Negociaciones** - Aplicar estándar compacto
6. ⏳ **Documentos** - Aplicar estándar compacto
7. ⏳ **Abonos** - Actualizar a estándar compacto

---
3. ⏳ **Validar** en browser
4. ⏳ **Aplicar** a Proyectos, Viviendas, Clientes, Negociaciones, Documentos

---

## 📚 REFERENCIAS

- **Módulo Referencia**: `src/modules/abonos/components/abonos-page-main.tsx`
- **Estilos Referencia**: `src/modules/abonos/styles/seleccion-cliente.styles.ts`
- **Componentes**: Usar estilos directos (no componentes compartidos en esta fase)
