# Accordion Wizard — Estándar Unificado de Creación

**Fecha**: 2026-03-21
**Estado**: Aprobado
**Módulos afectados**: Proyectos, Viviendas, Clientes

---

## 1. Problema

Los 3 módulos de creación tienen implementaciones inconsistentes:

| Aspecto | Proyecto | Vivienda | Cliente |
|---------|----------|----------|---------|
| Entrega | Modal | Página `/viviendas/nueva` | Modal |
| Pasos | Ninguno | 5 con stepper horizontal | 3-4 con stepper |
| Estilos | `.styles.ts` propio | `.styles.ts` propio | Tailwind inline |
| Campos | Inputs manuales con iconos | Inputs manuales | `ModernInput` compartido |
| Focus ring | `ring-4` | `ring-2` | `ring-4` |
| Labels | `text-sm` | `text-xs` | `text-sm` |

Resultado: cada formulario se siente como una app diferente.

## 2. Decisión

**Opción elegida: Accordion Flow** — cada paso es una sección expandible/colapsable. El formulario mismo comunica el progreso. Inspirado en Stripe Checkout / Apple Checkout.

**Descartadas**:
- Split Panel (sidebar + form): excelente pero mayor complejidad responsive
- Card Minimal (evolución del actual): insuficiente diferenciación

## 3. Arquitectura

### 3.1 Componentes compartidos

```
src/shared/components/accordion-wizard/
├── AccordionWizardLayout.tsx          # Page wrapper (breadcrumbs + bg + secciones)
├── AccordionWizardSection.tsx         # Sección individual (3 estados)
├── AccordionWizardSummary.tsx         # Resumen colapsado (1 línea)
├── AccordionWizardNavigation.tsx      # Barra Atrás / Dots / Siguiente (dentro de sección)
├── AccordionWizardField.tsx           # Campo unificado (floating label + glow)
├── accordion-wizard.styles.ts        # getAccordionWizardStyles(moduleName)
├── accordion-wizard.types.ts         # Tipos compartidos
├── accordion-wizard.animations.ts    # Constantes de Framer Motion
└── index.ts                           # Barrel export
```

### 3.2 Responsabilidades

| Componente | Hace | NO hace |
|---|---|---|
| `AccordionWizardLayout` | Renderiza breadcrumbs, fondo de página, envuelve children | Lógica de negocio, validación |
| `AccordionWizardSection` | Gestiona estado visual (3 estados), animación expand/collapse | Conocer qué campos tiene cada paso |
| `AccordionWizardSummary` | Muestra `items: {label, value}[]` en 1 línea con separadores | Decidir qué datos mostrar |
| `AccordionWizardNavigation` | Renderiza Atrás/Siguiente/Submit, dots de progreso | Decidir cuándo avanzar (eso es del hook) |
| `AccordionWizardField` | Input/Select/Textarea con floating label, theming, error | Validación (eso es de Zod/RHF) |

### 3.3 Flujo de datos

```
Ruta (/proyectos/nuevo)
  └─ page.tsx (Server Component — permisos)
      └─ NuevoProyectoView.tsx (Client Component — presentación)
          ├─ useNuevoProyecto() ← TODA la lógica (RHF, Zod, pasos, submit)
          └─ <AccordionWizardLayout>
              ├─ <AccordionWizardSection status="completed">
              │   └─ <AccordionWizardSummary items={...} />
              ├─ <AccordionWizardSection status="active">
              │   ├─ <PasoManzanas register={...} errors={...} />
              │   └─ <AccordionWizardNavigation onNext={...} onBack={...} />
              └─ <AccordionWizardSection status="pending" />
```

## 4. Diseño visual

### 4.1 Page Container

```
min-h-screen bg-gradient-to-br from-gray-50 via-{primary}-50/20 to-{secondary}-50/20
dark: from-gray-950 via-{primary}-950/10 to-{secondary}-950/10
content: max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-3
```

El ancho máximo es `max-w-3xl` (no full-width) para centrar la atención y dar sensación de formulario guiado.

