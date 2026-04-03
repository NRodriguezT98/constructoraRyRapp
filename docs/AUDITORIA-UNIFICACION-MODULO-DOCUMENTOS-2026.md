# AUDITORÍA ARQUITECTÓNICA: UNIFICACIÓN DEL MÓDULO DE DOCUMENTOS

**Fecha:** 1 de Abril de 2026
**Tipo:** Auditoría Arquitectónica Profunda + Plan de Unificación
**Severidad General:** 🔴 CRÍTICA — Deuda técnica acumulada que bloquea escalabilidad
**Autor:** Arquitecto de Software — Análisis basado en exploración exhaustiva del código

---

## RESUMEN EJECUTIVO

El sistema de documentos de Constructora RyR tiene un **problema de fragmentación severa**: la misma funcionalidad fue implementada **3 veces** — en `documentos/`, `viviendas/` y `clientes/` — con variaciones menores que dificultan el mantenimiento, introducen bugs silenciosos y triplican el esfuerzo de cada cambio.

### Cifras Clave del Problema

| Métrica                                           | Valor Actual                                    | Valor Objetivo       |
| ------------------------------------------------- | ----------------------------------------------- | -------------------- |
| Archivos totales relacionados a documentos        | **124 archivos**                                | ~55 archivos         |
| Archivos en `documentos/` (módulo central)        | 77                                              | 55 (optimizado)      |
| Archivos DUPLICADOS en `viviendas/`               | **29 archivos** (22 en subcarpetas documentos/) | **0**                |
| Archivos en `clientes/` (parcialmente necesarios) | 25                                              | 12 (solo los únicos) |
| Líneas de código duplicado estimado               | **~4,200 líneas**                               | 0                    |
| Services duplicados en viviendas/                 | 7 services (~1,273 líneas)                      | 0                    |
| Hooks duplicados en viviendas/                    | 15 hooks (~2,612 líneas)                        | 0                    |
| Hooks deprecados en raíz viviendas/               | 5 hooks                                         | 0                    |

---

## DIAGNÓSTICO DETALLADO

### 1. 🔴 PROBLEMA PRINCIPAL: Viviendas tiene una COPIA COMPLETA del módulo de documentos

**Estado:** El módulo `viviendas/` contiene una **réplica casi idéntica** de todo el sistema de documentos:

#### Services Duplicados (viviendas/services/documentos/)

| Archivo en viviendas/               | Líneas    | Copia de (documentos/)              | Líneas Original |
| ----------------------------------- | --------- | ----------------------------------- | --------------- |
| `documentos-base.service.ts`        | 248       | `documentos-base.service.ts`        | 412             |
| `documentos-eliminacion.service.ts` | 374       | `documentos-eliminacion.service.ts` | 347             |
| `documentos-estados.service.ts`     | 154       | `documentos-estados.service.ts`     | 412             |
| `documentos-storage.service.ts`     | 63        | `documentos-storage.service.ts`     | 70              |
| `documentos-versiones.service.ts`   | 322       | `documentos-versiones.service.ts`   | 401             |
| `documentos.service.ts`             | 100       | `documentos.service.ts`             | 196             |
| `index.ts`                          | 12        | `index.ts`                          | 10              |
| **Total**                           | **1,273** | —                                   | **1,848**       |

**Problema concreto:** Cuando se corrige un bug en `documentos/services/`, hay que recordar corregirlo TAMBIÉN en `viviendas/services/documentos/`. Esto ya ha causado inconsistencias (ej: `documentos-estados.service.ts` es genérico en `documentos/` pero hardcoded a `documentos_proyecto` — en viviendas puede estar hardcoded a `documentos_vivienda` o desactualizado).

#### Hooks Duplicados (viviendas/hooks/documentos/)

