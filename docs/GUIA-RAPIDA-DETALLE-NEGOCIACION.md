# 🎯 GUÍA RÁPIDA: Nuevo Detalle de Negociación

## 📦 Importación

```tsx
import { NegociacionDetalleMain } from '@/modules/negociaciones/components/detalle'

<NegociacionDetalleMain
  negociacionId="uuid-de-negociacion"
  clienteId="uuid-de-cliente"
/>
```

---

## 🏗️ Componentes Disponibles

### Componente Principal
```tsx
import { NegociacionDetalleMain } from '@/modules/negociaciones/components/detalle'
```

### Componentes Individuales (si necesitas personalizar)
```tsx
import {
  // Componentes base
  EstadoBadge,
  TimelineStep,
  NegociacionDetalleHeader,
  NegociacionDetalleTabs,

  // Tabs
  InformacionTab,
  FuentesPagoTab,
  AbonosTab,
  TimelineTab,

  // Modales
  ModalSuspender,
  ModalRenuncia,
  ModalReactivar,
} from '@/modules/negociaciones/components/detalle'
```

### Hook
```tsx
import { useNegociacionDetalle } from '@/modules/negociaciones/hooks'

const {
  negociacion,
  cargando,
  activeTab,
  setActiveTab,
  abonos,
  totalesPago,
  suspenderNegociacion,
  reactivarNegociacion,
  registrarRenuncia,
  // ... más propiedades
} = useNegociacionDetalle({ negociacionId })
```

---

## 🎨 Ejemplo de Uso Completo

```tsx
'use client'

import { NegociacionDetalleMain } from '@/modules/negociaciones/components/detalle'

export default function NegociacionPage({
  params
}: {
  params: { id: string; negociacionId: string }
}) {
  return (
    <NegociacionDetalleMain
      negociacionId={params.negociacionId}
      clienteId={params.id}
    />
  )
}
```

---

## 🔧 API del Hook

### `useNegociacionDetalle({ negociacionId })`

#### Retorna:

```typescript
{
  // Estado básico
  negociacion: Negociacion | null,
  cargando: boolean,
  error: string | null,

  // Tabs
  activeTab: 'informacion' | 'fuentes-pago' | 'abonos' | 'timeline',
  setActiveTab: (tab) => void,

  // Datos relacionados
  fuentesPago: FuentePago[],
  abonos: Abono[],
  cargandoAbonos: boolean,

  // Totales calculados
  totales: {
    valorTotal: number,
    totalFuentes: number,
    porcentajeCubierto: number,
    diferencia: number,
  },
  totalesPago: {
    totalPagado: number,
    saldoPendiente: number,
    porcentajePagado: number,
    valorTotal: number,
  },

  // Acciones
  suspenderNegociacion: (motivo: string) => Promise<boolean>,
  reactivarNegociacion: () => Promise<boolean>,
  registrarRenuncia: (motivo: string) => Promise<boolean>,
  actualizarNegociacion: (datos) => Promise<boolean>,
  recargarTodo: () => Promise<void>,

  // Helpers
  esActiva: boolean,
  estaSuspendida: boolean,
  puedeCompletarseAuto: boolean,
  estadoLegible: string,
}
```

---

## 📋 Estados de Negociación

```typescript
type EstadoNegociacion =
  | 'Activa'              // ✅ Verde - En proceso normal
  | 'Suspendida'          // ⏸️ Amarillo - Pausada temporalmente
  | 'Completada'          // 🎉 Azul - Finalizada exitosamente
  | 'Cerrada por Renuncia' // ❌ Gris - Cliente renunció
```

---

## 🎭 Acciones Disponibles por Estado

### Estado: Activa ✅
- ✅ Suspender
- ✅ Registrar Renuncia
- ❌ Reactivar (no disponible)

### Estado: Suspendida ⏸️
- ✅ Reactivar
- ❌ Suspender (ya está suspendida)
- ❌ Registrar Renuncia (solo si activa)

### Estado: Completada/Cerrada 🎉❌
- ❌ No hay acciones disponibles (estados finales)

---

