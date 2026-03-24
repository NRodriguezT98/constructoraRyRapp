# Edición de Abonos — Spec de Diseño

**Fecha:** 2026-03-22
**Estado:** Aprobado por usuario
**Módulo:** Abonos

---

## 1. Resumen Ejecutivo

Implementar la capacidad de editar abonos existentes en el sistema. Actualmente solo se puede crear y anular. La edición permite corregir errores sin necesidad de anular y recrear, preservando el ID original, fecha de creación y trazabilidad completa.

---

## 2. Decisiones de Diseño

| Decisión              | Valor                                         | Alternativas descartadas                 |
| --------------------- | --------------------------------------------- | ---------------------------------------- |
| Alcance de edición    | Por niveles (3 niveles)                       | Edición completa, edición parcial        |
| Estado de negociación | Solo Activa                                   | Activa+Suspendida, Todas excepto Cerrada |
| Permisos              | Solo admin (`rol === 'Administrador'`)        | Cualquier usuario, solo creador          |
| Auditoría             | Diff + motivo obligatorio (Nivel 3)           | Básica, solo diff                        |
| Comprobante           | Reemplazo simple                              | No editable, con historial               |
| UX de acceso          | Botón en card → modal                         | Vista detalle, ambos                     |
| Arquitectura backend  | PATCH endpoint dedicado                       | Delete+re-insert, reutilizar POST        |
| Consistencia UI       | Reutilizar modal de registro con modo edición | Modal separado nuevo                     |

---

## 3. Niveles de Edición

### Nivel 1 — Libre (sin restricciones extra)

| Campo               | Tipo                   | Validación                                                                                |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| `notas`             | `text \| null`         | Ninguna                                                                                   |
| `numero_referencia` | `varchar(100) \| null` | Ninguna                                                                                   |
| `metodo_pago`       | `varchar(50)`          | Enum: Transferencia, Efectivo, Cheque, Consignación, PSE, Tarjeta Crédito, Tarjeta Débito |

- **Motivo de cambio:** NO requerido
- **Auditoría:** Diff registrado en audit_log

### Nivel 2 — Con validación

| Campo                   | Tipo                  | Validación                         |
| ----------------------- | --------------------- | ---------------------------------- |
| `fecha_abono`           | `timestamp with tz`   | `fecha_abono >= fecha_negociacion` |
| `comprobante` (archivo) | `text` (ruta storage) | Archivo debe existir en storage    |

- **Motivo de cambio:** NO requerido
- **Auditoría:** Diff registrado en audit_log

### Nivel 3 — Financiero (protección máxima)

| Campo           | Tipo            | Validación                                                             |
| --------------- | --------------- | ---------------------------------------------------------------------- |
| `monto`         | `numeric(15,2)` | `monto > 0`, `(monto - mora_incluida) <= saldo_disponible_recalculado` |
| `mora_incluida` | `numeric(12,2)` | `mora_incluida >= 0`, `mora_incluida <= monto`                         |

- **Motivo de cambio:** OBLIGATORIO (campo de texto libre)
- **Auditoría:** Diff + motivo registrados en audit_log
- **Confirmación visual:** Panel diff muestra valores anteriores → nuevos

### Fórmula de saldo disponible para edición

```
saldo_disponible_para_edicion = fuente.saldo_pendiente + (abono_actual.monto - COALESCE(abono_actual.mora_incluida, 0))
nuevo_monto_capital = nuevo_monto - nueva_mora
validar: nuevo_monto_capital <= saldo_disponible_para_edicion
```

Se "devuelve" el capital actual del abono al saldo antes de validar el nuevo valor.

### Campos NO editables (inmutables)

| Campo              | Razón                                                       |
| ------------------ | ----------------------------------------------------------- |
| `negociacion_id`   | Cambiaría estructura completa                               |
| `fuente_pago_id`   | Requiere recalculo cruzado entre fuentes (anular + recrear) |
| `fecha_creacion`   | Registro histórico inmutable                                |
| `usuario_registro` | Quién lo creó originalmente                                 |