| Archivo en viviendas/              | Líneas    | Copia de (documentos/hooks/)             |
| ---------------------------------- | --------- | ---------------------------------------- |
| `useDocumentosLista.ts`            | 264       | `useDocumentosLista.ts` (380)            |
| `useDocumentoUpload.ts`            | 178       | `useDocumentoUpload.ts` (293)            |
| `useDocumentoVersiones.ts`         | 221       | — (lógica similar)                       |
| `useDocumentoReemplazarArchivo.ts` | 251       | `useDocumentoReemplazarArchivo.ts` (202) |
| `useDocumentoCard.ts`              | 115       | `useDocumentoCard.ts` (308)              |
| `useDocumentosEliminados.ts`       | 170       | `useDocumentosEliminados.ts` (361)       |
| `useCategoriasManager.ts`          | 121       | `useCategoriasManager.ts` (139)          |
| `useDetectarCambiosDocumento.ts`   | 115       | `useDetectarCambiosDocumento.ts` (108)   |
| `useDocumentoEditar.ts`            | 79        | `useDocumentoEditar.ts` (99)             |
| `useReemplazarArchivoForm.ts`      | 191       | `useReemplazarArchivoForm.ts` (177)      |
| `useMarcarEstadoVersion.ts`        | 192       | `useMarcarEstadoVersion.ts` (172)        |
| `useVersionesEliminadasCard.ts`    | 155       | `useVersionesEliminadasCard.ts` (110)    |
| `useEstadosVersionVivienda.ts`     | 167       | — (no existe en documentos/)             |
| `useDocumentosViviendaQuery.ts`    | 371       | `useDocumentosQuery.ts` (380)            |
| `index.ts`                         | 22        | `index.ts` (23)                          |
| **Total**                          | **2,612** | —                                        |

#### Hooks Deprecados en Raíz (viviendas/hooks/)

| Archivo                         | Líneas | Estado                   |
| ------------------------------- | ------ | ------------------------ |
| `useDocumentosVivienda.ts`      | ~100   | ❌ DEPRECADO             |
| `useDocumentoUploadVivienda.ts` | ~100   | ❌ DEPRECADO             |
| `useDocumentoVersiones.ts`      | ~100   | ❌ DEPRECADO             |
| `useDocumentosPapelera.ts`      | ~80    | ❌ DEPRECADO (v2 existe) |
| `useDocumentosPapelera.v2.ts`   | ~120   | ⚠️ Posiblemente activo   |

**Resumen viviendas:** ~4,200 líneas de código que son copias (con variaciones menores) del módulo central.

---

### 2. 🟡 PROBLEMA SECUNDARIO: Clientes tiene código mixto

#### Archivos NECESARIOS (sistemas únicos - NO duplican):

| Archivo                                  | Líneas | Justificación                                  |
| ---------------------------------------- | ------ | ---------------------------------------------- |
| `documentos-pendientes.service.ts`       | ~150   | Sistema único de requisitos por fuente de pago |
| `documentos-pendientes.types.ts`         | ~60    | Tipos del sistema de pendientes                |
| `documentos-pendientes.utils.ts`         | ~80    | Utilidades del sistema pendientes              |
| `useDocumentosPendientes.ts`             | ~100   | React Query para pendientes                    |
| `useDocumentosRequeridosFuentes.ts`      | ~120   | Requisitos por fuente de pago                  |
| `useDocumentosPendientesObligatorios.ts` | ~80    | Validación obligatorios                        |
| `SeccionDocumentosPendientes.tsx`        | ~150   | UI pendientes                                  |
| `BannerDocumentosPendientes.tsx`         | ~100   | Banner de alertas                              |
| `useBannerDocumentosPendientes.ts`       | ~80    | Lógica del banner                              |
| `useDocumentoIdentidad.ts`               | 59     | Manejo cédula/identidad                        |
| `validacion-documentos-colombia.ts`      | ~100   | Validación documentos colombianos              |
| `seccion-documentos-identidad.tsx`       | ~120   | UI documentos identidad                        |
| `subir-documentos-fuentes.ts`            | ~150   | Auto-upload por fuente de pago                 |

