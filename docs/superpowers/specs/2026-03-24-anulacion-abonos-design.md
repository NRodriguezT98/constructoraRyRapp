# Spec: Sistema de Anulación de Abonos
**Fecha:** 2026-03-24
**Estado:** Aprobado por usuario
**Módulo:** `src/modules/abonos/`

---

## Decisiones de diseño

| Aspecto | Decisión |
|---|---|
| Quién puede anular | Solo `Administrador` |
| Tipo de eliminación | Soft delete — `estado = 'Anulado'` con CHECK constraint |
| Motivo | Lista predefinida + observación libre obligatoria si elige "Otro" |
| Visibilidad UI | Ocultos por defecto; toggle Admin-only |
| Restricción temporal | Ninguna |
| Nombres en historial | Snapshot `anulado_por_nombre TEXT` (no JOIN) |
| Reactivación | No existe — principio contable de inmutabilidad |

---

## Capa 1 — Base de Datos

### Migración `abonos_historial`

```sql
ALTER TABLE abonos_historial
  ADD COLUMN estado              TEXT        NOT NULL DEFAULT 'Activo'
                                 CHECK (estado IN ('Activo', 'Anulado')),
  ADD COLUMN motivo_categoria    TEXT
                                 CHECK (motivo_categoria IN (
                                   'Error en el monto',
                                   'Pago duplicado',
                                   'Comprobante inválido',
                                   'Error en la fecha',
                                   'Solicitud del cliente',
                                   'Otro'
                                 )),
  ADD COLUMN motivo_detalle      TEXT,
  ADD COLUMN anulado_por_id      UUID REFERENCES usuarios(id),
  ADD COLUMN anulado_por_nombre  TEXT,           -- snapshot, no JOIN
  ADD COLUMN fecha_anulacion     TIMESTAMPTZ;

CREATE INDEX idx_abonos_estado
  ON abonos_historial(estado);
CREATE INDEX idx_abonos_negociacion_estado
  ON abonos_historial(negociacion_id, estado);
```

### Trigger AFTER UPDATE para recalcular saldos

Los triggers AFTER DELETE existentes se mantienen. Se añade un trigger
AFTER UPDATE que se dispara SOLO al cambiar `estado` de `'Activo'` a `'Anulado'`.
Este trigger recalcula `fuentes_pago.monto_recibido` y campos derivados de
`negociaciones` filtrando `WHERE estado = 'Activo'`.

### Actualización de `vista_abonos_completos`

Añadir campos `estado`, `motivo_categoria`, `motivo_detalle`,
`anulado_por_nombre`, `fecha_anulacion` a la vista existente.

### RLS

- SELECT: `estado = 'Activo'` para todos; `estado = 'Anulado'` solo Admin.
- UPDATE (anular): solo `Administrador`.

---

## Capa 2 — API Route

### `PATCH /api/abonos/anular` ← reemplaza el DELETE actual

**Validaciones en orden:**
1. Sesión autenticada
2. Rol `'Administrador'` — 403 si no
3. Body válido: `{ abonoId, motivoCategoria, motivoDetalle? }`
4. `motivoCategoria` pertenece al enum `MOTIVOS_ANULACION`
5. Si `motivoCategoria === 'Otro'` → `motivoDetalle` obligatorio, mínimo 10 chars
6. El abono existe — 404 si no
7. `abono.estado === 'Activo'` — 400 "ya anulado" si no
8. `negociacion.estado === 'Activa'` — 400 si no
9. `UPDATE abonos_historial SET estado='Anulado', motivo_categoria, motivo_detalle, anulado_por_id, anulado_por_nombre, fecha_anulacion`
   → Trigger recalcula saldos automáticamente
10. INSERT en `audit_log` (accion: 'UPDATE', tabla: 'abonos_historial')
11. Retornar `{ success: true, abono: abonoActualizado }`

**El comprobante en Storage NO se elimina** (soft delete = datos intactos).

---

## Capa 3 — TypeScript Types (src/modules/abonos/types/index.ts)

```typescript
export const MOTIVOS_ANULACION = [
  'Error en el monto',
  'Pago duplicado',
  'Comprobante inválido',
  'Error en la fecha',
  'Solicitud del cliente',
  'Otro',
] as const
export type MotivoAnulacion = typeof MOTIVOS_ANULACION[number]
export type EstadoAbono = 'Activo' | 'Anulado'

// Extender AbonoHistorial existente
// + estado, motivo_categoria, motivo_detalle,
//   anulado_por_id, anulado_por_nombre, fecha_anulacion

export interface AnularAbonoPayload {
  abonoId: string
  motivoCategoria: MotivoAnulacion
  motivoDetalle?: string
}
```

