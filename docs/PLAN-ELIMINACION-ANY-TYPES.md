# Plan de Eliminación de `any` Types — v2 (Definitivo)

> **⚠️ IMPORTANTE**: La v1 de este plan se marcó como "261 → 0 ✅ COMPLETO" pero la verificación
> usó `tsc --noEmit` + grep, que **NO DETECTA** `@typescript-eslint/no-explicit-any`.
> Solo `npx next lint` los detecta. Esta v2 usa `npx next lint` como **fuente única de verdad**.

## Estado Actual REAL (verificado con `npx next lint`)

| Tipo de Error     | Cantidad | Regla ESLint                         |
| ----------------- | :------: | ------------------------------------ |
| `no-explicit-any` |  **38**  | `@typescript-eslint/no-explicit-any` |
| `import/order`    |  **4**   | `import/order`                       |
| **TOTAL ERRORES** |  **42**  | —                                    |

## Plan de Fases (v2)

| Fase  | Estrategia                                                             | Errores que resuelve |    Estado    |
| ----- | ---------------------------------------------------------------------- | :------------------: | :----------: |
| **A** | Extender `NegociacionDetalle` + select de queries con campos faltantes |        **26**        | ⏳ PENDIENTE |
| **B** | Tipar parámetros genéricos y props de componentes                      |        **8**         | ⏳ PENDIENTE |
| **C** | Eliminar casts innecesarios y alinear tipos de props                   |        **~8**        | ⏳ PENDIENTE |
| **D** | Corregir import/order                                                  |        **4**         | ⏳ PENDIENTE |

---

## Diagnóstico de Causa Raíz

### ¿Por qué existen estos 38 `any`?

**Problema #1: Interfaces incompletas para datos de Supabase JOINs (26 de 38 errores)**

El service `negociaciones.service.ts` hace `select(*)` con JOINs anidados y devuelve campos como
`valor_total_pagar`, `fecha_renuncia_efectiva`, `saldo_pendiente`, `porcentaje_pagado`, etc.
Pero la interface `NegociacionDetalle` en `useNegociacionesQuery.ts` solo tiene un subconjunto de campos.
Resultado: los componentes hacen `(negociacion as any).valor_total_pagar` para acceder a datos que
SÍ existen en runtime pero NO en el tipo TypeScript.

Lo mismo pasa con:

- `(cliente as any).negociaciones` → `Cliente.negociaciones` SÍ existe en la interface, los `as any` son **innecesarios**
- `(cliente as any).intereses` → `Cliente.intereses` SÍ existe en la interface, el cast es **innecesario**
- `(viviendaActiva.vivienda as any)?.valor_base` → El query solo selecciona `valor_base, numero, estado` pero NO incluye manzanas/proyectos

**Problema #2: Parámetros de funciones/componentes sin tipar (8 de 38)**

Funciones utilitarias como `esValorVacio(valor: any)`, `formatearValor(valor: any)`, callbacks
como `(fuente: any) =>`, y props como `icon: any` que deberían tener tipos específicos.

**Problema #3: Casts innecesarios para evitar errores de tipo (4 de 38)**

`router.push(url as any)`, `useHook() as any`, `onGuardar={fn as any}` — casts que ocultan
desajustes entre los tipos declarados de las props y los valores reales.

---

## FASE A: Extender interfaces + queries con campos reales (resuelve 26 errores)

### A.1: Extender `NegociacionDetalle` en `useNegociacionesQuery.ts`

El service `obtenerNegociacionesCliente` hace `select(*)` que trae TODOS los campos de
`negociaciones` + JOINs con `vivienda(id, numero, valor_base, gastos_notariales, recargo_esquinera, es_esquinera, estado, manzanas(id, nombre, proyecto(id, nombre, estado, ubicacion)))`.

Pero `NegociacionDetalle` solo tiene:

```typescript
// ACTUAL (incompleto)
export interface NegociacionDetalle {
  id: string; estado: string; valor_negociado: number; descuento_aplicado: number;
  proyecto?: {...}; vivienda?: { id: string; numero: string; manzanas?: { nombre: string; id: string } };
  fecha_negociacion: string; fecha_creacion?: string; fecha_completada?: string;
}
```

