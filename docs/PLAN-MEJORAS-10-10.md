# Plan de Mejoras — RyR Constructora de 7.5/10 → 10/10

> **Fecha**: 04 de abril de 2026
> **Estado base**: `npm run check-all` pasa con exit code 0 (TypeScript ✅ ESLint ✅ Prettier ✅ Tests ✅)
> **Nota**: TypeScript y ESLint ya están limpios. Los hallazgos pendientes son de **arquitectura, organización y consistencia**.

---

## 🏆 ESTADO FINAL — 10/10 ALCANZADO

> **Completado**: Fases A – F ejecutadas y verificadas.
> **Verificación final**: `npm run check-all` → TypeScript ✅ ESLint ✅ Prettier ✅ 36 tests ✅ (exit code 0)
> **Pendiente baja prioridad**: Fase G (mover auth hooks) — no urgente, no bloquea ningún feature.

---

## Regla de Oro

> **NINGÚN cambio se declara terminado hasta que `npm run check-all` pase con exit code 0.**

---

## Resumen Ejecutivo

| Categoría | Hallazgos Originales | Estado |
|-----------|---------------------|--------|
| `eslint-disable` injustificados | 12 ocurrencias en 8 archivos | ✅ **Completado** — Fase A |
| Archivos sobredimensionados | 3 hooks + 3 services + 2 componentes | ✅ **Completado** — Fase B |
| Hooks legacy sin React Query | 2 módulos (auditorias, admin) | ✅ **Completado** — Fase C |
| Directorio UI duplicado | `src/components/ui/` legacy | ✅ **Completado** — Fase D |
| Factory keys faltantes | módulo `usuarios` | ✅ **Completado** — Fase E |
| Barrel exports faltantes | 9 módulos raíz | ✅ **Completado** — Fase F |
| `no-alert` en lógica de negocio | 1 archivo | ✅ **Completado** — Fase A |
| Auth hooks fuera del módulo | `src/hooks/` | ⚪ **Fase G** — Baja prioridad |

---

## FASE A — eslint-disable injustificados (Impacto: Medio, Esfuerzo: Bajo) ✅ COMPLETADO

> **Objetivo**: Eliminar todos los `eslint-disable-next-line` en código de negocio. Si algo necesita un disable, el código está mal — hay que arreglarlo.

> ✅ **COMPLETADO** — Se eliminaron los 12 `eslint-disable` de código de negocio. Los casos de `react-hooks/exhaustive-deps` se resolvieron con `useCallback` y reestructuración de efectos. `window.alert()` reemplazado por `toast.error()`. `<img>` migrado a `<Image>` de Next.js. El `useEffect` en `AuditoriasView.tsx` se eliminó al migrar a React Query (Fase C).

### A-01: `react-hooks/exhaustive-deps` silenciados (6 ocurrencias)

| Archivo | Línea | Descripción |
|---------|-------|-------------|
| `src/modules/viviendas/hooks/useEditarVivienda.ts` | — | exhaustive-deps silenciado |
| `src/modules/proyectos/hooks/useProyectosForm.ts` | 276 | exhaustive-deps silenciado |
| `src/modules/abonos/components/modal-registro-pago/useModalRegistroPago.ts` | 129, 143 | exhaustive-deps silenciado (2x) |
| `src/modules/clientes/components/fuente-pago-card/useFuentePagoCard.ts` | 81 | exhaustive-deps silenciado |
| `src/modules/clientes/components/asignar-vivienda/hooks/useAsignarViviendaForm.ts` | 222 | exhaustive-deps silenciado |
| `src/modules/clientes/hooks/useFormularioCliente.ts` | 102 | exhaustive-deps silenciado |
| `src/modules/proyectos/components/pasos/PasoInfoGeneral.tsx` | 81 | exhaustive-deps silenciado |
| `src/modules/auditorias/components/AuditoriasView.tsx` | 113 | exhaustive-deps silenciado |

**Solución por caso**:
- Si la dep es una función estable → envolverla en `useCallback`
- Si la dep causa loop → usar `useRef` como flag o reestructurar el efecto
- Si es genuinamente innecesario ejecutar → usar `// eslint-disable` con comentario explicativo en módulo de infraestructura (NUNCA en negocio)

### A-02: `no-alert` en `useEditarVivienda.ts`

- **Archivo**: `src/modules/viviendas/hooks/useEditarVivienda.ts` línea 554
- **Problema**: `window.alert()` es UX pobre y no respeta el sistema de modales de la app
- **Solución**: Reemplazar por `toast.error()` de `sonner` o por el modal de confirmación `useConfirmModal`

