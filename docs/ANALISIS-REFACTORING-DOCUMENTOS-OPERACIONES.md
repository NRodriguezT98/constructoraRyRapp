# 📊 ANÁLISIS ESTRATÉGICO: REFACTORING DE OPERACIONES DE DOCUMENTOS

**Fecha:** 2025-01-29  
**Contexto:** Evaluar si las operaciones de documentos (Editar, Nueva Versión, Archivar, Eliminar) deben seguir el patrón genérico implementado en Reemplazar Archivo  
**Objetivo:** Reducir duplicación de código y mantener consistencia arquitectónica  

---

## 🎯 RESUMEN EJECUTIVO

### ✅ Estado Actual

| Operación | Servicio | Estado | Prioridad | Esfuerzo |
|-----------|----------|--------|-----------|----------|
| **Reemplazar Archivo** | `documentos-reemplazo.service.ts` | ✅ **GENÉRICO** | ✅ Completado | - |
| **Nueva Versión** | `documentos-versiones.service.ts` | ✅ **GENÉRICO** | ✅ Completado | - |
| **Editar Metadatos** | Modal + Hook | ✅ **GENÉRICO** | ✅ Completado | - |
| **Archivar/Restaurar** | `documentos-eliminacion.service.ts` | ❌ **HARDCODED** | 🔴 CRÍTICA | 4 hrs |
| **Eliminar (Soft)** | `documentos-eliminacion.service.ts` | ❌ **HARDCODED** | 🔴 CRÍTICA | (incluido) |
| **Eliminar Definitivo** | `documentos-eliminacion.service.ts` | ❌ **HARDCODED** | 🔴 CRÍTICA | (incluido) |
| **Papelera** | `documentos-eliminacion.service.ts` | ❌ **HARDCODED** | 🔴 CRÍTICA | (incluido) |

### 🎁 Hallazgo Sorpresa

**¡Ya tienes más trabajo hecho de lo que pensabas!**

- ✅ **Versiones Service** → YA ES 100% GENÉRICO (todas las operaciones usan `tipoEntidad`)
- ✅ **Reemplazo Service** → Completado en sesión anterior
- ✅ **Modales** → DocumentoEditarMetadatosModal y DocumentoNuevaVersionModal YA tienen prop `tipoEntidad`

### 🚨 Punto Crítico

**Solo 1 servicio necesita refactoring:** `documentos-eliminacion.service.ts`

Este servicio maneja **4 funcionalidades críticas** usadas en todos los módulos:
1. Archivar documento
2. Restaurar documento archivado
3. Eliminar documento (soft delete)
4. Eliminar definitivo (hard delete)

**Todas están hardcoded a:**
- Tabla: `'documentos_proyecto'`
- Bucket: `'documentos-proyectos'`

---

## 📋 INVENTARIO DETALLADO

### ✅ 1. Servicio de Versiones (YA GENÉRICO)

**Ubicación:** `src/modules/documentos/services/documentos-versiones.service.ts`

**Métodos genéricos (todos usan `tipoEntidad`):**

```typescript
// ✅ Todos los métodos ya tienen este patrón
static async crearNuevaVersion(
  documentoId: string,
  archivo: File,
  usuarioId: string,
  tipoEntidad: TipoEntidad, // ← YA GENÉRICO
  cambios?: string,
  nuevoTitulo?: string,
  nuevaFechaDocumento?: string,
  nuevaFechaVencimiento?: string
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla
  const bucket = config.bucket
  // ... resto del código usa config
}
```

**Métodos disponibles:**
- ✅ `crearNuevaVersion(tipoEntidad)` → Crear versión nueva
- ✅ `obtenerVersiones(tipoEntidad)` → Listar versiones
- ✅ `restaurarVersion(tipoEntidad)` → Restaurar versión antigua
- ✅ `eliminarVersion(tipoEntidad)` → Eliminar versión específica
- ✅ `obtenerUltimaVersion(tipoEntidad)` → Obtener versión actual

**Conclusión:** ✅ **NO NECESITA REFACTORING** (ya cumple el estándar)

