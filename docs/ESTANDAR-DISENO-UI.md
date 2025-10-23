# 🎨 Estándar de Diseño UI - RyR Constructora

> **Referencia:** Módulo Abonos - Vista Detalle Cliente
> **Archivo:** `src/app/abonos/[clienteId]/page.tsx`
> **Última actualización:** Octubre 2025

---

## 🎯 Principios de Diseño

### 1. **Densidad Visual Optimizada**
- Maximizar información visible sin scroll excesivo
- Reducir padding y spacing sin sacrificar legibilidad
- Balance entre compactación y respiración visual

### 2. **Información Completa**
- ❌ NO abreviar fechas, valores monetarios ni textos importantes
- ✅ Mostrar información completa en formato legible
- Usar formato colombiano para fechas y moneda

### 3. **Consistencia Total**
- Todos los componentes similares deben tener tamaños armónicos
- Íconos del mismo tipo con tamaño uniforme
- Espaciado proporcional entre elementos

### 4. **Diseño Responsivo**
- Mobile-first con breakpoints sm: y md:
- Ajustes proporcionales para tablet y desktop
- Mantener legibilidad en todos los dispositivos

---

## 📐 Sistema de Espaciado

### Padding de Cards
```typescript
// Estándar para tarjetas principales
card: 'p-3 sm:p-4 md:p-5'

// Tarjetas compactas (métricas, items de lista)
cardCompact: 'p-3 sm:p-4'

// Secciones grandes (timeline, tablas)
section: 'p-4 sm:p-5 md:p-6'
```

### Gaps y Márgenes
```typescript
// Gap entre elementos del mismo nivel
gap: 'gap-3 sm:gap-4'

// Margen entre secciones
margin: 'mb-4 sm:mb-5 md:mb-6'

// Spacing vertical en listas
spacing: 'space-y-3 sm:space-y-4'
```

---

## 🎨 Sistema de Tamaños

### Íconos

#### Íconos Principales (Headers, Métricas)
```typescript
icon: 'w-6 h-6 sm:w-7 sm:h-7'
iconCircle: 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11'
```

#### Íconos de Timeline/Estados
```typescript
dotIcon: 'w-5 h-5 sm:w-6 sm:h-6'
dotCircle: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14'
```

#### Íconos de Badges
```typescript
badgeIcon: 'w-3.5 h-3.5 sm:w-4 sm:h-4'
```

### Tipografía

#### Títulos de Secciones
```typescript
sectionTitle: 'text-lg sm:text-xl md:text-2xl font-bold'
```

#### Títulos de Cards
```typescript
cardTitle: 'text-base sm:text-lg font-semibold'
```

#### Valores Numéricos (Métricas)
```typescript
value: 'text-xl sm:text-2xl md:text-3xl font-bold'
valueCompact: 'text-lg sm:text-xl md:text-2xl font-bold'
```

#### Labels y Descripciones
```typescript
label: 'text-xs sm:text-sm text-muted-foreground'
description: 'text-sm sm:text-base'
```

#### Badges
```typescript
badge: 'text-xs sm:text-sm px-2.5 py-0.5'
```

---

## 🎭 Gradientes y Colores

### Cards con Estado

#### Card Normal
```typescript
card: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800'
```

#### Card Completada (Estado Positivo)
```typescript
cardCompletada: 'opacity-75 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800'
```

#### Card Activa (Seleccionada/Activa)
```typescript
cardActive: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800'
```

#### Card Advertencia
```typescript
cardWarning: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800'
```

#### Card Error
```typescript
cardError: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border-red-200 dark:border-red-800'
```

### Círculos de Íconos

#### Círculo Azul (Principal)
```typescript
iconCircleBlue: 'bg-gradient-to-br from-blue-500 to-indigo-600'
```

#### Círculo Verde (Éxito/Completado)
```typescript
iconCircleGreen: 'bg-gradient-to-br from-green-500 to-emerald-600'
```

#### Círculo Amarillo (Advertencia/Pendiente)
```typescript
iconCircleYellow: 'bg-gradient-to-br from-yellow-500 to-amber-600'
```

#### Círculo Rojo (Error/Cancelado)
```typescript
iconCircleRed: 'bg-gradient-to-br from-red-500 to-rose-600'
```

#### Círculo Púrpura (Especial)
```typescript
iconCirclePurple: 'bg-gradient-to-br from-purple-500 to-violet-600'
```

---

## 🔄 Animaciones

