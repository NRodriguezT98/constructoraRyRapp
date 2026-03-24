# Sistema de Renuncias — Design Spec

**Fecha:** 2026-03-24
**Estado:** Aprobado
**Módulo:** `src/modules/renuncias/`

> **Nota:** Este documento describe el estado OBJETIVO del sistema. La infraestructura existente (migración 004, tipos en clientes/types) será modificada por la nueva migración 024. Columnas como `retencion_monto`, la eliminación del estado 'Cancelada', y la función RPC son trabajo a implementar, no estado actual.

---

## 1. Resumen Ejecutivo

Sistema completo para gestionar renuncias (retiro voluntario) de clientes de viviendas. Permite registrar la renuncia de una negociación activa, calcular devoluciones de Cuota Inicial con retención opcional, y procesar el reembolso con evidencia documental. Solo accesible para administradores.

---

## 2. Reglas de Negocio

### 2.1 Quién puede renunciar

- Negociaciones en estado **Activa** o **Suspendida**.
- **BLOQUEADO** si alguna fuente de pago tiene desembolso (`monto_desembolsado > 0`):
  - Crédito Hipotecario
  - Subsidio Mi Casa Ya
  - Caja de Compensación
- Motivo del bloqueo: desembolso implica escritura firmada = compraventa consumada.

### 2.2 Qué se devuelve

- **Solo Cuota Inicial**: suma de `monto_recibido` de fuentes tipo "Cuota Inicial".
- Crédito Hipotecario, Subsidios, Crédito Constructora → NO se devuelven (nunca fueron dinero del cliente, o se manejan fuera del sistema).

### 2.3 Retención

- **Opcional**: monto de penalización deducido del total a devolver.
- Si `retencion_monto > 0` → `retencion_motivo` es **obligatorio**.
- Validación: `retencion_monto <= total_cuota_inicial`.
- `monto_a_devolver = total_cuota_inicial - retencion_monto`.

### 2.4 Auto-cierre

- Si `monto_a_devolver = 0` (sin abonos O retención = total) → renuncia se cierra automáticamente.
- Estado directo: `Cerrada` sin pasar por `Pendiente Devolución`.

### 2.5 Documentos

- Comprobante de devolución: archivo PDF/imagen adjunto al procesar devolución.
- No se capturan datos bancarios estructurados (cuenta, banco, etc.).

### 2.6 No existe "cancelar renuncia"

- Una renuncia registrada es **irreversible**.
- Si el cliente regresa → nueva negociación desde cero.

### 2.7 Permisos

- **Todas las operaciones de escritura**: solo Admin.
- **Lectura (dashboard)**: todos los roles autenticados.

---

## 3. Estados y Flujos

### 3.1 Estados

Solo 2 estados:

| Estado | Significado |
|--------|------------|
| `Pendiente Devolución` | Renuncia registrada, hay dinero que devolver |
| `Cerrada` | Devolución procesada O no requería devolución |

### 3.2 Flujo completo

```
[Negociación Activa/Suspendida]
         │
         ▼
  ┌─ VALIDACIONES ──────────────────────┐
  │ • Estado = Activa | Suspendida      │
  │ • Sin desembolsos (Hip/Sub/Caja)    │
  │ • Sin renuncia previa               │
  └─────────────────────────────────────┘
         │ pasa
         ▼
  ┌─ MODAL: Registrar Renuncia ────────┐
  │ Paso 1: Motivo + Retención         │
  │ Paso 2: Confirmación (CONFIRMAR)   │
  └─────────────────────────────────────┘
         │ confirma
         ▼
  ┌─ CASCADA ATÓMICA (RPC) ────────────┐
  │ 1. Obtener snapshots (JSONB)       │
  │ 2. INSERT renuncia (trigger calcula│
  │    monto_a_devolver)               │
  │ 3. Negociación → Cerrada por Ren.  │
  │ 4. Vivienda → Disponible           │
  │ 5. Fuentes → Inactiva              │
  │ 6. INSERT audit_log                │
  └─────────────────────────────────────┘
         │
         ▼
   monto_a_devolver > 0?
    ┌────┴────┐
    │ SÍ      │ NO
    ▼         ▼
 Pendiente   Cerrada
 Devolución  (auto)
    │
    ▼
  ┌─ MODAL: Procesar Devolución ───────┐
  │ Fecha + Método + Comprobante       │
  └─────────────────────────────────────┘
    │
    ▼
  Cerrada
```

