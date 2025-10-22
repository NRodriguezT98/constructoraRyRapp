# 🏗️ PROPUESTA: Reestructuración Vista Detalle Negociación

**Fecha**: 2025-10-22
**Estado**: 📋 Propuesta
**Prioridad**: 🟡 Media

---

## 🎯 Objetivo

Reestructurar la vista de detalle de negociación siguiendo los principios de **arquitectura limpia** que hemos implementado en el módulo de proyectos:

- ✅ Separación de responsabilidades
- ✅ Componentes presentacionales puros
- ✅ Hooks personalizados para lógica
- ✅ Estilos centralizados
- ✅ Sistema de tabs para organizar información
- ✅ Barrel exports

---

## 📊 Análisis del Código Actual

### ❌ **Problemas Identificados:**

```tsx
// ❌ ARCHIVO MONOLÍTICO (400+ líneas)
negociacion-detalle-client.tsx
├── Lógica de negocio (useState, handlers)
├── Componentes internos (TimelineStep, EstadoBadge)
├── UI principal
├── Modal de renuncia
└── Múltiples responsabilidades mezcladas
```

**Problemas específicos:**

1. ❌ **Monolítico**: Todo en un solo archivo de 400+ líneas
2. ❌ **Mezcla de responsabilidades**: Lógica + UI + componentes internos
3. ❌ **Componentes no reutilizables**: `TimelineStep`, `EstadoBadge` dentro del archivo
4. ❌ **Sin organización por tabs**: Todo el contenido en una sola vista
5. ❌ **Estilos inline**: Strings largos de Tailwind
6. ❌ **Sin hooks personalizados**: Lógica mezclada con UI
7. ❌ **Modal inline**: Modal de renuncia definido en el mismo archivo

---

## ✅ Propuesta de Nueva Estructura

### 📁 **Estructura de Carpetas Propuesta:**

```
src/modules/negociaciones/
├── components/
│   ├── detalle/
│   │   ├── negociacion-detalle-main.tsx        # Componente principal
│   │   ├── negociacion-detalle-header.tsx      # Header con gradiente
│   │   ├── negociacion-detalle-tabs.tsx        # Sistema de tabs
│   │   ├── tabs/
│   │   │   ├── informacion-tab.tsx             # Info general
│   │   │   ├── fuentes-pago-tab.tsx            # Fuentes de pago
│   │   │   ├── abonos-tab.tsx                  # Historial de abonos
│   │   │   ├── documentos-tab.tsx              # Documentos relacionados
│   │   │   ├── timeline-tab.tsx                # Timeline del proceso
│   │   │   └── index.ts                        # Barrel export
│   │   ├── timeline-step.tsx                   # Componente de step
│   │   ├── estado-badge.tsx                    # Badge reutilizable
│   │   ├── modal-renuncia.tsx                  # Modal separado
│   │   └── index.ts                            # Barrel export
│   └── index.ts
├── hooks/
│   ├── useNegociacionDetalle.ts                # Hook principal
│   └── index.ts
├── styles/
│   ├── detalle.styles.ts                       # Estilos centralizados
│   └── index.ts
├── types/
│   └── index.ts                                # TypeScript types
└── services/
    └── negociaciones-detalle.service.ts        # API calls
```

---

## 🎨 Diseño de Tabs Propuesto

### **Tab 1: 📋 Información General**
```
┌─────────────────────────────────────────────────┐
│ 📋 Información General                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Resumen Financiero                         │
│  ├─ Valor Negociado: $120.000.000             │
│  ├─ Descuento: -$5.000.000                    │
│  └─ Valor Total: $115.000.000                 │
│                                                 │
│  🏠 Datos de la Vivienda                       │
│  ├─ Proyecto: Villa Real                       │
│  ├─ Manzana: A                                 │
│  ├─ Casa: 12                                   │
│  └─ Estado: Asignada                           │
│                                                 │
│  👤 Datos del Cliente                          │
│  ├─ Nombre: Juan Pérez                         │
│  ├─ Documento: CC 1234567890                   │
│  └─ Estado: Activo                             │
│                                                 │
│  📝 Notas                                       │
│  └─ [Notas de la negociación]                  │
│                                                 │
│  [Acciones Rápidas]                            │
│  [Completar] [Suspender] [Registrar Renuncia]  │
└─────────────────────────────────────────────────┘
```