### 4.2 Breadcrumb Bar

```
flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6
← icono interactivo (vuelve al listado con confirmación si hay cambios)
Separador: ChevronRight w-4 h-4
Último item: text-{primary}-600 font-medium
```

### 4.3 Sección — Estado COMPLETADO

```tsx
<motion.div className={cn(
  'rounded-2xl border-2 border-gray-200 dark:border-gray-700',
  'border-l-4 border-l-green-500',
  'bg-white dark:bg-gray-900',
  'px-6 py-4',
  'transition-all duration-200',
  'hover:shadow-md cursor-pointer'
)}>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Check animado */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30
        flex items-center justify-center">
        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
      </motion.div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {/* Resumen en 1 línea */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {summaryText}
        </p>
      </div>
    </div>
    <button className="text-xs font-medium text-{primary}-600
      hover:text-{primary}-700 flex items-center gap-1">
      <Pencil className="w-3 h-3" /> Editar
    </button>
  </div>
</motion.div>
```

### 4.4 Sección — Estado ACTIVO

```tsx
<motion.div className={cn(
  'rounded-2xl border-2',
  'border-{primary}-300 dark:border-{primary}-700',
  'border-l-4 border-l-{primary}-500',
  'bg-white dark:bg-gray-900',
  'shadow-lg shadow-{primary}-500/5',
  'overflow-hidden'
)}>
  {/* Header */}
  <div className="px-6 pt-5 pb-0">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-{primary}-100 dark:bg-{primary}-900/30
          flex items-center justify-center">
          <span className="text-sm font-bold text-{primary}-600">{stepNumber}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <span className="text-xs text-gray-400">Paso {current} de {total}</span>
    </div>

    {/* Progress bar */}
    <div className="mt-3 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-{primary}-500 to-{secondary}-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  </div>

  {/* Content (animated) */}
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    className="px-6 pt-4 pb-5"
  >
    {children}

    {/* Navigation integrada */}
    <AccordionWizardNavigation ... />
  </motion.div>
</motion.div>
```

### 4.5 Sección — Estado PENDIENTE

```tsx
<div className={cn(
  'rounded-2xl border-2 border-gray-200 dark:border-gray-800',
  'border-l-4 border-l-gray-300 dark:border-l-gray-600',
  'bg-gray-50 dark:bg-gray-900/50',
  'px-6 py-4 opacity-50'
)}>
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800
      flex items-center justify-center">
      <span className="text-sm font-medium text-gray-400">{stepNumber}</span>
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">{title}</h3>
      <p className="text-xs text-gray-400 dark:text-gray-600">
        Completa los pasos anteriores para continuar
      </p>
    </div>
  </div>
</div>
```

### 4.6 AccordionWizardField (Floating Label)

El campo usa CSS `peer` pseudo-classes para detectar si el input tiene valor (`placeholder-shown`) o focus, y flotar el label correspondientemente.

**Comportamiento del floating label**:
- **Sin valor, sin focus**: label centrado verticalmente (`top-3.5 text-sm text-gray-400`)
- **Con focus**: label sube (`top-1.5 text-xs font-semibold text-{primary}-600`)
- **Con valor (aun sin focus)**: label sube (misma posición que focused)
- **Con defaultValue/pre-filled**: label SIEMPRE floated desde el mount (el `placeholder-shown` de CSS se encarga automáticamente porque el input tiene valor)
- **Al borrar todo el texto**: label baja a posición resting

> **Nota técnica**: `placeholder-transparent` + `peer-placeholder-shown:` es la clave.
> CSS detecta automáticamente si el input tiene valor, sin necesidad de estado JS.
> Esto funciona correctamente con `defaultValue`, `value`, y `register()` de RHF.