**Campos a AGREGAR** (todos son opcionales porque no todos los queries los traen):

```typescript
export interface NegociacionDetalle {
  // ... campos existentes ...

  // Valores financieros (vienen de select(*) en obtenerNegociacionesCliente)
  valor_total?: number
  valor_total_pagar?: number
  total_abonado?: number
  saldo_pendiente?: number
  porcentaje_pagado?: number
  porcentaje_descuento?: number
  valor_escritura_publica?: number

  // Estado extendido
  fecha_renuncia_efectiva?: string
  notas?: string
  vivienda_id?: string
  cliente_id?: string
}
```

**Extender el tipo de `vivienda` dentro de la interface:**

```typescript
vivienda?: {
  id: string
  numero: string
  valor_base?: number
  recargo_esquinera?: number
  gastos_notariales?: number
  es_esquinera?: boolean
  estado?: string
  manzanas?: {
    nombre: string
    id: string
    proyecto?: { nombre: string; id?: string; ubicacion?: string; estado?: string }
  }
}
```

### A.2: Agregar `valor_total_pagar` al select de `useFuentesPagoTab.ts`

El query local en este hook selecciona:

```sql
id, valor_negociado, valor_total, estado, vivienda_id, viviendas(valor_base, numero, estado)
```

**Agregar:** `valor_total_pagar` al select.
**Agregar:** `manzanas(nombre, proyectos(nombre))` al select de viviendas (necesario para `fuentes-pago-tab.tsx` L298-299).

### A.3: Quitar `as any` que se vuelven innecesarios DESPUÉS de A.1

| Archivo                       | Líneas             | Cast a eliminar                                                                        | Razón                                              |
| ----------------------------- | ------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `cliente-detalle-client.tsx`  | 364, 463, 466, 494 | `(cliente as any).negociaciones` → `cliente.negociaciones`                             | `Cliente` YA tiene `negociaciones?: Negociacion[]` |
| `cliente-detalle-client.tsx`  | 365, 495           | `(n: any)` → `(n)`                                                                     | TypeScript infiere `Negociacion` del array         |
| `EstadisticasComerciales.tsx` | 17                 | `(cliente as any).intereses` → `cliente.intereses`                                     | `Cliente` YA tiene `intereses?: ClienteInteres[]`  |
| `useFuentesPagoTab.ts`        | 535-536            | `(negociacion as any).valor_total_pagar` → `negociacion?.valor_total_pagar`            | Campo agregado al select (A.2)                     |
| `useNegociacionTab.ts`        | 117                | `(negociacion as any).valor_total_pagar` → `negociacion.valor_total_pagar`             | Campo agregado a interface (A.1)                   |
| `negociacion-tab.tsx`         | 337                | `(negociacion as any).fecha_renuncia_efectiva` → `negociacion.fecha_renuncia_efectiva` | Campo agregado (A.1)                               |
| `negociacion-tab.tsx`         | 342                | `negociacion as any` → `negociacion` directo                                           | Todos los campos ya en interface                   |
| `negociacion-tab.tsx`         | 361                | `abonos as any` → quitar cast                                                          | Tipo ya coincide con el componente                 |
| `fuentes-pago-tab.tsx`        | 298-299            | `(negociacion.viviendas as any)?.manzanas` → `negociacion?.viviendas?.manzanas`        | Tipo extendido (A.1) + query extendido (A.2)       |
| `fuentes-pago-tab.tsx`        | 344, 354           | `fuentesPago as any`, `tiposDisponibles as any`                                        | Casts innecesarios — tipos ya coinciden            |
| `vivienda-asignada-tab.tsx`   | 184, 188           | `(viviendaActiva.vivienda as any)?.valor_base`                                         | Tipo extendido (A.1)                               |

---

## FASE B: Tipar parámetros genéricos y props (resuelve 8 errores)

Cambios mecánicos — reemplazar `any` por el tipo correcto:

