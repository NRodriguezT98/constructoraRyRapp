# 🔧 PLAN DE EJECUCIÓN: Refactoring Servicio de Eliminación

**Archivo:** `documentos-eliminacion.service.ts`  
**Tiempo estimado:** 4 horas  
**Complejidad:** Media  
**Riesgo:** Bajo (patrón probado)  

---

## 📋 PREPARACIÓN (15 min)

### 1. Backup y Git

```powershell
# Crear branch
git checkout -b feature/refactor-eliminacion-generico

# Backup manual del archivo
Copy-Item "src\modules\documentos\services\documentos-eliminacion.service.ts" `
  -Destination "src\modules\documentos\services\documentos-eliminacion.service.BACKUP.ts"
```

### 2. Documentar Firmas Actuales

```typescript
// FIRMAS ANTES DEL REFACTORING (para rollback)

// ❌ Antes
static async archivarDocumento(documentoId: string): Promise<void>
static async restaurarDocumentoArchivado(documentoId: string): Promise<void>
static async eliminarDocumento(documentoId: string): Promise<void>
static async eliminarDefinitivo(documentoId: string): Promise<void>
static async obtenerDocumentosArchivados(proyectoId: string): Promise<DocumentoProyecto[]>
static async obtenerDocumentosEliminados(): Promise<DocumentoProyecto[]>
static async obtenerVersionesEliminadas(documentoId: string): Promise<DocumentoProyecto[]>
static async restaurarVersionesSeleccionadas(versionIds: string[]): Promise<void>
static async restaurarDocumentoEliminado(documentoId: string): Promise<void>
```

---

## 🛠️ REFACTORING DEL SERVICIO (2 horas)

### Paso 1: Imports y Constantes (5 min)

**Ubicación:** Líneas 1-11

```typescript
// ✅ ANTES (línea 1-11)
import { supabase } from '@/lib/supabase/client'
import type { DocumentoProyecto } from '../types/documento.types'

const BUCKET_NAME = 'documentos-proyectos' // ❌ ELIMINAR ESTA LÍNEA

/**
 * Servicio de eliminación de documentos (soft/hard delete)
 * Responsabilidades: archivar, eliminar (soft), restaurar, eliminar definitivo (hard)
 */
export class DocumentosEliminacionService {
```

```typescript
// ✅ DESPUÉS
import { supabase } from '@/lib/supabase/client'
import type { DocumentoProyecto } from '../types/documento.types'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../types/entidad.types'

/**
 * ✅ SERVICIO GENÉRICO: Eliminación de documentos (soft/hard delete)
 * Soporta: proyectos, viviendas, clientes, contratos, proveedores
 * Responsabilidades: archivar, eliminar (soft), restaurar, eliminar definitivo (hard)
 */
export class DocumentosEliminacionService {
```

---

### Paso 2: archivarDocumento() (15 min)

**Ubicación:** Líneas 13-31

```typescript
// ❌ ANTES
static async archivarDocumento(documentoId: string): Promise<void> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto')
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { error } = await supabase
    .from('documentos_proyecto')
    .update({ estado: 'archivado' })
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

  if (error) throw error
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Archivar documento completo (todas las versiones)
 */
static async archivarDocumento(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data: documento, error: getError } = await supabase
    .from(tabla)
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { error } = await supabase
    .from(tabla)
    .update({ estado: 'archivado' })
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

  if (error) throw error
}
```

---

### Paso 3: restaurarDocumentoArchivado() (10 min)

**Ubicación:** Líneas 33-51

```typescript
// ❌ ANTES
static async restaurarDocumentoArchivado(documentoId: string): Promise<void> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto')
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { error } = await supabase
    .from('documentos_proyecto')
    .update({ estado: 'activo' })
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