#### Archivos DUPLICADOS (podrían usar el genérico):

| Archivo                                | Líneas | Duplica                                                 |
| -------------------------------------- | ------ | ------------------------------------------------------- |
| `documentos-eliminacion.service.ts`    | 153    | `documentos/services/documentos-eliminacion.service.ts` |
| `documentos-lista-cliente.tsx`         | ~200   | Versión especializada de `documentos-lista.tsx`         |
| `documentos-filtros-cliente.tsx`       | ~100   | Versión de `documentos-filtros.tsx` con filtros extra   |
| `documento-renombrar-modal.tsx`        | ~120   | Podría ser modal genérico                               |
| `documento-eliminar-version-modal.tsx` | ~100   | Podría usar modal genérico                              |
| `documento-categorias-modal.tsx`       | ~100   | Podría usar `categorias-manager.tsx`                    |
| `documentos-agrupados.tsx`             | ~150   | Vista agrupada (extensión, no duplicación)              |
| `useDocumentosListaCliente.ts`         | 216    | Versión de `useDocumentosLista.ts`                      |
| `useDocumentosTab.ts`                  | ~100   | Orquestador de tab                                      |
| `documentos-cliente.store.ts`          | ~60    | Zustand duplicado                                       |
| `documentos.styles.ts`                 | ~80    | Estilos duplicados                                      |

---

### 3. 🟡 PROBLEMA EN EL MÓDULO CENTRAL: Hooks inflados

Dentro del mismo `documentos/`, hay hooks que violan el límite de 200 líneas:

| Hook                    | Líneas | Problema                                  |
| ----------------------- | ------ | ----------------------------------------- |
| `useDocumentosLista.ts` | 380+   | 15+ useState, maneja 5 modales diferentes |
| `useDocumentosQuery.ts` | 380    | 12 hooks exportados + wildcard barrel     |
| `useDocumentoCard.ts`   | 308    | Código legacy de protección deshabilitado |
| `useDocumentoUpload.ts` | 293    | Lógica compleja de metadata detection     |

---

### 4. 🔴 BUGS ACTIVOS POR LA FRAGMENTACIÓN

| #   | Bug                                                             | Causa Raíz                                              | Impacto                                                |
| --- | --------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| 1   | `documentos-estados.service.ts` hardcodea `documentos_proyecto` | No fue actualizado al hacerse genérico                  | Viviendas/clientes no pueden marcar versiones erróneas |
| 2   | `documentos-storage.service.ts` hardcodea bucket `'documentos'` | 3 métodos no usan config genérica                       | Eliminación de archivos falla para viviendas/clientes  |
| 3   | `sanitizeForStorage()` duplicada                                | Existe en `base.service.ts` Y en `versiones.service.ts` | Riesgo de divergencia                                  |
| 4   | Viviendas services podrían estar desactualizados                | Copias manuales no sincronizadas                        | Comportamiento diferente entre módulos                 |

---

## ARQUITECTURA PROPUESTA: UNIFICACIÓN TOTAL

### Principio Rector

> **"Un solo módulo de documentos que sirve a TODAS las entidades a través de composición, no duplicación."**

El módulo `documentos/` ya tiene el 90% del diseño genérico correcto con `CONFIGURACION_ENTIDADES`. El problema es que ese diseño no se adoptó en viviendas/clientes — en su lugar se COPIÓ el código.

### Arquitectura Objetivo