| Archivo                          | Línea | Actual                           | Correcto                                                                                                |
| -------------------------------- | :---: | -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DetalleEventoModal.tsx`         |  167  | `icono: any`                     | `icono: React.ElementType`                                                                              |
| `DetalleEventoModal.tsx`         |  260  | `esValorVacio(valor: any)`       | `esValorVacio(valor: unknown)`                                                                          |
| `DetalleEventoModal.tsx`         |  277  | `formatearValor(valor: any)`     | `formatearValor(valor: unknown)`                                                                        |
| `ListaFuentes.tsx`               |  39   | `icon: React.ComponentType<any>` | `icon: React.ComponentType<{ className?: string }>`                                                     |
| `ListaFuentes.tsx`               |  52   | `lista?: any[]`                  | `lista?: Array<{ total: number; subidos: number; pendientes: number; obligatoriosPendientes: number }>` |
| `ListaFuentes.tsx`               |  169  | `(tipoConfig: any)`              | `(tipoConfig: TipoFuentePagoConfig)` — tipo ya importado en el archivo                                  |
| `negociacion-detalle-client.tsx` |  90   | `icon: any`                      | `icon: React.ElementType`                                                                               |
| `EditarFuentesPagoModal.tsx`     |  66   | `valor: any`                     | `valor: string \| number`                                                                               |

---

## FASE C: Eliminar casts innecesarios y alinear tipos (resuelve ~8 errores restantes)

| Archivo                          |  Línea   | Problema                                    | Solución                                                                       |
| -------------------------------- | :------: | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `useViviendaAsignadaTab.ts`      | 239, 246 | `router.push(url as any)`                   | Quitar `as any` — `push()` acepta `string`                                     |
| `useViviendaAsignadaTab.ts`      |   149    | `viviendaActiva as any` en `generarReporte` | Tipar parámetro como `NegociacionDetalle \| null`                              |
| `vivienda-asignada-tab.tsx`      |    96    | `useViviendaAsignadaTab() as any`           | Quitar cast — el hook retorna tipo correcto; agregar props faltantes al return |
| `vivienda-asignada-tab.tsx`      | 248, 278 | `(fuente: any)`, `(abono: any)`             | Importar y usar `FuentePago`, `Abono`                                          |
| `vivienda-asignada-tab.tsx`      |   301    | `guardarFuentes as any`                     | Alinear tipo de `onGuardar` prop en `EditarFuentesPagoModal`                   |
| `vivienda-asignada-tab.tsx`      |   488    | `handleConfirmarPaso as any`                | Alinear tipo de `onConfirmar` en `ModalMarcarPasoCompletado`                   |
| `useEditarFuentesPago.ts`        |    66    | `(f as any).detalles`                       | Agregar `detalles?: string \| null` a `FuentePagoEditable`                     |
| `negociacion-detalle-client.tsx` | 387-388  | `(f: any)`, `(fuente: any)`                 | Tipar como `FuentePago` donde `fuentesPago` ya es typed                        |

---

## FASE D: Corregir errores de import/order (4 errores)

| Archivo                  | Línea | Problema                                     | Solución                                                                             |
| ------------------------ | :---: | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| `DiffFuentesPago.tsx`    |  11   | Falta línea vacía entre import groups        | Agregar línea vacía entre `lucide-react` y `@/modules`                               |
| `EditarProyectoView.tsx` |   5   | `lucide-react` debe ir antes de `next/link`  | Reordenar: `next/link` es external, `lucide-react` también — ordenar alfabéticamente |
| `AbonosTab.tsx`          |  20   | No debe haber línea vacía dentro de grupo    | Eliminar línea vacía entre imports del mismo grupo                                   |
| `AbonosTab.tsx`          |  22   | Import de hook debe ir antes del type import | Mover `useAbonosViviendaTab` antes del `type Vivienda`                               |

---

## Inventario COMPLETO de Errores (38 `any` + 4 `import/order`)

### Archivo 1: `src/app/clientes/[id]/cliente-detalle-client.tsx` — 6 errores

```
364:21  (cliente as any).negociaciones?.filter(
365:15  (n: any) => n.estado !== 'Cerrada por Renuncia'
463:33  (cliente as any).negociaciones?.[0]
466:47  (cliente as any).negociaciones[0]
494:32  (cliente as any).negociaciones?.filter(
495:25  (n: any) => n.estado !== 'Cerrada por Renuncia'
```

**Causa**: `cliente` es `Cliente` que YA tiene `negociaciones?: Negociacion[]`. Los `as any` son innecesarios.
**Fix FASE A.3**: Quitar `as any`, tipar `(n)` por inferencia.

### Archivo 2: `src/app/clientes/[id]/negociaciones/[negociacionId]/negociacion-detalle-client.tsx` — 3 errores

```
90:66   icon: any                    → icon: React.ElementType
387:27  (f: any) =>                  → (f: FuentePago) =>
388:29  (fuente: any) =>             → (fuente: FuentePago) =>
```

**Causa**: Tipos no especificados en interfaces y callbacks.
**Fix FASE B + C**.

### Archivo 3: `src/app/clientes/[id]/tabs/components/DetalleEventoModal.tsx` — 3 errores

```
167:10  icono: any                   → icono: React.ElementType
260:30  esValorVacio(valor: any)     → esValorVacio(valor: unknown)
277:32  formatearValor(valor: any)   → formatearValor(valor: unknown)
```

**Causa**: Interface y funciones utilitarias sin tipo específico.
**Fix FASE B**.

### Archivo 4: `src/app/clientes/[id]/tabs/fuentes-pago/components/ListaFuentes.tsx` — 3 errores

```
39:31   icon: React.ComponentType<any>    → React.ComponentType<{ className?: string }>
52:15   lista?: any[]                      → tipado específico
169:52  (tipoConfig: any) =>               → (tipoConfig: TipoFuentePagoConfig) =>
```

**Causa**: Props genéricas sin tipo.
**Fix FASE B**.

### Archivo 5: `src/app/clientes/[id]/tabs/fuentes-pago/hooks/useFuentesPagoTab.ts` — 2 errores

```
535:25  (negociacion as any).valor_total_pagar
536:38  (negociacion as any).valor_total_pagar
```

**Causa**: El query local selecciona `id, valor_negociado, valor_total, estado, vivienda_id, viviendas(valor_base, numero, estado)`
SIN `valor_total_pagar`. El campo existe en BD pero no se selecciona en el query.
**Fix FASE A.2**: Agregar `valor_total_pagar` al `.select()`.

### Archivo 6: `src/app/clientes/[id]/tabs/fuentes-pago-tab.tsx` — 4 errores

```
298:46  (negociacion.viviendas as any)?.manzanas?.proyectos?.nombre
299:51  (negociacion.viviendas as any)?.manzanas?.nombre
344:39  fuentesPago as any
354:49  tiposDisponibles as any
```

**Causa L298-299**: Query selecciona `viviendas(valor_base, numero, estado)` SIN `manzanas(nombre, proyectos(nombre))`.
**Fix FASE A.2**: Extender select para incluir manzanas/proyectos.
**Causa L344,354**: Casts innecesarios — tipos ya coinciden con los props.
**Fix FASE C**: Quitar `as any`.

### Archivo 7: `src/app/clientes/[id]/tabs/general/components/EstadisticasComerciales.tsx` — 1 error

```
17:33   (cliente as any).intereses
```

**Causa**: `Cliente` YA tiene `intereses?: ClienteInteres[]`. El cast es innecesario.
**Fix FASE A.3**: Quitar `as any`.

### Archivo 8: `src/app/clientes/[id]/tabs/negociacion/hooks/useNegociacionTab.ts` — 1 error

```
117:28  (negociacion as any).valor_total_pagar
```

**Causa**: `NegociacionDetalle` no tiene `valor_total_pagar`.
**Fix FASE A.1**: Agregar campo a la interface.

### Archivo 9: `src/app/clientes/[id]/tabs/negociacion-tab.tsx` — 3 errores

```
337:40  (negociacion as any).fecha_renuncia_efectiva
342:33  negociacion as any
361:34  abonos as any
```

**Causa**: Campos faltantes en `NegociacionDetalle` + casts innecesarios.
**Fix FASE A.1 + A.3**.

### Archivo 10: `src/app/clientes/[id]/tabs/vivienda-asignada/components/EditarFuentesPagoModal.tsx` — 1 error

```
66:84   valor: any
```

**Causa**: Parámetro de `actualizarFuente(index, campo, valor)` sin tipo específico.
**Fix FASE B**: `valor: string | number`.

### Archivo 11: `src/app/clientes/[id]/tabs/vivienda-asignada/hooks/useEditarFuentesPago.ts` — 1 error

```
66:25   (f as any).detalles
```

**Causa**: `FuentePagoEditable` no define `detalles`.
**Fix FASE C**: Agregar `detalles?: string | null` a la interface local.

### Archivo 12: `src/app/clientes/[id]/tabs/vivienda-asignada/hooks/useViviendaAsignadaTab.ts` — 3 errores

```
149:40  viviendaActiva as any         → Tipar parámetro de generarReporte
239:98  router.push(... as any)       → Quitar as any (string es válido)
246:126 router.push(... as any)       → Quitar as any (string es válido)
```

**Fix FASE C**.

### Archivo 13: `src/app/clientes/[id]/tabs/vivienda-asignada-tab.tsx` — 7 errores

```
96:46   useViviendaAsignadaTab({ cliente }) as any  → Quitar cast, corregir hook return type
184:45  (viviendaActiva.vivienda as any)?.valor_base → Usar tipo extendido (FASE A)
188:61  (viviendaActiva.vivienda as any)?.recargo_esquinera → Usar tipo extendido (FASE A)
248:45  (fuente: any) =>                → (fuente: FuentePago) =>
278:42  (abono: any) =>                 → Importar y usar tipo Abono
301:40  guardarFuentes as any           → Alinear tipo de onGuardar prop
488:45  handleConfirmarPaso as any      → Alinear tipo de onConfirmar prop
```

**Fix FASE A + C**.

### Archivos con import/order (4 errores)

```
DiffFuentesPago.tsx:11         — Falta línea vacía entre grupos de import
EditarProyectoView.tsx:5       — lucide-react debe ir antes de next/link
AbonosTab.tsx:20               — Línea vacía dentro de grupo de import
AbonosTab.tsx:22               — Orden incorrecto de imports
```

**Fix FASE D**.

---

## Orden de Ejecución

```
FASE A → FASE B → FASE C → FASE D → VERIFICACIÓN FINAL
```

1. **FASE A** primero porque resolver las interfaces desbloquea 26 de 38 errores
2. **FASE B** es independiente — tipos de parámetros simples
3. **FASE C** depende parcialmente de A (los casts se eliminan después de tener los tipos)
4. **FASE D** es independiente — solo reordenar imports

## Verificación DEFINITIVA

```bash
# 1. FUENTE ÚNICA DE VERDAD — 0 errores ESLint
npx next lint 2>&1 | Select-String "Error" | Measure-Object
# Count DEBE ser: 0

# 2. Complementario — 0 errores TypeScript
npx tsc --noEmit

# 3. Confirmar que la app compila
npm run build
```

**NO usar** `tsc --noEmit` como verificación de `any` — TypeScript NO lo detecta.
**NO usar** grep/Select-String como verificación — no cubre todos los patrones.
**SOLO** `npx next lint` es la fuente de verdad para `no-explicit-any`.

---

## Historial v1 (referencia, ya ejecutado)

Las fases F1-F3 de la v1 sí eliminaron ~126 `any` reales del código.
Las fases F4-F9 se marcaron como completas pero la verificación fue insuficiente.
Los 42 errores de esta v2 son los que quedaron sin resolver.

---

## Historial v1 (referencia, ya ejecutado)

Las fases F1-F3 de la v1 sí eliminaron ~126 `any` reales del código.
Las fases F4-F9 se marcaron como completas pero la verificación fue insuficiente.
Los 42 errores de esta v2 son los que quedaron sin resolver.
