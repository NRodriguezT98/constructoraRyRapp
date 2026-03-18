# Spec: Persistencia del Crédito con la Constructora al Asignar Vivienda

**Fecha:** 2026-03-17  
**Estado:** Aprobado por usuario  
**Módulos afectados:** `negociaciones.service.ts`, `useAsignarViviendaV2.ts`, `SeccionRevision.tsx`

---

## Problema

Cuando se asigna una vivienda con "Crédito con la Constructora" como fuente de pago, el usuario configura capital, tasa, número de cuotas y fecha de inicio en `CreditoConstructoraForm`. Al presionar "Asignar Vivienda", esos parámetros se descartan silenciosamente:

- `creditos_constructora` nunca se crea → sin registro del préstamo
- `cuotas_credito` nunca se crea → sin calendario de pagos
- `fuentes_pago.capital_para_cierre` queda NULL

La infraestructura (tablas, services, hooks) ya existe completa. Solo falta conectar el wizard con ella.

---

## Objetivo

Al finalizar el wizard de asignación de vivienda:

1. Si alguna fuente tiene `parametrosCredito`, crear automáticamente en la misma operación transaccional:
   - 1 fila en `creditos_constructora` con los parámetros financieros
   - N filas en `cuotas_credito` (una por cuota), con fecha y monto individual
   - `fuentes_pago.capital_para_cierre` llenado desde el INSERT inicial (no un UPDATE posterior)
2. Mostrar en el Paso 3 (Revisión) el desglose financiero del crédito.

---

## Invariantes del negocio

```
Valor vivienda        = $113.600.000
Cuota Inicial         =  $99.600.000   monto_aprobado
Crédito Constructora:
  capital             =  $14.000.000   → monto_aprobado + capital_para_cierre
  tasa mensual        =  1.5%
  num cuotas          =  6
  interés total       =   $1.260.000   → calculado: 14M × 0.015 × 6
  monto total         =  $15.260.000   → lo que el cliente realmente paga al final
  cuota mensual       =   $2.543.333   → 15.26M / 6 (redondeado)
  ────────────────────────────────────
  Suma cierre:           $113.600.000  ✓ (capital, no monto_total)
```

- `monto_aprobado` en `fuentes_pago` = capital (cubre la vivienda)
- `capital_para_cierre` en `fuentes_pago` = capital (campo semántico explícito)
- El interés es ganancia de la constructora, **no forma parte del precio de la vivienda**
- Una negociación normalmente tiene una sola fuente de crédito constructora; si hubiera más, el service las maneja iterando

---

## Flujo de datos existente (traza completa)

```
CreditoConstructoraForm.onActualizar('parametrosCredito', valor)
  └─→ handleCreditoActualizar (SeccionFuentesPago.tsx)
        └─→ creditoRef.current = { monto_aprobado, capital_para_cierre, parametrosCredito }
              └─→ onChange({ tipo, monto_aprobado, capital_para_cierre, parametrosCredito, campos:{} })
                    └─→ useFuentesPago: f.config = { capital_para_cierre, parametrosCredito, ... }
                          └─→ useAsignarViviendaV2 .map() → DTO → crearNegociacion()
```

---

## Cambios por archivo

### 1. `negociaciones.service.ts` — DTO + Paso 2b

**`CrearFuentePagoDTO` — campos nuevos:**
```typescript
export interface CrearFuentePagoDTO {
  tipo: string
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_asignacion_url?: string
  // NUEVO — solo para fuentes con logica_negocio.genera_cuotas = true:
  capital_para_cierre?: number   // Se inserta directamente en fuentes_pago (no UPDATE posterior)
  parametrosCredito?: {
    capital: number
    tasaMensual: number          // porcentaje: 1.5 = 1.5%
    numCuotas: number
    fechaInicio: Date | string   // el service normaliza con T12:00:00
    tasaMoraDiaria?: number      // default 0.001 (0.1%/día); se guarda en creditos_constructora
  }
}
```

El flag `genera_cuotas` que activa este flujo viene de `tipos_fuentes_pago.logica_negocio.genera_cuotas` (JSONB). El service detecta la necesidad comprobando `fuente.parametrosCredito != null` — sin consulta extra a BD.

**`capital_para_cierre` en el INSERT inicial de `fuentesParaInsertar`:**
```typescript
const fuentesParaInsertar = datos.fuentes_pago.map(fuente => ({
  negociacion_id: negociacion.id,
  tipo: fuente.tipo,
  tipo_fuente_id: tipoIdMap[fuente.tipo] || null,
  monto_aprobado: fuente.monto_aprobado,
  capital_para_cierre: fuente.capital_para_cierre ?? null,   // NUEVO
  // Para fuentes sin parametrosCredito (Cuota Inicial, Hipotecario, etc.):
  //   capital_para_cierre=undefined en DTO → null en BD → correcto (sin crédito)
  entidad: fuente.entidad || null,
  numero_referencia: fuente.numero_referencia || null,
  carta_asignacion_url: fuente.carta_asignacion_url || null,
  permite_multiples_abonos: fuente.tipo === 'Cuota Inicial',
  estado: 'Activa',
  estado_fuente: 'activa',
}))
```