## 🎨 Estilos Disponibles

```tsx
import * as styles from '@/modules/negociaciones/styles/detalle.styles'

// Usar en componentes:
<div className={styles.layoutClasses.container}>
  <div className={styles.cardClasses.container}>
    <h3 className={styles.cardClasses.title}>Título</h3>
  </div>
</div>
```

### Categorías de Estilos:
- `layoutClasses` - Contenedores y grids
- `headerClasses` - Header con gradiente
- `breadcrumbsClasses` - Navegación
- `tabsClasses` - Sistema de tabs
- `cardClasses` - Tarjetas de contenido
- `infoClasses` - Cajas de información
- `progressClasses` - Barras de progreso
- `buttonClasses` - Botones temáticos
- `badgeClasses` - Badges de estado
- `timelineClasses` - Timeline
- `emptyClasses` - Estados vacíos
- `loadingClasses` - Estados de carga
- `modalClasses` - Modales
- `animations` - Variantes de Framer Motion

---

## 🔍 Ejemplo: Uso del Hook

```tsx
'use client'

import { useNegociacionDetalle } from '@/modules/negociaciones/hooks'
import { InformacionTab, AbonosTab } from '@/modules/negociaciones/components/detalle'

export function MiComponentePersonalizado({ negociacionId }: { negociacionId: string }) {
  const {
    negociacion,
    cargando,
    activeTab,
    setActiveTab,
    totalesPago,
    suspenderNegociacion,
  } = useNegociacionDetalle({ negociacionId })

  if (cargando) return <div>Cargando...</div>

  const handleSuspender = async () => {
    const exito = await suspenderNegociacion('Motivo de suspensión')
    if (exito) {
      console.log('Negociación suspendida exitosamente')
    }
  }

  return (
    <div>
      <h1>Mi Vista Personalizada</h1>

      {/* Botones de tabs */}
      <button onClick={() => setActiveTab('informacion')}>Info</button>
      <button onClick={() => setActiveTab('abonos')}>Abonos</button>

      {/* Contenido del tab activo */}
      {activeTab === 'informacion' && (
        <InformacionTab
          negociacion={negociacion}
          totalesPago={totalesPago}
          esActiva={true}
          estaSuspendida={false}
          onSuspender={handleSuspender}
          onReactivar={() => {}}
          onRenuncia={() => {}}
        />
      )}

      {activeTab === 'abonos' && (
        <AbonosTab
          abonos={[]}
          totalesPago={totalesPago}
          cargandoAbonos={false}
        />
      )}
    </div>
  )
}
```

---

## 🎯 Tabs Disponibles

### 1. Información
```tsx
<InformacionTab
  negociacion={negociacion}
  totalesPago={totalesPago}
  esActiva={esActiva}
  estaSuspendida={estaSuspendida}
  onSuspender={() => setModalAbierto('suspender')}
  onReactivar={() => setModalAbierto('reactivar')}
  onRenuncia={() => setModalAbierto('renuncia')}
/>
```

**Contenido:**
- Resumen financiero (valor negociado, descuento, total)
- Notas de la negociación
- Botones de acción contextuales

### 2. Fuentes de Pago
```tsx
<FuentesPagoTab
  negociacionId={negociacionId}
  valorTotal={valorTotal}
  fuentesPago={fuentesPago}
  totales={{
    totalFuentes: number,
    porcentajeCubierto: number,
    diferencia: number,
  }}
  onActualizar={recargarTodo}
/>
```

**Contenido:**
- Barra de progreso de cobertura
- Métricas (total, cubierto, faltante)
- Configuración de fuentes (`<ConfigurarFuentesPago />`)
- Lista de fuentes configuradas

### 3. Abonos
```tsx
<AbonosTab
  abonos={abonos}
  totalesPago={{
    totalPagado: number,
    saldoPendiente: number,
    porcentajePagado: number,
    valorTotal: number,
  }}
  cargandoAbonos={cargandoAbonos}
/>
```

**Contenido:**
- Barra de progreso de pago
- Métricas (total pagado, pendiente, %)
- Botón "Registrar Abono"
- Historial de abonos