### 3.3 Efectos cascada en otros módulos

| Entidad | Cambio |
|---------|--------|
| Negociación | `estado → 'Cerrada por Renuncia'` |
| Vivienda | `estado → 'Disponible'` |
| Fuentes de Pago | `estado → 'Inactiva'` (todas) |
| audit_log | Registro con acción `RENUNCIA_REGISTRADA` |

---

## 4. Arquitectura y Modelo de Datos

### 4.1 Cambios al Schema (migración)

**Agregar columnas:**

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `retencion_monto` | `NUMERIC(15,2)` | `0` | Monto retenido |
| `retencion_motivo` | `TEXT` | `NULL` | Justificación |

**Modificar CHECK de estado:**

```sql
-- Antes: ('Pendiente Devolución', 'Cerrada', 'Cancelada')
-- Después: ('Pendiente Devolución', 'Cerrada')
```

**Eliminar columnas obsoletas:**

- `fecha_cancelacion`
- `motivo_cancelacion`
- `usuario_cancelacion`

**Eliminar constraint obsoleto:**

- `renuncias_cancelada_motivo_check`

**Agregar constraint:**

```sql
CONSTRAINT renuncias_retencion_justificacion_check CHECK (
  retencion_monto = 0 OR retencion_motivo IS NOT NULL
)
```

### 4.2 Trigger `calcular_monto_devolver()` (actualizar)

```
total_cuota_inicial = SUM(monto_recibido) WHERE tipo = 'Cuota Inicial'
monto_a_devolver = total_cuota_inicial - COALESCE(retencion_monto, 0)
requiere_devolucion = (monto_a_devolver > 0)
Si no requiere → estado = 'Cerrada', fecha_cierre = NOW()
```

### 4.3 Función RPC `registrar_renuncia_completa()`

Transacción atómica que ejecuta:

1. Validaciones (estado negociación, sin duplicados, sin desembolsos)
2. Snapshots (cliente, vivienda, negociación, abonos)
3. INSERT renuncia (dispara trigger)
4. UPDATE negociación → 'Cerrada por Renuncia'
5. UPDATE vivienda → 'Disponible'
6. UPDATE fuentes_pago → 'Inactiva'
7. INSERT audit_log
8. RETURN renuncia completa

### 4.4 Deprecar

- `validar_cancelacion_renuncia()` → DROP FUNCTION
- Vista `v_renuncias_pendientes` → actualizar sin referencia a 'Cancelada'

### 4.5 Estructura del módulo

```
src/modules/renuncias/
├── components/
│   ├── RenunciasPageMain.tsx
│   ├── RenunciasHeaderPremium.tsx
│   ├── RenunciasMetricasPremium.tsx
│   ├── RenunciasFiltrosPremium.tsx
│   ├── RenunciaCard.tsx
│   ├── modals/
│   │   ├── RegistrarRenunciaModal.tsx
│   │   ├── ProcesarDevolucionModal.tsx
│   │   └── DetalleRenunciaModal.tsx
│   └── index.ts
├── hooks/
│   ├── useRenunciasQuery.ts
│   ├── useRegistrarRenuncia.ts
│   ├── useProcesarDevolucion.ts
│   ├── useRenunciasList.ts
│   ├── useModalRegistrarRenuncia.ts
│   ├── useModalProcesarDevolucion.ts
│   └── index.ts
├── services/
│   └── renuncias.service.ts
├── types/
│   └── index.ts
├── styles/
│   └── renuncias.styles.ts
└── utils/
    └── renuncias.utils.ts
```

### 4.6 Service (`renuncias.service.ts`)

| Método | Descripción |
|--------|-------------|
| `obtenerRenuncias(filtros)` | Lista con joins |
| `obtenerRenuncia(id)` | Detalle completo |
| `validarPuedeRenunciar(negociacionId)` | Pre-validación |
| `registrarRenuncia(dto)` | RPC atómica |
| `procesarDevolucion(id, dto)` | Registra pago + cierra |
| `obtenerMetricas()` | Contadores para dashboard |