  if (error) throw error
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Restaurar documento archivado (todas las versiones)
 */
static async restaurarDocumentoArchivado(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data: documento, error: getError } = await supabase
    .from(tabla)
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { error } = await supabase
    .from(tabla)
    .update({ estado: 'activo' })
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)

  if (error) throw error
}
```

---

### Paso 4: obtenerDocumentosArchivados() (15 min)

**Ubicación:** Líneas 53-73

```typescript
// ❌ ANTES
static async obtenerDocumentosArchivados(
  proyectoId: string
): Promise<DocumentoProyecto[]> {
  const { data, error } = await supabase
    .from('documentos_proyecto')
    .select(`
      *,
      usuario:usuarios!fk_documentos_proyecto_subido_por (
        nombres,
        apellidos,
        email
      )
    `)
    .eq('proyecto_id', proyectoId)
    .eq('estado', 'archivado')
    .eq('es_version_actual', true)
    .order('fecha_creacion', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as DocumentoProyecto[]
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Obtener documentos archivados de una entidad
 */
static async obtenerDocumentosArchivados(
  entidadId: string,
  tipoEntidad: TipoEntidad
): Promise<DocumentoProyecto[]> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data, error } = await supabase
    .from(tabla)
    .select(`
      *,
      usuario:usuarios (
        nombres,
        apellidos,
        email
      )
    `)
    .eq(config.campoEntidad, entidadId)
    .eq('estado', 'archivado')
    .eq('es_version_actual', true)
    .order('fecha_creacion', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as DocumentoProyecto[]
}
```

---

### Paso 5: eliminarDocumento() (15 min)

**Ubicación:** Líneas 75-120

```typescript
// ❌ ANTES (parcial - solo cambios clave)
static async eliminarDocumento(documentoId: string): Promise<void> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id, documento_padre_id, version, es_version_actual')
    .eq('id', documentoId)
    .single()

  // ...

  const { data: versiones, error: versionesError } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id, version, es_version_actual')
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
    .eq('estado', 'activo')
    .order('version', { ascending: false })

  // ...

  const { error: updateError } = await supabase
    .from('documentos_proyecto') // ❌
    .update({ estado: 'eliminado' })
    .in('id', idsAEliminar)

  // ...

  const { error: flagError } = await supabase
    .from('documentos_proyecto') // ❌
    .update({ es_version_actual: true })
    .eq('id', versionMasAlta.id)
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Eliminar documento (soft delete)
 * Elimina el documento y TODAS sus versiones
 */
static async eliminarDocumento(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void> {
  console.log('🗑️ Eliminando documento (soft delete):', documentoId)

  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data: documento, error: getError } = await supabase
    .from(tabla)
    .select('id, documento_padre_id, version, es_version_actual')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { data: versiones, error: versionesError } = await supabase
    .from(tabla)
    .select('id, version, es_version_actual')
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
    .eq('estado', 'activo')
    .order('version', { ascending: false })

  if (versionesError) throw versionesError

  console.log(`📊 Eliminando ${versiones?.length || 0} versiones activas`)

  if (versiones && versiones.length > 0) {
    const versionMasAlta = versiones[0]
    const idsAEliminar = versiones.map((v) => v.id)

    const { error: updateError } = await supabase
      .from(tabla)
      .update({ estado: 'eliminado' })
      .in('id', idsAEliminar)

    if (updateError) throw updateError

    const { error: flagError } = await supabase
      .from(tabla)
      .update({ es_version_actual: true })
      .eq('id', versionMasAlta.id)

    if (flagError) throw flagError

    console.log(`✅ ${versiones.length} versiones eliminadas`)
  }
}
```

---

### Paso 6: obtenerDocumentosEliminados() (15 min)

**Ubicación:** Líneas 122-139

```typescript
// ❌ ANTES
static async obtenerDocumentosEliminados(): Promise<DocumentoProyecto[]> {
  const { data, error } = await supabase
    .from('documentos_proyecto')
    .select(`
      *,
      proyectos(nombre),
      usuarios(nombres, apellidos, email)
    `)
    .eq('estado', 'eliminado')
    .eq('es_version_actual', true)
    .order('fecha_actualizacion', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as DocumentoProyecto[]
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Obtener documentos eliminados (Papelera)
 * @param tipoEntidad - Opcional: filtra por tipo de entidad. Si no se provee, muestra todos
 */
static async obtenerDocumentosEliminados(
  tipoEntidad?: TipoEntidad
): Promise<DocumentoProyecto[]> {
  // Si se especifica tipo, usar tabla específica
  const config = tipoEntidad
    ? obtenerConfiguracionEntidad(tipoEntidad)
    : null

  const tabla = config?.tabla || 'documentos_proyecto' // Fallback para compatibilidad

  const { data, error } = await supabase
    .from(tabla)
    .select(`
      *,
      usuarios(nombres, apellidos, email)
    `)
    .eq('estado', 'eliminado')
    .eq('es_version_actual', true)
    .order('fecha_actualizacion', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as DocumentoProyecto[]
}
```

---

### Paso 7: obtenerVersionesEliminadas() (10 min)

**Ubicación:** Líneas 141-165

```typescript
// ❌ ANTES
static async obtenerVersionesEliminadas(
  documentoId: string
): Promise<DocumentoProyecto[]> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto')
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { data, error } = await supabase
    .from('documentos_proyecto')
    .select(`
      *,
      usuario:usuarios!fk_documentos_proyecto_subido_por (
        nombres,
        apellidos,
        email
      )
    `)
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
    .eq('estado', 'eliminado')
    .order('version', { ascending: true })

  if (error) throw error
  return (data || []) as unknown as DocumentoProyecto[]
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Obtener versiones eliminadas de un documento
 */
static async obtenerVersionesEliminadas(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<DocumentoProyecto[]> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data: documento, error: getError } = await supabase
    .from(tabla)
    .select('id, documento_padre_id')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  const documentoPadreId = documento.documento_padre_id || documentoId

  const { data, error } = await supabase
    .from(tabla)
    .select(`
      *,
      usuario:usuarios (
        nombres,
        apellidos,
        email
      )
    `)
    .or(`id.eq.${documentoPadreId},documento_padre_id.eq.${documentoPadreId}`)
    .eq('estado', 'eliminado')
    .order('version', { ascending: true })

  if (error) throw error
  return (data || []) as unknown as DocumentoProyecto[]
}
```

---

### Paso 8: restaurarVersionesSeleccionadas() (10 min)

**Ubicación:** Líneas 167-177

```typescript
// ❌ ANTES
static async restaurarVersionesSeleccionadas(versionIds: string[]): Promise<void> {
  if (versionIds.length === 0) {
    throw new Error('Debe seleccionar al menos una versión para restaurar')
  }

  const { error } = await supabase
    .from('documentos_proyecto')
    .update({ estado: 'activo' })
    .in('id', versionIds)

  if (error) throw error
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Restaurar versiones seleccionadas
 */
static async restaurarVersionesSeleccionadas(
  versionIds: string[],
  tipoEntidad: TipoEntidad
): Promise<void> {
  if (versionIds.length === 0) {
    throw new Error('Debe seleccionar al menos una versión para restaurar')
  }

  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { error } = await supabase
    .from(tabla)
    .update({ estado: 'activo' })
    .in('id', versionIds)

  if (error) throw error
}
```

---

### Paso 9: restaurarDocumentoEliminado() (15 min)

**Ubicación:** Líneas 179-228

```typescript
// ❌ ANTES (parcial - solo queries clave)
static async restaurarDocumentoEliminado(documentoId: string): Promise<void> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id, documento_padre_id, es_version_actual')
    .eq('id', documentoId)
    .single()

  // ... lógica de restauración

  const { data: padre } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id')
    .eq('id', documento.documento_padre_id)
    .single()

  const { data: versiones } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id')
    .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
    .eq('estado', 'eliminado')

  const { error: updateError } = await supabase
    .from('documentos_proyecto') // ❌
    .update({ estado: 'activo' })
    .in('id', documentosARestaurar)
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Restaurar documento eliminado (con todas sus versiones)
 */
static async restaurarDocumentoEliminado(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla

  const { data: documento, error: getError } = await supabase
    .from(tabla)
    .select('id, documento_padre_id, es_version_actual')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  let documentosARestaurar: string[] = []

  if (documento.documento_padre_id) {
    const { data: padre } = await supabase
      .from(tabla)
      .select('id')
      .eq('id', documento.documento_padre_id)
      .single()

    if (padre) {
      const { data: versiones } = await supabase
        .from(tabla)
        .select('id')
        .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        documentosARestaurar = versiones.map((v) => v.id)
      }
    }
  } else {
    const { data: versiones } = await supabase
      .from(tabla)
      .select('id')
      .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
      .eq('estado', 'eliminado')

    if (versiones) {
      documentosARestaurar = versiones.map((v) => v.id)
    }
  }

  if (documentosARestaurar.length > 0) {
    const { error: updateError } = await supabase
      .from(tabla)
      .update({ estado: 'activo' })
      .in('id', documentosARestaurar)

    if (updateError) throw updateError
  } else {
    const { error } = await supabase
      .from(tabla)
      .update({ estado: 'activo' })
      .eq('id', documentoId)

    if (error) throw error
  }
}
```

---

### Paso 10: eliminarDefinitivo() (20 min)

**Ubicación:** Líneas 230-285

**⚠️ CRÍTICO: Este método usa Storage**

```typescript
// ❌ ANTES (parcial - solo cambios clave)
static async eliminarDefinitivo(documentoId: string): Promise<void> {
  const { data: documento, error: getError } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id, documento_padre_id, es_version_actual')
    .eq('id', documentoId)
    .single()

  // ...

  const { data: padre } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id')
    .eq('id', documento.documento_padre_id)
    .single()

  const { data: versiones } = await supabase
    .from('documentos_proyecto') // ❌
    .select('id, url_storage')
    .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
    .eq('estado', 'eliminado')

  // ❌ STORAGE HARDCODED
  for (const version of versiones) {
    try {
      await supabase.storage.from(BUCKET_NAME).remove([version.url_storage])
    } catch (err) {
      console.warn('⚠️ Error al eliminar archivo de Storage:', err)
    }
  }

  const { error: deleteError } = await supabase
    .from('documentos_proyecto') // ❌
    .delete()
    .in('id', documentosAEliminar)
}
```

```typescript
// ✅ DESPUÉS
/**
 * ✅ GENÉRICO: Eliminar definitivamente (hard delete - NO reversible)
 */
static async eliminarDefinitivo(
  documentoId: string,
  tipoEntidad: TipoEntidad
): Promise<void> {
  const config = obtenerConfiguracionEntidad(tipoEntidad)
  const tabla = config.tabla
  const bucket = config.bucket

  const { data: documento, error: getError } = await supabase
    .from(tabla)
    .select('id, documento_padre_id, es_version_actual')
    .eq('id', documentoId)
    .single()

  if (getError) throw getError
  if (!documento) throw new Error('Documento no encontrado')

  let documentosAEliminar: string[] = []

  if (documento.documento_padre_id) {
    const { data: padre } = await supabase
      .from(tabla)
      .select('id')
      .eq('id', documento.documento_padre_id)
      .single()

    if (padre) {
      const { data: versiones } = await supabase
        .from(tabla)
        .select('id, url_storage')
        .or(`id.eq.${padre.id},documento_padre_id.eq.${padre.id}`)
        .eq('estado', 'eliminado')

      if (versiones) {
        // ✅ STORAGE GENÉRICO
        for (const version of versiones) {
          try {
            await supabase.storage.from(bucket).remove([version.url_storage])
          } catch (err) {
            console.warn('⚠️ Error al eliminar archivo de Storage:', err)
          }
        }

        documentosAEliminar = versiones.map((v) => v.id)
      }
    }
  } else {
    const { data: versiones } = await supabase
      .from(tabla)
      .select('id, url_storage')
      .or(`id.eq.${documentoId},documento_padre_id.eq.${documentoId}`)
      .eq('estado', 'eliminado')

    if (versiones) {
      // ✅ STORAGE GENÉRICO
      for (const version of versiones) {
        try {
          await supabase.storage.from(bucket).remove([version.url_storage])
        } catch (err) {
          console.warn('⚠️ Error al eliminar archivo de Storage:', err)
        }
      }

      documentosAEliminar = versiones.map((v) => v.id)
    }
  }

  // Eliminar registros de BD (DELETE físico)
  if (documentosAEliminar.length > 0) {
    const { error: deleteError } = await supabase
      .from(tabla)
      .delete()
      .in('id', documentosAEliminar)

    if (deleteError) throw deleteError
  }
}
```

---

## 🔄 ACTUALIZAR FACADE (30 min)

### Archivo: `documentos.service.ts`

```typescript
// ✅ AGREGAR wrappers genéricos con default tipoEntidad

/**
 * ✅ GENÉRICO: Archivar documento
 */
static async archivarDocumento(
  documentoId: string,
  tipoEntidad: TipoEntidad = 'proyecto'
): Promise<void> {
  return DocumentosEliminacionService.archivarDocumento(documentoId, tipoEntidad)
}

/**
 * ✅ GENÉRICO: Restaurar documento archivado
 */
static async restaurarDocumentoArchivado(
  documentoId: string,
  tipoEntidad: TipoEntidad = 'proyecto'
): Promise<void> {
  return DocumentosEliminacionService.restaurarDocumentoArchivado(documentoId, tipoEntidad)
}

/**
 * ✅ GENÉRICO: Eliminar documento (soft delete)
 */
static async eliminarDocumento(
  documentoId: string,
  tipoEntidad: TipoEntidad = 'proyecto'
): Promise<void> {
  return DocumentosEliminacionService.eliminarDocumento(documentoId, tipoEntidad)
}

/**
 * ✅ GENÉRICO: Eliminar definitivamente
 */
static async eliminarDefinitivo(
  documentoId: string,
  tipoEntidad: TipoEntidad = 'proyecto'
): Promise<void> {
  return DocumentosEliminacionService.eliminarDefinitivo(documentoId, tipoEntidad)
}

/**
 * ✅ GENÉRICO: Obtener documentos archivados
 */
static async obtenerDocumentosArchivados(
  entidadId: string,
  tipoEntidad: TipoEntidad = 'proyecto'
): Promise<DocumentoProyecto[]> {
  return DocumentosEliminacionService.obtenerDocumentosArchivados(entidadId, tipoEntidad)
}

/**
 * ✅ GENÉRICO: Obtener documentos eliminados (Papelera)
 */
static async obtenerDocumentosEliminados(
  tipoEntidad?: TipoEntidad
): Promise<DocumentoProyecto[]> {
  return DocumentosEliminacionService.obtenerDocumentosEliminados(tipoEntidad)
}
```

---

## 🎨 ACTUALIZAR COMPONENTES (1 hora)

### Componente: `documento-card.tsx`

**Buscar llamadas a:**
- `DocumentosService.archivarDocumento(...)`
- `DocumentosService.eliminarDocumento(...)`
- `DocumentosService.restaurarDocumentoArchivado(...)`

**Cambios:**

```typescript
// ❌ ANTES
const handleArchivar = async () => {
  try {
    await DocumentosService.archivarDocumento(documento.id)
    toast.success('Documento archivado')
  } catch (error) {
    toast.error('Error al archivar')
  }
}

// ✅ DESPUÉS (agregar tipoEntidad)
const handleArchivar = async () => {
  try {
    await DocumentosService.archivarDocumento(documento.id, 'proyecto') // ← AGREGAR
    toast.success('Documento archivado')
  } catch (error) {
    toast.error('Error al archivar')
  }
}
```

**Para hacer genérico el componente:**

```typescript
// Agregar prop tipoEntidad al componente
interface DocumentoCardProps {
  documento: DocumentoProyecto
  tipoEntidad?: TipoEntidad // ← AGREGAR
  onDeleted?: () => void
}

export function DocumentoCard({
  documento,
  tipoEntidad = 'proyecto', // ← DEFAULT
  onDeleted
}: DocumentoCardProps) {
  // ...

  const handleArchivar = async () => {
    try {
      await DocumentosService.archivarDocumento(documento.id, tipoEntidad) // ← USAR PROP
      toast.success('Documento archivado')
    } catch (error) {
      toast.error('Error al archivar')
    }
  }
}
```

---

## ✅ TESTING (1 hora)

### Checklist de Pruebas

**Proyectos:**
- [ ] Archivar documento
- [ ] Restaurar documento archivado
- [ ] Ver documentos archivados
- [ ] Eliminar documento
- [ ] Restaurar desde papelera
- [ ] Eliminar definitivo
- [ ] Verificar archivo eliminado de Storage

**Viviendas:**
- [ ] Archivar documento
- [ ] Restaurar documento archivado
- [ ] Ver documentos archivados
- [ ] Eliminar documento
- [ ] Restaurar desde papelera
- [ ] Eliminar definitivo

**Clientes:**
- [ ] Archivar documento
- [ ] Restaurar documento archivado
- [ ] Ver documentos archivados
- [ ] Eliminar documento
- [ ] Restaurar desde papelera
- [ ] Eliminar definitivo

**Casos Edge:**
- [ ] Documento con múltiples versiones
- [ ] Restaurar versión específica
- [ ] Archivar/eliminar versión padre (debe afectar todas)
- [ ] Eliminar definitivo verifica que archivo existe antes

---

## 📝 COMMIT

```powershell
# Eliminar backup
Remove-Item "src\modules\documentos\services\documentos-eliminacion.service.BACKUP.ts"

# Verificar cambios
git status
git diff

# Commit
git add .
git commit -m "refactor(documentos): servicio de eliminación genérico

✅ Cambios:
- Eliminada constante BUCKET_NAME hardcoded
- Agregado parámetro tipoEntidad a todos los métodos
- Soporta proyectos, viviendas, clientes
- Actualizado facade documentos.service.ts
- Componentes actualizados con prop tipoEntidad

✅ Métodos refactorizados (9):
- archivarDocumento
- restaurarDocumentoArchivado
- obtenerDocumentosArchivados
- eliminarDocumento
- obtenerDocumentosEliminados
- obtenerVersionesEliminadas
- restaurarVersionesSeleccionadas
- restaurarDocumentoEliminado
- eliminarDefinitivo

✅ Testing completo en 3 módulos
"

# Push
git push origin feature/refactor-eliminacion-generico
```

---

## 🎉 VALIDACIÓN FINAL

**Checklist:**
- [ ] Todos los métodos tienen parámetro `tipoEntidad`
- [ ] Constante `BUCKET_NAME` eliminada
- [ ] Todas las queries usan `config.tabla`
- [ ] Todos los campos usan `config.campoEntidad`
- [ ] Storage usa `config.bucket`
- [ ] Facade actualizada con defaults
- [ ] Componentes funcionan en 3 módulos
- [ ] Tests pasados exitosamente
- [ ] Documentación JSDoc actualizada
- [ ] Commit realizado

**Tiempo real:** _____ horas  
**Problemas encontrados:** _____  
**Soluciones aplicadas:** _____  