---

### ✅ 2. Servicio de Reemplazo (COMPLETADO SESIÓN ANTERIOR)

**Ubicación:** `src/modules/documentos/services/documentos-reemplazo.service.ts`

**Características:**
- ✅ 100% genérico con patrón `tipoEntidad`
- ✅ Rollback automático en caso de error
- ✅ Verificación de backup antes de eliminar archivo anterior
- ✅ Auditoría completa con metadata de reemplazo
- ✅ Documentado con ejemplos de uso

**Conclusión:** ✅ **COMPLETADO** (referencia para otros servicios)

---

### ✅ 3. Modal Editar Metadatos (YA GENÉRICO)

**Ubicación:** `src/modules/documentos/components/modals/DocumentoEditarMetadatosModal.tsx`

**Interfaz:**
```typescript
interface DocumentoEditarMetadatosModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  categorias: CategoriaDocumento[]
  tipoEntidad?: TipoEntidad // ← YA TIENE PROP GENÉRICA
  onClose: () => void
  onEditado?: () => void | Promise<void>
}
```

**Hook usado:**
```typescript
const { editando, editarMetadatos } = useDocumentoEditar()

// ✅ editarMetadatos acepta tipoEntidad
await editarMetadatos(documento.id, {...}, tipoEntidad)
```

**Conclusión:** ✅ **YA GENÉRICO** (listo para usar en cualquier módulo)

---

### ✅ 4. Modal Nueva Versión (YA GENÉRICO)

**Ubicación:** `src/modules/documentos/components/modals/DocumentoNuevaVersionModal.tsx`

**Interfaz:**
```typescript
interface DocumentoNuevaVersionModalProps {
  isOpen: boolean
  documento: DocumentoProyecto
  onClose: () => void
  onSuccess?: () => void
  tipoEntidad?: TipoEntidad // ← YA TIENE PROP GENÉRICA
}
```

**Servicio usado:**
```typescript
await DocumentosService.crearNuevaVersion(
  documento.id,
  archivo,
  user.id,
  tipoEntidad, // ← YA USA TIPO GENÉRICO
  cambios,
  titulo,
  fechaDocumento,
  fechaVencimiento
)
```

**Conclusión:** ✅ **YA GENÉRICO** (listo para usar en cualquier módulo)

---

### ❌ 5. Servicio de Eliminación (NECESITA REFACTORING)

**Ubicación:** `src/modules/documentos/services/documentos-eliminacion.service.ts`

**Problema:** HARDCODED a proyectos en **347 líneas de código**

**Línea 8 - CONSTANTE HARDCODED:**
```typescript
const BUCKET_NAME = 'documentos-proyectos' // ❌ HARDCODED
```

**Métodos afectados (TODOS hardcoded):**

#### 5.1. Archivar Documento
```typescript
// ❌ PROBLEMA ACTUAL
static async archivarDocumento(documentoId: string): Promise<void> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto') // ❌ HARDCODED
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  // ... actualización también hardcoded
  await supabase
    .from('documentos_proyecto') // ❌ HARDCODED
    .update({ estado: 'archivado' })
}
```

**Solución requerida:**
```typescript
// ✅ PATRÓN CORRECTO
static async archivarDocumento(
  documentoId: string,
  tipoEntidad: TipoEntidad // ← AGREGAR
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data: documento, error: getError } = await supabase
    .from(tabla) // ✅ GENÉRICO
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  // ... actualización con tabla genérica
  await supabase
    .from(tabla) // ✅ GENÉRICO
    .update({ estado: 'archivado' })
}
```

#### 5.2. Restaurar Documento Archivado
```typescript
// ❌ ACTUAL: Hardcoded
static async restaurarDocumentoArchivado(documentoId: string): Promise<void>

// ✅ REQUERIDO: Genérico
static async restaurarDocumentoArchivado(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void>
```

#### 5.3. Eliminar Documento (Soft Delete)
```typescript
// ❌ ACTUAL: Hardcoded
static async eliminarDocumento(documentoId: string): Promise<void>

// ✅ REQUERIDO: Genérico
static async eliminarDocumento(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void>
```