### **Tab 2: 💳 Fuentes de Pago**
```
┌─────────────────────────────────────────────────┐
│ 💳 Fuentes de Pago                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  [+ Agregar Nueva Fuente]                       │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 💰 Subsidio                            │    │
│  │ Monto: $30.000.000                     │    │
│  │ Entidad: Mi Casa Ya                    │    │
│  │ Ref: SUB-2024-001                      │    │
│  │ [Editar] [Eliminar]                    │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 🏦 Crédito Bancario                    │    │
│  │ Monto: $80.000.000                     │    │
│  │ Entidad: Banco de Bogotá               │    │
│  │ Permite abonos múltiples: Sí           │    │
│  │ [Editar] [Eliminar]                    │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  💰 Total Configurado: $110.000.000            │
│  ⚠️ Faltante: $5.000.000                       │
└─────────────────────────────────────────────────┘
```

### **Tab 3: 💵 Abonos**
```
┌─────────────────────────────────────────────────┐
│ 💵 Abonos                                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Resumen de Pagos                           │
│  ├─ Total Pagado: $85.000.000 (73.9%)         │
│  ├─ Saldo Pendiente: $30.000.000              │
│  └─ [Barra de progreso visual]                 │
│                                                 │
│  [+ Registrar Nuevo Abono]                      │
│                                                 │
│  📋 Historial de Abonos                        │
│  ┌────────────────────────────────────────┐    │
│  │ 2024-10-15 | $30.000.000               │    │
│  │ Subsidio - Mi Casa Ya                  │    │
│  │ Ref: AB-001                            │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 2024-09-20 | $50.000.000               │    │
│  │ Crédito - Banco de Bogotá              │    │
│  │ Ref: AB-002                            │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 2024-08-10 | $5.000.000                │    │
│  │ Cuota Inicial - Efectivo               │    │
│  │ Ref: AB-003                            │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### **Tab 4: 📄 Documentos**
```
┌─────────────────────────────────────────────────┐
│ 📄 Documentos                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  [+ Subir Documento]                            │
│                                                 │
│  📂 Categorías                                  │
│  [Todos] [Contratos] [Cartas] [Comprobantes]   │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 📄 Contrato de Compraventa            │    │
│  │ 📅 2024-10-01                         │    │
│  │ [Ver] [Descargar]                     │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │ 📄 Carta de Aprobación Crédito        │    │
│  │ 📅 2024-09-15                         │    │
│  │ [Ver] [Descargar]                     │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### **Tab 5: ⏱️ Timeline**
```
┌─────────────────────────────────────────────────┐
│ ⏱️ Timeline del Proceso                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✅ En Proceso                                  │
│  │  Negociación creada                         │
│  │  📅 2024-08-01                              │
│  │                                             │
│  ✅ Cierre Financiero                           │
│  │  Fuentes configuradas                       │
│  │  📅 2024-08-05                              │
│  │                                             │
│  🔄 Activa (Estado actual)                      │
│  │  Recibiendo abonos                          │
│  │  📅 2024-08-10 - Presente                   │
│  │                                             │
│  ⏳ Completada                                  │
│  │  Pendiente de finalización                  │
│  │                                             │
│  ──────────────────────────────────────────    │
│                                                 │
│  📊 Estadísticas                                │
│  ├─ Días en proceso: 82                        │
│  ├─ Último abono: hace 5 días                  │
│  └─ Progreso: 73.9%                            │
└─────────────────────────────────────────────────┘
```