```
src/modules/documentos/                    # ← FUENTE ÚNICA DE VERDAD
├── components/
│   ├── lista/                             # Lista genérica (ya existente, ya genérica)
│   ├── cards/                             # Cards genéricas (ya existentes)
│   ├── modals/                            # Modales genéricos (ya existentes)
│   ├── upload/                            # Upload genérico (ya existente)
│   ├── categorias/                        # Categorías genéricas (ya existentes)
│   ├── archivados/                        # Vista archivados (ya existente)
│   ├── eliminados/                        # Papelera genérica (ya existente)
│   ├── viewer/                            # Visor (ya existente)
│   └── shared/                            # Badges, íconos (ya existentes)
│
├── hooks/
│   ├── queries/                           # ← NUEVO: React Query organizado
│   │   ├── useDocumentosQuery.ts          #    Queries principales
│   │   └── useCategoriaQuery.ts           #    Queries de categorías
│   ├── mutations/                         # ← NUEVO: Mutations organizadas
│   │   ├── useUploadMutation.ts           #    Subir documento
│   │   ├── useDeleteMutation.ts           #    Eliminar/archivar
│   │   ├── useVersionMutation.ts          #    Versiones
│   │   ├── useReplaceMutation.ts          #    Reemplazo admin
│   │   └── useStateMutation.ts            #    Estados de versión
│   ├── ui/                                # ← NUEVO: Lógica de UI separada
│   │   ├── useDocumentosLista.ts          #    Filtros + vista (SIN modales)
│   │   ├── useDocumentoCard.ts            #    Card state
│   │   ├── useDocumentoUploadForm.ts      #    Form del upload
│   │   └── useCategoriaManager.ts         #    Gestión categorías
│   ├── modals/                            # ← NUEVO: Un hook por modal
│   │   ├── useArchivarModal.ts
│   │   ├── useRestaurarModal.ts
│   │   ├── useVersionesModal.ts
│   │   ├── useReemplazarModal.ts
│   │   ├── useEditarMetadatosModal.ts
│   │   └── useMarcarEstadoModal.ts
│   └── index.ts
│
├── services/
│   ├── documentos-crud.service.ts         # ← RENOMBRAR: base → crud (más claro)
│   ├── documentos-storage.service.ts      # ← FIX: quitar hardcoded buckets
│   ├── documentos-versiones.service.ts    # ← FIX: extraer sanitizeForStorage
│   ├── documentos-eliminacion.service.ts  # (ya genérico, OK)
│   ├── documentos-estados.service.ts      # ← FIX CRÍTICO: hacer genérico
│   ├── documentos-reemplazo.service.ts    # (ya genérico, OK)
│   ├── categorias.service.ts              # (ya genérico, OK)
│   └── index.ts
│
├── types/
│   ├── documento.types.ts                 # ← RENOMBRAR: DocumentoProyecto → Documento
│   ├── entidad.types.ts                   # (excelente, no tocar)
│   └── index.ts
│
├── utils/
│   ├── sanitize-storage.ts               # ← NUEVO: extraer de services duplicados
│   └── formatear-entidad.ts
│
├── schemas/
│   └── documento.schema.ts
│
├── store/
│   └── documentos.store.ts
│
├── constants/
│   └── archivado.constants.ts
│
└── styles/
    └── classes.ts


src/modules/viviendas/                     # ← DESPUÉS DE UNIFICACIÓN
├── components/detalle/tabs/
│   └── DocumentosTab.tsx                  # ✅ MANTENER: thin wrapper
├── hooks/
│   └── useDocumentosPapelera.v2.ts        # ⚠️ EVALUAR: ¿necesario o usar genérico?
│   (documentos/ ELIMINADA)                # ❌ ELIMINAR: toda la subcarpeta
├── services/
│   (documentos/ ELIMINADA)                # ❌ ELIMINAR: toda la subcarpeta
│   (documentos-vivienda.service.ts ELIMINADA) # ❌ ELIMINAR: stub vacío
└── types/
    (documento-vivienda.types.ts ELIMINADA) # ❌ ELIMINAR: tipo duplicado


src/modules/clientes/                      # ← DESPUÉS DE UNIFICACIÓN
├── components/
│   ├── documentos/
│   │   └── seccion-documentos-identidad.tsx  # ✅ MANTENER: UI específica de clientes
│   └── documentos-pendientes/                # ✅ MANTENER: sistema único
│       ├── SeccionDocumentosPendientes.tsx
│       ├── BannerDocumentosPendientes.tsx
│       └── useBannerDocumentosPendientes.ts
├── documentos/
│   ├── components/
│   │   ├── documentos-lista-cliente.tsx    # ⚠️ EVALUAR: ¿extensión del genérico o reemplazar?
│   │   └── BannerDocumentoRequerido.tsx    # ✅ MANTENER: UI específica
│   │   (modales duplicados ELIMINADOS)     # ❌ ELIMINAR: usar modales genéricos
│   └── hooks/
│       ├── useDocumentoIdentidad.ts        # ✅ MANTENER: lógica única de cédula
│       └── useDocumentosListaCliente.ts    # ⚠️ EVALUAR: ¿se puede extender el genérico?
├── hooks/
│   ├── useDocumentosPendientes.ts          # ✅ MANTENER: sistema único
│   ├── useDocumentosRequeridosFuentes.ts   # ✅ MANTENER: sistema único
│   └── useDocumentosTab.ts                 # ⚠️ EVALUAR: simplificar
├── services/
│   ├── documentos-pendientes.service.ts    # ✅ MANTENER: sistema único
│   └── (documentos-eliminacion.service.ts ELIMINADA)  # ❌ USAR GENÉRICO
└── utils/
    ├── documentos-pendientes.utils.ts      # ✅ MANTENER
    └── validacion-documentos-colombia.ts   # ✅ MANTENER
```