### Hover en Cards
```typescript
// Framer Motion
whileHover={{ scale: 1.02, y: -5 }}
transition={{ duration: 0.2, ease: 'easeOut' }}

// Tailwind (alternativa)
className: 'transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg'
```

### Transiciones Suaves
```typescript
// Aplicar a elementos interactivos
className: 'transition-all duration-300 ease-in-out'
```

### Estados de Loading
```typescript
// Skeleton shimmer effect
className: 'animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600'
```

---

## 📊 Componentes Específicos

### 1. Métricas (KPI Cards)

**Estructura:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  <Card className={styles.metricasStyles.card}>
    {/* Ícono + Valor + Label */}
  </Card>
</div>
```

**Estilos:**
```typescript
metricasStyles: {
  container: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
  card: 'p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200',
  content: 'flex items-center justify-between gap-3',
  info: 'flex-1',
  value: 'text-xl sm:text-2xl md:text-3xl font-bold mb-1',
  label: 'text-xs sm:text-sm text-muted-foreground',
  iconCircle: 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0',
  icon: 'w-5 h-5 sm:w-6 sm:h-6 text-white'
}
```

### 2. Cards de Información (Fuentes de Pago, Negociaciones, etc.)

**Estructura:**
```tsx
<Card className={styles.fuentesStyles.card}>
  <CardHeader className={styles.fuentesStyles.header}>
    <div className={styles.fuentesStyles.iconCircle}>
      <Icon className={styles.fuentesStyles.icon} />
    </div>
    <div className={styles.fuentesStyles.headerText}>
      <CardTitle>{titulo}</CardTitle>
      <CardDescription>{descripcion}</CardDescription>
    </div>
  </CardHeader>
  <CardContent className={styles.fuentesStyles.content}>
    {/* Información detallada */}
  </CardContent>
  <CardFooter className={styles.fuentesStyles.footer}>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

**Estilos:**
```typescript
fuentesStyles: {
  container: 'space-y-3 sm:space-y-4',
  card: 'p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200',
  header: 'flex items-start gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800',
  iconCircle: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0',
  icon: 'w-5 h-5 sm:w-6 sm:h-6 text-white',
  headerText: 'flex-1 min-w-0',
  title: 'text-base sm:text-lg font-semibold truncate',
  description: 'text-xs sm:text-sm text-muted-foreground mt-1',
  content: 'space-y-3 py-3 sm:py-4',
  infoRow: 'flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0',
  label: 'text-xs sm:text-sm text-muted-foreground',
  value: 'text-sm sm:text-base font-semibold',
  footer: 'pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800'
}
```

### 3. Timeline / Historial

**Estructura:**
```tsx
<div className={styles.timelineStyles.container}>
  <div className={styles.timelineStyles.header}>
    <h3 className={styles.timelineStyles.title}>Historial</h3>
  </div>

  <div className={styles.timelineStyles.list}>
    {items.map((item, index) => (
      <div key={item.id} className={styles.timelineStyles.itemContainer}>
        {/* Línea vertical */}
        {index !== items.length - 1 && (
          <div className={styles.timelineStyles.line} />
        )}

        {/* Dot indicador */}
        <div className={styles.timelineStyles.dotContainer}>
          <div className={styles.timelineStyles.dotCircle}>
            <Icon className={styles.timelineStyles.dotIcon} />
          </div>
        </div>

        {/* Card de contenido */}
        <Card className={styles.timelineStyles.card}>
          {/* Contenido del item */}
        </Card>
      </div>
    ))}
  </div>
</div>
```

**Estilos:**
```typescript
timelineStyles: {
  container: 'space-y-3 sm:space-y-4',
  header: 'flex items-center gap-3 mb-4 sm:mb-5',
  title: 'text-lg sm:text-xl md:text-2xl font-bold',
  headerIcon: 'w-6 h-6 sm:w-7 sm:h-7',

  list: 'space-y-4 sm:space-y-5',
  itemContainer: 'relative pl-8 sm:pl-10 md:pl-12',

  // Línea vertical
  line: 'absolute left-4 sm:left-5 md:left-6 top-10 sm:top-12 md:top-14 bottom-0 w-px bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700',

  // Dot circular
  dotContainer: 'absolute left-0 top-0',
  dotCircle: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg',
  dotIcon: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white',

  // Card de contenido
  card: 'p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200',
  cardHeader: 'flex justify-between items-start mb-3 sm:mb-4',
  badge: 'px-2.5 py-0.5 text-xs sm:text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium',
  date: 'text-xs sm:text-sm text-muted-foreground',

  amount: 'text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3',
  details: 'space-y-2',
  detailRow: 'flex justify-between items-center text-xs sm:text-sm',
  detailLabel: 'text-muted-foreground',
  detailValue: 'font-medium'
}
```