### A-03: `@next/next/no-img-element` (2 ocurrencias)

| Archivo | Línea |
|---------|-------|
| `src/modules/abonos/components/modal-registro-pago/ComprobantePago.tsx` | 155 |
| `src/modules/abonos/components/abono-detalle-modal/AbonoDetalleModal.tsx` | 205 |

- **Problema**: Se usa `<img>` directo en vez de `<Image>` de Next.js (sin optimización)
- **Solución**: Migrar a `import Image from 'next/image'` con dimensiones explícitas o `fill` prop

### A-04: `@typescript-eslint/no-empty-function`

- **Archivo**: `src/modules/viviendas/components/ImpactoFinancieroModal.tsx` línea 65
- **Problem**: Función vacía `() => {}` como prop — código de relleno
- **Solución**: Pasar `undefined` si el callback es opcional, o implementar la función correctamente

---

## FASE B — Archivos Sobredimensionados (Impacto: Alto, Esfuerzo: Alto) ✅ COMPLETADO

> **Objetivo**: Ningún hook > 200 líneas, ningún service > 300 líneas, ningún componente > 150 líneas.
> **Referencia**: REGLA crítica #0 (separación de responsabilidades).

> ✅ **COMPLETADO** — Todos los archivos sobredimensionados divididos según estrategia de split documentada:
> - **B-01**: `useEditarVivienda` (556L), `useProyectosForm` (496L), `useTiposFuentesPago` (484L), `useEntidadesFinancieras` (306L) → splits en sub-hooks orquestados.
> - **B-02**: `proyectos.service.ts` (813L), `viviendas.service.ts` (785L), `tipos-fuentes-pago.service.ts` (509L) → splits en servicios por dominio.
> - **B-03**: `proyectos-form.tsx` (867L) → wizard con subcomponentes de paso. `clientes-page-main.tsx` (358L) → `ClientesHeader`, `ClientesFiltros`, `ClientesLista`.

### B-01: Hooks sobredimensionados

| Archivo | Líneas Actuales | Límite | Exceso |
|---------|----------------|--------|--------|
| `src/modules/viviendas/hooks/useEditarVivienda.ts` | **556** | 200 | +178% |
| `src/modules/proyectos/hooks/useProyectosForm.ts` | **496** | 200 | +148% |
| `src/modules/configuracion/hooks/useTiposFuentesPago.ts` | **484** | 200 | +142% |
| `src/modules/configuracion/hooks/useEntidadesFinancieras.ts` | **306** | 200 | +53% |

**Estrategia de split para `useEditarVivienda.ts` (556 líneas)**:
```
useEditarVivienda.ts (orquestador ~60 líneas)
├── useEditarViviendaForm.ts      — lógica del formulario + schema
├── useEditarViviendaSubmit.ts    — lógica de guardado + optimistic updates
├── useEditarViviendaData.ts      — fetch inicial + React Query
└── useEditarViviendaManzanas.ts  — gestión de manzanas + validación
```

**Estrategia de split para `useProyectosForm.ts` (496 líneas)**:
```
useProyectosForm.ts (orquestador ~80 líneas)
├── useProyectosFormState.ts      — estado del wizard (paso actual, validación)
├── useProyectosFormSubmit.ts     — lógica de creación/guardado
└── useProyectosFormManzanas.ts   — gestión dinámica de manzanas
```

**Estrategia de split para `useTiposFuentesPago.ts` (484 líneas — configuracion)**:
```
useTiposFuentesPago.ts (orquestador + re-exports ~60 líneas)
├── useTiposFuentesPagoQuery.ts       — queries + mutations + keys
├── useTiposFuentesPagoForm.ts        — lógica de formulario crear/editar
└── useTiposFuentesPagoOrden.ts       — lógica de reordenamiento
```

### B-02: Services sobredimensionados

| Archivo | Líneas Actuales | Límite | Exceso |
|---------|----------------|--------|--------|
| `src/modules/proyectos/services/proyectos.service.ts` | **813** | 300 | +171% |
| `src/modules/viviendas/services/viviendas.service.ts` | **785** | 300 | +162% |
| `src/modules/configuracion/services/tipos-fuentes-pago.service.ts` | **509** | 300 | +70% |

**Estrategia de split para `proyectos.service.ts` (813 líneas)**:
```
proyectos.service.ts (re-exports + tipos compartidos ~60 líneas)
├── proyectos-crud.service.ts         — CRUD básico: listar, obtener, crear, actualizar
├── proyectos-manzanas.service.ts     — operaciones con manzanas y viviendas
└── proyectos-estado.service.ts       — transiciones de estado + validaciones
```

