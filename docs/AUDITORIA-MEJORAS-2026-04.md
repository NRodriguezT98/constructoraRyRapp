# Auditoría de Mejoras — Abril 2026

> **Fecha**: 04 de abril de 2026
> **Referencia anterior**: `PLAN-MEJORAS-10-10.md` (objetivo 7.5 → 10/10)
> **Herramienta de verificación**: `npm run check-all` (TypeScript ✅ ESLint ✅ Prettier ✅ 36 tests ✅)

---

## 📊 Calificación Global: 8.2 / 10

| Área | Puntos | Nota |
|------|--------|------|
| Herramientas de calidad (TypeScript, ESLint, Prettier, Tests) | 10/10 | ✅ Impecable |
| Estructura de módulos y separación de responsabilidades | 8/10 | ✅ Bien — hooks accordion muy grandes |
| React Query y patrones de datos | 7/10 | ⚠️ 11 hooks legacy sin migrar |
| Consistencia de código | 8/10 | ✅ Bien — 4 query hooks sin factory keys |
| Cobertura de tests | 3/10 | ❌ Solo 2 archivos de test en toda la app |
| Organización y barrel exports | 10/10 | ✅ Completo |
| Deuda técnica controlada (eslint-disable, ts-ignore) | 9/10 | ✅ Bueno — todos justificados |

---

## ✅ LO QUE ESTÁ EXCELENTE

### 1. `npm run check-all` — Exit Code 0 Sostenido
Sin errores de TypeScript, ESLint ni Prettier. 36 tests pasando.

```
✔ TypeScript (tsc --noEmit)     — 0 errores
✔ ESLint (--max-warnings=0)     — 0 warnings
✔ Prettier                      — 0 archivos desformateados
✔ Vitest                        — 36/36 tests pasando
```

### 2. Zero imports `@/components/ui` legacy
La consolidación de `src/components/ui/` → `src/shared/components/ui/` se completó.
- **0 imports legacy** restantes (eran 16)
- `components.json` apunta a la ruta correcta

### 3. Barrel Exports — 11/11 módulos
Todos los módulos tienen `index.ts` raíz:

| Módulo | Barrel |
|--------|--------|
| abonos, admin, auditorias | ✅ |
| clientes, configuracion, fuentes-pago | ✅ |
| proyectos, renuncias, requisitos-fuentes | ✅ |
| usuarios, viviendas | ✅ |

### 4. eslint-disable — Todos Justificados
Solo **7 ocurrencias** (eran 12 injustificados). Todas tienen comentario explicativo o son en infraestructura:

| Archivo | Regla | Justificación |
|---------|-------|---------------|
| `src/lib/utils/logger.ts` | `no-console` | **Infraestructura** — por definición usa `console.*` |
| `src/shared/utils/logger.ts` | `no-console` | **Infraestructura** — por definición usa `console.*` |
| `src/shared/documentos/.../documento-card-horizontal.tsx` | `no-img-element` | Thumbnails Supabase Storage con dimensiones variables — `next/image` requeriría width/height fijos |
| `src/shared/documentos/.../documento-viewer.tsx` | `no-img-element` | Signed URL de Supabase Storage, `object-contain` con dimensiones dinámicas |
| `src/shared/hooks/useLocationSelector.ts` (×2) | `exhaustive-deps` | Sincronización de estado externo → interno; añadir deps causaría bucle infinito |
| `src/hooks/useAutoLogout.ts` | `exhaustive-deps` | Auth hook (Fase G pendiente) |

**Pendiente**: `useAutoLogout.ts` podría resolverse con `useRef` cuando se ejecute Fase G.

### 5. React Query — Módulos principales migrados
- `auditorias`: `useAuditoriasQuery.ts` + factory keys ✅
- `proyectos`: `useProyectosQuery.ts` + factory keys ✅
- `clientes`: `useClientesQuery.ts` + factory keys ✅
- `abonos`: `useAbonosQuery.ts` + factory keys ✅
- `renuncias`: `useRenunciasQuery.ts` + factory keys ✅
- `usuarios`: `useUsuariosQuery.ts` + factory keys ✅

### 6. Cero `@/components/ui` imports + `components.json` actualizado
Shadcn genera nuevos componentes en `src/shared/components/ui/` — fuente única de verdad.