```tsx
interface AccordionWizardFieldProps {
  label: string
  type?: 'text' | 'date' | 'number' | 'email' | 'tel'
  error?: string
  required?: boolean
  moduleName: ModuleName
  // ...extends InputHTMLAttributes
}

export function AccordionWizardField({ label, error, required, moduleName, ...props }: AccordionWizardFieldProps) {
  const styles = getAccordionWizardStyles(moduleName)
  const hasError = !!error

  return (
    <div className="relative">
      <input
        className={cn(
          styles.field.inputBase,
          hasError ? styles.field.inputError : styles.field.inputFocus,
          'peer'
        )}
        placeholder={label}  // ← invisible (placeholder-transparent) pero activa peer-placeholder-shown
        {...props}
      />
      <label className={cn(
        'absolute left-4 transition-all duration-200 pointer-events-none',
        // Resting (input vacío Y no focused)
        'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm',
        'peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500',
        'peer-placeholder-shown:font-normal',
        // Floated (tiene valor O tiene focus)
        'top-1.5 text-xs font-semibold',
        hasError ? 'text-red-500' : styles.field.labelFloated,
        'peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-semibold',
        hasError ? 'peer-focus:text-red-500' : styles.field.labelFloated
      )}>
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>

      {/* Error message con shake */}
      {hasError ? (
        <motion.p
          initial={{ x: -5 }}
          animate={{ x: [5, -3, 3, 0] }}
          transition={{ duration: 0.3 }}
          className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      ) : null}
    </div>
  )
}
```

### 4.7 AccordionWizardNavigation

```tsx
<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100
  dark:border-gray-800">
  {/* Back */}
  {!isFirst && (
    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5
      rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <ChevronLeft className="w-4 h-4" /> Atrás
    </button>
  )}

  {/* Dots indicator */}
  <div className="flex items-center gap-1.5">
    {steps.map((_, i) => (
      <div key={i} className={cn(
        'w-2 h-2 rounded-full transition-all',
        i + 1 < currentStep && 'bg-green-500',
        i + 1 === currentStep && 'bg-{primary}-500 w-6',  // ← dot activo es pill
        i + 1 > currentStep && 'bg-gray-300 dark:bg-gray-600'
      )} />
    ))}
  </div>

  {/* Next / Submit */}
  {!isLast ? (
    <button onClick={onNext} className="flex items-center gap-2 px-5 py-2.5
      rounded-xl text-sm font-semibold text-white
      bg-gradient-to-r from-{primary}-600 to-{secondary}-600
      hover:from-{primary}-700 hover:to-{secondary}-700
      shadow-md shadow-{primary}-500/20 hover:shadow-lg
      transition-all active:scale-[0.98]">
      Siguiente <ChevronRight className="w-4 h-4" />
    </button>
  ) : (
    <button onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2
      px-5 py-2.5 rounded-xl text-sm font-semibold text-white
      bg-gradient-to-r from-green-600 to-emerald-600
      hover:from-green-700 hover:to-emerald-700
      shadow-md shadow-green-500/20 hover:shadow-lg
      transition-all active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed">
      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      {submitLabel}
    </button>
  )}
</div>
```

### 4.8 Animaciones

```typescript
// accordion-wizard.animations.ts

export const accordionAnimations = {
  // Sección expandiéndose
  sectionExpand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },

  // Resumen apareciendo después de colapsar
  summaryAppear: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.15, duration: 0.2 },
  },

  // Campos con stagger al abrir sección
  fieldStagger: {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.2 },
    }),
  },

  // Check al completar paso
  checkAppear: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: 'spring', stiffness: 400, damping: 15 },
  },

  // Shake en error
  errorShake: {
    animate: { x: [0, -5, 5, -3, 3, 0] },
    transition: { duration: 0.3 },
  },

  // Progress bar
  progressBar: {
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Page entrance
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
} as const
```

## 5. Estilos paramétricos

> **REGLA CRÍTICA**: Tailwind JIT NO soporta template literals con interpolación de variables
> en tiempo de ejecución (ej: `` `border-${color}-500` ``). TODOS los valores de clase deben
> ser strings completos pre-construidos. La función `getAccordionWizardStyles` construye
> un mapa de strings completos usando los valores pre-construidos de `moduleThemes.classes`.