### 4.7 React Query

```typescript
export const renunciasKeys = {
  all: ['renuncias'] as const,
  lists: () => [...renunciasKeys.all, 'list'] as const,
  list: (filtros?) => [...renunciasKeys.lists(), { filtros }] as const,
  details: () => [...renunciasKeys.all, 'detail'] as const,
  detail: (id) => [...renunciasKeys.details(), id] as const,
  metricas: () => [...renunciasKeys.all, 'metricas'] as const,
}
```

**Invalidaciones cruzadas al registrar:**
- `renunciasKeys.all`
- `['clientes']`
- `['viviendas']`
- `['negociaciones']`
- `['abonos']`

### 4.8 Tipos TypeScript

```typescript
export type EstadoRenuncia = 'Pendiente Devolución' | 'Cerrada'

export interface RegistrarRenunciaDTO {
  negociacion_id: string
  motivo: string
  retencion_monto?: number
  retencion_motivo?: string
  notas?: string
}
```

DTOs `CancelarRenunciaDTO` y `CerrarRenunciaDTO` → ELIMINAR (ya no existen).

---

## 5. Componentes UI

### 5.1 Dashboard `/renuncias`

Estructura estándar 3 partes (patrón Proyectos/Abonos):

1. **Header Hero** — gradiente rojo/rosa/pink con FileX icon
2. **4 Métricas** — Total renuncias, Pendientes devolución, Cerradas, Total devuelto
3. **Filtros sticky** — Búsqueda, estado, proyecto
4. **Lista de RenunciaCard** — Con datos del cliente, vivienda, monto, estado

### 5.2 RenunciaCard

- Borde izquierdo coloreado por estado (amarillo=pendiente, verde=cerrada)
- Info: cliente, vivienda, proyecto, fecha, motivo (truncado), montos
- Acciones: "Ver Detalle", "Procesar Devolución" (solo si pendiente)

### 5.3 Modal: Registrar Renuncia (Wizard 2 pasos)

**Paso 1 — Información:**
- Resumen de la negociación (cliente, vivienda, fuentes, montos)
- Campo: motivo (textarea, 500 chars max, obligatorio)
- Campo: retención monto (opcional, max = cuota inicial)
- Campo: retención motivo (obligatorio si retención > 0)

**Paso 2 — Confirmación:**
- Warning "acción irreversible"
- Lista de efectos cascada
- Resumen financiero (cuota - retención = a devolver)
- Input escribir "CONFIRMAR" para activar botón
- Animación de éxito al completar

### 5.4 Modal: Procesar Devolución

- Resumen de la renuncia (cliente, vivienda, monto)
- Campos: fecha devolución, método (select), número comprobante (opcional)
- Upload: comprobante PDF/imagen
- Animación de éxito al completar

### 5.5 Modal: Detalle Renuncia (solo lectura)

Tabs: Info General | Financiero | Snapshots | Auditoría

### 5.6 Punto de entrada en perfil de cliente

- Botón "Registrar Renuncia" en menú desplegable (tres puntos) de la negociación
- Solo visible para Admin
- Pre-valida antes de abrir modal

### 5.7 Tema visual

Agregar `'renuncias'` a `ModuleName` en `module-themes.ts`:
- Primary: `red`
- Secondary: `rose`
- Tertiary: `pink`
- Gradient: `from-red-600 via-rose-600 to-pink-600`

---

## 6. Manejo de Errores

### 6.1 Validaciones pre-renuncia

| Validación | Mensaje |
|------------|---------|
| Estado no renunciable | "Solo negociaciones Activas o Suspendidas" |
| Ya tiene renuncia | "Ya existe una renuncia para esta negociación" |
| Desembolso hipotecario | "Crédito hipotecario ya desembolsado" |
| Desembolso subsidio | "Subsidio ya desembolsado" |

### 6.2 Errores en cascada (RPC)

- Toda la cascada es transaccional → ROLLBACK automático si falla cualquier paso.
- `retención > cuota_inicial` → EXCEPTION en trigger.
- Constraint UNIQUE en negociacion_id previene duplicados concurrentes.
- Frontend: modal permanece abierto, botón se reactiva, toast.error con mensaje.

