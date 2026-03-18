# Spec: Crédito con la Constructora — Refactor y Features

**Fecha:** 2026-03-18  
**Estado:** Aprobado  
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
│   └── useCuotasCredito.ts           (NUEVO — cálculos: próxima cuota, progreso)
│
├── components/
│   ├── CuotasCreditoTab.tsx          (REFACTOR — orquestador < 150 líneas)
│   ├── PanelResumenCredito.tsx       (NUEVO — stats + panel próxima cuota)
│   ├── TablaAmortizacion.tsx         (NUEVO — tabla de cuotas con acciones)
│   ├── ConfirmacionPagoCuota.tsx     (NUEVO — panel inline confirmación de pago)
│   ├── AplicarMoraModal.tsx          (EXISTENTE — sin cambios)
│   └── ReestructurarCreditoModal.tsx (EXISTENTE — sin cambios)
│
└── services/
    └── cuotas-credito.service.ts     (MODIFICAR — agregar registrarPagoYMarcarCuota)
```

### Regla de responsabilidad única

| Archivo                     | Responsabilidad exacta                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `useCreditoConstructora.ts` | Carga de datos desde BD, acciones de mora y reestructuración                                          |
| `useCuotasCredito.ts`       | Cálculos derivados: próxima cuota, progreso, monto pendiente total. Envuelve `useCreditoConstructora` |
| `CuotasCreditoTab.tsx`      | Orquestador: conecta hook → subcomponentes. Sin lógica propia                                         |
| `PanelResumenCredito.tsx`   | UI presentacional: 4 stats del crédito + card próxima cuota                                           |
| `TablaAmortizacion.tsx`     | UI presentacional: tabla de cuotas con botones Mora/Pagar                                             |
| `ConfirmacionPagoCuota.tsx` | UI presentacional: desglose cuota+mora → confirmar pago                                               |

---

## Detalle: `useCuotasCredito.ts`

Hook que envuelve `useCreditoConstructora` y agrega cálculos sin duplicar llamadas a BD.

```typescript
interface ProximaCuota {
  cuota: CuotaVigente
  estaVencida: boolean
  diasVencida: number
  moraSugerida: number   // calculada con tasa_mora_diaria de BD (solo referencia informativa)
  totalAPagar: number    // valor_cuota + mora_aplicada (mora ya registrada en BD)
}

interface ProgresoCredito {
  cuotasPagadas: number
  cuotasTotales: number
  cuotasPendientes: number
  montoPagado: number       // suma de valor_cuota de cuotas con estado 'Pagada'
  montoPendiente: number    // suma de total_a_cobrar de cuotas no pagadas
  porcentajeAvance: number  // 0–100
}

// Retorno del hook
{
  // Delegado de useCreditoConstructora
  credito, cuotas, resumen, cargando, procesando, error,
  recargar, aplicarMora, reestructurar, crearPlan,

  // Calculados
  proximaCuota: ProximaCuota | null,
  progresoCredito: ProgresoCredito,

  // Acción atómica (R7)
  registrarPagoCuota: (cuotaId: string, monto: number, mora: number) => Promise<boolean>
}
```

---

## Detalle: `registrarPagoYMarcarCuota` (corrección bug R7)

Función nueva en `cuotas-credito.service.ts`:

```typescript
export async function registrarPagoYMarcarCuota(dto: {
  negociacion_id: string
  fuente_pago_id: string
  cuota_id: string
  monto: number // valor_cuota + mora_aplicada
  mora_incluida: number // mora_aplicada de la cuota (puede ser 0)
  fecha_pago: string // YYYY-MM-DD
}): Promise<{ error: Error | null }>
```

**Lógica:**

1. Insertar en `abonos_historial` con `mora_incluida`
2. Si falla → retornar error (nada que revertir)
3. Actualizar `cuotas_credito.estado = 'Pagada'` y `fecha_pago`
4. Si falla → eliminar el abono recién insertado (rollback manual)
5. Retornar éxito

---

## Detalle: UI `PanelResumenCredito`

**Zona A — 4 stats compactas:**

- Capital prestado
- Interés total
- Mora acumulada
- Tasa mensual (%)

**Zona B — Card próxima cuota:**

- Número de cuota y total (ej: "Cuota 5 de 12")
- Fecha de vencimiento formateada con `formatDateCompact`
- Indicador visual: verde (vigente), ámbar (<7 días), rojo (vencida + días de mora)
- Valor cuota base
- Mora aplicada (si existe y > 0)
- Mora sugerida como referencia si está vencida y no tiene mora aplicada aún
- Total a pagar (destacado)
- Barra de progreso: cuotas pagadas / total con porcentaje

---

## Detalle: UI `ConfirmacionPagoCuota`

Panel inline que reemplaza el panel de confirmación actual en `CuotasCreditoTab`:

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

- Si la cuota no tiene mora (`mora_aplicada === 0`), no se muestra la fila de mora
- El botón confirmar llama a `registrarPagoCuota` del hook
- Muestra spinner mientras procesa, deshabilita botones

---

## Flujo de datos

```
BD (cuotas_credito + abonos_historial)
  ↓
useCreditoConstructora (carga raw, acciones)
  ↓
useCuotasCredito (cálculos: próxima cuota, progreso, acción atómica)
  ↓
CuotasCreditoTab (orquestador, estado UI)
  ├─→ PanelResumenCredito (props: credito, proximaCuota, progresoCredito)
  ├─→ TablaAmortizacion (props: cuotas, onMora, onPagar)
  └─→ ConfirmacionPagoCuota (props: cuota seleccionada, onConfirmar, onCancelar)
```

---

## Consideraciones de seguridad

- `registrarPagoYMarcarCuota`: el rollback manual (delete del abono) es aceptable dado que Supabase no expone transacciones directas desde el cliente. El riesgo de inconsistencia es bajo y auditable.
- No se expone `tasa_mora_diaria` al cliente — se usa solo server-side para calcular la sugerencia.
- Todos los montos calculados usan `Math.round` para evitar decimales flotantes.

---

## Checklist de verificación post-implementación

- [ ] R1: Registrar abono con mora → `monto_recibido` de la fuente NO incluye la mora
- [ ] R2: No existe UI para pagar mora por separado
- [ ] R3: `mora_total_recibida` en `fuentes_pago` refleja correctamente la mora cobrada
- [ ] R4: El panel "Próxima cuota" muestra N°, fecha, valor, mora (si existe), total y progreso
- [ ] R5: Clic en "Pagar" muestra panel inline con desglose — no abre modal general
- [ ] R6: `CuotasCreditoTab.tsx` tiene < 150 líneas. Sin `useState` de lógica de negocio
- [ ] R7: Si falla `marcarCuotaPagada` después de registrar abono, el abono se revierte
- [ ] Mora sugerida (no aplicada) se muestra como referencia informativa cuando la cuota está vencida sin mora
- [ ] Dark mode correcto en todos los componentes nuevos
- [ ] TypeScript sin errores: `npm run type-check` exitoso