---

## 4. Precondiciones

### Para ver el botón "Editar" (frontend)

1. `rol === 'Administrador'` (vía `usePermisosQuery()`)
2. `negociacion.estado === 'Activa'`

Si cualquiera es falsa, el botón NO se renderiza (invisible).

### Para ejecutar la edición (backend)

1. Sesión autenticada
2. `rol === 'Administrador'` (verificado en BD)
3. Abono existe
4. `negociacion.estado === 'Activa'`
5. Validaciones de nivel según campos modificados
6. Si Nivel 3: `motivo_cambio` no vacío

---

## 5. Arquitectura de Componentes

### Archivos nuevos

```
src/app/api/abonos/editar/
└── route.ts                                  # PATCH endpoint

src/modules/abonos/components/modal-editar-abono/
├── useModalEditarAbono.ts                    # Hook con lógica de edición (< 200 líneas)
└── index.ts                                  # Barrel export

src/modules/abonos/types/
└── editar-abono.types.ts                     # Tipos específicos de edición

src/modules/abonos/services/
└── editar-abono.service.ts                   # Llamada al PATCH endpoint
```

### Archivos a modificar

| Archivo                                                                   | Cambio                                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/abonos/components/modal-registro-pago/ModalRegistroPago.tsx` | Agregar prop `modo: 'crear' \| 'editar'`, título/botón condicional, fuente deshabilitada en edición, panel diff financiero |
| `src/app/abonos/components/abono-card.tsx`                                | Agregar botón "Editar" (lápiz) visible solo si `isAdmin && negociacion.estado === 'Activa'`                                |
| `src/app/clientes/[id]/tabs/negociacion/components/AbonosRecientes.tsx`   | Pasar props `isAdmin` y `onEditar`                                                                                         |
| `src/app/clientes/[id]/tabs/negociacion-tab.tsx`                          | Renderizar modal en modo edición, manejar estado open/close                                                                |

### Estrategia de consistencia

El modal de registro (`ModalRegistroPago.tsx`) se reutiliza para edición:

- **Modo crear:** `useModalRegistroPago` (hook existente) → POST /api/abonos/registrar
- **Modo editar:** `useModalEditarAbono` (hook nuevo) → PATCH /api/abonos/editar

Ambos hooks exponen la misma interfaz de campos (monto, metodoPago, referencia, notas, fechaAbono, comprobante, errors, isSubmitting, handleSubmit, handleClose) para que el modal los consuma de forma idéntica.

El hook de edición agrega extras: `camposModificados`, `nivelCambio`, `motivoCambio`, `setMotivoCambio`, `diffFinanciero`, `hayCambios`.

### Cambios en ModalRegistroPago.tsx

1. **Props:** `modo?: 'crear' | 'editar'`
2. **Título:** `modo === 'editar' ? 'Editar Abono' : 'Registrar Pago'`
3. **Fuente:** Selector `disabled` en modo edición
4. **Panel diff:** Si `diffFinanciero.length > 0`, mostrar antes → después + campo motivo
5. **Botón submit:** `modo === 'editar' ? 'Guardar Cambios' : 'Registrar'`
6. **Botón deshabilitado:** `!hayCambios` en modo edición

---

## 6. Flujo de Datos

```
[1] abono-card.tsx
    └─ Admin ve botón "Editar" (Pencil icon)
    └─ Click → onEditar(abono) sube al padre

[2] negociacion-tab.tsx (orquestador)
    └─ setAbonoEditando(abono)
    └─ setModalEditarOpen(true)

[3] ModalRegistroPago.tsx (modo='editar')
    └─ Datos prellenados del abono original
    └─ useModalEditarAbono.ts (lógica)
        ├─ Detecta campos modificados (diff vs original)
        ├─ Clasifica nivel de cambio máximo (1/2/3)
        ├─ Si nivel 3 → muestra campo "motivo" obligatorio
        ├─ Valida según nivel
        └─ handleSubmit()
            └─ editarAbono.service.ts
                └─ PATCH /api/abonos/editar