### 4. Timeline
```tsx
<TimelineTab negociacion={negociacion} />
```

**Contenido:**
- Flujo visual del proceso:
  1. Activa → Creación
  2. Suspendida (opcional)
  3. Completada O Renuncia
- Fechas de creación y actualización

---

## 🎭 Modales

### Modal Suspender
```tsx
<ModalSuspender
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={async (motivo: string) => {
    const exito = await suspenderNegociacion(motivo)
    return exito
  }}
  negociacionId={negociacionId}
/>
```

### Modal Renuncia
```tsx
<ModalRenuncia
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={async (motivo: string) => {
    const exito = await registrarRenuncia(motivo)
    return exito
  }}
  negociacionId={negociacionId}
/>
```

### Modal Reactivar
```tsx
<ModalReactivar
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={async () => {
    const exito = await reactivarNegociacion()
    return exito
  }}
  negociacionId={negociacionId}
/>
```

---

## 🎨 EstadoBadge

```tsx
import { EstadoBadge } from '@/modules/negociaciones/components/detalle'

<EstadoBadge estado="Activa" />
<EstadoBadge estado="Suspendida" />
<EstadoBadge estado="Completada" />
<EstadoBadge estado="Cerrada por Renuncia" />
```

**Renderiza:**
- Icono apropiado
- Color temático
- Texto del estado

---

## 📊 Cálculos Automáticos

### Totales de Fuentes de Pago
```typescript
const totales = {
  valorTotal: negociacion.valor_total,
  totalFuentes: sum(fuentesPago.map(f => f.monto_aprobado)),
  porcentajeCubierto: (totalFuentes / valorTotal) * 100,
  diferencia: valorTotal - totalFuentes,
}
```

### Totales de Pagos
```typescript
const totalesPago = {
  valorTotal: negociacion.valor_total,
  totalPagado: sum(abonos.map(a => a.monto)),
  saldoPendiente: valorTotal - totalPagado,
  porcentajePagado: (totalPagado / valorTotal) * 100,
}
```

---

## ⚠️ Validaciones Importantes

### Suspender Negociación
```typescript
if (!esActiva) {
  // Error: Solo se pueden suspender negociaciones activas
}
if (!motivo.trim()) {
  // Error: Motivo es obligatorio
}
```

### Reactivar Negociación
```typescript
if (!estaSuspendida) {
  // Error: Solo se pueden reactivar negociaciones suspendidas
}
```

### Registrar Renuncia
```typescript
if (!esActiva) {
  // Error: Solo se pueden registrar renuncias en negociaciones activas
}
if (!motivo.trim()) {
  // Error: Motivo es obligatorio
}
```

---

## 🎯 Flujo Completo de Negociación

```
1. CREACIÓN
   └─> Estado: "Activa"

2. CONFIGURACIÓN (Activa)
   ├─> Configurar Fuentes de Pago
   └─> Registrar Abonos

3. OPCIONES INTERMEDIAS (Activa)
   ├─> Suspender
   │   └─> Estado: "Suspendida"
   │       └─> Reactivar
   │           └─> Estado: "Activa"
   │
   └─> Registrar Renuncia
       └─> Estado: "Cerrada por Renuncia" (FINAL)

4. FINALIZACIÓN AUTOMÁTICA
   └─> Al 100% pagado
       └─> Estado: "Completada" (FINAL)
```

---

## 🚀 Listo para Usar

El módulo está 100% completo y listo para producción.

**Archivo a modificar para integrar:**
```
src/app/clientes/[id]/negociaciones/[negociacionId]/negociacion-detalle-client.tsx
```

**Reemplazar con:**
```tsx
'use client'

import { NegociacionDetalleMain } from '@/modules/negociaciones/components/detalle'

export default function NegociacionDetalleClient({
  params
}: {
  params: { id: string; negociacionId: string }
}) {
  return (
    <NegociacionDetalleMain
      negociacionId={params.negociacionId}
      clienteId={params.id}
    />
  )
}
```

🎉 **¡Disfruta del nuevo módulo!**