```typescript
// accordion-wizard.styles.ts
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

// ⚠️ Mapas de clases completas por módulo (Tailwind puede escanearlas)
const PAGE_BG: Record<ModuleName, string> = {
  proyectos: 'min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50/20 dark:from-gray-950 dark:via-green-950/10 dark:to-emerald-950/10',
  viviendas: 'min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-amber-50/20 dark:from-gray-950 dark:via-orange-950/10 dark:to-amber-950/10',
  clientes: 'min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/20 to-blue-50/20 dark:from-gray-950 dark:via-cyan-950/10 dark:to-blue-950/10',
  // ... otros módulos siguen el mismo patrón
}

const SECTION_ACTIVE: Record<ModuleName, string> = {
  proyectos: 'border-green-300 dark:border-green-700 border-l-4 border-l-green-500 bg-white dark:bg-gray-900 shadow-lg shadow-green-500/5',
  viviendas: 'border-orange-300 dark:border-orange-700 border-l-4 border-l-orange-500 bg-white dark:bg-gray-900 shadow-lg shadow-orange-500/5',
  clientes: 'border-cyan-300 dark:border-cyan-700 border-l-4 border-l-cyan-500 bg-white dark:bg-gray-900 shadow-lg shadow-cyan-500/5',
}

const STEP_CIRCLE_ACTIVE: Record<ModuleName, string> = {
  proyectos: 'w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center',
  viviendas: 'w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center',
  clientes: 'w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center',
}

const FIELD_FOCUS: Record<ModuleName, string> = {
  proyectos: 'focus:border-green-500 focus:shadow-[0_0_0_3px] focus:shadow-green-500/15',
  viviendas: 'focus:border-orange-500 focus:shadow-[0_0_0_3px] focus:shadow-orange-500/15',
  clientes: 'focus:border-cyan-500 focus:shadow-[0_0_0_3px] focus:shadow-cyan-500/15',
}

// ... mapas similares para cada variante dinámica (LABEL_FLOATED, DOT_ACTIVE, EDIT_BUTTON, etc.)

export const getAccordionWizardStyles = (moduleName: ModuleName) => {
  const theme = moduleThemes[moduleName]

  return {
    page: {
      container: PAGE_BG[moduleName] ?? PAGE_BG.proyectos,
      content: 'max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-3',
    },
    breadcrumbs: {
      container: 'flex items-center gap-2 text-sm mb-6',
      link: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors',
      current: theme.classes.text.primary + ' font-medium',
    },
    section: {
      base: 'rounded-2xl border-2 transition-all duration-200',
      completed: 'border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500 bg-white dark:bg-gray-900 hover:shadow-md cursor-pointer px-6 py-4',
      active: SECTION_ACTIVE[moduleName] ?? SECTION_ACTIVE.proyectos,
      pending: 'border-gray-200 dark:border-gray-800 border-l-4 border-l-gray-300 dark:border-l-gray-600 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 opacity-50',
    },
    stepCircle: {
      completed: 'w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center',
      active: STEP_CIRCLE_ACTIVE[moduleName] ?? STEP_CIRCLE_ACTIVE.proyectos,
      pending: 'w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center',
    },
    progressBar: {
      track: 'h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden',
      fill: `bg-gradient-to-r ${theme.classes.gradient.primary} rounded-full`,  // ✅ gradient.primary ya es string completo
    },
    field: {
      inputBase: 'w-full px-4 pt-5 pb-2 rounded-xl border-2 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-transparent transition-all duration-200 focus:outline-none',
      inputFocus: FIELD_FOCUS[moduleName] ?? FIELD_FOCUS.proyectos,
      inputError: 'border-red-500 focus:border-red-500 focus:shadow-red-500/15',
      labelResting: 'text-gray-400 dark:text-gray-500',
      labelFloated: theme.classes.text.primary,  // ✅ pre-built string
    },
    navigation: {
      backButton: 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
      nextButton: `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${theme.classes.gradient.primary} shadow-md ${theme.classes.shadow} hover:shadow-lg transition-all active:scale-[0.98]`,
      submitButton: 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-500/20 hover:shadow-lg transition-all active:scale-[0.98]',
      dot: 'w-2 h-2 rounded-full transition-all',
      dotCompleted: 'bg-green-500',
      dotActive: theme.classes.badge.primary + ' w-6',  // ✅ pre-built
      dotPending: 'bg-gray-300 dark:bg-gray-600',
    },
    editButton: theme.classes.text.primary + ' text-xs font-medium flex items-center gap-1 hover:opacity-80',
  } as const
}
```