#### 5.4. Eliminar Definitivo (Hard Delete)
```typescript
// ❌ ACTUAL: Hardcoded + Storage hardcoded
static async eliminarDefinitivo(documentoId: string): Promise<void> {
  // ...
  await supabase.storage.from(BUCKET_NAME).remove([...]) // ❌ BUCKET HARDCODED
}

// ✅ REQUERIDO: Genérico
static async eliminarDefinitivo(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  await supabase.storage.from(config.bucket).remove([...]) // ✅ GENÉRICO
}
```

#### 5.5. Obtener Documentos Archivados
```typescript
// ❌ ACTUAL: Solo proyectos, hardcoded query
static async obtenerDocumentosArchivados(
  proyectoId: string
): Promise<DocumentoProyecto[]> {
  const { data, error } = await supabase
    .from('documentos_proyecto') // ❌ HARDCODED
    .select(`
      *,
      usuario:usuarios!fk_documentos_proyecto_subido_por (...)
    `)
    .eq('proyecto_id', proyectoId) // ❌ CAMPO HARDCODED
}

// ✅ REQUERIDO: Genérico
static async obtenerDocumentosArchivados(
  entidadId: string,
  tipoEntidad: TipoEntidad
): Promise<DocumentoProyecto[]> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)

  const { data, error } = await supabase
    .from(config.tabla) // ✅ GENÉRICO
    .select(`
      *,
      usuario:usuarios (...)
    `)
    .eq(config.campoEntidad, entidadId) // ✅ GENÉRICO
}
```

#### 5.6. Obtener Documentos Eliminados (Papelera)
```typescript
// ❌ ACTUAL: Solo proyectos, no filtra por entidad
static async obtenerDocumentosEliminados(): Promise<DocumentoProyecto[]> {
  const { data, error } = await supabase
    .from('documentos_proyecto') // ❌ HARDCODED
    .select(`
      *,
      proyectos(nombre), // ❌ JOIN HARDCODED
      usuarios(...)
    `)
    .eq('estado', 'eliminado')
}

// ✅ REQUERIDO: Genérico
static async obtenerDocumentosEliminados(
  tipoEntidad?: TipoEntidad // ← Opcional para ver todos o filtrar
): Promise<DocumentoProyecto[]> {
  const config = tipoEntidad
    ? obtenerConfiguracionEntidad(tipoEntidad)
    : null

  const tabla = config?.tabla || 'documentos_proyecto'

  const { data, error } = await supabase
    .from(tabla) // ✅ GENÉRICO
    .select(`
      *,
      usuarios(...)
    `)
    .eq('estado', 'eliminado')
}
```

**Métodos totales a refactorizar:** 7

---

## 🎯 PLAN DE ACCIÓN

### 🔴 Fase 1: Refactoring de Eliminación (CRÍTICO - 4 horas)

**Objetivo:** Hacer genérico `documentos-eliminacion.service.ts`

**Tareas:**

1. **Eliminar constante hardcoded** (5 min)
   ```typescript
   // ❌ ELIMINAR
   const BUCKET_NAME = 'documentos-proyectos'
   ```

2. **Agregar parámetro tipoEntidad a TODOS los métodos** (30 min)
   - `archivarDocumento(documentoId, tipoEntidad)`
   - `restaurarDocumentoArchivado(documentoId, tipoEntidad)`
   - `eliminarDocumento(documentoId, tipoEntidad)`
   - `eliminarDefinitivo(documentoId, tipoEntidad)`
   - `obtenerDocumentosArchivados(entidadId, tipoEntidad)`
   - `obtenerDocumentosEliminados(tipoEntidad?)` ← Opcional
   - `obtenerVersionesEliminadas(documentoId, tipoEntidad)`
   - `restaurarVersionesSeleccionadas(versionIds, tipoEntidad)`
   - `restaurarDocumentoEliminado(documentoId, tipoEntidad)`