**Paso 2b — después del INSERT de fuentes, para cada fuente con `parametrosCredito`:**

Envolver todo Paso 2b en try/catch: si `calcularTablaAmortizacion` lanza (parámetros inválidos) o si `crearCredito`/`crearCuotasCredito` falla, disparar el rollback inmediatamente. Los parámetros ya fueron validados en el form, pero el service debe protegerse.

`calcularTablaAmortizacion` valida todas las entradas y lanza con mensaje descriptivo si: capital ≤ 0, tasaMensual ≤ 0 o > 10, numCuotas < 1 o > 360.

```
a) Normalizar fecha:
   const fechaDate = typeof parametrosCredito.fechaInicio === 'string'
     ? new Date(parametrosCredito.fechaInicio + 'T12:00:00')
     : parametrosCredito.fechaInicio

b) calcularTablaAmortizacion({ capital, tasaMensual, numCuotas, fechaInicio: fechaDate })
   Interés simple:
     interesTotal = capital × (tasaMensual/100) × numCuotas
     montoTotal   = capital + interesTotal
     valorCuota   = Math.round(montoTotal / numCuotas)
   Fechas de cuotas: addMonths(fechaInicio, i) — comportamiento existente, no cambiar

c) crearCredito({
     fuente_pago_id: fuenteCreada.id,
     capital: parametrosCredito.capital,
     tasa_mensual: parametrosCredito.tasaMensual,
     num_cuotas: parametrosCredito.numCuotas,
     fecha_inicio: fechaCuotaParaBD(fechaDate),   // convierte Date local → 'YYYY-MM-DD' sin timezone shift
     valor_cuota: calculo.valorCuotaMensual,
     interes_total: calculo.interesTotal,
     monto_total: calculo.montoTotal,
     tasa_mora_diaria: parametrosCredito.tasaMoraDiaria ?? 0.001  // 0.001 = 0.1% diario (ver ParametrosCredito type)
   })
   → Si error: ir a rollback

d) crearCuotasCredito(fuenteCreada.id, calculo.cuotas, versionPlan=1)
   → Insert batch único (.insert(rows[])) — un solo round-trip para N cuotas
   → crearCuotasCredito llama fechaCuotaParaBD internamente — el service no necesita llamarlo
   → Al insertar las cuotas, el trigger sync_version_credito en BD actualiza
     creditos_constructora.version_actual → 1 (idempotente, no es trigger de audit_log)
   → Si error: ir a rollback
```

**Rollback del Paso 2b** — mismo patrón de compensación manual ya usado en el service.
Si múltiples fuentes tienen `parametrosCredito`, el rollback elimina TODOS los registros creados en esta llamada (no solo el que falló). El service debe acumular los `fuente_pago_id` con crédito exitoso y eliminarlos todos.
```typescript
// Para cada fuenteConCreditoCreado.id (todos los insertados en esta operación):
await supabase.from('cuotas_credito').delete().eq('fuente_pago_id', fuenteConCreditoCreado.id)
await supabase.from('creditos_constructora').delete().eq('fuente_pago_id', fuenteConCreditoCreado.id)
// luego continúa el rollback existente:
// → DELETE fuentes_pago WHERE negociacion_id
// → DELETE negociaciones WHERE id
// → UPDATE viviendas SET estado='Disponible', cliente_id=null, negociacion_id=null
// → UPDATE clientes SET estado anterior
```

No se requiere función RPC ni cambio en base de datos. Es el mismo patrón de compensación ya establecido en el service.

**Auditoría:** la creación de `creditos_constructora` y `cuotas_credito` es consecuencia directa de la asignación de vivienda, que ya se audita. No se agregan entradas adicionales en `audit_log` en este flujo inicial.

**Imports nuevos en `negociaciones.service.ts`:**
```typescript
import { calcularTablaAmortizacion, fechaCuotaParaBD } from '@/modules/fuentes-pago/utils/calculos-credito'
// fechaCuotaParaBD se usa solo en el Paso 2b para fecha_inicio de crearCredito
// crearCuotasCredito llama fechaCuotaParaBD internamente para cada cuota de la tabla
import { crearCredito } from '@/modules/fuentes-pago/services/creditos-constructora.service'
import { crearCuotasCredito } from '@/modules/fuentes-pago/services/cuotas-credito.service'
```

**Nota sobre `tasaMensual=0`:** `calcularTablaAmortizacion` lanza `Error('La tasa mensual debe estar entre 0 y 10%')` para tasa ≤ 0 o > 10, igual que el CHECK constraint en BD (`tasa_mensual > 0`). El form `CreditoConstructoraForm` debe validar esto antes de habilitar Continuar. El try/catch en `SeccionRevision` captura este caso y muestra el fallback.

---

### 2. `useAsignarViviendaV2.ts` — incluir parametrosCredito en el DTO

En el `.map()` que construye `fuentesDTO`:

```typescript
return {
  tipo: f.tipo,
  monto_aprobado: monto,                                            // ya existente
  capital_para_cierre: f.config.capital_para_cierre ?? undefined,  // NUEVO
  parametrosCredito: f.config.parametrosCredito ?? undefined,       // NUEVO
  entidad: ...,
  numero_referencia: ...,
  permite_multiples_abonos: ...,
}
```

---

### 3. `SeccionRevision.tsx` — desglose visual del crédito

Para cada fuente activa con `f.config?.parametrosCredito`, calcular con `useMemo`:

```typescript
const creditoInfo = useMemo(() => {
  try {
    const params = f.config.parametrosCredito
    if (!params) return null
    const fecha = typeof params.fechaInicio === 'string'
      ? new Date(params.fechaInicio + 'T12:00:00')
      : params.fechaInicio
    return calcularTablaAmortizacion({ ...params, fechaInicio: fecha })
  } catch {
    return null  // parámetros inválidos (ej: tasa=0): mostrar fallback sin crash
  }
  // Deps: valores primitivos, no la referencia del objeto (que se recrea en cada render)
}, [
  f.config?.parametrosCredito?.capital,
  f.config?.parametrosCredito?.tasaMensual,
  f.config?.parametrosCredito?.numCuotas,
  String(f.config?.parametrosCredito?.fechaInicio),
])
```

**UI con desglose** (cuando `creditoInfo` disponible):
```
● Crédito con la Constructora
  Capital a financiar:    $14.000.000
  Interés total (1.5%):    $1.260.000
  ───────────────────────────────────
  Total a pagar:          $15.260.000
  6 cuotas de $2.543.333/mes · Primera: 01 abr 2026
```
Fecha primera cuota = `creditoInfo.cuotas[0].fechaVencimiento` (= addMonths(fechaInicio, 1)). No es `fechaInicio` — la primera cuota vence un mes después de la fecha de inicio.

**UI fallback** (si `creditoInfo` es null):
```
● Crédito con la Constructora    $14.000.000
```

El monto en la columna derecha del resumen siempre es el **capital** ($14M), consistente con el cierre financiero.

---

## Flujo completo después del cambio

```
Wizard Paso 2: CreditoConstructoraForm
  → state: { monto_aprobado=$14M, capital_para_cierre=$14M, parametrosCredito={...} }

Wizard Paso 3: SeccionRevision
  → recalcula localmente con calcularTablaAmortizacion
  → muestra: capital, interés=$1.26M, total=$15.26M, cuota=$2.54M, fecha=01/04/2026

"Asignar Vivienda" → crearNegociacion(DTO con parametrosCredito)
  → INSERT negociaciones
  → INSERT fuentes_pago (monto_aprobado=$14M, capital_para_cierre=$14M)
  → [Paso 2b] calcularTablaAmortizacion
     → INSERT creditos_constructora (1 fila con parámetros del préstamo)
     → INSERT cuotas_credito (batch de 6 filas con calendario de pagos)
  → UPDATE viviendas SET estado='Asignada'
  → UPDATE clientes SET estado='Activo'

Post-creación:
  → CuotasCreditoTab en detalle del cliente muestra el calendario de 6 cuotas
  → Módulo de abonos puede registrar pagos contra esas cuotas
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/modules/clientes/services/negociaciones.service.ts` | DTO + Paso 2b + rollback extendido |
| `src/modules/clientes/pages/asignar-vivienda-v2/hooks/useAsignarViviendaV2.ts` | `capital_para_cierre` y `parametrosCredito` en DTO |
| `src/modules/clientes/pages/asignar-vivienda-v2/components/sections/SeccionRevision.tsx` | Desglose visual del crédito |

## Archivos que NO se modifican

| Archivo | Razón |
|---------|-------|
| `src/modules/fuentes-pago/services/creditos-constructora.service.ts` | Ya listo |
| `src/modules/fuentes-pago/services/cuotas-credito.service.ts` | Ya listo |
| `src/modules/fuentes-pago/utils/calculos-credito.ts` | Ya listo |
| `src/modules/fuentes-pago/components/CreditoConstructoraForm.tsx` | Ya listo |
| Base de datos | Tablas y columnas ya existen |

---

## Criterios de éxito

- [ ] Al asignar con Crédito Constructora: 1 fila en `creditos_constructora` con capital, tasa, cuotas, interés y monto total correctos
- [ ] Al asignar: N filas en `cuotas_credito` con fechas y montos correctos
- [ ] `fuentes_pago.capital_para_cierre` = capital (no NULL)
- [ ] Si falla Paso 2b: la negociación no queda creada (rollback total)
- [ ] Paso 3 muestra: capital, interés total, monto total, cuota mensual, fecha de primera cuota
- [ ] Monto en resumen para el cierre = capital (no total con intereses)
- [ ] Fuentes sin `parametrosCredito` (Cuota Inicial, Hipotecario, etc.) no son afectadas
- [ ] `parametrosCredito` inválido en Revisión: muestra fallback sin crash