### **Tab 6: 📊 Actividad**
```
┌─────────────────────────────────────────────────┐
│ 📊 Actividad                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 Registro de Cambios                        │
│                                                 │
│  🔹 2024-10-15 - 14:30                         │
│  │  Abono registrado: $30.000.000             │
│  │  Usuario: admin@ryrconstructor.com         │
│  │                                             │
│  🔹 2024-10-01 - 10:15                         │
│  │  Estado cambiado: Cierre → Activa          │
│  │  Usuario: admin@ryrconstructor.com         │
│  │                                             │
│  🔹 2024-09-25 - 16:45                         │
│  │  Fuente agregada: Crédito Bancario        │
│  │  Usuario: admin@ryrconstructor.com         │
│  │                                             │
│  🔹 2024-08-01 - 09:00                         │
│  │  Negociación creada                        │
│  │  Usuario: admin@ryrconstructor.com         │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Implementación Propuesta

### **1. Hook Principal: `useNegociacionDetalle.ts`**

```typescript
/**
 * Hook: useNegociacionDetalle
 *
 * Maneja toda la lógica del detalle de negociación
 * - Carga de datos
 * - Gestión de tabs
 * - Acciones (completar, suspender, renuncia)
 * - Cálculos (totales, porcentajes)
 */

export function useNegociacionDetalle(negociacionId: string) {
  const [activeTab, setActiveTab] = useState<TabType>('informacion')
  const [negociacion, setNegociacion] = useState<Negociacion | null>(null)
  const [fuentesPago, setFuentesPago] = useState<FuentePago[]>([])
  const [abonos, setAbonos] = useState<Abono[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [negociacionId])

  const cargarDatos = async () => {
    // Implementación...
  }

  // Cálculos
  const totales = useMemo(() => {
    const totalPagado = abonos.reduce((sum, a) => sum + a.monto, 0)
    const saldoPendiente = (negociacion?.valor_total || 0) - totalPagado
    const porcentajePagado = (totalPagado / (negociacion?.valor_total || 1)) * 100

    return { totalPagado, saldoPendiente, porcentajePagado }
  }, [abonos, negociacion])

  // Acciones
  const completarNegociacion = useCallback(async () => {
    // Implementación...
  }, [negociacionId])

  const suspenderNegociacion = useCallback(async (motivo: string) => {
    // Implementación...
  }, [negociacionId])

  const registrarRenuncia = useCallback(async (motivo: string) => {
    // Implementación...
  }, [negociacionId])

  const recargarDatos = useCallback(() => {
    cargarDatos()
  }, [negociacionId])

  return {
    // Estado
    negociacion,
    fuentesPago,
    abonos,
    documentos,
    loading,
    error,
    activeTab,

    // Datos calculados
    totales,

    // Acciones
    setActiveTab,
    completarNegociacion,
    suspenderNegociacion,
    registrarRenuncia,
    recargarDatos,

    // Utilidades
    puedeCompletarse: totales.porcentajePagado >= 100,
    esActiva: negociacion?.estado === 'Activa',
    estaSuspendida: negociacion?.estado === 'Suspendida',
  }
}
```

---

### **2. Estilos Centralizados: `detalle.styles.ts`**

```typescript
/**
 * Estilos para el detalle de negociación
 */

export const layoutClasses = {
  container: 'container mx-auto px-4 py-6 sm:px-6 lg:px-8',
  inner: 'space-y-6',
}

export const headerClasses = {
  container: 'rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white shadow-xl',
  title: 'text-3xl font-bold mb-2',
  subtitle: 'text-purple-100',
  statsGrid: 'mt-6 grid grid-cols-1 gap-4 md:grid-cols-3',
  statCard: 'rounded-lg bg-white/10 p-4 backdrop-blur-sm',
  statLabel: 'flex items-center gap-2 text-purple-100 text-sm',
  statValue: 'mt-1 font-semibold',
  statValueLarge: 'mt-1 text-2xl font-bold',
}