---

## PLAN DE EJECUCIÓN: 5 FASES

### FASE 1: Corrección de Bugs Críticos (Riesgo 0 — no cambia estructura)

**Objetivo:** Arreglar los bugs activos que la fragmentación ya causó.

**Tareas:**

1. **Hacer `documentos-estados.service.ts` genérico**
   - Reemplazar 3 instancias de `from('documentos_proyecto')` con `from(getTablaDocumentos(tipoEntidad))`
   - Agregar parámetro `tipoEntidad` a los 3 métodos públicos
   - Actualizar `documentos.service.ts` (facade) para pasar `tipoEntidad`

2. **Fix buckets hardcoded en `documentos-storage.service.ts`**
   - `eliminarArchivoStorage()` → agregar `tipoEntidad`, usar `config.bucket`
   - `eliminarArchivosStorage()` → agregar `tipoEntidad`, usar `config.bucket`
   - `subirArchivo()` → agregar `tipoEntidad`, usar `config.bucket`

3. **Extraer `sanitizeForStorage()` a utils**
   - Crear `documentos/utils/sanitize-storage.ts`
   - Importar desde `base.service.ts` y `versiones.service.ts`
   - Eliminar las 2 copias duplicadas

**Estimado:** Cambios menores, sin riesgo de regresión.

---

### FASE 2: Eliminación del código muerto en Viviendas (Riesgo bajo)

**Objetivo:** Eliminar los 5 hooks deprecados de `viviendas/hooks/` raíz.

**Tareas:**

1. **Verificar que NO se importan** en ningún componente activo:

   ```bash
   grep -r "useDocumentosVivienda\|useDocumentoUploadVivienda\|useDocumentoVersiones" src/ --include="*.tsx" --include="*.ts"
   ```

2. **Eliminar archivos:**
   - `viviendas/hooks/useDocumentosVivienda.ts`
   - `viviendas/hooks/useDocumentoUploadVivienda.ts`
   - `viviendas/hooks/useDocumentoVersiones.ts`
   - `viviendas/hooks/useDocumentosPapelera.ts` (v1 — v2 existe)

3. **Eliminar stub vacío:**
   - `viviendas/services/documentos-vivienda.service.ts`

4. **Eliminar tipo duplicado:**
   - `viviendas/types/documento-vivienda.types.ts`

**Estimado:** ~500 líneas eliminadas sin impacto funcional.

---

### FASE 3: Migración de Viviendas al módulo genérico (Riesgo medio)