---

## ⚠️ HALLAZGOS ACTUALES — Deuda Técnica Nueva

### 🔴 CRÍTICO — Cobertura de tests mínima

**Solo 2 archivos de test en toda la aplicación:**

| Archivo | Tests |
|---------|-------|
| `src/modules/clientes/utils/validacion-documentos-colombia.test.ts` | 18 tests |
| `src/modules/fuentes-pago/utils/calculos-credito.test.ts` | 18 tests |

**Total: 36 tests para una app con 37 rutas, 11 módulos, 100+ hooks, 50+ services.**

Los únicos tests son para funciones utilitarias puras. No hay tests para:
- Services (lógica de negocio crítica)
- Hooks (React Query mutations, transformaciones)
- Componentes (formularios, renders condicionales)
- Flujos de autenticación

**Impacto**: Regressions invisibles. Cualquier refactor puede romper funcionalidad sin saberlo.

---

### 🔴 ALTO — Hooks Accordion sobredimensionados (deuda nueva)

Los hooks de wizard multi-paso agregados como nueva funcionalidad exceden ampliamente el límite de 200L:

| Hook | Líneas | Exceso |
|------|--------|--------|
| `viviendas/hooks/useEditarViviendaAccordion.ts` | **667** | +234% |
| `proyectos/hooks/useEditarProyecto.ts` | **646** | +223% |
| `clientes/hooks/useEditarClienteAccordion.ts` | **602** | +201% |
| `viviendas/hooks/useNuevaViviendaAccordion.ts` | **545** | +173% |
| `clientes/hooks/useNuevoClienteAccordion.ts` | **539** | +170% |
| `clientes/pages/asignar-vivienda-v2/hooks/useAsignarViviendaV2.ts` | **469** | +135% |
| `viviendas/hooks/useEditarVivienda.ts` | **455** | +128% |
| `proyectos/hooks/useProyectosForm.ts` | **410** | +105% |
| `clientes/hooks/useFormularioCliente.ts` | **408** | +104% |

**En total: 44 hooks superan el límite de 200 líneas.**

Estos son los hooks de formularios wizard/accordion. Estrategia de split sugerida:
```
useEditarViviendaAccordion.ts (orquestador ~80L)
├── useViviendaPaso1Form.ts    — datos básicos
├── useViviendaPaso2Form.ts    — pricing y tipo
├── useViviendaPaso3Form.ts    — estado y fechas
└── useViviendaSubmit.ts       — lógica de guardado
```

---

### 🔴 ALTO — Services sobredimensionados (14 archivos)

| Service | Líneas | Límite |
|---------|--------|--------|
| `clientes/services/negociaciones.service.ts` | **938** | 300 |
| `clientes/services/pdf-negociacion.service.ts` | **801** | 300 |
| `clientes/services/clientes.service.ts` | **575** | 300 |
| `renuncias/services/renuncias.service.ts` | **507** | 300 |
| `abonos/services/abonos.service.ts` | **468** | 300 |
| `configuracion/services/entidades-financieras.service.ts` | **466** | 300 |
| `usuarios/services/usuarios.service.ts` | **385** | 300 |
| `proyectos/services/proyectos-escritura.service.ts` | **372** | 300 |
| `viviendas/services/viviendas-consultas.service.ts` | **365** | 300 |
| `auditorias/services/auditorias.service.ts` | **350** | 300 |
| `clientes/services/intereses.service.ts` | **331** | 300 |
| `clientes/services/historial-cliente.service.ts` | **329** | 300 |
| `viviendas/services/vivienda-validation.service.ts` | **321** | 300 |
| `clientes/services/fuentes-pago.service.ts` | **320** | 300 |

> **Nota**: `pdf-negociacion.service.ts` es un PDF renderer — puede justificarse exceder el límite por naturaleza de la funcionalidad.

---

### 🟡 MEDIO — Hooks legacy (useState + supabase directo, sin React Query)

**11 hooks** aún usan el patrón antiguo `useState + useEffect + supabase.from()` sin React Query:

| Hook | Módulo |
|------|--------|
| `useAbonoDetalle.ts` | abonos |
| `useSubirCartaModal.ts` | clientes/fuentes-pago |
| `useCategoriasSistemaClientes.ts` | clientes |
| `useClienteCardActivo.ts` | clientes |
| `useClienteIntereses.ts` | clientes |
| `useConfigurarFuentesPago.ts` | clientes |
| `useInteresFormulario.ts` | clientes |
| `useRegistrarInteres.ts` | clientes |
| `useTiposFuentePagoConfig.ts` | fuentes-pago |
| `useViviendasList.ts` | viviendas |
| `useDocumentosLista.ts` | shared/documentos |

**Impacto**: Sin caché, sin retry automático, sin invalidación coordinada, sin optimistic updates.

---

### 🟡 MEDIO — Componentes sobredimensionados (25+ archivos)

Los componentes más grandes detectados:

| Componente | Líneas |
|------------|--------|
| `clientes/components/formulario-cliente-modern.tsx` | **900** |
| `shared/documentos/components/lista/documento-card.tsx` | **819** |
| `shared/documentos/components/modals/DocumentoVersionesModal.tsx` | **765** |
| `renuncias/components/modals/RegistrarRenunciaModal.tsx` | **762** |
| `auditorias/components/detalles/DocumentosAuditoriaDetalle.tsx` | **718** |
| `shared/documentos/components/lista/documento-card-horizontal.tsx` | **700** |
| `clientes/components/negociaciones/configurar-fuentes-pago.tsx` | **694** |
| `auditorias/components/AuditoriasView.tsx` | **526** |

> **Excepción**: PDF renderers (`ReciboAbonoPDF.tsx`, `NegociacionPDF.tsx`) son necesariamente largos por la estructura de `@react-pdf/renderer`.

---

### 🟡 MEDIO — Factory Keys faltantes en 4 Query hooks

| Hook | Tiene Factory Keys |
|------|--------------------|
| `clientes/components/asignar-vivienda/hooks/useProyectosQuery.ts` | ❌ |
| `clientes/components/asignar-vivienda/hooks/useViviendasQuery.ts` | ❌ |
| `usuarios/hooks/usePermisosQuery.ts` | ❌ |
| `viviendas/hooks/useViviendaQuery.ts` | ❌ |

Estos hooks usan strings literales en `queryKey` en vez del patrón factory.

---

### 🟡 MEDIO — `@ts-ignore` temporal en `intereses.service.ts`

```
// NOTA: Los @ts-ignore son temporales hasta que se ejecute el SQL.
// Ejecutar supabase/cliente-intereses-schema.sql PRIMERO, luego regenerar tipos.
```

El schema SQL no se ha ejecutado aún en Supabase. Resolver: `npm run db:exec supabase/cliente-intereses-schema.sql` → `npm run types:generate` → eliminar `@ts-ignore`.

---

### 🟢 BAJO — Módulo `admin` sin directorio `types/`

Solo el módulo `admin` no tiene carpeta `types/`. No es bloqueante pero rompe la consistencia.

---

## 📈 Comparativa: Antes vs Ahora

| Métrica | Abril 2026 (Base) | Ahora | Delta |
|---------|-------------------|-------|-------|
| `check-all` exit code | ✅ 0 | ✅ 0 | — |
| `eslint-disable` injustificados | **12** | **0** | ✅ -100% |
| `eslint-disable` totales | **12** | **7** (todos justificados) | ✅ |
| Imports `@/components/ui` legacy | **16** | **0** | ✅ -100% |
| Módulos sin barrel export | **9** | **0** | ✅ -100% |
| Factory keys faltantes (módulos principales) | **1** (usuarios) | **0** | ✅ |
| Factory keys faltantes (todos los query hooks) | — | **4** | ⚠️ nuevo |
| Hooks legacy sin React Query | **2** (auditorias, admin) | **11** | ❌ nuevo |
| Hooks > 200 líneas (módulos) | **4** del plan | **44** totales | ❌ deuda nueva |
| Services > 300 líneas | **3** del plan | **14** totales | ❌ deuda nueva |
| Archivos de test | **2** | **2** | — |
| Tests pasando | **36** | **36** | — |
| `@ts-ignore` en código | **0** | **1** (documentado) | ⚠️ |

---

## 📋 Nuevo Plan de Mejoras — Hacia 10/10 Real

