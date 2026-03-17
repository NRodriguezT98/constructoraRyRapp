# Spec: Crédito con la Constructora — Feature Design

**Fecha:** 17 marzo 2026
**Estado:** ✅ Brainstorming completado — arquitectura aprobada — **pendiente implementación**
**Prioridad:** Alta — funcionalidad de negocio crítica
**Sesión anterior:** Esta sesión dejó todo diseñado. La siguiente debe implementar desde el paso 1.

---

## 🎯 Resumen ejecutivo

Agregar "Crédito con la Constructora" como nueva fuente de pago en el sistema. A diferencia de fuentes simples (Cuota Inicial, Crédito Hipotecario, Mi Casa Ya), esta fuente genera:

- Una **tabla de amortización** (cuotas programadas)
- **Intereses calculados** automáticamente: capital × tasa_mensual × num_cuotas
- **Reestructuraciones** posibles (cambiar plazo en cualquier momento)
- **Mora manual** aplicada por admin a cuotas específicas
- **Abonos libres** (no se obliga a pagar cuota por cuota)

El cierre financiero usa **capital** (no monto total con intereses) para validar que se cubre el valor de la vivienda.

---

## 📋 Decisiones de diseño (brainstorming completado)

| Pregunta                                              | Decisión                                                                                         |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ¿Interés fijo o calculado?                            | **Calculado** — el admin ingresa tasa mensual + número de cuotas                                 |
| ¿Cómo se registran los pagos?                         | **Opción C**: tabla de cuotas generada, abonos libres sin match obligatorio                      |
| ¿Cuotas fijas o flexibles?                            | **Flexibles** — se puede reestructurar el plan en cualquier momento                              |
| ¿Cómo se aplica mora?                                 | **Manualmente** por el admin, cuota por cuota                                                    |
| ¿Dónde aparece la mora en los abonos?                 | **Desglosada** dentro del abono: campo `mora_incluida` en `abonos_historial`                     |
| ¿El sistema de fuentes actuales escala?               | No — hay tipos hardcodeados en 3 lugares. Requiere refactor limpio                               |
| ¿Usar arquitectura de "crédito general" o específica? | **Crédito general** en BD, implementación específica de "Crédito con la Constructora" primero    |
| ¿Cierre financiero con intereses sumados?             | **No** — usar `capital_para_cierre` para no inflar el total por encima del precio de la vivienda |

---

## 🔍 Estado actual del código (auditoría realizada)

### Problemas identificados en fuentes de pago existentes

**1. Tipos hardcodeados en 3 lugares:**

```
src/modules/clientes/types/fuentes-pago.ts  → TIPOS_FUENTE_PAGO const + TipoFuentePago union
src/modules/abonos/types/index.ts           → TipoFuentePago union duplicada
src/modules/clientes/components/configurar-fuentes/configurar-fuentes-pago.tsx → TIPOS_FUENTE record hardcodeado
```

**2. Validaciones hardcodeadas en hook:**

```
src/modules/clientes/hooks/useFuentesPago.ts  → línea ~195: `if (tipo !== 'Cuota Inicial')`
```

**3. Lo que SÍ funciona y no debe tocarse:**

- `tipos_fuentes_pago.configuracion_campos` JSONB — sistema de campos dinámicos funcional ✅
- `cargarTiposFuentesPagoActivas()` en `tipos-fuentes-pago.service.ts` ✅
- Componentes de fuentes de pago en detalle-cliente ✅

---

## 🗄️ Cambios en Base de Datos

### Migración 1: Agregar columnas a tablas existentes