## 6. Mapping por módulo

### 6.1 Proyectos → `/proyectos/nuevo` (3 pasos, verde/esmeralda)

| Paso | Título | Campos | Resumen colapsado |
|------|--------|--------|-------------------|
| 1 | Información General | `nombre`*, `ubicacion`*, `descripcion`*, `estado`, `fechaInicio`, `fechaFinEstimada` | `{nombre} · {ubicación} · {estado}` |
| 2 | Manzanas | useFieldArray: `nombre` + `totalViviendas` por manzana, agregar/eliminar | `{n} manzanas · {total} viviendas` |
| 3 | Resumen | Vista read-only agrupada por paso, botón "Crear Proyecto" | N/A (último paso) |

**Hook**: `useNuevoProyecto` — reutiliza la lógica existente de `useProyectosForm` (Zod schemas, validación async de nombre duplicado, useFieldArray para manzanas, validación de editabilidad).

**Archivos nuevos**:
```
src/app/proyectos/nuevo/page.tsx
src/modules/proyectos/components/nuevo-proyecto-view.tsx
src/modules/proyectos/components/pasos/
  ├── PasoInfoGeneral.tsx
  ├── PasoManzanas.tsx
  └── PasoResumenProyecto.tsx
src/modules/proyectos/hooks/useNuevoProyecto.ts
```

**Archivos que se mantienen** (para edición en modal):
```
src/modules/proyectos/components/proyectos-form.tsx  ← solo para edición
src/modules/proyectos/hooks/useProyectosForm.ts      ← compartido (schemas + lógica base)
```

### 6.2 Viviendas → `/viviendas/nueva` (5 pasos, naranja/ámbar)

| Paso | Título | Campos | Resumen colapsado |
|------|--------|--------|-------------------|
| 1 | Ubicación | `proyecto_id`*, `manzana_id`*, `numero`* | `{proyecto} · {manzana} · Viv #{num}` |
| 2 | Linderos | `lindero_norte`*, `sur`*, `oriente`*, `occidente`* | `4 linderos definidos ✓` |
| 3 | Información Legal | `matricula_inmobiliaria`*, `nomenclatura`*, `area_lote`*, `area_construida`*, `tipo_vivienda` (async: matrícula duplicada) | `Mat. {matricula_inmobiliaria} · {area_lote}m² · {tipo}` |
| 4 | Información Financiera | `valor_base`*, `es_esquinera`, `recargo_esquinera` | `${valor} · {esquinera/regular}` |
| 5 | Resumen | Vista read-only + cálculos financieros, botón "Crear Vivienda" | N/A |

**Hook**: Reutiliza `useNuevaVivienda` existente (ya tiene pasos, validación async de matrícula, cálculos financieros).

**Migración**: El componente `nueva-vivienda-view.tsx` se refactoriza para usar `AccordionWizardLayout` + `AccordionWizardSection` en lugar del stepper horizontal actual. Los 5 paso-*.tsx se mantienen como children de cada sección.

### 6.3 Clientes → `/clientes/nuevo` (4 pasos, cyan/azul)