[4] PATCH /api/abonos/editar (route.ts)
    ├─ Verificar sesión (auth)
    ├─ Verificar rol === 'Administrador'
    ├─ Cargar abono actual completo (datos_anteriores)
    ├─ Cargar negociación → verificar estado === 'Activa'
    ├─ Cargar fuente_pago → calcular saldo disponible
    ├─ Validar cambios por nivel
    ├─ Si nivel 3: verificar motivo_cambio presente
    ├─ UPDATE abonos_historial SET ... WHERE id = abono_id
    ├─ Si comprobante cambió → eliminar viejo de storage (best-effort)
    ├─ Registrar auditoría con diff + motivo
    └─ Return { success, abono actualizado }

[5] Triggers automáticos (BD)
    └─ trigger_actualizar_monto_recibido (AFTER UPDATE)
        └─ Recalcula fuentes_pago.monto_recibido, mora_total_recibida
    └─ trigger_validar_abono_no_excede_saldo (BEFORE UPDATE)
        └─ Valida saldo en BD como segunda capa
    └─ update_negociaciones_totales (cascading)
        └─ Recalcula: total_abonado, saldo_pendiente, porcentaje_pagado

[6] Frontend
    └─ onSuccess → invalidateQueries → UI se refresca automáticamente
```

---

## 7. API: PATCH /api/abonos/editar

### Request

```typescript
interface EditarAbonoRequest {
  abono_id: string // UUID del abono a editar
  monto?: number // Nivel 3
  mora_incluida?: number // Nivel 3
  fecha_abono?: string // Nivel 2 (YYYY-MM-DD)
  metodo_pago?: string // Nivel 1
  numero_referencia?: string | null // Nivel 1
  notas?: string | null // Nivel 1
  comprobante_path?: string // Nivel 2 (nueva ruta si se reemplazó)
  motivo_cambio?: string // Obligatorio si hay campos Nivel 3
}
```

Solo se envían campos modificados (actualización parcial).

### Response (éxito)

```typescript
{
  success: true,
  abono: { id, monto, fecha_abono, metodo_pago, ... },
  message: 'Abono actualizado exitosamente'
}
```

### Orden de operaciones

```
1.  Verificar sesión + rol admin
2.  Parsear body, validar abono_id presente
3.  Cargar abono actual completo → datos_anteriores
4.  Si no existe → 404
5.  Cargar negociación → verificar estado === 'Activa'
6.  Si no Activa → 409
7.  Detectar qué campos cambiaron
8.  Si sin cambios → 400
9.  Cargar fuente_pago → calcular saldo disponible (si cambió monto/mora)
10. Validar cada campo según su nivel
11. Si nivel 3 detectado: verificar motivo_cambio no vacío → 422 si falta
12. UPDATE abonos_historial SET campos_modificados WHERE id = abono_id
13. Si comprobante cambió: eliminar archivo viejo de storage (best-effort)
14. Registrar auditoría: auditarActualizacion('abonos_historial', id, antes, despues, { motivo_cambio }, 'abonos')
15. Return éxito + abono actualizado
```

Pasos 12-13-14 son secuenciales. El UPDATE (12) es la operación crítica. Storage (13) y auditoría (14) son best-effort.

### Errores

| Escenario              | HTTP | Mensaje                                                                      |
| ---------------------- | ---- | ---------------------------------------------------------------------------- |
| No autenticado         | 401  | "No autorizado"                                                              |
| No es admin            | 403  | "Solo administradores pueden editar abonos"                                  |
| Abono no encontrado    | 404  | "Abono no encontrado"                                                        |
| Negociación no Activa  | 409  | "La negociación no está activa"                                              |
| Sin cambios            | 400  | "No se detectaron cambios"                                                   |
| Monto excede saldo     | 422  | "El monto principal excede el saldo disponible de la fuente ($X disponible)" |
| mora > monto           | 422  | "La mora incluida no puede superar el monto total"                           |
| monto <= 0             | 422  | "El monto debe ser mayor a 0"                                                |
| fecha < negociacion    | 422  | "La fecha no puede ser anterior a la fecha de negociación"                   |
| Motivo vacío (Nivel 3) | 422  | "Debe indicar el motivo del cambio para modificaciones financieras"          |
| Error BD / trigger     | 500  | "Error al actualizar el abono"                                               |

---

## 8. Auditoría

### Campos del registro

```typescript
await auditService.auditarActualizacion(
  'abonos_historial', // tabla
  abono.id, // registro_id
  datosAnteriores, // snapshot completo antes
  datosNuevos, // snapshot completo después
  {
    // metadata
    motivo_cambio: body.motivo_cambio || null,
    nivel_cambio: nivelMaximo, // 1, 2, o 3
    campos_modificados: camposQueCalbiaron, // ['monto', 'notas', ...]
    timestamp_cliente: new Date().toISOString(),
  },
  'abonos' // módulo
)
```

### Diff automático

El servicio `auditarActualizacion` genera `cambios_especificos` automáticamente comparando antes vs después:

```json
{
  "monto": { "antes": 5000000, "despues": 4500000 },
  "notas": { "antes": null, "despues": "Corrección por error de digitación" }
}
```

---

## 9. Casos Borde

### Edición concurrente

Admin A abre edición, Admin B anula el abono → Backend verifica existencia antes del UPDATE → 404.

### Negociación cambia de estado durante edición

Admin abre modal con negociación Activa, otro usuario la suspende → Backend verifica estado al PATCH → 409.

### Comprobante: subida exitosa pero PATCH falla

El flujo sube primero el archivo a storage, luego envía la ruta en el PATCH. Si el PATCH falla, el archivo queda huérfano (limpiable). El archivo viejo solo se elimina DESPUÉS de un UPDATE exitoso.

### Editar monto con otros abonos en la fuente

Saldo disponible para edición = fuente.saldo_pendiente + abono_actual.monto_capital. Se "devuelve" el capital actual antes de validar nuevo valor.

### Comprobante obligatorio

El comprobante no se puede eliminar sin reemplazo. Siempre debe haber uno. En modo edición, si no se sube nuevo, el original se mantiene.

---

## 10. Tipos TypeScript

```typescript
// editar-abono.types.ts