```sql
-- Archivo: supabase/migrations/2026-03-17-credito-constructora-schema.sql

-- 1. Lógica de negocio por tipo de fuente
ALTER TABLE tipos_fuentes_pago
ADD COLUMN IF NOT EXISTS logica_negocio JSONB DEFAULT NULL;

COMMENT ON COLUMN tipos_fuentes_pago.logica_negocio IS
'Lógica de negocio específica del tipo: { genera_cuotas: boolean, requiere_tabla_amortizacion: boolean, permite_mora: boolean, formula_interes: string }';

-- 2. Metadata del crédito en la instancia de fuente
ALTER TABLE fuentes_pago
ADD COLUMN IF NOT EXISTS metadata_credito JSONB DEFAULT NULL;

COMMENT ON COLUMN fuentes_pago.metadata_credito IS
'Para fuentes de crédito: { capital: number, tasa_mensual: number, num_cuotas: number, valor_cuota: number, interes_total: number, fecha_inicio: string }';

-- 3. Campo mora en historial de abonos
ALTER TABLE abonos_historial
ADD COLUMN IF NOT EXISTS mora_incluida NUMERIC(12,2) DEFAULT 0 NOT NULL;

COMMENT ON COLUMN abonos_historial.mora_incluida IS
'Monto de mora incluido en este abono. El monto total del abono = monto_principal + mora_incluida';
```

### Migración 2: Nueva tabla de cuotas

```sql
-- Nueva tabla para tabla de amortización
CREATE TABLE IF NOT EXISTS cuotas_credito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fuente_pago_id UUID NOT NULL REFERENCES fuentes_pago(id) ON DELETE CASCADE,
  numero_cuota INT NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  valor_cuota NUMERIC(12,2) NOT NULL,           -- valor base sin mora
  mora_aplicada NUMERIC(12,2) DEFAULT 0,         -- mora acumulada por admin
  total_a_cobrar NUMERIC(12,2) GENERATED ALWAYS AS (valor_cuota + mora_aplicada) STORED,
  estado TEXT NOT NULL DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'Pagada', 'Vencida', 'Reestructurada')),
  fecha_pago DATE,                               -- cuándo se marcó como pagada
  version_plan INT NOT NULL DEFAULT 1,           -- incrementa con reestructuraciones
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_cuotas_credito_fuente ON cuotas_credito(fuente_pago_id);
CREATE INDEX idx_cuotas_credito_estado ON cuotas_credito(estado);
CREATE INDEX idx_cuotas_credito_vencimiento ON cuotas_credito(fecha_vencimiento);
CREATE UNIQUE INDEX idx_cuotas_version_numero ON cuotas_credito(fuente_pago_id, version_plan, numero_cuota);

-- Trigger updated_at
CREATE TRIGGER update_cuotas_credito_updated_at
  BEFORE UPDATE ON cuotas_credito
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE cuotas_credito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver cuotas" ON cuotas_credito
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Solo admins pueden insertar cuotas" ON cuotas_credito
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_sistema
      WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Solo admins pueden actualizar cuotas" ON cuotas_credito
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_sistema
      WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
    )
  );
```

### Migración 3: Registrar tipo "Crédito con la Constructora"

```sql
-- Insertar o actualizar el tipo en tipos_fuentes_pago
INSERT INTO tipos_fuentes_pago (nombre, descripcion, activo, orden, logica_negocio, configuracion_campos)
VALUES (
  'Crédito con la Constructora',
  'Financiación directa con la constructora con tabla de amortización, tasa de interés configurable y posibilidad de reestructuración.',
  true,
  5,  -- después de los tipos existentes
  '{
    "genera_cuotas": true,
    "requiere_tabla_amortizacion": true,
    "permite_mora": true,
    "formula_interes": "simple",
    "capital_para_cierre": true
  }'::jsonb,
  '[
    {
      "nombre": "capital",
      "label": "Capital del crédito",
      "tipo": "number",
      "rol": "monto",
      "requerido": true,
      "placeholder": "Ej: 50000000",
      "ayuda": "Monto del crédito sin intereses (capital puro)"
    },
    {
      "nombre": "tasa_mensual",
      "label": "Tasa de interés mensual (%)",
      "tipo": "number",
      "requerido": true,
      "placeholder": "Ej: 1.5",
      "ayuda": "Porcentaje mensual. Ej: 1.5 = 1.5%",
      "min": 0,
      "max": 10,
      "step": 0.1
    },
    {
      "nombre": "num_cuotas",
      "label": "Número de cuotas",
      "tipo": "number",
      "requerido": true,
      "placeholder": "Ej: 24",
      "ayuda": "Cantidad de meses para pagar",
      "min": 1,
      "max": 240
    },
    {
      "nombre": "fecha_inicio",
      "label": "Fecha de inicio del crédito",
      "tipo": "date",
      "requerido": true,
      "ayuda": "Fecha desde la cual se calculan los vencimientos"
    }
  ]'::jsonb
)
ON CONFLICT (nombre) DO UPDATE SET
  logica_negocio = EXCLUDED.logica_negocio,
  configuracion_campos = EXCLUDED.configuracion_campos,
  descripcion = EXCLUDED.descripcion,
  activo = true;
```

