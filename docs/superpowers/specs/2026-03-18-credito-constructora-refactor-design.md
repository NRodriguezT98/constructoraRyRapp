# Spec: Crédito con la Constructora — Refactor y Features

**Fecha:** 2026-03-18  
**Estado:** En revisión  
**Módulo afectado:** `src/modules/fuentes-pago/`  
**Archivo de entrada actual:** `src/app/abonos/[clienteId]/components/fuente-pago-card.tsx`

---

## Contexto

La fuente de pago "Crédito con la Constructora" permite financiar parte del valor de una vivienda directamente con la constructora. Genera una tabla de amortización con cuotas mensuales de interés simple.

La infraestructura de BD ya está correcta (tabla `creditos_constructora`, tabla `cuotas_credito`, vista `vista_cuotas_vigentes`, triggers que separan mora del capital). Los problemas son en la capa de presentación y en un bug de atomicidad en el flujo de pago.

---

## Requisitos

| ID  | Requisito                                                                                                                                                                                               | Origen               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| R1  | El campo "Pendiente" en el módulo abonos debe reflejar capital + intereses (nunca inflado con mora)                                                                                                     | Confirmado en diseño |
| R2  | La mora siempre se paga junto con la cuota en un solo abono — no existe pago separado de mora                                                                                                           | Decisión de negocio  |
| R3  | La mora no incrementa la deuda del crédito; se contabiliza por separado en `mora_total_recibida`                                                                                                        | Diseño BD existente  |
| R4  | Panel "Próxima cuota" con: N° cuota, fecha vencimiento, valor cuota, mora aplicada (si existe), mora sugerida como referencia (si vencida y sin mora), total a pagar, progreso (cuotas pagadas / total) | Aprobado             |
| R5  | Pago de cuota con confirmación inline: desglose cuota + mora + total → botón confirmar. Sin abrir el modal general de abonos                                                                            | Aprobado             |
| R6  | Refactor de `CuotasCreditoTab.tsx`: debe quedar < 150 líneas como orquestador puro. Lógica extraída a `useCuotasCredito.ts`                                                                             | Regla #0             |
| R7  | Corrección de bug: el pago de cuota debe ser una operación atómica. Si `registrarAbono` tiene éxito pero `marcarCuotaPagada` falla, se revierte el abono                                                | Bug detectado        |

---

## Arquitectura

### Estructura de archivos resultante

```
src/modules/fuentes-pago/
├── hooks/
│   ├── useCreditoConstructora.ts     (EXISTENTE — sin cambios en responsabilidades)
│   └── useCuotasCredito.ts           (NUEVO — envuelve useCreditoConstructora + cálculos + acción atómica)
│
├── components/
│   ├── CuotasCreditoTab.tsx          (REFACTOR — orquestador < 150 líneas)
│   ├── PanelResumenCredito.tsx       (NUEVO — reemplaza las 4 StatCards actuales + card próxima cuota)
│   ├── TablaAmortizacion.tsx         (NUEVO — extrae el <table> inline de CuotasCreditoTab)
│   ├── ConfirmacionPagoCuota.tsx     (NUEVO — extrae el bloque JSX inline cuotaParaPago de CuotasCreditoTab)
│   ├── ConfigurarPlanCredito.tsx     (NUEVO — extrae el form "sin plan" de CuotasCreditoTab, bloque !credito || cuotas.length===0)
│   ├── AplicarMoraModal.tsx          (EXISTENTE — sin cambios)
│   └── ReestructurarCreditoModal.tsx (EXISTENTE — sin cambios)
│
└── services/
    └── cuotas-credito.service.ts     (MODIFICAR — agregar registrarPagoYMarcarCuota)
```

### Regla de responsabilidad única