### FASE H — Tests (Impacto: alto, Prioridad: ⭐⭐⭐)

> La mayor brecha de calidad. Una app de producción sin tests no tiene red de seguridad.

**Objetivo mínimo**: 80% de cobertura en services críticos + hooks de datos.

```
Prioridad 1 (services con lógica de negocio crítica):
├── negociaciones.service.test.ts       — cálculos de cuotas, validaciones
├── clientes.service.test.ts            — CRUD + sanitización
└── abonos.service.test.ts              — cálculos de abono, estados

Prioridad 2 (hooks React Query):
├── useClientesQuery.test.ts
├── useProyectosQuery.test.ts
└── useAbonosQuery.test.ts

Prioridad 3 (componentes críticos):
├── formulario-cliente.test.tsx
└── ModalRegistroPago.test.tsx
```

---

### FASE I — Migración React Query completa (Impacto: medio, Prioridad: ⭐⭐)

Migrar los 11 hooks legacy a React Query. Prioridad por uso:

| Hook | Prioridad |
|------|-----------|
| `useViviendasList.ts` (página de viviendas) | Alta |
| `useDocumentosLista.ts` (documentos compartidos) | Alta |
| `useConfigurarFuentesPago.ts` | Media |
| `useClienteCardActivo.ts` | Media |
| `useClienteIntereses.ts` | Baja |
| Resto | Baja |

---

### FASE J — Split de hooks accordion (Impacto: medio, Prioridad: ⭐)

Aplicar el mismo patrón de la Fase B a los hooks accordion nuevos.
Los 5 hooks más críticos a dividir:

1. `useEditarViviendaAccordion.ts` (667L)
2. `useEditarProyecto.ts` (646L)
3. `useEditarClienteAccordion.ts` (602L)
4. `useNuevaViviendaAccordion.ts` (545L)
5. `useNuevoClienteAccordion.ts` (539L)

---

### FASE K — Factory keys + ts-ignore + admin/types (Impacto: bajo, Prioridad: ⭐)

1. Agregar factory keys a los 4 hooks pendientes
2. Ejecutar SQL de intereses → `types:generate` → eliminar `@ts-ignore`
3. Crear `src/modules/admin/types/index.ts`

---

### FASE G — Auth hooks (baja prioridad, sin cambios)

Mover `src/hooks/useAutoLogout.ts`, `useIdleTimer.ts`, etc. a `src/modules/auth/hooks/`.
Aún sin urgencia — no bloquea ningún feature.

---

## 🎯 Calificaciones por Módulo (Estado Actual)

| Módulo | Nota | Descripción |
|--------|------|-------------|
| `auditorias` | **9.0** | React Query ✅, hooks razonables |
| `proyectos` | **8.0** | `useProyectosForm` (410L), `useEditarProyecto` (646L) — pendientes |
| `abonos` | **8.5** | Bien estructurado — `abonos.service.ts` (468L) |
| `renuncias` | **8.5** | Barrel ✅, service 507L |
| `fuentes-pago` | **8.0** | `useTiposFuentePagoConfig` legacy |
| `usuarios` | **8.5** | Factory keys ✅, barrel ✅ |
| `clientes` | **7.0** | 8 hooks legacy, 3 services > 300L, hooks accordion > 600L |
| `viviendas` | **7.5** | Hooks accordion 545-667L, `useViviendasList` legacy |
| `configuracion` | **8.0** | Bien estructurado, services <= límite |
| `requisitos-fuentes` | **8.5** | Limpio |
| `admin` | **8.0** | Sin `types/`, bien en general |
| `shared/documentos` | **7.5** | Componentes > 700L, hook legacy, 2 eslint-disable justificados |

---

## Métricas Objetivo para 10/10 Real

| Métrica | Estado Actual | Meta 10/10 |
|---------|--------------|------------|
| Archivos de test | 2 | 15+ |
| Tests totales | 36 | 150+ |
| Hooks legacy sin React Query | 11 | 0 |
| Hooks > 200 líneas | 44 | < 10 (accordion orquestados) |
| Services > 300 líneas | 14 | < 5 |
| Factory keys faltantes | 4 | 0 |
| `@ts-ignore` sin resolver | 1 | 0 |
| `check-all` exit code | ✅ 0 | ✅ 0 |