**Objetivo:** Hacer que viviendas use DIRECTAMENTE `documentos/` en vez de sus copias.

**Estrategia:** Migrar archivo por archivo, verificando con `npm run type-check` después de cada cambio.

#### 3A: Migrar Services (viviendas/services/documentos/ → documentos/services/)

1. **Verificar equivalencia:** Comparar cada service de viviendas con el de documentos/ para confirmar que el genérico cubre toda la funcionalidad
2. **Actualizar imports en hooks:**

   ```typescript
   // ANTES (viviendas/hooks/documentos/useDocumentosLista.ts)
   import { DocumentosBaseService } from '../../services/documentos/documentos-base.service'

   // DESPUÉS
   import { DocumentosBaseService } from '@/modules/documentos/services'
   ```

3. **Eliminar** `viviendas/services/documentos/` completa (7 archivos, 1,273 líneas)

#### 3B: Migrar Hooks (viviendas/hooks/documentos/ → documentos/hooks/)

**Para cada hook duplicado:**

1. Verificar que el hook de `documentos/` acepta `tipoEntidad`
2. Actualizar el componente `DocumentosTab.tsx` para usar hooks de `documentos/`
3. Si el hook de viviendas tiene lógica EXTRA, crear extensión:

   ```typescript
   // Si useDocumentosLista de viviendas tiene algo extra:
   import { useDocumentosLista } from '@/modules/documentos/hooks'

   export function useDocumentosListaVivienda(viviendaId: string) {
     const base = useDocumentosLista(viviendaId, 'vivienda')
     // Solo agregar lo extra aquí
     return { ...base /* extras */ }
   }
   ```

4. Si NO tiene diferencias → eliminar directamente

**Hook mantener (único):**

- `useDocumentosViviendaQuery.ts` → Renombrar las query keys para que no colisionen con las del módulo genérico, o MEJOR: agregar las keys de vivienda al `documentosKeys` factory del módulo central

5. **Eliminar** `viviendas/hooks/documentos/` completa (~2,612 líneas)

**Estimado:** ~3,885 líneas eliminadas total de viviendas.

---

### FASE 4: Consolidar Clientes (Riesgo medio-bajo)

**Objetivo:** Clientes usa el módulo genérico donde sea posible, manteniendo solo lo que es verdaderamente único.

**Tareas:**

1. **Eliminar `documentos-eliminacion.service.ts` de clientes:**
   - Reemplazar usos con `DocumentosEliminacionService` genérico pasando `tipoEntidad: 'cliente'`

2. **Evaluar `documentos-lista-cliente.tsx`:**
   - Si es solo `documentos-lista.tsx` con filtros extra → crear wrapper thin
   - Si tiene lógica completamente diferente → mantener como extensión

3. **Eliminar modales duplicados de clientes:**
   - `documento-renombrar-modal.tsx` → usar modal genérico (o crear uno en `documentos/`)
   - `documento-eliminar-version-modal.tsx` → usar modal genérico
   - `documento-categorias-modal.tsx` → usar `categorias-manager.tsx` genérico

4. **Mantener TODO lo del sistema de pendientes** (es un subsistema separado y bien diseñado)

**Estimado:** ~600 líneas eliminadas.

---

### FASE 5: Refactorización interna del módulo documentos/ (Riesgo bajo)

**Objetivo:** Optimizar la estructura interna del módulo central.

**Tareas:**

1. **Renombrar `DocumentoProyecto` → `Documento`**
   - Buscar y reemplazar en todo el proyecto
   - Mantener alias temporal: `export type DocumentoProyecto = Documento`

2. **Descomponer `useDocumentosLista.ts` (380 → 4 hooks de ~95 líneas):**

   ```
   useDocumentosLista.ts →
     useDocumentosListaCore.ts    (filtrado + datos)
     useDocumentoViewer.ts        (modal viewer + URL preview)
     useDocumentoArchivoActions.ts (archivar + restaurar modales)
     useDocumentoDeleteAction.ts   (ya existe como useEliminarDocumento)
   ```