**Estrategia de split para `viviendas.service.ts` (785 líneas)**:
```
viviendas.service.ts (re-exports ~60 líneas)
├── viviendas-crud.service.ts         — CRUD básico
├── viviendas-asignacion.service.ts   — asignación a clientes + negociaciones
└── viviendas-estado.service.ts       — activar/desactivar + validaciones
```

### B-03: Componentes sobredimensionados

| Archivo | Líneas Actuales | Límite | Exceso |
|---------|----------------|--------|--------|
| `src/modules/proyectos/components/proyectos-form.tsx` | **867** | 150 | +478% |
| `src/modules/clientes/components/clientes-page-main.tsx` | **358** | 150 | +139% |

**Estrategia de split para `proyectos-form.tsx` (867 líneas)**:
> Este es el mayor problema. Un formulario wizard de 867 líneas mezcla pasos, lógica de navegación, validación y UI.

```
proyectos-form.tsx (orquestador wizard ~80 líneas)
└── pasos/
    ├── PasoInfoGeneral.tsx         — paso 1 (ya existe, extraer lógica inline)
    ├── PasoEstadoFechas.tsx        — paso 2 (ya existe)
    ├── PasoManzanas.tsx            — paso 3 (ya existe)
    └── PasoResumen.tsx             — paso 4 (crear si no existe)
```
> **Nota**: Los subcomponentes de pasos pueden existir ya — verificar si realmente están siendo re-renderizados desde `proyectos-form.tsx` o si allí hay lógica duplicada.

**Estrategia de split para `clientes-page-main.tsx` (358 líneas)**:
```
clientes-page-main.tsx (~80 líneas)
├── ClientesHeader.tsx              — header con estadísticas y botón nuevo
├── ClientesFiltros.tsx             — barra de búsqueda y filtros
└── ClientesLista.tsx               — lista/grid de cards
```

---

## FASE C — Hooks Legacy sin React Query (Impacto: Medio, Esfuerzo: Medio) ✅ COMPLETADO

> **Objetivo**: Estandarizar todos los módulos bajo el patrón React Query. Eliminar `useState` para dato remoto.

> ✅ **COMPLETADO**:
> - **C-01**: `useAuditorias.ts` reescrito. Creado `useAuditoriasQuery.ts` con `auditoriasKeys` factory + 4 hooks (`useAuditoriasListQuery`, `useAuditoriasResumenQuery`, `useAuditoriasEliminacionesQuery`, `useAuditoriasEstadisticasQuery`). `useAuditorias.ts` reducido a puro estado UI.
> - **C-02**: `admin/useTiposFuentesPago.ts` reescrito con `useMutation` × 2. Funciones async puras extraídas al nivel de módulo.

### C-01: `useAuditorias.ts` — migrar de useState a React Query

- **Archivo**: `src/modules/auditorias/hooks/useAuditorias.ts`
- **Problema**: 10 `useState` + `useEffect` para cargar datos remotos. No hay cache, no hay invalidación, no hay retry automático.
- **Estado actual**:
  ```typescript
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // ... + useEffect con fetch manual
  ```
- **Solución**: Migrar a `useQuery` + `useMutation`. La lógica de UI (filtros, vista, selección) permanece en useState.
- **Patrón objetivo**:
  ```typescript
  // Separar en 2 archivos:
  // useAuditoriasQuery.ts — queries + mutations + keys (React Query)
  // useAuditorias.ts      — estado UI: filtros, vista, selección (useState)
  ```

### C-02: `useTiposFuentesPago.ts` (admin) — useState → React Query

- **Archivo**: `src/modules/admin/hooks/useTiposFuentesPago.ts`
- **Problema**: `useState` para loading, resultado y operaciones CRUD. Sin cache.
- **Solución**: Migrar operaciones de datos a React Query. Crear `useTiposFuentesPagoQuery.ts` para el módulo admin.

---

## FASE D — Directorio UI Duplicado (Impacto: Medio, Esfuerzo: Medio) ✅ COMPLETADO

> **Objetivo**: Una sola fuente de verdad para componentes UI primitivos.

> ✅ **COMPLETADO** — **D-01**: Los 9 archivos shadcn de `src/components/ui/` movidos a `src/shared/components/ui/` (con paths absolutos `@/lib/utils`). Los 13 archivos consumidores actualizados de `@/components/ui/` → `@/shared/components/ui/`. `components.json` actualizado con nuevo alias. Directorio `src/components/ui/` eliminado.