3. **Reemplazar queries hardcoded** (1 hora)
   - Todos los `.from('documentos_proyecto')` → `.from(config.tabla)`
   - Todos los `.eq('proyecto_id', ...)` → `.eq(config.campoEntidad, ...)`
   - Todos los `storage.from(BUCKET_NAME)` → `storage.from(config.bucket)`

4. **Actualizar facade (documentos.service.ts)** (20 min)
   ```typescript
   // ✅ AGREGAR wrappers con tipoEntidad
   static async archivarDocumento(
     documentoId: string,
     tipoEntidad: TipoEntidad = 'proyecto'
   ) {
     return DocumentosEliminacionService.archivarDocumento(documentoId, tipoEntidad)
   }
   ```

5. **Actualizar llamadas en componentes** (1.5 horas)
   - `documento-card.tsx` (proyectos)
   - `documento-card-horizontal.tsx` (proyectos)
   - `documento-card-vivienda.tsx` (viviendas) ← Si existe
   - `documento-card-cliente.tsx` (clientes) ← Si existe
   - Agregar prop `tipoEntidad` a componentes

6. **Testing exhaustivo** (1 hora)
   - Archivar en proyectos
   - Archivar en viviendas
   - Archivar en clientes
   - Eliminar en proyectos
   - Eliminar en viviendas
   - Eliminar en clientes
   - Restaurar en cada módulo
   - Papelera global

7. **Documentación** (15 min)
   - Actualizar comentarios JSDoc
   - Crear ejemplos de uso
   - Actualizar guías de módulos

**Entregable:**
- ✅ Servicio de eliminación 100% genérico
- ✅ Componentes actualizados en 3 módulos
- ✅ Testing completo
- ✅ Documentación actualizada

---

### ✅ Fase 2: Validación de Integración (OPCIONAL - 1 hora)

**Objetivo:** Verificar que TODOS los modales genéricos funcionen en los 3 módulos

**Checklist:**

| Modal | Proyectos | Viviendas | Clientes |
|-------|-----------|-----------|----------|
| Reemplazar Archivo | ✅ | ⚠️ Validar | ⚠️ Validar |
| Editar Metadatos | ✅ | ⚠️ Validar | ⚠️ Validar |
| Nueva Versión | ✅ | ⚠️ Validar | ⚠️ Validar |
| Archivar | ⚠️ Pendiente refactor | ⚠️ Pendiente | ⚠️ Pendiente |
| Eliminar | ⚠️ Pendiente refactor | ⚠️ Pendiente | ⚠️ Pendiente |

**Tareas:**
1. Probar modal de reemplazo en viviendas
2. Probar modal de reemplazo en clientes
3. Probar modal de edición en viviendas
4. Probar modal de edición en clientes
5. Probar modal de nueva versión en viviendas
6. Probar modal de nueva versión en clientes

---

## 📊 IMPACTO ESTIMADO

### Reducción de Duplicación

**Antes del refactoring:**
- Servicio de eliminación: 347 líneas × 3 módulos = **~1,041 líneas duplicadas**

**Después del refactoring:**
- Servicio genérico: 347 líneas × 1 = **347 líneas**
- Ahorro: **~694 líneas de código** (66% reducción)

### Beneficios

| Categoría | Beneficio |
|-----------|-----------|
| **Mantenibilidad** | Un solo lugar para arreglar bugs (no 3) |
| **Consistencia** | Mismo comportamiento en todos los módulos |
| **Extensibilidad** | Agregar módulo nuevo = 0 líneas de servicio |
| **Testing** | 1 suite de tests cubre todos los casos |
| **Documentación** | Guía única para todas las entidades |

---

## 🚀 RECOMENDACIÓN FINAL

### ✅ **PROCEDER CON REFACTORING**

**Razones:**

1. **Consistencia arquitectónica**
   - Ya tienes el patrón establecido (reemplazo, versiones)
   - Eliminación es la ÚNICA excepción

2. **Alto impacto, bajo riesgo**
   - 4 horas de trabajo
   - Patrón probado y documentado
   - Testing exhaustivo posible