### 6.3 Errores en procesar devolución

- Upload falla → no se actualiza BD, toast error.
- Renuncia ya cerrada por otro admin → query invalidation detecta cambio.

### 6.4 Casos borde

| Caso | Comportamiento |
|------|----------------|
| $0 en Cuota Inicial | Auto-cierra sin devolución |
| Retención = total | Auto-cierra (monto_a_devolver = 0) |
| Retención > total | Bloqueado (frontend + constraint) |
| Motivo vacío/espacios | trim() + validación → no permite |
| Texto CONFIRMAR | Comparación exacta case-sensitive |
| Múltiples negociaciones | Cada renuncia es independiente |

### 6.5 Seguridad

| Control | Implementación |
|---------|----------------|
| Frontend | Botones solo si `isAdmin = true` |
| RLS | INSERT/UPDATE solo rol admin |
| SELECT | Todos los autenticados |
| Storage | Bucket `renuncias-comprobantes`, upload admin-only |

---

## 7. Archivos a Crear/Modificar

### Nuevos archivos

| Archivo | Descripción |
|---------|-------------|
| `supabase/migrations/024_sistema_renuncias.sql` | Migración completa |
| `src/modules/renuncias/services/renuncias.service.ts` | Service con RPC |
| `src/modules/renuncias/hooks/useRenunciasQuery.ts` | React Query keys + hook |
| `src/modules/renuncias/hooks/useRegistrarRenuncia.ts` | Mutation standalone |
| `src/modules/renuncias/hooks/useProcesarDevolucion.ts` | Mutation standalone |
| `src/modules/renuncias/hooks/useRenunciasList.ts` | Filtros + paginación |
| `src/modules/renuncias/hooks/useModalRegistrarRenuncia.ts` | Lógica modal |
| `src/modules/renuncias/hooks/useModalProcesarDevolucion.ts` | Lógica modal |
| `src/modules/renuncias/types/index.ts` | Tipos del módulo |
| `src/modules/renuncias/styles/renuncias.styles.ts` | Estilos centralizados |
| `src/modules/renuncias/utils/renuncias.utils.ts` | Helpers |
| `src/modules/renuncias/components/RenunciasPageMain.tsx` | Orquestador |
| `src/modules/renuncias/components/RenunciasHeaderPremium.tsx` | Header |
| `src/modules/renuncias/components/RenunciasMetricasPremium.tsx` | Métricas |
| `src/modules/renuncias/components/RenunciasFiltrosPremium.tsx` | Filtros |
| `src/modules/renuncias/components/RenunciaCard.tsx` | Card |
| `src/modules/renuncias/components/modals/RegistrarRenunciaModal.tsx` | Modal registro |
| `src/modules/renuncias/components/modals/ProcesarDevolucionModal.tsx` | Modal devolución |
| `src/modules/renuncias/components/modals/DetalleRenunciaModal.tsx` | Modal detalle |
| Barrel exports (`index.ts`) en cada carpeta | Exports |

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/shared/config/module-themes.ts` | Agregar `'renuncias'` al type + tema |
| `src/modules/clientes/types/index.ts` | Actualizar `EstadoRenuncia`, eliminar DTOs obsoletos |
| `src/app/renuncias/components/renuncias-content.tsx` | Reemplazar placeholder con `RenunciasPageMain` |

---

## 8. Orden de Implementación Sugerido

1. **Migración SQL** — Schema changes + RPC function + trigger update
2. **Tipos + Service** — TypeScript types + service con RPC calls
3. **React Query hooks** — Keys, query, mutations
4. **Module theme** — Agregar renuncias a module-themes
5. **Estilos** — renuncias.styles.ts
6. **Dashboard UI** — Header, métricas, filtros, cards
7. **Modal Registrar** — Wizard 2 pasos con validación
8. **Modal Procesar Devolución** — Form con upload
9. **Modal Detalle** — Vista de solo lectura con tabs
10. **Punto de entrada en perfil de cliente** — Botón en negociación
11. **Conectar página** — Reemplazar placeholder
12. **Testing manual** — Flujo completo end-to-end