---

## 🔧 Cambios en TypeScript

### Objetivo: eliminar tipos hardcodeados

**Archivos a modificar:**

#### `src/modules/clientes/types/fuentes-pago.ts`

```typescript
// ❌ ELIMINAR ESTO:
export const TIPOS_FUENTE_PAGO = [
  'Cuota Inicial',
  'Crédito Hipotecario',
  'Mi Casa Ya',
  'Subsidio',
] as const
export type TipoFuentePago = (typeof TIPOS_FUENTE_PAGO)[number]

// ✅ REEMPLAZAR CON:
export type TipoFuentePago = string // ahora es dinámico, viene de BD

// ✅ AGREGAR tipo enriquecido:
export interface LogicaNegocio {
  genera_cuotas: boolean
  requiere_tabla_amortizacion: boolean
  permite_mora: boolean
  formula_interes: 'simple' | 'compuesto'
  capital_para_cierre: boolean
}

export interface TipoFuentePagoCatalogo {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  orden: number
  configuracion_campos: CampoConfig[] | null
  logica_negocio: LogicaNegocio | null
}
```

#### `src/modules/abonos/types/index.ts`

```typescript
// ❌ ELIMINAR:
export type TipoFuentePago =
  | 'Cuota Inicial'
  | 'Crédito Hipotecario'
  | 'Mi Casa Ya'
  | 'Subsidio'

// ✅ IMPORTAR del módulo clientes:
export type { TipoFuentePago } from '@/modules/clientes/types/fuentes-pago'
```

#### `src/modules/clientes/components/configurar-fuentes/configurar-fuentes-pago.tsx`

```typescript
// ❌ ELIMINAR:
const TIPOS_FUENTE: Record<TipoFuentePago, { label: string; icon: React.ReactNode; color: string }> = {
  'Cuota Inicial': { ... },
  'Crédito Hipotecario': { ... },
  ...
}

// ✅ REEMPLAZAR CON: cargar dinámicamente de tipos_fuentes_pago
// El componente ya tiene cargandoTipos / tiposFuentesDisponibles — solo ajustar
```

#### `src/modules/clientes/hooks/useFuentesPago.ts` (línea ~195)

```typescript
// ❌ ELIMINAR validación hardcodeada:
if (tipo !== 'Cuota Inicial') { ... }

// ✅ REEMPLAZAR CON: consultar logica_negocio del tipo
const tipoInfo = tiposCatalogo.find(t => t.nombre === tipo)
if (tipoInfo?.logica_negocio?.genera_cuotas) { ... }
```

---

## 🏗️ Nueva Arquitectura de Módulo

### Reorganizar servicios de fuentes de pago

```
src/modules/fuentes-pago/              ← NUEVO MÓDULO (extraído de clientes/)
├── services/
│   ├── tipos-fuentes.service.ts       ← Mover de clientes/services/
│   ├── fuentes-pago.service.ts        ← Mover de clientes/services/
│   └── cuotas-credito.service.ts      ← NUEVO
├── hooks/
│   ├── useTiposFuentes.ts             ← NUEVO (reemplaza cargas manuales)
│   ├── useConfigurarFuentes.ts        ← Refactor del hook actual
│   └── useCreditoConstructora.ts      ← NUEVO (lógica de crédito)
├── utils/
│   └── calculos-credito.ts            ← NUEVO (funciones puras)
└── types/
    └── index.ts                       ← Tipos de cuotas, crédito, etc.
```