3. **Evitar deuda técnica**
   - Si no se hace ahora, se duplicará en viviendas/clientes
   - Cada módulo nuevo requerirá copiar/pegar

4. **Preparación para nuevos módulos**
   - Contratos (próximamente)
   - Proveedores (próximamente)
   - Con refactoring: **0 líneas de servicio nuevas**
   - Sin refactoring: **+347 líneas por módulo**

---

## 📝 CHECKLIST DE EJECUCIÓN

**Antes de empezar:**
- [ ] Backup de `documentos-eliminacion.service.ts`
- [ ] Branch de Git: `feature/refactor-eliminacion-generico`
- [ ] Documentar firma actual de métodos (para rollback)

**Durante refactoring:**
- [ ] Eliminar `BUCKET_NAME` hardcoded
- [ ] Agregar `tipoEntidad` a 9 métodos
- [ ] Reemplazar queries con `config.tabla`
- [ ] Reemplazar campos con `config.campoEntidad`
- [ ] Reemplazar bucket con `config.bucket`
- [ ] Actualizar facade `documentos.service.ts`
- [ ] Actualizar componentes de proyectos
- [ ] Actualizar componentes de viviendas (si existen)
- [ ] Actualizar componentes de clientes (si existen)

**Testing:**
- [ ] Archivar documento en proyectos
- [ ] Restaurar documento archivado en proyectos
- [ ] Eliminar documento en proyectos
- [ ] Restaurar desde papelera en proyectos
- [ ] Eliminar definitivo en proyectos
- [ ] Repetir en viviendas
- [ ] Repetir en clientes
- [ ] Ver papelera global (todos los módulos)

**Post-refactoring:**
- [ ] Actualizar documentación de arquitectura
- [ ] Crear guía de uso para nuevos módulos
- [ ] Commit y PR
- [ ] Code review
- [ ] Merge a main

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

**Patrón genérico establecido:**
- ✅ `docs/MODAL-REEMPLAZO-GENERICO-GUIA.md`
- ✅ `docs/REFACTOR-MODAL-REEMPLAZO-THEMING.md`
- ✅ `src/modules/documentos/services/documentos-reemplazo.service.ts`
- ✅ `src/modules/documentos/services/documentos-versiones.service.ts`
- ✅ `src/modules/documentos/types/entidad.types.ts` (factory)

**Archivos a modificar:**
- ❌ `src/modules/documentos/services/documentos-eliminacion.service.ts` (347 líneas)
- ⚠️ `src/modules/documentos/services/documentos.service.ts` (facade)
- ⚠️ `src/modules/documentos/components/lista/documento-card.tsx`
- ⚠️ `src/modules/documentos/components/lista/documento-card-horizontal.tsx`
- ⚠️ Componentes de viviendas (si existen)
- ⚠️ Componentes de clientes (si existen)

---

## 🎉 CONCLUSIÓN

**¡Excelente decisión estratégica!**

El refactoring del servicio de eliminación es el **último paso** para tener un sistema de documentos **100% genérico** que funcione perfectamente en:
- ✅ Proyectos
- ✅ Viviendas
- ✅ Clientes
- ✅ **Cualquier módulo futuro** (sin código adicional)

**Esfuerzo:** 4 horas  
**Impacto:** Reducción de 66% en duplicación  
**ROI:** Alto (evita ~700 líneas por cada módulo nuevo)  

**Estado del proyecto después del refactoring:**
```
Sistema de Documentos - COMPLETAMENTE GENÉRICO
├── Reemplazar Archivo     ✅ GENÉRICO
├── Nueva Versión          ✅ GENÉRICO
├── Editar Metadatos       ✅ GENÉRICO
├── Archivar/Restaurar     ✅ GENÉRICO (después de refactoring)
├── Eliminar (Soft)        ✅ GENÉRICO (después de refactoring)
└── Eliminar Definitivo    ✅ GENÉRICO (después de refactoring)
```

**¿Listo para empezar? 🚀**
