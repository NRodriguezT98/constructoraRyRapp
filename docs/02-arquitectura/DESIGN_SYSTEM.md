# 🎨 Sistema de Diseño - Proyecto Detalle

## 📋 Resumen

Este archivo documenta el **sistema de diseño moderno** implementado en la página de Detalle de Proyecto, que servirá como **modelo base** para todas las demás vistas de la aplicación.

---

## ✨ Características Implementadas

### 1. **Header con Glassmorphism**
- ✅ Fondo con gradiente `from-blue-600 via-indigo-600 to-purple-700`
- ✅ Patrón de fondo animado con círculos pulsantes
- ✅ Breadcrumb para navegación contextual
- ✅ Icono animado con efecto hover (escala)
- ✅ Botones de acción con glassmorphism
- ✅ Backdrop blur para efecto glassmorphism
- ⚠️ **Badge de estado removido** - No útil para proyectos reales

**Uso:**
```tsx
<div className={styles.headerClasses.container}>
  {/* Contenido */}
</div>
```

---

### 2. **Stats Cards Mejorados**
- ✅ Hover effect con elevación (-translate-y-2)
- ✅ Gradiente de fondo en hover
- ✅ Icono con rotación 360° en hover
- ✅ Barra de progreso animada en la parte inferior
- ✅ Sombras y bordes con transiciones suaves
- ⚠️ **Indicadores de tendencia removidos** - Mostrarán datos reales cuando se integre módulo de viviendas

**Características:**
- Grid responsive (1/2/4 columnas)
- Animación escalonada (delay incremental)
- Glassmorphism con `backdrop-blur-sm`

---

### 3. **Barra de Progreso Premium**
- ✅ Header con icono y metadata
- ✅ Barra con gradiente `from-blue-500 via-purple-500 to-pink-500`
- ✅ Efecto shimmer animado (luz que pasa)
- ✅ Milestones informativos (Total, Vendidas, Disponibles)
- ✅ Preparada para calcular % de viviendas vendidas
- ⚠️ **Progreso manual removido** - Se calculará automáticamente cuando se integre módulo de viviendas

**Cálculo Futuro:**
```typescript
// Cuando se integre módulo de viviendas
const viviendasVendidas = viviendas.filter(v => v.estado === 'vendida').length
const porcentajeVendido = (viviendasVendidas / totalViviendas) * 100
```

---

### 4. **Tabs con Underline Animado**
- ✅ Underline con `layoutId` para transición fluida
- ✅ Iconos por tab
- ✅ Badges con contadores
- ✅ Hover effect (y: -2)
- ✅ Colores dinámicos (activo/inactivo)

**Técnica:**
```tsx
{activeTab === tab.id && (
  <motion.div
    layoutId="activeTab"
    className={styles.tabsClasses.tabUnderline}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  />
)}
```

---

### 5. **Info Cards con Profundidad**
- ✅ Gradiente sutil `from-white to-gray-50`
- ✅ Header con icono en gradiente
- ✅ Hover effect (elevación y sombra)
- ✅ Iconos contextuales en filas de datos
- ✅ Tipografía jerárquica (label/value)

---

## 🎨 Paleta de Colores

### Gradientes Principales
```typescript
presupuesto: 'from-blue-500 to-indigo-600'
manzanas: 'from-green-500 to-emerald-600'
viviendas: 'from-purple-500 to-violet-600'
fecha: 'from-orange-500 to-amber-600'
descripcion: 'from-blue-500 to-indigo-600'
contacto: 'from-purple-500 to-violet-600'
progreso: 'from-blue-500 to-purple-600'
```

### Estados
- **En Planificación:** `bg-blue-400` (dot pulsante)
- **En Construcción:** `bg-orange-400` (dot pulsante)
- **Completado:** `bg-green-400`
- **Pausado:** `bg-gray-400`

---

## 🎭 Animaciones Framer Motion

### Patterns Reutilizables

#### 1. Fade In Up
```typescript
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}
```

#### 2. Hover Lift
```typescript
whileHover: { y: -8, scale: 1.02 }
```

#### 3. Hover Rotate (Iconos)
```typescript
{
  whileHover: { rotate: 360 },
  transition: { duration: 0.6 }
}
```

#### 4. Status Pulse
```typescript
{
  animate: { scale: [1, 1.05, 1] },
  transition: { repeat: Infinity, duration: 2 }
}
```

#### 5. Progress Bar
```typescript
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${value}%` }}
  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