### `calculos-credito.ts` — funciones puras

```typescript
// src/modules/fuentes-pago/utils/calculos-credito.ts

export interface ParametrosCredito {
  capital: number
  tasaMensual: number // como porcentaje: 1.5 = 1.5%
  numCuotas: number
  fechaInicio: Date
}

export interface CuotaCalculo {
  numero: number
  fechaVencimiento: Date
  valorCuota: number
  capitalPorCuota: number
  interesPorCuota: number
}

export interface ResumenCredito {
  capital: number
  interesTotal: number
  montoTotal: number
  valorCuotaMensual: number
  cuotas: CuotaCalculo[]
}

/**
 * Calcula tabla de amortización con interés simple
 * Interés total = capital × (tasaMensual / 100) × numCuotas
 */
export function calcularTablaAmortizacion(
  params: ParametrosCredito
): ResumenCredito {
  const { capital, tasaMensual, numCuotas, fechaInicio } = params
  const tasa = tasaMensual / 100
  const interesTotal = capital * tasa * numCuotas
  const montoTotal = capital + interesTotal
  const valorCuota = montoTotal / numCuotas
  const capitalPorCuota = capital / numCuotas
  const interesPorCuota = interesTotal / numCuotas

  const cuotas: CuotaCalculo[] = Array.from({ length: numCuotas }, (_, i) => {
    const fecha = new Date(fechaInicio)
    fecha.setMonth(fecha.getMonth() + i + 1)
    return {
      numero: i + 1,
      fechaVencimiento: fecha,
      valorCuota: Math.round(valorCuota),
      capitalPorCuota: Math.round(capitalPorCuota),
      interesPorCuota: Math.round(interesPorCuota),
    }
  })

  return {
    capital,
    interesTotal,
    montoTotal,
    valorCuotaMensual: Math.round(valorCuota),
    cuotas,
  }
}

/**
 * Calcula mora acumulada para una cuota vencida
 * Mora = valor_cuota × tasa_mora_diaria × dias_vencido
 */
export function calcularMora(
  valorCuota: number,
  fechaVencimiento: Date,
  tasaMoraDiaria: number = 0.001 // 0.1% diario por defecto
): number {
  const hoy = new Date()
  const diasVencido = Math.max(
    0,
    Math.floor(
      (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
    )
  )
  return Math.round(valorCuota * tasaMoraDiaria * diasVencido)
}
```

### `cuotas-credito.service.ts` — NUEVO

```typescript
// src/modules/fuentes-pago/services/cuotas-credito.service.ts

import { supabase } from '@/lib/supabase/client'
import type { CuotaCalculo } from '../utils/calculos-credito'

export interface CuotaCredito {
  id: string
  fuente_pago_id: string
  numero_cuota: number
  fecha_vencimiento: string
  valor_cuota: number
  mora_aplicada: number
  total_a_cobrar: number
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Reestructurada'
  fecha_pago: string | null
  version_plan: number
  notas: string | null
}

export async function crearCuotasCredito(
  fuentePagoId: string,
  cuotas: CuotaCalculo[],
  versionPlan: number = 1
): Promise<{ error: Error | null }> {
  const rows = cuotas.map(c => ({
    fuente_pago_id: fuentePagoId,
    numero_cuota: c.numero,
    fecha_vencimiento: c.fechaVencimiento.toISOString().split('T')[0],
    valor_cuota: c.valorCuota,
    version_plan: versionPlan,
  }))

  const { error } = await supabase.from('cuotas_credito').insert(rows)
  return { error: error ? new Error(error.message) : null }
}

export async function getCuotasByFuente(
  fuentePagoId: string
): Promise<{ data: CuotaCredito[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('cuotas_credito')
    .select('*')
    .eq('fuente_pago_id', fuentePagoId)
    .order('version_plan', { ascending: true })
    .order('numero_cuota', { ascending: true })

  return { data, error: error ? new Error(error.message) : null }
}

export async function aplicarMoraCuota(
  cuotaId: string,
  moraAplicada: number,
  notas?: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('cuotas_credito')
    .update({ mora_aplicada: moraAplicada, notas: notas ?? null })
    .eq('id', cuotaId)

  return { error: error ? new Error(error.message) : null }
}

export async function reestructurarCredito(
  fuentePagoId: string,
  nuevasCuotas: CuotaCalculo[],
  nuevaVersion: number
): Promise<{ error: Error | null }> {
  // 1. Marcar cuotas pendientes actuales como Reestructuradas
  const { error: e1 } = await supabase
    .from('cuotas_credito')
    .update({ estado: 'Reestructurada' })
    .eq('fuente_pago_id', fuentePagoId)
    .eq('estado', 'Pendiente')

  if (e1) return { error: new Error(e1.message) }

  // 2. Insertar nuevas cuotas con nueva versión
  return crearCuotasCredito(fuentePagoId, nuevasCuotas, nuevaVersion)
}
```

