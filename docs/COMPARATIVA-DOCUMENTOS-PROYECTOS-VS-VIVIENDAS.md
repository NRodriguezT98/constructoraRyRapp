# 📊 ANÁLISIS COMPARATIVO: SISTEMA DOCUMENTOS PROYECTOS VS VIVIENDAS

## 🎯 Objetivo
Identificar diferencias entre el sistema de documentos de Proyectos y Viviendas para lograr paridad de funcionalidades.

---

## ✅ LO QUE VIVIENDAS YA TIENE (Implementado 2025-01-06)

### Base de Datos
- ✅ Tabla `documentos_vivienda` (17 columnas)
- ✅ 8 categorías predefinidas del sistema (auto-seed)
- ✅ Vista `vista_documentos_vivienda`
- ✅ Storage bucket `documentos-viviendas` con RLS
- ✅ Políticas RLS completas

### Backend/Lógica
- ✅ `DocumentosViviendaService` (service dedicado)
- ✅ `useDocumentosVivienda` (React Query hooks)
- ✅ `useCategoriasSistemaViviendas` (categorías + auto-detección)
- ✅ `useDocumentoUploadVivienda` (lógica formulario)
- ✅ `useDocumentosListaVivienda` (lógica lista)
- ✅ Auto-categorización por nombre de archivo

### Componentes UI
- ✅ `DocumentoUploadVivienda` (formulario upload)
- ✅ `DocumentosListaVivienda` (lista con cards)
- ✅ `DocumentoCardCompacto` (card individual)
- ✅ Animaciones Framer Motion
- ✅ Empty state personalizado

### Funcionalidades
- ✅ Subir documentos (PDF, JPG, PNG)
- ✅ Listar documentos
- ✅ Descargar documentos
- ✅ Eliminar documentos (solo Admin)
- ✅ Auto-categorización
- ✅ Validación de archivos
- ✅ Toast notifications

---

## ❌ LO QUE FALTA EN VIVIENDAS (Comparado con Proyectos)

### 🔴 CRÍTICO - Funcionalidades Core

#### 1. **Sistema de Versionado**
**Proyectos tiene:**
- ✅ Tabla con `version`, `es_version_actual`, `documento_padre_id`
- ✅ Crear nueva versión de documento existente
- ✅ Ver historial de versiones
- ✅ Comparar versiones
- ✅ Restaurar versión anterior
- ✅ Modal de versiones con timeline

**Viviendas:**
- ❌ NO tiene versionado implementado
- ❌ Falta `DocumentoVersionesModalVivienda` funcional
- ❌ Falta servicio `crearNuevaVersion()`

**Archivos involucrados:**
- ✅ Existe: `documento-versiones-modal-vivienda.tsx` (PERO POSIBLEMENTE INCOMPLETO)
- ❌ Falta: Integración completa con hooks

---

#### 2. **Marcar Documentos como Importantes**
**Proyectos tiene:**
- ✅ Campo `es_importante` en tabla
- ✅ Toggle para marcar/desmarcar
- ✅ Badge visual "Importante"
- ✅ Filtro por documentos importantes
- ✅ Vista destacada en UI

**Viviendas:**
- ⚠️ Campo existe en BD (`es_importante`)
- ❌ NO hay UI para marcar/desmarcar
- ❌ NO hay badge visual
- ❌ NO hay filtro

**Archivos a crear:**
- ❌ Toggle en `DocumentoCardCompacto`
- ❌ Servicio `toggleImportante()`

---

#### 3. **Etiquetas (Tags) Personalizadas**
**Proyectos tiene:**
- ✅ Campo `etiquetas` (array de strings)
- ✅ Input para agregar múltiples tags
- ✅ Autocomplete de tags existentes
- ✅ Filtro por etiquetas
- ✅ Vista chips coloridos

**Viviendas:**
- ⚠️ Campo existe en BD (`etiquetas`)
- ❌ NO hay UI para agregar tags
- ❌ NO hay autocomplete
- ❌ NO hay filtro