| Paso | Título | Campos | Resumen colapsado |
|------|--------|--------|-------------------|
| 1 | Información Personal | `nombres`*, `apellidos`*, `tipo_documento`*, `numero_documento`* (async: duplicados + algoritmo), `fecha_nacimiento`, `estado_civil` | `{nombres} {apellidos} · {tipo} {num}` |
| 2 | Contacto y Ubicación | `telefono`, `telefono_alternativo`, `email`, `departamento`*, `ciudad`* (cascading: depto→ciudad), `direccion` | `{tel \|\| email} · {ciudad}, {depto}` |
| 3 | Interés Inicial | `interes_inicial.proyecto_id` (dropdown), `interes_inicial.vivienda_id` (cascading: proyecto→vivienda, dropdown dependiente), `interes_inicial.notas_interes` (textarea). **Solo en modo creación**, se omite en edición | `Interesado en {proy} - Viv #{n}` |
| 4 | Resumen | Vista read-only, botón "Crear Cliente" | N/A |

**Prerequisito: Migración de validación manual → Zod**

El hook `useFormularioCliente` actual usa validación manual con callbacks (`validarStep0`, `validarStep1`, etc.). Para integrar con el Accordion Wizard (que usa React Hook Form + `formState.errors`), se debe crear `useNuevoCliente` con **Zod schemas por paso**, siguiendo el mismo patrón de Proyectos y Viviendas:

```typescript
// Patrón objetivo (como useNuevoProyecto y useNuevaVivienda)
const paso1Schema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  tipo_documento: z.enum(['CC', 'CE', 'PP', 'NIT', ...]),
  numero_documento: z.string().min(1, 'Requerido'),
  fecha_nacimiento: z.string().optional(),
  estado_civil: z.enum([...]).optional(),
})

// Validación async de duplicados se hace en superRefine
// (igual que proyectos valida nombre duplicado y viviendas valida matrícula)
const createPaso1Schema = () => paso1Schema.superRefine(async (data, ctx) => {
  const duplicado = await clientesService.buscarPorDocumento(data.tipo_documento, data.numero_documento)
  if (duplicado) ctx.addIssue({ code: 'custom', message: '...', path: ['numero_documento'] })
})
```

La lógica de validación de `validarDocumentoIdentidad()` (algoritmo CC/NIT) se integra como `.refine()` en el campo `numero_documento`.

**Archivos nuevos**:
```
src/app/clientes/nuevo/page.tsx
src/modules/clientes/components/nuevo-cliente-view.tsx
src/modules/clientes/components/pasos/
  ├── PasoInfoPersonal.tsx
  ├── PasoContacto.tsx
  ├── PasoInteres.tsx
  └── PasoResumenCliente.tsx
src/modules/clientes/hooks/useNuevoCliente.ts    ← NUEVO con Zod schemas
```

**Archivos que se mantienen** (para edición en modal):
```
src/modules/clientes/components/formulario-cliente-modern.tsx  ← solo edición
src/modules/clientes/hooks/useFormularioCliente.ts             ← solo edición
```

## 7. Comportamientos

| Comportamiento | Detalle |
|---|---|
| **Abrir paso** | Solo el activo o un completado (vía "Editar") |
| **Editar completado** | Click "Editar" → cierra activo, abre completado. Si modifica y avanza, re-valida dependientes |
| **Siguiente** | Valida paso → colapsa con resumen (spring) → abre siguiente (stagger) |
| **Atrás** | Cierra actual → abre anterior sin revalidar |
| **Submit** | Solo en último paso → botón verde "Crear {Entidad}" |
| **Cancelar** | Breadcrumb "← {Módulo}" con confirmación si hay cambios (`hasUnsavedChanges`) |
| **Validación Async** | Mientras valida: botón "Siguiente" deshabilitado + spinner pequeño en botón + texto "Verificando...". Si timeout (>5s): toast warning "La verificación está tardando, intenta de nuevo". Inline error si falla validación. |
| **Edit dependientes** | Si se edita un campo en paso N que tiene dependientes en pasos posteriores, los pasos N+1 en adelante pasan a status "pending" y requieren revalidación. El usuario debe avanzar paso a paso de nuevo. Ejemplo: si en viviendas se cambia `proyecto_id` (paso 1), `manzana_id` se resetea y pasos 2-4 vuelven a pending. |
| **Keyboard** | `Enter` en último campo = siguiente. `Escape` = cancelar con dialog |
| **Mobile (< 640px)** | Secciones full-width, grids → 1 columna, botones stacked |