---

## 🎨 Diseño de UI

### 1. Formulario de configuración de "Crédito con la Constructora"

Cuando el admin activa esta fuente en el configurador de negociaciones, aparece el formulario extendido:

```
┌─────────────────────────────────────────────────────────────────┐
│ 💰 Crédito con la Constructora                              [✓] │
│─────────────────────────────────────────────────────────────────│
│                                                                 │
│  Capital del crédito *                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  $ 50,000,000                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Tasa de interés mensual (%) *    Número de cuotas *            │
│  ┌─────────────────────────┐      ┌──────────────────────┐      │
│  │  1.5 %                  │      │  24 cuotas           │      │
│  └─────────────────────────┘      └──────────────────────┘      │
│                                                                 │
│  Fecha de inicio *                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  01/04/2026                                             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📊 Vista previa del crédito                             │    │
│  │                                                         │    │
│  │  Capital:         $50,000,000                           │    │
│  │  Interés total:   $18,000,000  (18,000,000)             │    │
│  │  Monto total:     $68,000,000                           │    │
│  │  Valor cuota:     $2,833,333 / mes                      │    │
│  │                                                         │    │
│  │  [Ver tabla de amortización completa ▼]                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ⚠️ Para cierre financiero se usará el capital: $50,000,000     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Tabla de amortización expandible:**

```
┌────┬──────────────┬──────────────┬──────────────┬───────────────┐
│ #  │ Vencimiento  │ Capital/cuota│ Interés/cuota│ Total cuota   │
├────┼──────────────┼──────────────┼──────────────┼───────────────┤
│  1 │ 01/05/2026   │   $2,083,333 │     $750,000  │  $2,833,333  │
│  2 │ 01/06/2026   │   $2,083,333 │     $750,000  │  $2,833,333  │
│ .. │ ...          │          ... │          ...  │        ...   │
│ 24 │ 01/04/2028   │   $2,083,333 │     $750,000  │  $2,833,333  │
└────┴──────────────┴──────────────┴──────────────┴───────────────┘
```

---

### 2. Pestaña "Cuotas" en detalle de fuente de pago

En el detalle del cliente → Fuentes de Pago → Crédito con la Constructora → Tab Cuotas:

```
┌─────────────────────────────────────────────────────────────────┐
│ Plan de cuotas - Crédito con la Constructora        [Reestructurar] │
│ Versión actual: Plan 1 (24 cuotas)                  [Ver historial] │
│─────────────────────────────────────────────────────────────────│
│                                                                 │
│ Resumen: 18 cuotas pendientes • 6 pagadas • 0 vencidas          │
│                                                                 │
│  ┌────┬──────────────┬─────────────────┬──────────┬──────────────────┐ │
│  │ #  │ Vencimiento  │ Valor cuota      │ Mora     │ Estado           │ │
│  ├────┼──────────────┼─────────────────┼──────────┼──────────────────┤ │
│  │  1 │ 01/05/2026   │    $2,833,333   │    -     │ ✅ Pagada         │ │
│  │  2 │ 01/06/2026   │    $2,833,333   │    -     │ ✅ Pagada         │ │
│  │  3 │ 01/07/2026   │    $2,833,333   │ $50,000  │ 🔴 Vencida        │ │
│  │    │              │                 │          │ [Aplicar mora]    │ │
│  │  4 │ 01/08/2026   │    $2,833,333   │    -     │ ⏳ Pendiente      │ │
│  └────┴──────────────┴─────────────────┴──────────┴──────────────────┘ │
│                                                                 │
│  💡 Los abonos se registran libremente y se asocian al crédito  │
│     sin necesidad de coincidir con una cuota específica.        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Lógica de colores de estado:**