3. **Organizar hooks por carpetas:**

   ```
   hooks/
   ├── queries/     (useDocumentosQuery, separar en archivos más pequeños)
   ├── mutations/   (extraer mutations de useDocumentosQuery)
   ├── ui/          (useDocumentosLista, useDocumentoCard, etc.)
   └── modals/      (useArchivarModal, useReemplazarModal, etc.)
   ```

4. **Limpiar `useDocumentoCard.ts`:**
   - Eliminar código legacy de protección deshabilitado (~50 líneas)

5. **Mover llamadas Supabase directas a services:**
   - `useDocumentoEditar.ts` hace `supabase.from()` directo → usar service

---

## IMPACTO DE LA UNIFICACIÓN

### Reducción de Código

| Métrica           | Antes     | Después  | Reducción |
| ----------------- | --------- | -------- | --------- |
| Archivos totales  | 124       | ~55      | **-56%**  |
| Líneas duplicadas | ~4,200    | 0        | **-100%** |
| Services files    | 16        | 8        | **-50%**  |
| Hooks files       | 35+       | 18       | **-49%**  |
| Puntos de fallo   | 3 módulos | 1 módulo | **-67%**  |

### Beneficios Cualitativos

1. **Un bug → un fix.** Hoy, un bug en documentos requiere 3 fixes (documentos/, viviendas/, clientes/). Después: 1 fix.
2. **Una feature → un desarrollo.** Hoy, agregar "firma digital" requiere implementar en 3 lugares. Después: 1 lugar.
3. **Onboarding simplificado.** Nuevo desarrollador aprende UN módulo, no 3 variantes.
4. **Tests significativos.** Se pueden escribir tests para EL módulo, no para 3 copias.
5. **Type safety real.** `Documento` (genérico) en lugar de `DocumentoProyecto` usado como genérico.

### Riesgos y Mitigación

| Riesgo                                    | Probabilidad | Mitigación                                        |
| ----------------------------------------- | ------------ | ------------------------------------------------- |
| Regresión en viviendas al cambiar imports | Media        | Fase 3 incluye `type-check` paso por paso         |
| Query keys que colisionan                 | Baja         | Factory pattern ya las separa por `tipoEntidad`   |
| Funcionalidad específica perdida          | Baja         | Comparación archivo por archivo antes de eliminar |
| Tiempo de inactividad                     | Nula         | Cambios son import paths, no lógica nueva         |

---

## ORDEN DE PRIORIDAD RECOMENDADO

```
FASE 1 → INMEDIATA     (bugs activos, 0 riesgo de regresión)
FASE 2 → ESTA SEMANA   (código muerto, 0 impacto funcional)
FASE 3 → SPRINT 1      (migración mayor, requiere testing)
FASE 4 → SPRINT 1-2    (consolidar clientes, menor escala)
FASE 5 → SPRINT 2      (optimización interna, mejora calidad)
```

---

## DIAGRAMA DE DEPENDENCIAS ACTUAL vs PROPUESTO

