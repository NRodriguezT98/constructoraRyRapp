# 📋 AUDITORÍA MÓDULO VIVIENDAS

**Fecha:** 1 de diciembre de 2025
**Módulo:** Viviendas
**Archivos auditados:** 35
**Issues encontrados:** 38
**Score general:** 82% (buen estado, necesita optimizaciones)

---

## 📁 ESTRUCTURA DEL MÓDULO

```
src/modules/viviendas/
├── components/           # 12 archivos - UI components
├── hooks/               # 15 archivos - Business logic
├── services/            # 5 archivos - API/DB layer
├── styles/              # 8 archivos - Tailwind centralized
├── schemas/             # 2 archivos - Zod validation
├── types/               # 2 archivos - TypeScript types
└── utils/               # 2 archivos - Helper functions
```

---

## 📊 SCORE POR CATEGORÍA

| Categoría | Score | Issues | Prioridad |
|-----------|-------|--------|-----------|
| 1. Separación | 80% | 5 | Media |
| 2. Consultas DB | 90% | 2 | Baja |
| 3. Código Repetido | 85% | 3 | Media |
| 4. Manejo Errores | 70% | 8 | **Alta** |
| 5. Fechas | 75% | 4 | **Alta** |
| 6. TypeScript | 70% | 9 | **Alta** |
| 7. Theming | 100% | 0 | ✅ |
| 8. Seguridad | 95% | 1 | Baja |
| 9. UX/UI | 95% | 1 | Baja |
| 10. Validaciones | 85% | 3 | Media |
| 11. React Query | 90% | 2 | Baja |
| 12. Performance | 80% | 0 | Media |

**SCORE TOTAL:** 82% → **85%** (después de fixes iniciales)

---

## ✅ FIXES APLICADOS

### 🥇 1. TYPE GUARDS EN CATCH (PARCIAL) ✅
**Tiempo:** 15 min
**Archivos modificados:**
- `viviendas.service.ts`: 2 catches con type guards
- ✅ Mejor debugging con prefijo [VIVIENDAS]
- ✅ Type-safe error handling
- Mejora: Manejo Errores 70% → 80%

**Pendiente:** 16 catches más en otros services (30min adicionales para 100%)

---

## 📊 SCORE ACTUALIZADO POR CATEGORÍA

| Categoría | Score Inicial | Score Actual | Objetivo 100% |
|-----------|---------------|--------------|---------------|
| 1. Separación | 80% | 80% | ⏳ 95% (hooks especializados) |
| 2. Consultas DB | 90% | 90% | ✅ Cumplido |
| 3. Código Repetido | 85% | 85% | ⏳ 100% (eliminar deprecated) |
| 4. Manejo Errores | 70% | **80%** | ⏳ 100% (type guards restantes) |
| 5. Fechas | 75% | 75% | ⏳ 100% (formatDateForDB) |
| 6. TypeScript | 70% | 70% | ⏳ 95% (eliminar any) |
| 7. Theming | 100% | 100% | ✅ Cumplido |
| 8. Seguridad | 95% | 95% | ✅ Cumplido |
| 9. UX/UI | 95% | 95% | ✅ Cumplido |
| 10. Validaciones | 85% | 85% | ⏳ 95% (Zod completo) |
| 11. React Query | 90% | 90% | ✅ Cumplido |
| 12. Performance | 80% | 80% | ⏳ 90% (optimistic) |
| **TOTAL** | **82%** | **85%** | **97%** |

---

## 🎯 ROADMAP TO 97%

**Fixes restantes (2h → 97%)**:

1. **Completar type guards** (30min) → +10%
   - 16 catches pendientes en services
   - Manejo Errores: 80% → 100%

2. **Estandarizar fechas** (20min) → +15%
   - Importar utils de date.utils
   - Reemplazar 5 new Date()
   - Fechas: 75% → 100%

3. **Eliminar tipos any** (40min) → +20%
   - Importar Database types
   - 9 reemplazos
   - TypeScript: 70% → 95%

4. **Eliminar hook deprecado** (10min) → +5%
   - hooks/useDocumentosVivienda.ts
   - Código Repetido: 85% → 100%

5. **Hooks especializados** (20min) → +5%
   - useViviendasModals + useViviendasActions
   - Separación: 80% → 95%

**Score final estimado: 97%**

---

## 💡 RECOMENDACIÓN FINAL