/>
```

---

## 📦 Estructura de Archivos

```
src/app/proyectos/[id]/
├── proyecto-detalle-client.tsx    # Componente principal (refactorizado)
├── proyecto-detalle.styles.ts     # Estilos centralizados
└── page.tsx                       # Server component wrapper
```

---

## 🔧 Cómo Aplicar a Otras Páginas

### Paso 1: Copiar archivo de estilos
```bash
# Copiar estructura de estilos
cp proyecto-detalle.styles.ts ../nueva-pagina/nueva-pagina.styles.ts
```

### Paso 2: Importar estilos
```tsx
import * as styles from './nueva-pagina.styles'
```

### Paso 3: Usar componentes del sistema

#### Header
```tsx
<div className={styles.headerClasses.container}>
  <div className={styles.headerClasses.breadcrumb}>
    {/* Breadcrumb */}
  </div>
  <div className={styles.headerClasses.contentWrapper}>
    {/* Contenido */}
  </div>
</div>
```

#### Stats Card
```tsx
<motion.div
  {...styles.animations.fadeInUp}
  transition={{ delay: 0.3 }}
  {...styles.animations.hoverLift}
  className={styles.statsCardClasses.card}
>
  {/* Contenido de stat */}
</motion.div>
```

#### Progress Bar
```tsx
<div className={styles.progressClasses.container}>
  <div className={styles.progressClasses.bar}>
    <motion.div
      className={styles.progressClasses.barFill}
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
    />
  </div>
</div>
```

---

## 🎯 Beneficios del Sistema

### ✅ Consistencia Visual
- Todas las páginas usan los mismos componentes
- Colores y espaciados estandarizados
- Animaciones predecibles

### ✅ Mantenibilidad
- Estilos en archivos separados (`.styles.ts`)
- Fácil actualización global
- Sin duplicación de código

### ✅ Performance
- Animaciones optimizadas con Framer Motion
- CSS modular con Tailwind
- Tree-shaking automático

### ✅ Escalabilidad
- Componentes reutilizables
- Patterns documentados
- Fácil de extender

---

## 📚 Próximos Pasos

### Para Estandarizar Otras Páginas:

1. **Lista de Proyectos** (`/proyectos`)
   - [ ] Usar `statsCardClasses` para tarjetas de proyecto
   - [ ] Implementar header similar con filtros
   - [ ] Tabs para vistas (Grid/Lista)

2. **Viviendas** (`/viviendas`)
   - [ ] Header con breadcrumb
   - [ ] Stats cards para métricas
   - [ ] Tabla con hover effects

3. **Clientes** (`/clientes`)
   - [ ] Header consistente
   - [ ] Info cards para detalles
   - [ ] Timeline de actividad

4. **Dashboard** (`/`)
   - [ ] ✅ Ya tiene diseño moderno (referencia)
   - [ ] Alinear stats cards con nuevo sistema

---

## 🔍 Componentes Compartidos a Crear

Para maximizar reutilización, crear en `src/shared/components/layouts/`:

```
PageHeader.tsx          # Header con breadcrumb y acciones
StatsGrid.tsx          # Grid de estadísticas reutilizable
ProgressCard.tsx       # Card de progreso premium
TabsContainer.tsx      # Tabs con underline animado
InfoCard.tsx           # Card de información con gradiente
```

---

## 📖 Referencias

- **Glassmorphism:** `backdrop-blur-xl` + `bg-white/20`
- **Gradientes:** `bg-gradient-to-br` con 2-3 colores
- **Sombras:** `shadow-lg`, `shadow-2xl`, `shadow-3xl`
- **Transiciones:** `transition-all duration-300`
- **Hover:** `hover:scale-105`, `hover:-translate-y-2`

---

## ✨ Resultado Final

La página de Detalle de Proyecto ahora tiene:

✅ **Header impactante** con glassmorphism y gradientes
✅ **Stats cards interactivos** con animaciones premium
✅ **Barra de progreso profesional** con efecto shimmer
✅ **Tabs modernos** con transiciones fluidas
✅ **Info cards con profundidad** visual
✅ **Microinteracciones** en hover/click
✅ **Animaciones escalonadas** para entrada de elementos
✅ **Diseño responsive** optimizado

**Siguiente paso:** Aplicar estos patterns a las demás páginas para lograr consistencia total.

---

**Creado:** 15 de octubre de 2025
**Versión:** 1.0
**Modelo Base:** `/proyectos/[id]`