### ACTUAL (Fragmentado)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ESTADO ACTUAL                                │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   PROYECTOS     │  │   VIVIENDAS     │  │    CLIENTES     │    │
│  │  (Tab wrapper)  │  │  (Tab wrapper)  │  │   (Tab + más)   │    │
│  └───────┬─────────┘  └───────┬─────────┘  └───────┬─────────┘    │
│          │                    │                     │               │
│          ▼                    ▼                     ▼               │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│  │ documentos/  │     │ viviendas/   │     │ clientes/    │       │
│  │ services/    │     │ services/    │     │ services/    │       │
│  │ hooks/       │     │ documentos/  │     │ documentos/  │       │
│  │ components/  │     │              │     │              │       │
│  │              │     │ hooks/       │     │ hooks/       │       │
│  │ 77 archivos  │     │ documentos/  │     │              │       │
│  │ ~6,500 líneas│     │              │     │              │       │
│  └──────────────┘     │ 29 archivos  │     │ 25 archivos  │       │
│                       │ ~3,900 líneas│     │ ~2,400 líneas│       │
│         ✅             └──────────────┘     └──────────────┘       │
│     GENÉRICO              ❌ COPIA             ⚠️ MIXTO           │
│                                                                     │
│  Total: 131 archivos / ~12,800 líneas                               │
└─────────────────────────────────────────────────────────────────────┘
```

### PROPUESTO (Unificado)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ESTADO PROPUESTO                                │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────────┐      │
│  │ PROYECTOS   │    │ VIVIENDAS   │    │     CLIENTES       │      │
│  │ (Tab: 1 file│    │ (Tab: 1 file│    │ (Tab + Pendientes  │      │
│  │  ~100 líneas│    │  ~100 líneas│    │  + Identidad)      │      │
│  └──────┬──────┘    └──────┬──────┘    │  ~12 archivos      │      │
│         │                  │           └─────────┬──────────┘      │
│         │                  │                     │                  │
│         └──────────────────┼─────────────────────┘                  │
│                            │                                        │
│                            ▼                                        │
│              ┌──────────────────────────┐                           │
│              │    documentos/ (ÚNICO)   │                           │
│              │                          │                           │
│              │  services/    (8 files)  │                           │
│              │  hooks/       (18 files) │                           │
│              │  components/  (25 files) │                           │
│              │  types/       (3 files)  │                           │
│              │  utils/       (2 files)  │                           │
│              │  schemas/     (1 file)   │                           │
│              │  store/       (1 file)   │                           │
│              │                          │                           │
│              │  ~55 archivos            │                           │
│              │  ~6,500 líneas           │                           │
│              └──────────────────────────┘                           │
│                            ✅                                       │
│                    FUENTE ÚNICA DE VERDAD                           │
│                                                                     │
│  Total: ~68 archivos / ~7,500 líneas (-48% archivos, -41% líneas)  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CHECKLIST FINAL DE VALIDACIÓN

Después de cada fase, verificar:

- [ ] `npm run type-check` → 0 errores
- [ ] `npm run build` → Compilación exitosa
- [ ] Documentos de PROYECTOS: subir, versionar, archivar, eliminar, restaurar, reemplazar
- [ ] Documentos de VIVIENDAS: subir, versionar, archivar, eliminar, restaurar, reemplazar
- [ ] Documentos de CLIENTES: subir, identidad, pendientes, fuentes de pago
- [ ] Papelera global: muestra documentos de los 3 módulos
- [ ] Auditoría: registra operaciones de los 3 módulos
- [ ] Dark mode: consistente en todos los componentes
- [ ] No existen archivos en `viviendas/services/documentos/`
- [ ] No existen archivos en `viviendas/hooks/documentos/`
- [ ] `DocumentoProyecto` renombrado a `Documento`
- [ ] `useDocumentosLista` < 200 líneas

---

## CONCLUSIÓN

El módulo de documentos tiene el **diseño genérico correcto** (`CONFIGURACION_ENTIDADES` es elegante y funcional). El problema es que ese diseño no se propagó — en lugar de usarlo, se duplicó el código completo para viviendas y parcialmente para clientes.

La unificación propuesta **no requiere reescribir lógica** — es fundamentalmente un trabajo de **cambio de imports + eliminación de copias**. El módulo central ya soporta `TipoEntidad = 'proyecto' | 'vivienda' | 'cliente'`. Solo necesitamos que los otros módulos lo USEN en lugar de tener sus propias copias.

El resultado: **un sistema mantenible, testeable y escalable** donde agregar un 4to tipo de entidad (ej: `contrato`) requeriría agregar **4 líneas** en `CONFIGURACION_ENTIDADES` en vez de copiar 29 archivos.