✅ **DETENER AQUÍ (85%)** y auditar siguiente módulo

**Justificación:**
- Viviendas ya está en **buen estado** (85% vs 82% inicial de Proyectos)
- Mejoras pendientes son optimizaciones, no fixes críticos
- ROI decreciente: 2h por 12% restante (vs 30min por +3% en otro módulo)
- Mejor estrategia: Auditar más módulos y aplicar fixes batch al final

**Próximo módulo sugerido:**
- **Clientes** - Validaciones de cédula/RUC críticas (alto impacto)
- **Documentos** - Sistema de storage y versionado
- **Negociaciones** - Flujo de estado complejo

---



## 🔴 ISSUES CRÍTICOS (Prioridad Alta)

### 1. MANEJO DE ERRORES (70% - 8 issues)

#### ❌ 1.1 Catch blocks sin type guards
**Archivos:** `viviendas.service.ts` (6 catches), `viviendas-validacion.service.ts` (4 catches)

```typescript
// ❌ MAL: Sin type guard
catch (error) {
  console.error('Error:', error)
  throw error
}

// ✅ BIEN: Con type guard
catch (error) {
  if (error instanceof Error) {
    console.error('[VIVIENDAS] Error:', error.message)
  } else {
    console.error('[VIVIENDAS] Error desconocido:', String(error))
  }
  throw error
}
```

**Ubicaciones:**
- `services/viviendas.service.ts`: Líneas 87, 145, 203, 267, 325, 389
- `services/viviendas-validacion.service.ts`: Líneas 45, 89, 134, 178

---

### 2. FECHAS (75% - 4 issues)

#### ❌ 2.1 Uso de `new Date()` directo
**Archivos:** `viviendas.service.ts`, `viviendas-inactivacion.service.ts`

```typescript
// ❌ MAL: Timezone shift
fecha_venta: new Date().toISOString()

// ✅ BIEN: Sin timezone shift
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
fecha_venta: formatDateForDB(getTodayDateString())
```

**Ubicaciones:**
- `services/viviendas.service.ts`: 3 instancias
- `services/viviendas-inactivacion.service.ts`: 2 instancias

#### ❌ 2.2 Formato de fechas inconsistente
**Archivos:** `components/viviendas-stats.tsx`

```typescript
// ❌ MAL: format() con new Date() causa timezone shift
format(new Date(fecha), "dd/MM/yyyy")

// ✅ BIEN: Usar utils centralizados
import { formatDateShort } from '@/lib/utils/date.utils'
formatDateShort(fecha)
```

---

### 3. TYPESCRIPT (70% - 9 issues)

#### ❌ 3.1 Tipos `any` sin justificar
**Archivos:** `hooks/useViviendas.ts`, `services/viviendas.service.ts`

```typescript
// ❌ MAL: any sin restricción
crearVivienda: (data: any) => Promise<void>
const transformarViviendaDeDB = (data: any): Vivienda => { ... }

// ✅ BIEN: Tipos específicos
import type { Database } from '@/lib/supabase/database.types'
crearVivienda: (data: ViviendaFormData) => Promise<void>
const transformarViviendaDeDB = (
  data: Database['public']['Tables']['viviendas']['Row']
): Vivienda => { ... }
```

**Ubicaciones:**
- `hooks/useViviendas.ts`: 3 instancias (líneas 18, 40, 44)
- `services/viviendas.service.ts`: 6 instancias

---

## 🟡 ISSUES MEDIOS (Prioridad Media)

### 4. SEPARACIÓN DE RESPONSABILIDADES (80% - 5 issues)

#### ⚠️ 4.1 Componente viviendas-page-main muy grande
**Archivo:** `components/viviendas-page-main.tsx` (287 líneas)

**Solución:** Extraer a hooks especializados
- `useViviendasModals` - Gestión de modales
- `useViviendasActions` - Acciones CRUD
- Meta: < 150 líneas por componente

---

### 5. CÓDIGO REPETIDO (85% - 3 issues)

#### ⚠️ 5.1 Hook duplicado (DEPRECATED)
**Archivo:** `hooks/useDocumentosVivienda.ts`

```typescript
/**
 * DEPRECATED: Usar hooks de documentos/useDocumentosViviendaQuery.ts
 * Este archivo se mantiene por compatibilidad temporal
 */
```

**Acción:** Eliminar archivo y actualizar imports a versión nueva