**Archivos a crear:**
- ❌ `EtiquetasInput` component
- ❌ Lógica en upload/edición

---

#### 4. **Fechas de Documento y Vencimiento**
**Proyectos tiene:**
- ✅ Campos `fecha_documento`, `fecha_vencimiento`
- ✅ Inputs de fecha en formulario
- ✅ Alertas de documentos próximos a vencer (30 días)
- ✅ Badge visual "Próximo a vencer"
- ✅ Vista/filtro de documentos vencidos

**Viviendas:**
- ⚠️ Campos existen en BD
- ❌ NO hay inputs en formulario
- ❌ NO hay alertas
- ❌ NO hay badge visual

**Archivos a crear:**
- ❌ Inputs fecha en `DocumentoUploadVivienda`
- ❌ Servicio `obtenerProximosAVencer()`
- ❌ Badge/alerta en card

---

#### 5. **Metadata Personalizable (JSON)**
**Proyectos tiene:**
- ✅ Campo `metadata` (JSONB)
- ✅ UI para agregar key-value pairs
- ✅ Vista de metadata en card

**Viviendas:**
- ⚠️ Campo existe en BD (`metadata`)
- ❌ NO hay UI para editar
- ❌ NO hay vista

---

#### 6. **Estados de Documento (Activo/Archivado)**
**Proyectos tiene:**
- ✅ Campo `estado` ('activo', 'archivado')
- ✅ Acción "Archivar" (soft delete)
- ✅ Filtro activos/archivados
- ✅ Restaurar documento archivado

**Viviendas:**
- ⚠️ Campo existe en BD (`estado`)
- ⚠️ Eliminación es HARD DELETE (no archiva)
- ❌ NO hay acción archivar
- ❌ NO hay filtro

**Archivos a modificar:**
- ✅ `useDocumentosListaVivienda` (cambiar delete por archive)

---

### 🟡 IMPORTANTE - Mejoras de UX

#### 7. **Filtros Avanzados**
**Proyectos tiene:**
- ✅ Filtro por categoría
- ✅ Filtro por etiquetas
- ✅ Filtro por estado (activo/archivado)
- ✅ Filtro por rango de fechas
- ✅ Búsqueda por nombre
- ✅ Filtro "Solo importantes"

**Viviendas:**
- ⚠️ SOLO tiene búsqueda básica
- ❌ Falta componente `DocumentosFiltros`

---

#### 8. **Visualizador de Documentos (Viewer)**
**Proyectos tiene:**
- ✅ Modal fullscreen para ver PDF/imágenes
- ✅ Navegación entre páginas (PDF)
- ✅ Zoom in/out
- ✅ Descarga desde viewer
- ✅ Ver metadata y versiones

**Viviendas:**
- ❌ NO tiene viewer
- ❌ Solo descarga directa

**Archivos a crear:**
- ❌ `DocumentoViewerVivienda` modal

---

#### 9. **Edición de Información**
**Proyectos tiene:**
- ✅ Modal para editar título, descripción
- ✅ Cambiar categoría
- ✅ Actualizar metadata
- ✅ Guardar cambios sin re-subir archivo

**Viviendas:**
- ⚠️ Existe modal `DocumentoRenombrarModal`
- ❌ Solo renombra título (limitado)
- ❌ No edita otros campos

**Archivos a ampliar:**
- ⚠️ `documento-renombrar-modal.tsx` → convertir en modal de edición completa

---

#### 10. **Reemplazo de Archivo**
**Proyectos tiene:**
- ✅ Reemplazar archivo físico sin cambiar metadata
- ✅ Mantiene historial (versión nueva)
- ✅ Confirmación con validación

**Viviendas:**
- ⚠️ Existe modal `ReemplazarArchivoModal`
- ❓ Estado: VERIFICAR si está completo

---

### 🟢 OPCIONAL - Nice to Have