- `Pendiente` → gris/neutro (no vencida aún)
- `Pagada` → verde
- `Vencida` → rojo (fecha_vencimiento < hoy AND estado = 'Pendiente') — calculado en frontend o BD view
- `Reestructurada` → morado/tachado (versiones anteriores)

---

### 3. Modal "Aplicar mora" (admin only)

```
┌─────────────────────────────────────────────┐
│ Aplicar mora a Cuota #3                      │
│                                             │
│  Cuota vencida el: 01/07/2026               │
│  Valor original:   $2,833,333               │
│                                             │
│  Mora calculada sugerida:                   │
│  ┌─────────────────────────────────────┐    │
│  │  $47,222 (1 mes vencido ~ 1.5%)     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Mora a aplicar *                           │
│  ┌─────────────────────────────────────┐    │
│  │  $ 47,222                           │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Notas (opcional)                           │
│  ┌─────────────────────────────────────┐    │
│  │  Acordado con cliente el 15/07/2026 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Cancelar]              [Aplicar mora ✓]   │
└─────────────────────────────────────────────┘
```

---

### 4. Modal "Reestructurar crédito"

```
┌─────────────────────────────────────────────────────┐
│ Reestructurar crédito - Plan 1 → Plan 2              │
│                                                     │
│  Cuotas pendientes actuales: 18 cuotas              │
│  Monto pendiente: $50,999,994                       │
│                                                     │
│  ── Nuevo plan ──                                   │
│                                                     │
│  Capital pendiente (automático)                     │
│  ┌───────────────────────────────────────────┐      │
│  │  $37,499,994  (capital no pagado)         │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  Nueva tasa mensual (%)    Nuevas cuotas            │
│  ┌─────────────────────┐   ┌─────────────────────┐  │
│  │  1.5 %              │   │  36                 │  │
│  └─────────────────────┘   └─────────────────────┘  │
│                                                     │
│  📊 Nuevo plan:                                     │
│  Capital: $37,499,994 │ Interés: $20,249,997        │
│  Total: $57,749,991   │ Cuota: $1,604,166 / mes     │
│                                                     │
│  ⚠️ Las 18 cuotas pendientes del Plan 1 quedarán    │
│     archivadas como "Reestructuradas".              │
│                                                     │
│  [Cancelar]           [Confirmar reestructuración]  │
└─────────────────────────────────────────────────────┘
```

---

### 5. Campo "mora_incluida" en modal de registro de abono

En el modal de registrar abono, cuando la fuente activa es "Crédito con la Constructora":

```
┌─────────────────────────────────────────────────────┐
│ Registrar abono — Crédito con la Constructora        │
│                                                     │
│  Monto del abono *                                  │
│  ┌───────────────────────────────────────────┐      │
│  │  $ 3,000,000                              │      │
│  └───────────────────────────────────────────┘      │
│                                                     │
│  ¿Este abono incluye mora? (opcional)               │
│  ┌─────────────────────────────────────────┐  ─ ─   │
│  │  [✓] Sí, incluye mora                   │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  Monto de mora incluida *                           │
│  ┌───────────────────────────────────────────┐      │
│  │  $ 166,667                                │      │
│  └───────────────────────────────────────────┘      │
│  (El abono principal sería $2,833,333)              │
│                                                     │
│  Comprobante de pago                                │
│  [Subir imagen o PDF]                               │
│                                                     │
│  [Cancelar]                    [Registrar abono ✓]  │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Plan de implementación ordenado

### FASE 1: Base de datos (ejecutar primero)

```bash
# Paso 1: Crear archivo de migración
# (el contenido está en la sección "Cambios en Base de Datos" arriba)
# Guardar como: supabase/migrations/2026-03-17-credito-constructora-schema.sql