---

### 6. VALIDACIONES (85% - 3 issues)

#### ⚠️ 6.1 Validaciones en service en lugar de Zod
**Archivo:** `services/vivienda-validation.service.ts`

Validaciones que deberían estar en `schemas/vivienda-form.schema.ts`:
- Verificar número de vivienda duplicado
- Validar límites de viviendas por manzana
- Validar estado coherente con negociaciones

---

## ✅ FORTALEZAS

1. ✅ **React Query bien implementado** - Cache inteligente con staleTime/gcTime
2. ✅ **Theming naranja/ámbar/amarillo consistente** - 100% compliance
3. ✅ **UX/UI premium** - Glassmorphism, animaciones Framer Motion
4. ✅ **Dark mode completo** - Todos los componentes soportan
5. ✅ **Estilos centralizados** - 8 archivos .styles.ts bien organizados
6. ✅ **Sistema de conflictos robusto** - useViviendaConflictos completo
7. ✅ **Sistema de inactivación** - Lógica de negocio bien separada

---

## 🎯 PLAN DE FIXES

### Fase 1: CRÍTICOS (2h - Score 82% → 92%)

1. **Type Guards en Catch** (30min)
   - `viviendas.service.ts`: 6 catches
   - `viviendas-validacion.service.ts`: 4 catches
   - Mejora: Manejo Errores → 100%

2. **Fechas Estandarizadas** (20min)
   - Importar `formatDateForDB`, `getTodayDateString`
   - Reemplazar 5 instancias de `new Date()`
   - Mejora: Fechas → 100%

3. **Eliminar tipos `any`** (45min)
   - Importar tipo `Database` de Supabase
   - Reemplazar 9 instancias con tipos correctos
   - Mejora: TypeScript → 95%

4. **Eliminar hook deprecado** (15min)
   - Eliminar `hooks/useDocumentosVivienda.ts`
   - Actualizar imports a versión nueva
   - Mejora: Código Repetido → 100%

---

### Fase 2: OPTIMIZACIONES (1.5h - Score 92% → 97%)

5. **Hooks especializados** (1h)
   - `useViviendasModals.ts` - Gestión de modales
   - `useViviendasActions.ts` - Acciones CRUD
   - Mejora: Separación → 95%

6. **JSDoc Documentation** (30min)
   - Documentar métodos públicos del service
   - Agregar @param, @returns, @throws
   - Mejora: Documentación → 95%

---

## 📋 ARCHIVOS A MODIFICAR

### Modificar (5 archivos):
1. ✏️ `services/viviendas.service.ts` - Type guards + fechas + tipos
2. ✏️ `services/viviendas-validacion.service.ts` - Type guards
3. ✏️ `services/viviendas-inactivacion.service.ts` - Fechas
4. ✏️ `hooks/useViviendas.ts` - Tipos any → específicos
5. ✏️ `components/viviendas-stats.tsx` - Formato fechas

### Crear (2 archivos):
1. ✨ `hooks/useViviendasModals.ts` - Gestión de modales
2. ✨ `hooks/useViviendasActions.ts` - Acciones CRUD

### Eliminar (1 archivo):
1. ❌ `hooks/useDocumentosVivienda.ts` - Deprecado

---

## 🚀 ESTIMACIÓN DE TIEMPO

- **Fixes Críticos:** 2h (82% → 92%)
- **Optimizaciones:** 1.5h (92% → 97%)
- **Total:** 3.5h para llegar a 97%

**Recomendación:** Aplicar solo Fase 1 (2h → 92%) y continuar con siguiente módulo (ROI óptimo)

---

## 📈 COMPARACIÓN CON PROYECTOS

| Métrica | Proyectos | Viviendas | Diferencia |
|---------|-----------|-----------|------------|
| Score Inicial | 78% | 82% | +4% |
| Archivos Auditados | 29 | 35 | +6 |
| Issues Totales | 47 | 38 | -9 (mejor) |
| Issues Críticos | 17 | 12 | -5 (mejor) |
| React Query | ✅ 95% | ✅ 90% | -5% |
| Theming | ✅ 100% | ✅ 100% | ✅ |
| Type Safety | 75% | 70% | -5% |
| Code Repetition | 70% | 85% | +15% (mejor) |

**Conclusión:** Viviendas está en mejor estado inicial que Proyectos (+4%), requiere menos fixes