| Archivo                     | Responsabilidad exacta                                                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCreditoConstructora.ts` | Carga de datos desde BD, acciones de mora y reestructuración                                                                                                                           |
| `useCuotasCredito.ts`       | Cálculos derivados: próxima cuota, progreso, monto pendiente total. Envuelve `useCreditoConstructora`. Expone `registrarPagoCuota` (atómica). Recibe `fuentePagoId` + `negociacionId`. |
| `CuotasCreditoTab.tsx`      | Orquestador: conecta hook → subcomponentes. Props: `fuentePagoId`, `negociacionId`, `montoFuente`, `onPagoCuotaRegistrado?`. Sin lógica propia                                         |
| `PanelResumenCredito.tsx`   | UI presentacional pura: 4 stats monetarias (capital, interés, mora, tasa) + card próxima cuota. **El contenido cambia respecto al bloque actual** (que muestra counts de cuotas).      |
| `TablaAmortizacion.tsx`     | UI presentacional pura: tabla de cuotas + alerta vencidas. Extrae el `<table>` y el bloque de alerta de CuotasCreditoTab                                                               |
| `ConfirmacionPagoCuota.tsx` | UI presentacional pura: desglose cuota+mora → confirmar pago inline                                                                                                                    |
| `ConfigurarPlanCredito.tsx` | UI presentacional pura: formulario crear plan para fuentes sin cuotas (clientes históricos)                                                                                            |

### Props de los componentes nuevos

```typescript
// PanelResumenCredito — stats monetarias + card próxima cuota
interface PanelResumenCreditoProps {
  credito: CreditoConstructora
  resumen: ResumenCuotas
  proximaCuota: ProximaCuota | null
  progresoCredito: ProgresoCredito
}

// TablaAmortizacion — lista de cuotas con acciones
interface TablaAmortizacionProps {
  cuotas: CuotaVigente[]
  procesando: boolean
  onPagar: (cuota: CuotaVigente) => void
  onMora: (cuota: CuotaVigente) => void
}

// ConfirmacionPagoCuota — panel inline de confirmación (no modal)
interface ConfirmacionPagoCuotaProps {
  cuota: CuotaVigente // usar cuota.total_a_cobrar para el total (= valor_cuota + mora_aplicada)
  procesando: boolean
  error: string | null
  onConfirmar: () => void
  onCancelar: () => void
}
```

**Cascading change en `fuente-pago-card.tsx`:** agregar `negociacionId` y `onPagoCuotaRegistrado` al `<CuotasCreditoTab>` y eliminar `onPagarCuota`. El componente ya recibe `negociacionId` como prop. `onPagoCuotaRegistrado` debe llamar a la función que el padre actualmente llama en `onAbonoRegistrado?.()` para refrescar el saldo de la tarjeta.

Hook que envuelve `useCreditoConstructora` y agrega cálculos sin duplicar llamadas a BD.

> Los tipos `ProximaCuota` y `ProgresoCredito` se definen en `src/modules/fuentes-pago/types/index.ts` (ver sección "Tipos nuevos" más adelante).

**Props del hook:**

```typescript
interface UseCuotasCreditoProps {
  fuentePagoId: string
  negociacionId: string // necesario para construir PagoCuotaDTO en registrarPagoCuota
}
```

**Retorno del hook:**

```typescript
{
  // Delegado de useCreditoConstructora (sin cambios)
  credito, cuotas, resumen, cargando, procesando, error,
  recargar, aplicarMora, reestructurar, crearPlan,

  // NUEVO: Calculados con useMemo
  proximaCuota: ProximaCuota | null,  // null si todas las cuotas están pagadas
  progresoCredito: ProgresoCredito,

  // NUEVO: delegar getMoraSugerida de useCreditoConstructora
  getMoraSugerida: (cuotaId: string) => number,

  // NUEVO: Acción atómica (R7)
  registrarPagoCuota: (cuotaId: string) => Promise<boolean>
  // El hook construye el PagoCuotaDTO internamente usando negociacionId + cuota lookup
}
```

**Regla de cálculo de `proximaCuota`:**

- Primera cuota donde `estado !== 'Pagada'` y `estado !== 'Reestructurada'`, ordenada por `numero_cuota` asc
- Si no hay ninguna: retorna `null` (crédito completamente pagado)
- `mora_sugerida` se calcula solo si `estado === 'Vencida' && mora_aplicada === 0`; en otro caso es `null`
- `total_a_pagar = valor_cuota + mora_aplicada` (siempre usa mora registrada en BD, no sugerida)

**Edge case — cuota pagada con mora:**

- No interfiere en `proximaCuota` (estados 'Pagada' son excluidos)
- `progresoCredito.montoPagado` suma solo `valor_cuota` (no mora) de pagadas — mora se contabiliza en `mora_total_recibida` de la fuente

**Edge case — crédito sin plan (fuentes históricas):**

- `cuotas.length === 0` → `proximaCuota = null`, `progresoCredito = { totalCuotas: 0, cuotasPagadas: 0, cuotasPendientes: 0, montoTotal: credito?.monto_total ?? 0, montoPagado: 0, porcentaje: 0 }`
- El componente `ConfigurarPlanCredito` se muestra cuando `!credito || cuotas.length === 0`

---

## Tipos nuevos a agregar en `src/modules/fuentes-pago/types/index.ts`

```typescript
/** La siguiente cuota pendiente de pagar, calculada en useCuotasCredito */
export interface ProximaCuota {
  id: string
  numero_cuota: number
  fecha_vencimiento: string // YYYY-MM-DD
  valor_cuota: number // Capital + interés de esa cuota
  mora_aplicada: number // 0 si no se ha aplicado mora
  mora_sugerida: number | null // Calculada por calcularMoraSugerida(), null si no vencida
  total_a_pagar: number // valor_cuota + mora_aplicada
  estado: 'Pendiente' | 'Vencida'
  dias_mora: number // 0 si no vencida
}