### 4. Header de Página

**Estructura:**
```tsx
<div className={styles.headerStyles.container}>
  <div className={styles.headerStyles.backButton}>
    <Button variant="ghost" onClick={goBack}>
      <ArrowLeft />
      Volver
    </Button>
  </div>

  <div className={styles.headerStyles.content}>
    <div className={styles.headerStyles.iconCircle}>
      <Icon className={styles.headerStyles.icon} />
    </div>
    <div className={styles.headerStyles.info}>
      <h1 className={styles.headerStyles.title}>{titulo}</h1>
      <p className={styles.headerStyles.subtitle}>{subtitulo}</p>
    </div>
  </div>
</div>
```

**Estilos:**
```typescript
headerStyles: {
  container: 'space-y-4 sm:space-y-5 mb-6 sm:mb-8',
  backButton: 'flex items-center',
  content: 'flex items-center gap-4 sm:gap-5',
  iconCircle: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg',
  icon: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white',
  info: 'flex-1 min-w-0',
  title: 'text-xl sm:text-2xl md:text-3xl font-bold truncate',
  subtitle: 'text-sm sm:text-base text-muted-foreground mt-1'
}
```

---

## 🎯 Badges y Estados

### Sistema de Badges
```typescript
badgeStyles: {
  base: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium transition-colors',

  // Estados de negociación/proceso
  activa: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  pendiente: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  completada: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  cancelada: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',

  // Estados de pago
  pagado: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  pendientePago: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  vencido: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',

  // Estados de vivienda
  disponible: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  reservada: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  vendida: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
}
```

---

## 📱 Breakpoints Responsivos

### Sistema de Breakpoints
```typescript
// Tailwind default breakpoints (mantener consistencia)
sm: '640px'   // Tablet pequeña
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Desktop grande
2xl: '1536px' // Desktop extra grande
```

### Patrones Comunes

#### Grid Responsivo
```typescript
// 1 columna móvil, 2 tablet, 3-4 desktop
grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
```

#### Flex Responsivo
```typescript
// Stack en móvil, row en tablet+
flex: 'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'
```

#### Texto Responsivo
```typescript
// Progresión natural de tamaños
title: 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
body: 'text-sm sm:text-base md:text-lg'
small: 'text-xs sm:text-sm'
```

---

## ✅ Checklist de Implementación

Al crear una nueva vista, verificar:

### Estructura
- [ ] Componente principal < 150 líneas
- [ ] Lógica extraída a hook personalizado (`use[Vista].ts`)
- [ ] Estilos centralizados en archivo `.styles.ts`
- [ ] Tipos TypeScript en archivo `types/index.ts`
- [ ] Barrel export (`index.ts`) en carpeta de componentes

### Estilos
- [ ] Padding de cards: `p-3 sm:p-4`
- [ ] Íconos principales: `w-6 h-6 sm:w-7 sm:h-7`
- [ ] Íconos en círculos: `w-9 h-9 sm:w-10 sm:h-10`
- [ ] Títulos de sección: `text-lg sm:text-xl`
- [ ] Valores numéricos: `text-xl sm:text-2xl`
- [ ] Gaps entre elementos: `gap-3 sm:gap-4`
- [ ] Márgenes entre secciones: `mb-4 sm:mb-5`

### Responsividad
- [ ] Grid adapta columnas según breakpoint
- [ ] Texto escala proporcionalmente
- [ ] Íconos ajustan tamaño
- [ ] Spacing crece en pantallas grandes
- [ ] Probado en móvil (375px), tablet (768px) y desktop (1280px)

### Interactividad
- [ ] Hover en cards: `whileHover={{ scale: 1.02, y: -5 }}`
- [ ] Transiciones suaves: `transition-all duration-200`
- [ ] Estados visuales claros (hover, active, disabled)
- [ ] Loading states con skeleton o spinner

### Accesibilidad
- [ ] Contraste de colores suficiente (WCAG AA)
- [ ] Textos alternativos en íconos importantes
- [ ] Navegación por teclado funcional
- [ ] Focus visible en elementos interactivos

### Performance
- [ ] `useMemo` para valores calculados
- [ ] `useCallback` para funciones como props
- [ ] Lazy loading de componentes pesados
- [ ] Optimización de re-renders

---

## 🔍 Ejemplo de Referencia Completo