export const tabsClasses = {
  container: 'border-b border-gray-200 dark:border-gray-700',
  nav: 'flex gap-6 overflow-x-auto',
  tab: 'relative pb-4 px-2 text-sm font-medium transition-colors whitespace-nowrap',
  tabActive: 'text-purple-600 dark:text-purple-400',
  tabInactive: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
  tabUnderline: 'absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600',
  tabIcon: 'h-4 w-4',
  tabBadge: 'ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
}

export const cardClasses = {
  container: 'rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
  title: 'text-xl font-bold text-gray-900 dark:text-white mb-4',
  subtitle: 'text-lg font-semibold text-gray-900 dark:text-white mb-4',
}

export const buttonClasses = {
  primary: 'rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors',
  secondary: 'rounded-lg border-2 border-purple-600 px-4 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors',
  success: 'rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors',
  danger: 'rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors',
  warning: 'rounded-lg border-2 border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors',
}

// Animaciones
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
}
```

---

### **3. Componente Principal: `negociacion-detalle-main.tsx`**

```tsx
/**
 * Componente Principal: Detalle de Negociación
 *
 * Arquitectura limpia:
 * - Lógica en hook useNegociacionDetalle
 * - Estilos centralizados en detalle.styles.ts
 * - Sistema de tabs para organización
 * - Componentes presentacionales puros
 */

'use client'

import { motion } from 'framer-motion'
import { useNegociacionDetalle } from '../../hooks'
import * as styles from '../../styles/detalle.styles'
import { NegociacionDetalleHeader } from './negociacion-detalle-header'
import { NegociacionDetalleTabs } from './negociacion-detalle-tabs'
import {
  InformacionTab,
  FuentesPagoTab,
  AbonosTab,
  DocumentosTab,
  TimelineTab,
  ActividadTab,
} from './tabs'

interface NegociacionDetalleMainProps {
  clienteId: string
  negociacionId: string
}