/** Progreso global del crédito */
export interface ProgresoCredito {
  totalCuotas: number
  cuotasPagadas: number
  cuotasPendientes: number
  montoTotal: number // credito.monto_total (capital + interes_total)
  montoPagado: number // suma de valor_cuota de cuotas pagadas (sin mora)
  porcentaje: number // 0-100
}
```

---

## Detalle: `registrarPagoYMarcarCuota` (corrección bug R7)

Función nueva en `cuotas-credito.service.ts`. Reemplaza el patrón de doble llamada que existe en `fuente-pago-card.tsx`.

```typescript
export interface PagoCuotaDTO {
  negociacion_id: string
  fuente_pago_id: string
  cuota_id: string
  /** valor_cuota + mora_aplicada. Nunca puede ser 0. */
  monto: number
  /** mora_aplicada de la cuota. Puede ser 0. Siempre number, nunca undefined. */
  mora_incluida: number
  /** `'Transferencia'` — hardcodeado en la función, no expuesto al usuario */
  metodo_pago: 'Transferencia'
  /** YYYY-MM-DD — construido con `getTodayDateString()` */
  fecha_pago: string
}

export async function registrarPagoYMarcarCuota(
  dto: PagoCuotaDTO
): Promise<{ error: Error | null }>
```

**Lógica detallada:**

1. Insertar en `abonos_historial` con `mora_incluida = dto.mora_incluida`
   - Trigger BD actualiza `monto_recibido` en `fuentes_pago` (excluye mora automáticamente)
   - Si falla → retornar `{ error }`. Nada que revertir.
2. Guardar el `id` del abono insertado
3. `UPDATE cuotas_credito SET estado = 'Pagada', fecha_pago = dto.fecha_pago WHERE id = dto.cuota_id`
   - Si falla → rollback: `DELETE FROM abonos_historial WHERE id = abonoId`
   - Retornar `{ error: new Error('Cuota no marcada pagada — abono revertido') }`
4. Ambos OK → `{ error: null }`

**Verificación criterio de aceptación R1:**
Después de registrar pago $55.000 (cuota $50.000 + mora $5.000):

- `fuentes_pago.monto_recibido` incrementa en **$50.000** (no $55.000)
- `fuentes_pago.mora_total_recibida` incrementa en **$5.000**
- `fuentes_pago.saldo_pendiente` decrece en **$50.000**

**Edge case `mora_incluida = 0`:** válido. El trigger lo maneja (`monto - 0 = monto`).

**Valor de `fecha_pago`:** el hook construye el DTO con `getTodayDateString()` de `@/lib/utils/date.utils`. No se expone como parámetro al usuario.

---

## Detalle: UI `PanelResumenCredito`

**Reemplaza:** el bloque de 4 stats que actualmente se renderiza inline en `CuotasCreditoTab.tsx` (líneas ~60-120 del archivo actual, dentro del bloque `credito &&`).

**Zona A — 4 stats compactas:**

- Capital prestado: `credito.capital`
- Interés total: `credito.interes_total`
- Mora acumulada: `resumen?.moraAcumulada ?? 0` ← suma de `mora_aplicada` de todas las cuotas (via `ResumenCuotas`)
- Tasa mensual: `credito.tasa_mensual` + `'%'`

> **Nota:** no se usa `fuentes_pago.mora_total_recibida` porque ese campo no existe en `FuentePago` ni `FuentePagoConAbonos`. `resumen.moraAcumulada` es la fuente pragmática correcta.

**Zona B — Card próxima cuota** (datos de `ProximaCuota`):

- Número de cuota y total (ej: "Cuota 5 de 12")
- Fecha de vencimiento formateada con `formatDateCompact`
- Indicador semáforo: verde (vigente), ámbar (≤7 días), rojo (vencida + "X días mora")
- Valor cuota base
- Mora aplicada: visible **solo si `proximaCuota.mora_aplicada > 0`**
- Mora sugerida: visible **solo si la cuota está vencida Y `mora_aplicada === 0`**, como texto informativo gris (ej: "Mora estimada: $2.500"). **No es editable aquí.**
- Total a pagar (bold destacado)
- Barra de progreso: `cuotasPagadas / totalCuotas` con porcentaje y texto "X de Y cuotas"

**Sin datos (edge case):** si `proximaCuota === null` (todas las cuotas están pagadas), mostrar badge verde "Crédito completado ✓".

---

## Detalle: UI `ConfirmacionPagoCuota`

Panel inline (no modal) que aparece al hacer clic en "Pagar" en la fila de la tabla. Reemplaza el bloque `cuotaParaPago &&` actual en `CuotasCreditoTab.tsx`.

```
┌─ Confirmar pago — Cuota N° X ─────────────────┐
│                                                │
│  Valor cuota:      $50.000                     │
│  Mora aplicada:    $5.000    ← oculto si 0     │
│  ─────────────────────────                     │
│  Total a pagar:    $55.000   ← bold destacado  │
│                                                │
│  [Cancelar]           [Confirmar pago →]       │
└────────────────────────────────────────────────┘
```

- Si `cuota.mora_aplicada === 0`: ocultar fila mora, total = valor_cuota
- **NO se muestra mora_sugerida aquí.** La mora ya debe estar registrada antes de pagar (con el botón "Aplicar Mora" de la tabla).
- El botón confirmar llama a `registrarPagoCuota(cuota.id)` del hook
- Muestra spinner mientras procesa, deshabilita ambos botones
- Si `error !== null` después de confirmar: muestra mensaje de error inline, no cierra el panel

---

## Detalle: UI `ConfigurarPlanCredito`

**Extrae** el formulario de "Configurar plan de cuotas" que actualmente vive inline en `CuotasCreditoTab.tsx` (bloque `!credito || cuotas.length === 0`, líneas ~25-60).

Este bloque es para **fuentes históricas** que fueron creadas antes de que existiera el sistema de cuotas.

**Props:**

```typescript
interface ConfigurarPlanCreditoProps {
  montoAprobado: number // pre-llenado como readonly en el form
  crearPlan: (params: ParametrosCredito) => Promise<boolean> // del hook padre
  procesando: boolean // para spinner / deshabilitar botón
  onPlanCreado: () => void // callback al completar satisfactoriamente
}
```

**Campos:**

- Monto del crédito (pre-llenado con `montoAprobado`, readonly)
- Tasa de interés mensual (%)
- Número de cuotas
- Fecha primera cuota

**Acción:** llama a `props.crearPlan(dto)` — el hook padre (`useCuotasCredito`) lo inyecta desde `useCreditoConstructora`. El componente es presentacional puro.

**Edge case:** si la fuente tiene `credito` pero `cuotas.length === 0` (plan eliminado sin recrear) → mostrar mismo formulario con mensaje explicativo.

---

## Flujo de datos

```
BD (cuotas_credito + abonos_historial)
  ↓