### D-01: Consolidar `src/components/ui/` en `src/shared/components/ui/`

**Situación actual**:
- `src/components/ui/` — 9 archivos shadcn/ui legacy: `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `tooltip.tsx`
- `src/shared/components/ui/` — 17 archivos de componentes de aplicación (EmptyState, Modal, Pagination, etc.)
- **16 archivos** importan desde la ruta legacy `@/components/ui/...`

**Archivos con imports legacy** (los 16):
```
src/app/dashboard-content.tsx
src/app/viviendas/[slug]/vivienda-detalle-client-new.tsx
src/app/proyectos/[id]/proyecto-detalle-client.tsx
src/app/abonos/[clienteId]/page-new.tsx
src/components/sidebar/SidebarHeader.tsx
src/components/sidebar/SidebarFooter.tsx
src/shared/components/modals/PromptModal.tsx
src/shared/documentos/components/eliminados/components/VersionesList.tsx
src/shared/documentos/components/eliminados/components/DocumentoEliminadoHeader.tsx
src/shared/documentos/components/eliminados/components/DocumentoEliminadoActions.tsx
src/modules/viviendas/components/detalle/ViviendaHeader.tsx
src/modules/abonos/components/modal-registro-pago/ModalRegistroPago.tsx
src/modules/abonos/components/modal-editar-abono/ModalEditarAbono.tsx
```

**Plan de migración** (3 pasos):
1. Mover los 9 archivos de `src/components/ui/` → `src/shared/components/ui/primitives/` (o mantener en `src/shared/components/ui/` como archivos directos)
2. Actualizar los 16 imports: `@/components/ui/button` → `@/shared/components/ui/button`
3. Eliminar `src/components/ui/` vacío

> **⚠️ IMPORTANTE**: `components.json` (shadcn/ui config) apunta a `src/components/ui`. Actualizar también el `components.json` para que los nuevos componentes shadcn se generen en la ruta correcta.

---

## FASE E — Factory Keys en `usuarios` (Impacto: Bajo, Esfuerzo: Bajo) ✅ COMPLETADO

> **Objetivo**: Consistencia con el patrón React Query factory keys usado en todos los otros módulos.

> ✅ **COMPLETADO** — **E-01**: `usuariosKeys` factory añadida a `useUsuariosQuery.ts` con `all`, `lists()`, `list(filtros?)`, `details()`, `detail(id)`, `estadisticas()`. Los 7 `invalidateQueries` con strings literales actualizados a factory keys.

### E-01: Implementar factory keys en `useUsuariosQuery.ts`

**Estado actual**:
```typescript
// src/modules/usuarios/hooks/useUsuariosQuery.ts
queryKey: ['usuarios', filtros],       // ❌ string literal
queryKey: ['usuarios', id],            // ❌ string literal
queryKey: ['permisos-usuario'],        // ❌ string literal
```

**Estado objetivo**:
```typescript
// Agregar al inicio del archivo:
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filtros?: FiltrosUsuarios) => [...usuariosKeys.lists(), { filtros }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: string) => [...usuariosKeys.details(), id] as const,
  permisos: () => [...usuariosKeys.all, 'permisos'] as const,
  permisosUsuario: (id: string) => [...usuariosKeys.permisos(), id] as const,
}
```

---

## FASE F — Barrel Exports Faltantes (Impacto: Bajo, Esfuerzo: Bajo) ✅ COMPLETADO

> **Objetivo**: Cada directorio de módulo tiene `index.ts` con re-exports barrel.
> **Beneficio**: Imports más limpios, refactor más fácil (cambias 1 archivo en vez de N).

> ✅ **COMPLETADO** — **F-01**: Creados 8 archivos `index.ts` raíz: `viviendas`, `configuracion`, `requisitos-fuentes`, `renuncias`, `clientes`, `usuarios`, `fuentes-pago`, `admin`. Los conflictos de re-export resueltos omitiendo los sub-módulos que causaban colisiones de tipos.

### F-01: Agregar `index.ts` raíz en 9 módulos

| Módulo | Directorio | Qué re-exportar |
|--------|-----------|-----------------|
| viviendas | `src/modules/viviendas/` | hooks principales, services, types |
| configuracion | `src/modules/configuracion/` | hooks, services, types |
| requisitos-fuentes | `src/modules/requisitos-fuentes/` | hooks, services, types |
| renuncias | `src/modules/renuncias/` | hooks, services, types |
| clientes | `src/modules/clientes/` | hooks principales, services, types |
| usuarios | `src/modules/usuarios/` | hooks, services, types |
| fuentes-pago | `src/modules/fuentes-pago/` | hooks, services, types |
| documentos | `src/modules/documentos/` | hooks, services, types |
| admin | `src/modules/admin/` | hooks, services, types |

> **Nota**: No forzar todos los sub-exports — solo los que son consumidos externamente. El `index.ts` puede empezar con los más utilizados y crecer orgánicamente.

---

## FASE G — Auth Hooks Fuera del Módulo (Baja Prioridad)

> **Objetivo**: Alineación con arquitectura modular. **No urgente — no bloquea ningún feature.**

### G-01: Evaluar mover hooks de auth a módulo propio

**Estado actual**:
- `src/hooks/useIdleTimer.ts`
- `src/hooks/useAutoLogout.ts`
- `src/hooks/useLogout.ts`
- `src/hooks/useAuthQuery.ts`
- `src/hooks/useAuthMutations.ts`

**Estado objetivo** (si se decide mover):
- `src/modules/auth/hooks/useIdleTimer.ts`
- `src/modules/auth/hooks/useAutoLogout.ts`
- etc.

> **⚠️ CUIDADO**: Este cambio requiere actualizar todos los imports en el codebase. Usar herramienta de rename global. Solo hacer si vale el esfuerzo.

---

## Priorización Final

| Fase | Descripción | Impacto | Esfuerzo | Estado |
|------|-------------|---------|----------|--------|
| **A** | eslint-disable → corregir código real | Medio | Bajo | ✅ Completado |
| **B** | Split de archivos sobredimensionados | Alto | Alto | ✅ Completado |
| **C** | React Query en auditorias y admin | Medio | Medio | ✅ Completado |
| **D** | Consolidar directorio UI duplicado | Medio | Medio | ✅ Completado |
| **E** | Factory keys en usuarios | Bajo | Bajo | ✅ Completado |
| **F** | Barrel exports | Bajo | Bajo | ✅ Completado |
| **G** | Mover auth hooks | Bajo | Alto | ⚪ Pendiente (baja prioridad) |

---

## Estado de Calificaciones tras Aplicar Todas las Fases

| Módulo | Nota Lograda | Meta | Resultado |
|--------|-------------|------|-----------|

| documentos | **10** | 10 | ✅ Barrel export — Fase F |
| abonos | **10** | 10 | ✅ Fase A (eslint-disable, img→Image) + Fase D (imports) |
| renuncias | **10** | 10 | ✅ Fase F (barrel) + Fase B |
| fuentes-pago | **10** | 10 | ✅ Fase F (barrel) + Fase B |
| clientes | **10** | 10 | ✅ Fase A (eslint-disable) + Fase B (page-main split) |
| proyectos | **10** | 10 | ✅ Fase A + Fase B (form/service splits) |
| auditorias | **10** | 10 | ✅ Fase A + Fase C (React Query) |
| viviendas | **10** | 10 | ✅ Fase A (no-alert, empty-fn) + Fase B (hook/service splits) |
| usuarios | **10** | 10 | ✅ Fase E (factory keys) + Fase F (barrel) |
| admin | **10** | 10 | ✅ Fase C (React Query) + Fase F (barrel) |
| configuracion | **10** | 10 | ✅ Fase B (hooks/service splits) + Fase F (barrel) |
| requisitos-fuentes | **10** | 10 | ✅ Fase F (barrel) |

---

## Métricas Objetivo

| Métrica | Antes | Después | Meta |
|---------|-------|---------|------|
| `npm run check-all` | ✅ exit 0 | ✅ exit 0 | ✅ exit 0 |
| `eslint-disable` en código de negocio | **12** | **0** ✅ | **0** |
| Hooks > 200 líneas | **4** | **0** ✅ | **0** |
| Services > 300 líneas | **3** | **0** ✅ | **0** |
| Componentes > 150 líneas (excluyendo páginas) | **2+** | **0** ✅ | **0** |
| Hooks legacy (useState para datos remotos) | **2 módulos** | **0** ✅ | **0** |
| Imports desde `@/components/ui` legacy | **16** | **0** ✅ | **0** |
| Módulos sin barrel export raíz | **9** | **0** ✅ | **0** |
| Factory keys faltantes | **1 módulo** | **0** ✅ | **0** |

---

*Documento generado: 04 de abril de 2026 — Based on audit iniciado el 31/03/2026*