export function NegociacionDetalleMain({
  clienteId,
  negociacionId,
}: NegociacionDetalleMainProps) {
  const {
    negociacion,
    fuentesPago,
    abonos,
    documentos,
    loading,
    error,
    activeTab,
    totales,
    setActiveTab,
    completarNegociacion,
    suspenderNegociacion,
    registrarRenuncia,
    recargarDatos,
    puedeCompletarse,
    esActiva,
  } = useNegociacionDetalle(negociacionId)

  // Loading state
  if (loading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error || !negociacion) {
    return <ErrorState error={error} clienteId={clienteId} />
  }

  // Tabs configuration
  const tabs = [
    {
      id: 'informacion',
      label: 'Información',
      icon: FileText,
      count: null,
    },
    {
      id: 'fuentes-pago',
      label: 'Fuentes de Pago',
      icon: CreditCard,
      count: fuentesPago.length,
    },
    {
      id: 'abonos',
      label: 'Abonos',
      icon: DollarSign,
      count: abonos.length,
    },
    {
      id: 'documentos',
      label: 'Documentos',
      icon: FolderOpen,
      count: documentos.length,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      count: null,
    },
    {
      id: 'actividad',
      label: 'Actividad',
      icon: Activity,
      count: null,
    },
  ]

  return (
    <div className={styles.layoutClasses.container}>
      <div className={styles.layoutClasses.inner}>
        {/* Breadcrumbs */}
        <Breadcrumbs clienteId={clienteId} />

        {/* Header */}
        <NegociacionDetalleHeader
          negociacion={negociacion}
          totales={totales}
        />

        {/* Tabs Navigation */}
        <NegociacionDetalleTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...styles.animations.fadeInUp}
          >
            {activeTab === 'informacion' && (
              <InformacionTab
                negociacion={negociacion}
                totales={totales}
                puedeCompletarse={puedeCompletarse}
                esActiva={esActiva}
                onCompletar={completarNegociacion}
                onSuspender={suspenderNegociacion}
                onRenuncia={registrarRenuncia}
              />
            )}
            {activeTab === 'fuentes-pago' && (
              <FuentesPagoTab
                negociacionId={negociacionId}
                valorTotal={negociacion.valor_total}
                fuentesPago={fuentesPago}
                onActualizar={recargarDatos}
              />
            )}
            {activeTab === 'abonos' && (
              <AbonosTab
                negociacionId={negociacionId}
                abonos={abonos}
                totales={totales}
                valorTotal={negociacion.valor_total}
                onActualizar={recargarDatos}
              />
            )}
            {activeTab === 'documentos' && (
              <DocumentosTab
                negociacionId={negociacionId}
                documentos={documentos}
                onActualizar={recargarDatos}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineTab negociacion={negociacion} />
            )}
            {activeTab === 'actividad' && (
              <ActividadTab negociacionId={negociacionId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## 📋 Plan de Implementación

### **Fase 1: Estructura Base** (2-3 horas)

1. ✅ Crear estructura de carpetas
2. ✅ Crear hook `useNegociacionDetalle`
3. ✅ Crear archivo de estilos `detalle.styles.ts`
4. ✅ Crear componentes base (Header, Tabs)

### **Fase 2: Tabs Principales** (4-5 horas)

5. ✅ Implementar Tab "Información"
6. ✅ Implementar Tab "Fuentes de Pago"
7. ✅ Implementar Tab "Abonos"
8. ✅ Migrar componente `ConfigurarFuentesPago`

### **Fase 3: Tabs Secundarios** (3-4 horas)

9. ✅ Implementar Tab "Documentos"
10. ✅ Implementar Tab "Timeline"
11. ✅ Implementar Tab "Actividad"

### **Fase 4: Componentes Auxiliares** (2-3 horas)

12. ✅ Extraer `TimelineStep` como componente
13. ✅ Extraer `EstadoBadge` como componente
14. ✅ Crear `ModalRenuncia` separado
15. ✅ Crear barrel exports

### **Fase 5: Testing y Pulido** (2 horas)

16. ✅ Probar navegación entre tabs
17. ✅ Probar acciones (completar, suspender, renuncia)
18. ✅ Validar responsive
19. ✅ Optimizar animaciones

---

## 📊 Beneficios de la Reestructuración

### **Antes:**
```
❌ 1 archivo monolítico (400+ líneas)
❌ Lógica mezclada con UI
❌ Difícil de mantener
❌ Componentes no reutilizables
❌ Sin organización clara
```

### **Después:**
```
✅ Módulo bien estructurado (15+ archivos pequeños)
✅ Separación de responsabilidades clara
✅ Componentes reutilizables
✅ Fácil de mantener y extender
✅ Sistema de tabs intuitivo
✅ Código limpio y profesional
```

---

## 🎯 Comparación Visual

### **Antes: Todo en una sola vista**
```
┌────────────────────────────────────┐
│ Header                             │
├────────────────────────────────────┤
│ Timeline │ Fuentes │ Acciones      │
│          │         │               │
│          │         │               │
│          │         │               │
│          │         │ (Todo junto,  │
│          │         │  desorganizado)│
└────────────────────────────────────┘
```

### **Después: Organizado en tabs**
```
┌────────────────────────────────────┐
│ Header con Métricas                │
├────────────────────────────────────┤
│ [Info] [Fuentes] [Abonos] [Docs]  │
│ [Timeline] [Actividad]             │
├────────────────────────────────────┤
│                                    │
│  Contenido del tab activo          │
│  (Organizado y enfocado)           │
│                                    │
└────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

1. **Decidir**: ¿Implementamos esta reestructuración?
2. **Priorizar**: ¿Qué tabs son más críticos?
3. **Planificar**: ¿Cuándo podemos dedicar tiempo?

---

## 📝 Notas

- Esta propuesta sigue **exactamente** el mismo patrón que usamos en el módulo de proyectos
- Reutiliza componentes existentes (ConfigurarFuentesPago)
- Mejora significativamente la UX con tabs organizados
- Facilita futuras extensiones (agregar más tabs)

---

¿Te gustaría que implemente esta reestructuración? Puedo empezar con las fases más críticas (Estructura Base + Tabs Principales).