useCreditoConstructora (carga raw, acciones: aplicarMora, reestructurar, crearPlan)
  ↓
useCuotasCredito (cálculos: próxima cuota, progreso; acción atómica registrarPagoCuota)
  ↓
CuotasCreditoTab (orquestador – solo estado UI: cuotaSeleccionada, mostrarConfirmacion)
  ├─→ ConfigurarPlanCredito  (cuando !credito || cuotas.length === 0)
  ├─→ PanelResumenCredito    (cuando credito && cuotas.length > 0)
  ├─→ TablaAmortizacion      (lista de cuotas, onMora → AplicarMoraModal, onPagar → setCuotaSeleccionada)
  └─→ ConfirmacionPagoCuota  (cuando cuotaSeleccionada !== null)
```

---

## Consideraciones de seguridad

- `registrarPagoYMarcarCuota`: el rollback manual (delete del abono) es aceptable dado que Supabase no expone transacciones directas desde el cliente. El riesgo de inconsistencia es bajo y auditable.
- No se expone `tasa_mora_diaria` al cliente — se usa solo server-side para calcular la sugerencia.
- Todos los montos calculados usan `Math.round` para evitar decimales flotantes.

---

## Checklist de verificación post-implementación

- [ ] R1: Registrar abono $55k (cuota $50k + mora $5k) → `fuentes_pago.monto_recibido` sube $50k, `mora_total_recibida` sube $5k
- [ ] R2: No existe botón ni flujo para pagar mora por separado (solo junto a la cuota)
- [ ] R3: `saldo_pendiente` en `fuentes_pago` = suma de `valor_cuota` de cuotas pendientes (nunca incluye mora)
- [ ] R4: `PanelResumenCredito` muestra N°, fecha, valor, mora si existe, mora_sugerida si vencida sin mora, total, barra progreso
- [ ] R5: Clic "Pagar" abre `ConfirmacionPagoCuota` inline (no modal general de abonos)
- [ ] R6: `CuotasCreditoTab.tsx` tiene ≤ 150 líneas. Solo `useState` para estado UI puro (`cuotaSeleccionada`, `mostrarConfirmacion`) — sin datos de negocio ni valores calculados
- [ ] R7: Si falla `UPDATE cuotas_credito` después de insertar abono → abono queda eliminado (consistencia BD)
- [ ] `ConfirmacionPagoCuota` NO muestra mora_sugerida (solo mora_aplicada ya registrada)
- [ ] `ConfigurarPlanCredito` se monta cuando `!credito || cuotas.length === 0`
- [ ] `useCuotasCredito` devuelve `proximaCuota === null` cuando todas las cuotas están pagadas
- [ ] Dark mode correcto en todos los componentes nuevos
- [ ] `npm run type-check` sin errores
