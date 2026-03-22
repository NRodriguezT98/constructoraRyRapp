# 🧙‍♂️ Guía: Crear un Nuevo Módulo con Accordion Wizard

> **Última actualización:** Junio 2025
> **Tiempo estimado:** 30-60 minutos
> **Resultado:** Formulario multi-paso con validación, animaciones, theming y UX completo

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Paso 0: Planificación](#3-paso-0-planificación)
4. [Paso 1: page.tsx (Server Component)](#4-paso-1-pagetsx)
5. [Paso 2: Hook Orquestador](#5-paso-2-hook-orquestador)
6. [Paso 3: Componentes de Paso](#6-paso-3-componentes-de-paso)
7. [Paso 4: Vista Orquestadora](#7-paso-4-vista-orquestadora)
8. [Paso 5: Barrel Exports](#8-paso-5-barrel-exports)
9. [Paso 6: Validación y QA](#9-paso-6-validación-y-qa)
10. [Referencia Rápida de Componentes](#10-referencia-rápida-de-componentes)
11. [Checklist Final](#11-checklist-final)
12. [Módulos Existentes como Referencia](#12-módulos-existentes-como-referencia)

---

## 1. Visión General

El sistema **Accordion Wizard** es un conjunto de componentes compartidos en `src/shared/components/accordion-wizard/` que implementan un formulario multi-paso con:

- ✅ Pasos colapsables tipo accordion (completado → resumen, activo → formulario, pendiente → bloqueado)
- ✅ Validación Zod por paso con feedback inline
- ✅ Animaciones Framer Motion (expand, stagger, shake on error)
- ✅ Theming automático por módulo (colores, gradientes)
- ✅ Hero header con ícono, tiempo estimado y contador de pasos
- ✅ Celebración animada al crear exitosamente
- ✅ Overlay de loading durante submit
- ✅ Breadcrumbs con navegación
- ✅ Responsive y dark mode completo

### Arquitectura de 3 capas

```
┌─────────────────────────────────────────────────┐
│  page.tsx (Server Component)                    │
│  → Permisos + metadata + delega a View          │
├─────────────────────────────────────────────────┤
│  [Modulo]View.tsx (Client Component)            │
│  → Orquesta UI: Hero + Sections + Navigation    │
│  → CERO lógica, solo presenta                   │
├─────────────────────────────────────────────────┤
│  useNuevo[Modulo].ts (Hook)                     │
│  → TODA la lógica: form, validación, submit     │
│  → Retorna estado + acciones al View            │
├─────────────────────────────────────────────────┤
│  Paso*.tsx (Componentes de paso)                │
│  → UI de cada paso: campos con register/errors  │
│  → Puro presentacional                          │
└─────────────────────────────────────────────────┘
```

---

## 2. Estructura de Archivos

Para un módulo llamado `[modulo]` (ej: `contratos`, `pagos`, `empleados`):

```
src/
├── app/[modulo]/nuevo/
│   └── page.tsx                          # Server Component
│
└── modules/[modulo]/
    ├── components/
    │   ├── Nuevo[Modulo]View.tsx          # Vista orquestadora
    │   ├── pasos-accordion/              # ← Carpeta de pasos
    │   │   ├── Paso[Nombre1].tsx
    │   │   ├── Paso[Nombre2].tsx
    │   │   ├── Paso[Nombre3].tsx
    │   │   └── index.ts                  # Barrel export
    │   └── index.ts                      # (ya existente, agregar export)
    ├── hooks/
    │   └── useNuevo[Modulo]Accordion.ts  # Hook orquestador
    ├── services/
    │   └── [modulo].service.ts           # (ya existente, usar)
    └── types/
        └── index.ts                      # (ya existente, usar)
```

---

## 3. Paso 0: Planificación

Antes de codificar, definí:

### A) Pasos del wizard

| # | Título | Campos obligatorios | Campos opcionales | Ícono (lucide) |
|---|--------|--------------------|--------------------|-----------------|
| 1 | ...    | ...                | ...                | ...             |
| 2 | ...    | ...                | ...                | ...             |

**Regla:** 3-5 pasos máximo. Si tenés más de 5, agrupá campos relacionados.

### B) Colores del módulo

El sistema soporta estos `moduleName`:

| moduleName | Colores | Ejemplo |
|---|---|---|
| `proyectos` | Verde/Esmeralda | `from-green-600 via-emerald-600 to-teal-600` |
| `viviendas` | Naranja/Ámbar | `from-orange-600 via-amber-600 to-yellow-600` |
| `clientes` | Cyan/Azul | `from-cyan-600 via-blue-600 to-indigo-600` |
| `negociaciones` | Rosa/Púrpura | `from-pink-600 via-purple-600 to-indigo-600` |
| `abonos` | Azul/Índigo | `from-blue-600 via-indigo-600 to-purple-600` |
| `documentos` | Rojo/Rosa | `from-red-600 via-rose-600 to-pink-600` |
| `auditorias` | Azul/Índigo | `from-blue-600 via-indigo-600 to-purple-600` |

Si tu módulo no existe, agregá sus colores en `AccordionWizardHero.tsx` (HERO_BG, HERO_SHADOW) y `AccordionWizardSuccess.tsx` (SUCCESS_BG, SUCCESS_GLOW).

### C) Schema Zod

Definí los campos con tipos, validaciones y mensajes de error.

---

## 4. Paso 1: page.tsx

**Archivo:** `src/app/[modulo]/nuevo/page.tsx`

```tsx
/**
 * Página: Crear Nuevo [Modulo] (Accordion Wizard)
 * Server Component — obtiene permisos y delega a Client Component
 */

import { getServerPermissions } from '@/lib/auth/server'
import { Nuevo[Modulo]View } from '@/modules/[modulo]/components/Nuevo[Modulo]View'

export const metadata = {
  title: 'Nuevo [Modulo] | RyR Constructora',
  description: 'Crea un nuevo [modulo] en el sistema',
}

export default async function Nuevo[Modulo]Page() {
  const permisos = await getServerPermissions('[modulo]')

  return <Nuevo[Modulo]View canCreate={permisos.canCreate} />
}
```

**Puntos clave:**
- Es un **Server Component** (sin `'use client'`)
- Obtiene permisos del servidor
- Pasa `canCreate` al View
- Define `metadata` para SEO

---

## 5. Paso 2: Hook Orquestador

**Archivo:** `src/modules/[modulo]/hooks/useNuevo[Modulo]Accordion.ts`

Este es el archivo más importante. Contiene TODA la lógica.

### Template completo:

```typescript
/**
 * useNuevo[Modulo]Accordion — Hook que orquesta la creación de [modulo]
 * con el patrón Accordion Wizard.
 */

import { useCallback, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Importar TIPOS del accordion wizard
import type { SectionStatus, SummaryItem, WizardStepConfig } from '@/shared/components/accordion-wizard'

// Importar ÍCONOS para cada paso (elegir de lucide-react)
import { Building2, CalendarDays, ClipboardCheck } from 'lucide-react'

// Importar service y types del módulo
import { [modulo]Service } from '../services/[modulo].service'
import type { Crear[Modulo]DTO } from '../types'

// ── 1. CONFIGURACIÓN DE PASOS ──────────────────────────
// Exportar para que el View pueda acceder a .length
export const PASOS_[MODULO]: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Información General',
    description: 'Nombre, ubicación y datos principales',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Fechas y Estado',
    description: 'Periodo de ejecución y estado actual',
    icon: CalendarDays,
  },
  {
    id: 3,
    title: 'Configuración Final',
    description: 'Detalles adicionales y confirmación',
    icon: ClipboardCheck,
  },
]

// ── 2. SCHEMA ZOD ──────────────────────────────────────
const [modulo]FormSchema = z.object({
  // Paso 1
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  ubicacion: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  descripcion: z.string().max(500).optional(),
  // Paso 2
  estado: z.string().min(1, 'Selecciona un estado'),
  fecha_inicio: z.string().min(1, 'Fecha requerida'),
  fecha_fin: z.string().optional(),
  // Paso 3
  notas: z.string().max(500).optional(),
})

type [Modulo]FormValues = z.input<typeof [modulo]FormSchema>

// ── 3. CAMPOS POR PASO (para validación parcial) ──────
// Solo incluir campos OBLIGATORIOS que se validan con trigger()
const FIELDS_PASO_1 = ['nombre', 'ubicacion'] as const
const FIELDS_PASO_2 = ['estado', 'fecha_inicio'] as const
// Paso 3: sin campos obligatorios → no necesita FIELDS_PASO_3

// ── 4. HOOK PRINCIPAL ──────────────────────────────────
export function useNuevo[Modulo]Accordion() {
  const router = useRouter()

  // Estado del wizard
  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // React Hook Form con Zod
  const {
    register,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<[Modulo]FormValues>({
    resolver: zodResolver([modulo]FormSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      ubicacion: '',
      descripcion: '',
      estado: '',
      fecha_inicio: '',
      fecha_fin: '',
      notas: '',
    },
  })

  // Watch para summaries
  const formData = watch()

  // ── Estado de cada paso ─────────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados],
  )

  // ── Progreso general (%) ────────────────────────────
  const progress = useMemo(
    () => Math.round((pasosCompletados.size / PASOS_[MODULO].length) * 100),
    [pasosCompletados],
  )

  // ── Summaries por paso (para estado 'completed') ────
  const summaryPaso1: SummaryItem[] = useMemo(
    () => [
      { label: 'Nombre', value: formData.nombre },
      { label: 'Ubicación', value: formData.ubicacion },
    ],
    [formData.nombre, formData.ubicacion],
  )

  const summaryPaso2: SummaryItem[] = useMemo(
    () => [
      { label: 'Estado', value: formData.estado },
      { label: 'Fecha inicio', value: formData.fecha_inicio },
    ],
    [formData.estado, formData.fecha_inicio],
  )

  const summaryPaso3: SummaryItem[] = useMemo(
    () => [
      { label: 'Notas', value: formData.notas || 'Sin notas' },
    ],
    [formData.notas],
  )

  // ── Validación por paso ──────────────────────────────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    setIsValidating(true)
    try {
      switch (pasoActual) {
        case 1: {
          const ok = await trigger([...FIELDS_PASO_1])
          // Validaciones async van aquí (ej: duplicados)
          return ok
        }
        case 2: {
          const ok = await trigger([...FIELDS_PASO_2])
          // Validaciones cross-field van aquí
          return ok
        }
        case 3:
          // Sin campos obligatorios → siempre válido
          return true
        default:
          return true
      }
    } finally {
      setIsValidating(false)
    }
  }, [pasoActual, trigger])

  // ── Navegación ──────────────────────────────────────
  const irSiguiente = useCallback(async () => {
    const esValido = await validarPasoActual()
    if (!esValido) return

    setPasosCompletados((prev) => new Set([...prev, pasoActual]))
    if (pasoActual < PASOS_[MODULO].length) {
      setPasoActual((prev) => prev + 1)
    }
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    if (pasoActual > 1) {
      setPasoActual((prev) => prev - 1)
    }
  }, [pasoActual])

  const irAPaso = useCallback(
    (paso: number) => {
      // Solo permitir ir a pasos completados (para editar)
      if (pasosCompletados.has(paso)) {
        setPasoActual(paso)
        // Remover de completados para re-editar
        setPasosCompletados((prev) => {
          const nuevo = new Set(prev)
          nuevo.delete(paso)
          return nuevo
        })
      }
    },
    [pasosCompletados],
  )

  // ── Submit final ────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const values = getValues()

      // Sanitizar datos antes de enviar
      const datosLimpios: Crear[Modulo]DTO = {
        nombre: values.nombre.trim(),
        ubicacion: values.ubicacion.trim(),
        descripcion: values.descripcion?.trim() || null,
        estado: values.estado,
        fecha_inicio: values.fecha_inicio,
        fecha_fin: values.fecha_fin || null,
        notas: values.notas?.trim() || null,
      }

      await [modulo]Service.crear(datosLimpios)

      toast.success('[Modulo] creado exitosamente')
      setShowSuccess(true)

      // Redirigir después de la animación de éxito
      setTimeout(() => {
        router.push('/[modulo]')
      }, 1800)
    } catch (error) {
      console.error('Error al crear [modulo]:', error)
      toast.error('Error al crear el [modulo]')
      setIsSubmitting(false)
    }
  }, [getValues, router])

  // ── Return ──────────────────────────────────────────
  return {
    // Configuración
    pasos: PASOS_[MODULO],

    // Estado del wizard
    pasoActual,
    getEstadoPaso,
    progress,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,

    // Summaries
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,

    // React Hook Form
    register,
    errors,
    setValue,
    watch,
    formData,

    // Submit
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,
  }
}
```

### Notas importantes del Hook:

1. **`PASOS_[MODULO]`** se exporta con nombre para que el View acceda a `.length`
2. **`FIELDS_PASO_N`** define qué campos validar con `trigger()` en cada paso
3. **`validarPasoActual()`** es donde va validación async (duplicados) y cross-field
4. **`summaryPasoN`** son `SummaryItem[]` que se muestran cuando la sección colapsa
5. **`showSuccess`** + `setTimeout` controla la animación de éxito + redirect
6. **Sanitización** siempre antes de enviar (strings vacíos → null)

---

## 6. Paso 3: Componentes de Paso

**Carpeta:** `src/modules/[modulo]/components/pasos-accordion/`

Cada paso es un componente **puro presentacional** que recibe `register` + `errors` del hook.

### Template de un paso:

```tsx
/**
 * Paso[Nombre] — Paso N: [descripción]
 * Campos: [campo1], [campo2], [campo3]
 */

'use client'

import { motion } from 'framer-motion'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import {
  AccordionWizardField,
  AccordionWizardSelect,
  AccordionWizardTextarea,
  fieldStaggerAnim,
} from '@/shared/components/accordion-wizard'

interface Paso[Nombre]Props {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  // Agregar watch/setValue si se necesitan (cascading, condicionales)
  // watch?: UseFormWatch<any>
  // setValue?: UseFormSetValue<any>
}

export function Paso[Nombre]({ register, errors }: Paso[Nombre]Props) {
  return (
    <div className="space-y-4">
      {/* Fila 1: Dos campos lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div {...fieldStaggerAnim(0)}>
          <AccordionWizardField
            {...register('campo1')}
            label="Campo 1"
            required
            moduleName="[modulo]"
            error={errors.campo1?.message as string}
          />
        </motion.div>

        <motion.div {...fieldStaggerAnim(1)}>
          <AccordionWizardField
            {...register('campo2')}
            label="Campo 2"
            moduleName="[modulo]"
            error={errors.campo2?.message as string}
          />
        </motion.div>
      </div>

      {/* Fila 2: Select (opciones) */}
      <motion.div {...fieldStaggerAnim(2)}>
        <AccordionWizardSelect
          {...register('estado')}
          label="Estado"
          required
          moduleName="[modulo]"
          error={errors.estado?.message as string}
          options={[
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
          ]}
        />
      </motion.div>

      {/* Fila 3: Textarea (campo largo) */}
      <motion.div {...fieldStaggerAnim(3)}>
        <AccordionWizardTextarea
          {...register('descripcion')}
          label="Descripción"
          moduleName="[modulo]"
          rows={3}
          error={errors.descripcion?.message as string}
        />
      </motion.div>
    </div>
  )
}
```

### Tipos de campo disponibles:

| Componente | Uso | Props principales |
|---|---|---|
| `AccordionWizardField` | Input text, email, tel, number, date | `label`, `type`, `required`, `moduleName`, `error` |
| `AccordionWizardSelect` | Select dropdown | `label`, `options[]`, `required`, `moduleName`, `error` |
| `AccordionWizardTextarea` | Texto largo | `label`, `rows`, `required`, `moduleName`, `error` |

### Reglas de layout:

- **Contenedor:** `<div className="space-y-4">`
- **Dos campos en fila:** `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">`
- **Animación stagger:** `<motion.div {...fieldStaggerAnim(N)}>` donde N es el índice (0, 1, 2...)
- **Spread register:** `{...register('nombreCampo')}` siempre como primera prop
- **Error:** `error={errors.nombreCampo?.message as string}`

### Barrel export:

```typescript
// src/modules/[modulo]/components/pasos-accordion/index.ts
export { PasoInfoGeneral } from './PasoInfoGeneral'
export { PasoEstadoFechas } from './PasoEstadoFechas'
export { PasoConfiguracion } from './PasoConfiguracion'
```

---

## 7. Paso 4: Vista Orquestadora

**Archivo:** `src/modules/[modulo]/components/Nuevo[Modulo]View.tsx`

La vista **NO tiene lógica**. Solo orquesta componentes.

### Template completo:

```tsx
/**
 * Nuevo[Modulo]View — Orquestador del wizard accordion
 * Componente presentacional puro.
 */

'use client'

// 1. Ícono para el Hero (elegir de lucide-react)
import { FolderPlus } from 'lucide-react'

// 2. Componentes compartidos del wizard
import {
  AccordionWizardHero,
  AccordionWizardLayout,
  AccordionWizardNavigation,
  AccordionWizardSection,
  AccordionWizardSuccess,
} from '@/shared/components/accordion-wizard'

// 3. Hook y constante de pasos
import { PASOS_[MODULO], useNuevo[Modulo]Accordion } from '../hooks/useNuevo[Modulo]Accordion'

// 4. Componentes de paso
import { Paso[Nombre1], Paso[Nombre2], Paso[Nombre3] } from './pasos-accordion'

interface Nuevo[Modulo]ViewProps {
  canCreate: boolean
}

export function Nuevo[Modulo]View({ canCreate }: Nuevo[Modulo]ViewProps) {
  const {
    pasos,
    pasoActual,
    getEstadoPaso,
    progress,
    irSiguiente,
    irAtras,
    irAPaso,
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,
    register,
    errors,
    setValue,
    watch,
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,
  } = useNuevo[Modulo]Accordion()

  // Guard: sin permisos
  if (!canCreate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No tienes permisos para crear [modulos].
        </p>
      </div>
    )
  }

  return (
    <AccordionWizardLayout
      moduleName="[modulo]"
      breadcrumbs={[
        { label: '[Modulos]', href: '/[modulo]' },
        { label: 'Nuevo [Modulo]' },
      ]}
      isSubmitting={isSubmitting}
      submitLoadingLabel="Creando [Modulo]..."
    >
      {/* ── Hero Header ─────────────────────────── */}
      <AccordionWizardHero
        icon={FolderPlus}
        title="Nuevo [Modulo]"
        subtitle="Completa la información paso a paso. Solo los campos con * son obligatorios."
        moduleName="[modulo]"
        estimatedTime="~3 minutos"
        totalSteps={PASOS_[MODULO].length}
      />

      {/* ── Paso 1 ──────────────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(1)}
        stepNumber={1}
        title={pasos[0].title}
        description={pasos[0].description}
        icon={pasos[0].icon}
        fieldCount={{ required: 2, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_[MODULO].length}
        progress={pasoActual === 1 ? progress : undefined}
        moduleName="[modulo]"
        summaryItems={summaryPaso1}
        onEdit={() => irAPaso(1)}
      >
        <Paso[Nombre1] register={register} errors={errors} />
        <AccordionWizardNavigation
          currentStep={1}
          totalSteps={PASOS_[MODULO].length}
          isFirst
          isLast={false}
          isValidating={pasoActual === 1 && isValidating}
          moduleName="[modulo]"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 2 ──────────────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(2)}
        stepNumber={2}
        title={pasos[1].title}
        description={pasos[1].description}
        icon={pasos[1].icon}
        fieldCount={{ required: 2, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_[MODULO].length}
        progress={pasoActual === 2 ? progress : undefined}
        moduleName="[modulo]"
        summaryItems={summaryPaso2}
        onEdit={() => irAPaso(2)}
      >
        <Paso[Nombre2] register={register} errors={errors} />
        <AccordionWizardNavigation
          currentStep={2}
          totalSteps={PASOS_[MODULO].length}
          isFirst={false}
          isLast={false}
          isValidating={pasoActual === 2 && isValidating}
          moduleName="[modulo]"
          onBack={irAtras}
          onNext={irSiguiente}
        />
      </AccordionWizardSection>

      {/* ── Paso 3 (último) ─────────────────────── */}
      <AccordionWizardSection
        status={getEstadoPaso(3)}
        stepNumber={3}
        title={pasos[2].title}
        description={pasos[2].description}
        icon={pasos[2].icon}
        fieldCount={{ required: 0, optional: 1 }}
        currentStep={pasoActual}
        totalSteps={PASOS_[MODULO].length}
        moduleName="[modulo]"
        summaryItems={summaryPaso3}
        onEdit={() => irAPaso(3)}
      >
        <Paso[Nombre3] register={register} errors={errors} />
        <AccordionWizardNavigation
          currentStep={3}
          totalSteps={PASOS_[MODULO].length}
          isFirst={false}
          isLast                              {/* ← último paso */}
          isSubmitting={isSubmitting}
          isValidating={isValidating}
          moduleName="[modulo]"
          submitLabel="Crear [Modulo]"        {/* ← texto del botón */}
          onBack={irAtras}
          onNext={irSiguiente}
          onSubmit={handleSubmit}             {/* ← solo en último paso */}
        />
      </AccordionWizardSection>

      {/* ── Success Celebration ──────────────────── */}
      <AccordionWizardSuccess
        isVisible={showSuccess}
        moduleName="[modulo]"
        title="¡[Modulo] creado!"
        subtitle="Redirigiendo al listado de [modulos]..."
      />
    </AccordionWizardLayout>
  )
}
```

### Patrón de cada sección:

```
AccordionWizardSection (contenedor del paso)
  ├── Paso[Nombre] (campos del formulario)
  └── AccordionWizardNavigation (botones Atrás/Siguiente/Crear)
```

### Props clave por sección:

| Prop | Qué hace | Fuente |
|---|---|---|
| `status` | `'completed'`/`'active'`/`'pending'` | `getEstadoPaso(N)` |
| `stepNumber` | Número del paso (1-based) | Literal |
| `title` | Título del paso | `pasos[N-1].title` |
| `description` | Descripción contextual | `pasos[N-1].description` |
| `icon` | Ícono lucide del paso | `pasos[N-1].icon` |
| `fieldCount` | `{ required: N, optional: M }` | Literal (contar campos) |
| `progress` | Solo en paso activo | `pasoActual === N ? progress : undefined` |
| `summaryItems` | Resumen al colapsar | `summaryPasoN` del hook |
| `onEdit` | Click en "Editar" (paso completado) | `() => irAPaso(N)` |

### Props clave de Navigation:

| Prop | Qué hacer |
|---|---|
| `isFirst` | `true` solo en paso 1 (oculta botón Atrás) |
| `isLast` | `true` solo en último paso (muestra Submit en vez de Siguiente) |
| `isSubmitting` | Solo en último paso: `isSubmitting` |
| `submitLabel` | Solo en último paso: `"Crear [Modulo]"` |
| `onSubmit` | Solo en último paso: `handleSubmit` |

---

## 8. Paso 5: Barrel Exports

Asegurate de que todos los archivos nuevos estén exportados:

```typescript
// src/modules/[modulo]/components/pasos-accordion/index.ts
export { PasoInfoGeneral } from './PasoInfoGeneral'
export { PasoEstadoFechas } from './PasoEstadoFechas'
export { PasoConfiguracion } from './PasoConfiguracion'
```

Si tu módulo ya tiene un `index.ts` de componentes, agregá el export de la View:
```typescript
// src/modules/[modulo]/components/index.ts
export { Nuevo[Modulo]View } from './Nuevo[Modulo]View'
```

---

## 9. Paso 6: Validación y QA

### TypeScript

```bash
npm run type-check
```

Debe compilar sin errores. Errores comunes:
- Falta importar `type { LucideIcon }` en algún lado
- `fieldStaggerAnim` no importado
- Typo en nombre de campo vs schema Zod

### Visual

Verificar en el browser:
- [ ] Hero header se renderiza con colores del módulo
- [ ] Primer paso abierto, resto colapsado
- [ ] Validación inline funciona al perder foco
- [ ] Botón "Siguiente" valida y muestra errores si fallan
- [ ] Paso completado colapsa y muestra resumen
- [ ] Click "Editar" en paso completado lo reabre
- [ ] Último paso muestra botón "Crear [Modulo]"
- [ ] Submit muestra overlay de loading
- [ ] Animación de éxito aparece
- [ ] Redirect funciona después de 1.8s
- [ ] Dark mode correcto en todos los elementos
- [ ] Responsive: mobile, tablet, desktop

---

## 10. Referencia Rápida de Componentes

Todos desde `@/shared/components/accordion-wizard`:

| Componente | Uso |
|---|---|
| `AccordionWizardLayout` | Wrapper general (breadcrumbs, fondo, overlay) |
| `AccordionWizardHero` | Header con ícono, título, tiempo estimado |
| `AccordionWizardSection` | Paso individual (expandible/colapsable) |
| `AccordionWizardNavigation` | Botones Atrás / Siguiente / Crear |
| `AccordionWizardField` | Input (text, email, tel, date, number) |
| `AccordionWizardSelect` | Select dropdown |
| `AccordionWizardTextarea` | Textarea multi-línea |
| `AccordionWizardSummary` | Resumen de paso completado (usado internamente) |
| `AccordionWizardSubmitOverlay` | Overlay de loading durante submit |
| `AccordionWizardSuccess` | Celebración animada al crear |

### Animaciones disponibles:

| Animación | Uso |
|---|---|
| `fieldStaggerAnim(index)` | Spread en `motion.div` de cada campo |
| `sectionExpandAnim` | Expand/collapse de secciones |
| `pageEnterAnim` | Fade in al cargar la página |
| `checkAppearAnim` | Check mark al completar paso |
| `errorShakeAnim` | Shake horizontal en campo con error |
| `summaryAppearAnim` | Fade in del resumen |

### Tipos que importar del hook:

```typescript
import type {
  SectionStatus,    // 'completed' | 'active' | 'pending'
  SummaryItem,      // { label: string; value: string | number | null }
  WizardStepConfig, // { id, title, description?, icon? }
} from '@/shared/components/accordion-wizard'
```

---

## 11. Checklist Final

### Antes de empezar:
- [ ] Planifiqué los pasos (3-5 máximo)
- [ ] Definí campos por paso (obligatorios vs opcionales)
- [ ] Elegí íconos de lucide-react para cada paso
- [ ] Verifiqué que el `moduleName` existe en los Record maps

### Archivos creados:
- [ ] `src/app/[modulo]/nuevo/page.tsx` — Server Component
- [ ] `src/modules/[modulo]/hooks/useNuevo[Modulo]Accordion.ts` — Hook
- [ ] `src/modules/[modulo]/components/Nuevo[Modulo]View.tsx` — Vista
- [ ] `src/modules/[modulo]/components/pasos-accordion/Paso[X].tsx` — Por cada paso
- [ ] `src/modules/[modulo]/components/pasos-accordion/index.ts` — Barrel

### Hook tiene:
- [ ] `PASOS_[MODULO]` exportado con `icon` y `description` por paso
- [ ] Schema Zod con campos tipados
- [ ] `FIELDS_PASO_N` para validación parcial
- [ ] `getEstadoPaso()` → `SectionStatus`
- [ ] `summaryPasoN` → `SummaryItem[]` con `useMemo`
- [ ] `validarPasoActual()` con `setIsValidating`
- [ ] `irSiguiente` / `irAtras` / `irAPaso`
- [ ] `handleSubmit` con sanitización, toast, `setShowSuccess`, `setTimeout` redirect
- [ ] Return tiene todos los valores necesarios para la Vista

### Vista tiene:
- [ ] `AccordionWizardLayout` con breadcrumbs + `submitLoadingLabel`
- [ ] `AccordionWizardHero` con ícono, título, subtítulo, tiempo, totalSteps
- [ ] Una `AccordionWizardSection` por paso con TODAS las props
- [ ] `AccordionWizardNavigation` dentro de cada Section
- [ ] `isFirst={true}` solo en paso 1
- [ ] `isLast={true}` + `onSubmit` + `submitLabel` solo en último paso
- [ ] `AccordionWizardSuccess` al final
- [ ] Guard `if (!canCreate)` al inicio

### Pasos tienen:
- [ ] `fieldStaggerAnim(N)` en cada campo
- [ ] Componentes compartidos: `AccordionWizardField/Select/Textarea`
- [ ] Grid responsive: `grid-cols-1 sm:grid-cols-2 gap-4`
- [ ] Prop `moduleName="[modulo]"` en cada campo
- [ ] `required` en campos obligatorios
- [ ] `error={errors.campo?.message as string}` en cada campo

### QA:
- [ ] `npm run type-check` limpio
- [ ] Visual: 7 estados verificados (hero, activo, error, completado, editando, loading, success)
- [ ] Dark mode completo
- [ ] Mobile responsive

---

## 12. Módulos Existentes como Referencia

| Módulo | Pasos | Complejidad | Referencia ideal para |
|---|---|---|---|
| **Clientes** | 4 | Alta (validación async, cross-field, tipos doc) | Formularios con validación compleja |
| **Proyectos** | 3 | Media (arrays dinámicos con manzanas) | Formularios con campos dinámicos |
| **Viviendas** | 5 | Media (muchos campos, cascading selects) | Formularios con muchos pasos |

### Archivos clave de cada uno:

**Clientes:**
```
src/app/clientes/nuevo/page.tsx
src/modules/clientes/hooks/useNuevoClienteAccordion.ts
src/modules/clientes/components/NuevoClienteAccordionView.tsx
src/modules/clientes/components/pasos-accordion/
```

**Proyectos:**
```
src/app/proyectos/nuevo/page.tsx
src/modules/proyectos/hooks/useNuevoProyecto.ts
src/modules/proyectos/components/NuevoProyectoView.tsx
src/modules/proyectos/components/pasos/
```

**Viviendas:**
```
src/app/viviendas/nueva/page.tsx
src/modules/viviendas/hooks/useNuevaViviendaAccordion.ts
src/modules/viviendas/components/NuevaViviendaAccordionView.tsx
src/modules/viviendas/components/pasos-accordion/
```

---

## 🎯 Resumen Rápido (TL;DR)

1. **Planificá** pasos, campos, íconos
2. **Creá el hook** (Zod + validación + navegación + submit)
3. **Creá los pasos** (campos con `AccordionWizardField` + `fieldStaggerAnim`)
4. **Creá la vista** (Hero + Sections + Navigation + Success)
5. **Creá el page.tsx** (permisos + metadata)
6. **Verificá** TypeScript + visual + dark mode + mobile