export interface AbonoParaEditar {
  id: string
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  mora_incluida: number | null
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
}

export interface EditarAbonoRequest {
  abono_id: string
  monto?: number
  mora_incluida?: number
  fecha_abono?: string
  metodo_pago?: string
  numero_referencia?: string | null
  notas?: string | null
  comprobante_path?: string
  motivo_cambio?: string
}

export interface EditarAbonoResponse {
  success: boolean
  abono?: AbonoParaEditar
  message: string
}

export interface DiffFinanciero {
  campo: string
  antes: number
  despues: number
}

export type NivelCambio = 1 | 2 | 3

export const CAMPOS_NIVEL: Record<string, NivelCambio> = {
  notas: 1,
  numero_referencia: 1,
  metodo_pago: 1,
  fecha_abono: 2,
  comprobante_url: 2,
  monto: 3,
  mora_incluida: 3,
}
```

---

## 11. Plan de Implementación (orden sugerido)

1. **Tipos** — `editar-abono.types.ts`
2. **Servicio** — `editar-abono.service.ts`
3. **Hook** — `useModalEditarAbono.ts`
4. **API endpoint** — `PATCH /api/abonos/editar/route.ts`
5. **Modal** — Modificar `ModalRegistroPago.tsx` (agregar modo edición)
6. **Card** — Modificar `abono-card.tsx` (agregar botón editar)
7. **AbonosRecientes** — Pasar props isAdmin/onEditar
8. **Tab** — Orquestar en `negociacion-tab.tsx`
9. **Verificación** — TypeScript + pruebas manuales