# Paso 2: Ejecutar migración
npm run db:exec supabase/migrations/2026-03-17-credito-constructora-schema.sql

# Paso 3: Regenerar tipos TypeScript
npm run types:generate

# Paso 4: Verificar
npm run type-check
```

### FASE 2: Utilidades y servicios nuevos

```
Crear en orden:
1. src/modules/fuentes-pago/utils/calculos-credito.ts
2. src/modules/fuentes-pago/types/index.ts
3. src/modules/fuentes-pago/services/cuotas-credito.service.ts
4. src/modules/fuentes-pago/hooks/useCreditoConstructora.ts
```

### FASE 3: Refactor de tipos hardcodeados

```
Modificar en orden:
1. src/modules/clientes/types/fuentes-pago.ts         → string en lugar de union
2. src/modules/abonos/types/index.ts                  → importar en lugar de duplicar
3. src/modules/clientes/hooks/useFuentesPago.ts       → reemplazar validación hardcodeada
4. configurar-fuentes-pago.tsx                         → eliminar TIPOS_FUENTE hardcodeado
```

### FASE 4: UI del formulario de configuración

```
Crear/modificar:
1. src/modules/clientes/components/configurar-fuentes/CreditoConstructoraForm.tsx
   - Formulario: capital, tasa_mensual, num_cuotas, fecha_inicio
   - Vista previa calculada en tiempo real (useMemo)
   - Tabla amortización expandible

2. Modificar hook useFuentesPago.ts:
   - Cuando fuente tiene logica_negocio.genera_cuotas = true:
     - Guardar metadata_credito en fuentes_pago
     - Llamar crearCuotasCredito() después de guardar
```

### FASE 5: UI del calendario de cuotas

```
Crear:
1. src/modules/clientes/components/fuente-detalle/tabs/CuotasCreditoTab.tsx
   - Tabla de cuotas con estados visuales
   - Botón "Aplicar mora" (admin only, cuotas vencidas)
   - Botón "Reestructurar" (admin only)
   - Resumen de cuotas (pendientes, pagadas, vencidas)

2. src/modules/clientes/components/fuente-detalle/modals/AplicarMoraModal.tsx
   - Formulario: mora_aplicada, notas
   - Mora sugerida calculada

3. src/modules/clientes/components/fuente-detalle/modals/ReestructurarCreditoModal.tsx
   - Muestra capital pendiente automáticamente
   - Inputs: nueva_tasa, nuevas_cuotas
   - Preview del nuevo plan
   - Confirmación con advertencia de archivado
```

### FASE 6: Campo mora_incluida en registro de abono

```
Modificar:
1. src/modules/abonos/components/modal-registro-pago/ModalRegistroPago.tsx
   - Detectar si fuente activa tiene logica_negocio.permite_mora
   - Mostrar checkbox "¿Incluye mora?"
   - Campo opcional: monto de mora

2. src/modules/abonos/services/abonos.service.ts
   - Incluir mora_incluida al insertar en abonos_historial

3. src/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal.tsx
   - Mostrar desglose si mora_incluida > 0
```

### FASE 7: Cierre financiero

```
Verificar/modificar:
1. src/modules/clientes/services/cierre-financiero.service.ts (o donde esté)
   - Para fuentes con capital_para_cierre = true:
     usar campo "capital" de metadata_credito en lugar de monto_aprobado
   - Σ(capital_para_cierre) >= valor_negociado