---

## Capa 4 — Archivos nuevos/modificados

### Nuevos
- `src/modules/abonos/components/modal-anular-abono/ModalAnularAbono.tsx`
- `src/modules/abonos/components/modal-anular-abono/ModalAnularAbono.styles.ts`
- `src/modules/abonos/components/modal-anular-abono/useModalAnularAbono.ts`
- `src/modules/abonos/components/modal-anular-abono/index.ts`
- `src/modules/abonos/services/anular-abono.service.ts`
- `supabase/migrations/20260324_anulacion_abonos.sql`

### Modificados
- `src/app/api/abonos/anular/route.ts` — DELETE → PATCH, nueva validación Admin + motivo
- `src/modules/abonos/types/index.ts` — nuevos tipos
- `src/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal.tsx` — botón anular solo Admin + abre ModalAnularAbono + badge ANULADO si ya está anulado
- `src/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal.styles.ts` — estilos badge ANULADO
- `src/modules/abonos/components/abono-detalle-modal/useAbonoDetalle.ts` — remover lógica de anulación inline, delegar a hook del nuevo modal
- `src/modules/abonos/hooks/useAbonos.ts` — filtro `estado = 'Activo'`, toggle `mostrarAnulados`
- `src/modules/abonos/types/index.ts` — `AbonoParaDetalle` con campos de anulación
- `src/modules/abonos/components/abono-detalle-modal/useAbonoDetalle.ts` — `AbonoParaDetalle` con campos anulación, remover `handleConfirmarAnular`

---

## Capa 5 — UI: ModalAnularAbono

```
┌────────────────────────────────────────────────────┐
│  ⚠  Anular Abono REC-001234                        │
│  Esta acción no se puede deshacer                  │
├────────────────────────────────────────────────────┤
│  Resumen del abono                                 │
│  • Monto: $2.500.000                               │
│  • Fecha: 15 de marzo de 2026                      │
│  • Fuente: Cuota Inicial                           │
├────────────────────────────────────────────────────┤
│  Motivo de anulación *                             │
│  [ Selecciona un motivo...              ▾ ]        │
│                                                    │
│  [solo si "Otro"] Describe el motivo *             │
│  [ textarea, min 10 chars              ]           │
├────────────────────────────────────────────────────┤
│  ⚠ Impacto en saldos                              │
│  • Fuente "Cuota Inicial": -$2.500.000             │
│  • Total negociación: -$2.500.000                  │
├────────────────────────────────────────────────────┤
│         [Cancelar]   [Confirmar anulación]         │
└────────────────────────────────────────────────────┘
```

**Post-anulación exitosa:**
```
┌────────────────────────────────────────────────────┐
│  ✓ Abono anulado correctamente                     │
│                                                    │
│  [Cerrar]    [Registrar abono corregido →]          │
└────────────────────────────────────────────────────┘
```

---

## Capa 6 — Toggle Admin en lista de abonos

- Solo visible si rol `=== 'Administrador'`
- Switch: "Mostrar anulados"
- Los abonos anulados se renderizan con fondo gris, monto tachado, badge rojo "ANULADO"
- En `AbonoDetalleModal`: si el abono es `'Anulado'`, mostrar sección de info de anulación en sidebar y ocultar botón "Anular"

---

## Escenarios completos

| # | Escenario | Comportamiento |
|---|---|---|
| 1 | Asesor intenta anular | Botón no visible. API → 403 |
| 2 | Admin anula abono ya anulado | Error: "Este abono ya fue anulado" |
| 3 | Negociación no activa | Error: "Solo negociaciones activas" |
| 4 | "Otro" sin detalle | Validación frontend + backend |
| 5 | Abono con comprobante | Archivo se mantiene en Storage |
| 6 | Saldos post-anulación | Trigger recalcula automáticamente |
| 7 | Único abono de la fuente | OK — fuente queda monto_recibido = 0 |
| 8 | Audit log | Registrado: quién, cuándo, motivo, monto |
| 9 | Reactivar abono | No permitido — anular + registrar nuevo |
| 10 | Post-anulación UX | Botón "Registrar abono corregido" |