#### 11. **Compartir Documentos (URLs Firmadas Temporales)**
**Proyectos tiene:**
- ✅ Generar URL temporal (1 hora)
- ✅ Copiar al portapapeles
- ✅ Compartir con usuarios externos

**Viviendas:**
- ❌ NO implementado

---

#### 12. **Notificaciones de Vencimiento**
**Proyectos tiene:**
- ✅ Email/notificación 7 días antes de vencer
- ✅ Dashboard con alertas

**Viviendas:**
- ❌ NO implementado

---

#### 13. **Auditoría de Accesos**
**Proyectos tiene:**
- ✅ Log de quién descargó/vio documento
- ✅ Timestamp de accesos

**Viviendas:**
- ❌ NO implementado

---

## 📋 PLAN DE ACCIÓN PRIORIZADO

### 🔴 Fase 1: CRÍTICO (Paridad Funcional Básica)
1. ✅ Sistema de versionado completo
2. ✅ Marcar como importante (toggle + badge)
3. ✅ Archivar en lugar de eliminar (soft delete)
4. ✅ Etiquetas personalizadas
5. ✅ Fechas (documento + vencimiento) con alertas

### 🟡 Fase 2: IMPORTANTE (Mejoras UX)
6. ✅ Filtros avanzados (categoría, tags, fechas, importante)
7. ✅ Visualizador de documentos (modal viewer)
8. ✅ Edición completa (no solo renombrar)

### 🟢 Fase 3: OPCIONAL (Enhancements)
9. ⚪ Compartir documentos (URLs temporales)
10. ⚪ Notificaciones de vencimiento
11. ⚪ Auditoría de accesos

---

## 🛠️ ARCHIVOS A CREAR/MODIFICAR

### Fase 1 - Crítico
```
src/modules/viviendas/
├── components/documentos/
│   ├── documento-versiones-modal-vivienda.tsx        # ✅ Existe (VERIFICAR)
│   ├── etiquetas-input.tsx                           # ❌ CREAR
│   ├── fecha-vencimiento-badge.tsx                   # ❌ CREAR
│   └── importante-toggle.tsx                         # ❌ CREAR
├── hooks/
│   └── useDocumentosListaVivienda.ts                 # ⚠️ MODIFICAR (soft delete)
├── services/
│   └── documentos-vivienda.service.ts                # ⚠️ AMPLIAR
└── types/
    └── documento-vivienda.types.ts                   # ⚠️ AMPLIAR
```

### Fase 2 - Importante
```
src/modules/viviendas/
├── components/documentos/
│   ├── documentos-filtros-vivienda.tsx               # ❌ CREAR
│   ├── documento-viewer-vivienda.tsx                 # ❌ CREAR
│   └── documento-editar-modal.tsx                    # ⚠️ AMPLIAR renombrar-modal
```

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual
- ✅ **FUNCIONAL**: Sistema básico de upload, lista, descarga y eliminación
- ⚠️ **LIMITADO**: Falta 50% de funcionalidades de Proyectos
- ❌ **CRÍTICO**: No tiene versionado, tags, ni fechas

### Recomendación
**IMPLEMENTAR FASE 1 COMPLETA** para lograr paridad funcional con Proyectos.
Esto dará a Viviendas las capacidades esenciales de gestión documental que los usuarios esperan.

**Tiempo estimado Fase 1**: 8-12 horas de desarrollo
**Tiempo estimado Fase 2**: 6-8 horas de desarrollo

---

## 📚 Referencias
- Módulo Proyectos: `src/modules/documentos/`
- Docs Proyectos: `docs/SISTEMA-DOCUMENTOS.md`
- Docs Viviendas: `docs/SISTEMA-DOCUMENTOS-VIVIENDAS-*.md`
- Schema BD: `supabase/schemas/schema.sql`
- Migración Viviendas: `supabase/migrations/20250106000001_sistema_documentos_viviendas.sql`