```

---

## ⚠️ Reglas de negocio críticas

1. **Cierre financiero**: `Σ(capital de crédito) >= valor_negociado`. NUNCA sumar el total con intereses porque inflará el valor por encima del precio de la vivienda.

2. **Abonos son libres**: El admin registra abonos sin tener que asociarlos a cuotas específicas. La tabla de cuotas es referencial para el cliente y el admin.

3. **Mora es manual**: El sistema SUGIERE mora calculada pero el admin puede escribir cualquier valor. La mora no se aplica automáticamente ni al abono ni a la cuota.

4. **Reestructuración archiva, no elimina**: Las cuotas del plan anterior cambian a estado `Reestructurada`. Se conserva la versión para historial.

5. **Un solo crédito activo por negociación**: No se puede tener dos fuentes "Crédito con la Constructora" activas en la misma negociación.

6. **Tipo de fuente puede existir multiple veces en futuro**: La nueva arquitectura debe soportar múltiples tipos de crédito (Crédito Constructor, Leasing, etc.) sin cambios de código — solo agregando registros en `tipos_fuentes_pago`.

---

## 🔗 Archivos clave para leer antes de implementar

| Archivo                                                                          | Por qué leerlo                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/modules/clientes/types/fuentes-pago.ts`                                     | Ver tipos hardcodeados a eliminar                          |
| `src/modules/clientes/hooks/useFuentesPago.ts`                                   | Hook principal de fuentes, tiene validaciones hardcodeadas |
| `src/modules/clientes/services/tipos-fuentes-pago.service.ts`                    | Servicio existente que ya funciona                         |
| `src/modules/clientes/components/configurar-fuentes/configurar-fuentes-pago.tsx` | UI de configuración actual                                 |
| `src/modules/abonos/types/index.ts`                                              | Union type duplicado a eliminar                            |
| `src/modules/abonos/components/modal-registro-pago/ModalRegistroPago.tsx`        | Donde agregar campo mora_incluida                          |
| `docs/SISTEMA-FUENTES-PAGO-DINAMICAS.md`                                         | Documentación del sistema actual                           |
| `docs/ANALISIS-CIERRE-FINANCIERO.md`                                             | Lógica de cierre financiero existente                      |

---

## 🧪 Checklist de pruebas

- [ ] Admin puede configurar "Crédito con la Constructora" con capital, tasa y plazo
- [ ] Vista previa calcula correctamente: interés = capital × tasa × n_cuotas
- [ ] Tabla de amortización muestra las N cuotas con fechas correctas
- [ ] Al guardar, se crean N registros en `cuotas_credito`
- [ ] `metadata_credito` se guarda en `fuentes_pago`
- [ ] Tab "Cuotas" muestra las cuotas con estados correctos
- [ ] Admin puede aplicar mora a cuota vencida
- [ ] Mora se guarda en `cuotas_credito.mora_aplicada`
- [ ] `total_a_cobrar` se calcula automáticamente (columna GENERATED)
- [ ] Reestructuración archiva cuotas pendientes y crea nuevas con version_plan + 1
- [ ] Al registrar abono, aparece campo mora_incluida si la fuente es de crédito
- [ ] `abonos_historial.mora_incluida` se guarda correctamente
- [ ] Cierre financiero usa capital (no monto total) para validar suma
- [ ] Tipo `TipoFuentePago` ya no es union — es `string` en todo el proyecto
- [ ] No hay `TIPOS_FUENTE_PAGO` hardcodeado en ningún archivo

---

## 📌 Notas adicionales para el agente que implemente

1. **Verificar siempre** los nombres de columnas con `npm run types:generate` antes de escribir queries.

2. **NO crear nuevas páginas** — todo va en componentes dentro del detalle del cliente existente.

3. **El módulo `fuentes-pago/`** se crea en `src/modules/` (no dentro de `clientes/` ni `abonos/`).

4. **La migración SQL** debe ejecutarse con `npm run db:exec`, nunca copiar/pegar en Supabase.

5. **Separación de responsabilidades es inviolable**: cálculos en `calculos-credito.ts`, queries en services, lógica en hooks, solo JSX en components.

6. **Dark mode obligatorio** en todos los componentes nuevos.

7. **Los modales de "Aplicar mora" y "Reestructurar"** deben usar `moduleName="clientes"` para el theming.

8. **La tabla `cuotas_credito`** debe tener RLS con política de solo-lectura para usuarios normales y acceso completo para admins.

---

_Documento generado el 17 marzo 2026 — listo para retomar en nueva sesión_