## 8. Mejoras UX sobre el diseño actual

| Mejora | Descripción |
|--------|-------------|
| **Floating labels** | Label sube al escribir, más limpio que label estático |
| **Focus glow** | `shadow-[0_0_0_3px]` sutil en vez de `ring-2/ring-4` genérico |
| **Error shake** | Campo con error hace shake al intentar avanzar |
| **Check animation** | Check verde aparece con spring animation al completar paso |
| **Stagger fields** | Campos aparecen con delay escalonado al abrir sección |
| **Progress bar** | Barra sutil debajo del título de sección activa |
| **Resumen inline** | Paso completado muestra datos en 1 línea (feedback inmediato) |
| **Dot indicator** | Dot activo es pill (`w-6`), completados verdes, pendientes grises |
| **Active scale** | Botones next/submit: `active:scale-[0.98]` para feedback táctil |

## 9. Límites y reglas

- `AccordionWizardLayout`: máximo 80 líneas
- `AccordionWizardSection`: máximo 120 líneas
- `AccordionWizardField`: máximo 80 líneas
- Cada componente de paso de módulo: máximo 150 líneas
- Cada hook de módulo: máximo 300 líneas
- Estilos SIEMPRE en `accordion-wizard.styles.ts` (función paramétrica)
- **NUNCA** Tailwind inline > 80 caracteres en componentes
- **NUNCA** lógica de negocio en componentes compartidos
- **NUNCA** colores hardcodeados (siempre vía `getAccordionWizardStyles`)

## 10. Orden de implementación

1. **Shared components** (`accordion-wizard/`) — sin dependencia de módulos
2. **Proyectos** (`/proyectos/nuevo`) — módulo más simple (3 pasos), valida el sistema
3. **Viviendas** (`/viviendas/nueva`) — migración del wizard existente (5 pasos)
4. **Clientes** (`/clientes/nuevo`) — requiere migrar de validación manual a Zod
5. **Verificación cruzada** — los 3 módulos lado a lado, dark mode, mobile

## 11. Archivos afectados (resumen)

### Nuevos
- `src/shared/components/accordion-wizard/*` (8 archivos)
- `src/app/proyectos/nuevo/page.tsx`
- `src/app/clientes/nuevo/page.tsx`
- `src/modules/proyectos/components/nuevo-proyecto-view.tsx`
- `src/modules/proyectos/components/pasos/PasoInfoGeneral.tsx`
- `src/modules/proyectos/components/pasos/PasoManzanas.tsx`
- `src/modules/proyectos/components/pasos/PasoResumenProyecto.tsx`
- `src/modules/proyectos/hooks/useNuevoProyecto.ts`
- `src/modules/clientes/components/nuevo-cliente-view.tsx`
- `src/modules/clientes/components/pasos/PasoInfoPersonal.tsx`
- `src/modules/clientes/components/pasos/PasoContacto.tsx`
- `src/modules/clientes/components/pasos/PasoInteres.tsx`
- `src/modules/clientes/components/pasos/PasoResumenCliente.tsx`
- `src/modules/clientes/hooks/useNuevoCliente.ts`

### Modificados
- `src/modules/viviendas/components/nueva-vivienda-view.tsx` (refactorizar a accordion)
- `src/modules/viviendas/styles/nueva-vivienda.styles.ts` (eliminar, usar shared)
- `src/modules/proyectos/components/proyectos-page-main.tsx` (botón "Nuevo" → Link a `/proyectos/nuevo`)
- `src/modules/clientes/components/clientes-page-main.tsx` (botón "Nuevo" → Link a `/clientes/nuevo`)

### Sin cambios (se mantienen para edición)
- `src/modules/proyectos/components/proyectos-form.tsx`
- `src/modules/proyectos/hooks/useProyectosForm.ts`
- `src/modules/clientes/components/formulario-cliente-modern.tsx`
- `src/modules/clientes/hooks/useFormularioCliente.ts`
- `src/modules/viviendas/hooks/useNuevaVivienda.ts` (se reutiliza)