**Archivo:** `src/app/abonos/[clienteId]/styles/abonos-detalle.styles.ts`

```typescript
export const abonosDetalleStyles = {
  // Layout principal
  container: 'space-y-4 sm:space-y-5 md:space-y-6',

  // Métricas
  metricasStyles: {
    container: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
    card: 'p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200',
    content: 'flex items-center justify-between gap-3',
    info: 'flex-1',
    value: 'text-xl sm:text-2xl md:text-3xl font-bold mb-1',
    label: 'text-xs sm:text-sm text-muted-foreground',
    iconCircle: 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0',
    icon: 'w-5 h-5 sm:w-6 sm:h-6 text-white'
  },

  // Fuentes de pago
  fuentesStyles: {
    section: 'space-y-3 sm:space-y-4',
    sectionHeader: 'flex items-center gap-3 mb-3 sm:mb-4',
    sectionTitle: 'text-lg sm:text-xl font-bold',
    sectionIcon: 'w-6 h-6 text-purple-600 dark:text-purple-400',

    container: 'space-y-3 sm:space-y-4',
    card: 'p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200 cursor-pointer',
    cardCompletada: 'opacity-75 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800',

    header: 'flex items-start gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800',
    iconCircle: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0',
    icon: 'w-5 h-5 sm:w-6 sm:h-6 text-white',
    headerText: 'flex-1 min-w-0',
    title: 'text-sm sm:text-base font-semibold truncate',
    tipo: 'text-xs sm:text-sm text-muted-foreground mt-0.5',

    content: 'space-y-2 sm:space-y-3 py-3 sm:py-4',
    valorRow: 'flex justify-between items-baseline',
    valorLabel: 'text-xs sm:text-sm text-muted-foreground',
    valorAmount: 'text-lg sm:text-xl font-bold',

    progressContainer: 'space-y-2',
    progressBar: 'h-2 sm:h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden',
    progressFill: 'h-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-300',
    progressText: 'text-xs sm:text-sm text-muted-foreground',

    infoGrid: 'grid grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-gray-200 dark:border-gray-800',
    infoItem: 'space-y-1',
    infoLabel: 'text-xs text-muted-foreground',
    infoValue: 'text-sm sm:text-base font-semibold',

    footer: 'flex gap-2 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800'
  },

  // Timeline
  timelineStyles: {
    section: 'space-y-3 sm:space-y-4',
    sectionHeader: 'flex items-center gap-3 mb-3 sm:mb-4',
    sectionTitle: 'text-lg sm:text-xl font-bold',
    sectionIcon: 'w-6 h-6 text-blue-600 dark:text-blue-400',

    container: 'space-y-4 sm:space-y-5',
    itemContainer: 'relative pl-8 sm:pl-10 md:pl-12',

    line: 'absolute left-4 sm:left-5 md:left-6 top-10 sm:top-12 md:top-14 bottom-0 w-px bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700',

    dotContainer: 'absolute left-0 top-0',
    dotCircle: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg',
    dotIcon: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white',

    card: 'p-3 sm:p-4 md:p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200',
    cardHeader: 'flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-3 sm:mb-4',
    badge: 'px-2.5 py-0.5 text-xs sm:text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium w-fit',
    date: 'text-xs sm:text-sm text-muted-foreground',

    amount: 'text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3',
    details: 'space-y-2',
    detailRow: 'flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0',
    detailLabel: 'text-xs sm:text-sm text-muted-foreground',
    detailValue: 'text-xs sm:text-sm font-medium'
  }
}
```

---

## 🚀 Aplicación a Otros Módulos

### Prioridad de Implementación

1. **Alta Prioridad** (flujos principales):
   - ✅ Abonos (completado - referencia)
   - [ ] Negociaciones
   - [ ] Viviendas
   - [ ] Clientes

2. **Media Prioridad**:
   - [ ] Proyectos
   - [ ] Documentos
   - [ ] Renuncias

3. **Baja Prioridad**:
   - [ ] Configuración
   - [ ] Reportes
   - [ ] Auditoría

---

## 📝 Notas Finales

- **Mantener consistencia** es más importante que innovación individual
- **Mobile-first** siempre - diseñar para pantallas pequeñas primero
- **Documentar desviaciones** - si necesitas romper el estándar, documentar por qué
- **Revisar periódicamente** - este documento debe evolucionar con el sistema

---

**Última revisión:** Octubre 2025
**Mantenido por:** Equipo de Desarrollo RyR
**Referencia viva:** Este documento debe actualizarse con cada mejora significativa
