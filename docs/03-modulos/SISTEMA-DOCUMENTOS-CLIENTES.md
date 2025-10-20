# 📄 SISTEMA DE DOCUMENTOS PARA CLIENTES - Plan de Implementación

## 🎯 Objetivo

Replicar el sistema completo de documentos de proyectos para el módulo de clientes:
- Categorías personalizadas por usuario
- Upload de múltiples documentos
- Gestión completa (ver, descargar, eliminar, versionar)
- Integración con el tab "Documentos" del detalle de cliente

---

## 📊 Comparación: Proyectos vs Clientes

### **Tabla de Proyectos**
```sql
documentos_proyecto (
  id, proyecto_id, categoria_id, titulo, descripcion,
  nombre_archivo, nombre_original, tamano_bytes, tipo_mime,
  url_storage, etiquetas, version, es_version_actual,
  documento_padre_id, estado, metadata, subido_por,
  fecha_documento, fecha_vencimiento, es_importante,
  fecha_creacion, fecha_actualizacion
)
```

### **Tabla de Clientes (a crear)**
```sql
documentos_cliente (
  id, cliente_id, categoria_id, titulo, descripcion,
  nombre_archivo, nombre_original, tamano_bytes, tipo_mime,
  url_storage, etiquetas, version, es_version_actual,
  documento_padre_id, estado, metadata, subido_por,
  fecha_documento, fecha_vencimiento, es_importante,
  fecha_creacion, fecha_actualizacion
)
```

**Diferencia**: Solo cambia `proyecto_id` → `cliente_id`

---

## 🗄️ Base de Datos

### **1. Tabla `documentos_cliente`**

```sql
CREATE TABLE IF NOT EXISTS public.documentos_cliente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES public.categorias_documento(id) ON DELETE SET NULL,

  -- Info del documento
  titulo VARCHAR(500) NOT NULL,
  descripcion TEXT,

  -- Info del archivo
  nombre_archivo VARCHAR(500) NOT NULL,
  nombre_original VARCHAR(500) NOT NULL,
  tamano_bytes BIGINT NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  url_storage TEXT NOT NULL,

  -- Organización
  etiquetas TEXT[],

  -- Versionado
  version INTEGER NOT NULL DEFAULT 1,
  es_version_actual BOOLEAN NOT NULL DEFAULT TRUE,
  documento_padre_id UUID REFERENCES public.documentos_cliente(id) ON DELETE SET NULL,

  -- Estado
  estado VARCHAR(50) NOT NULL DEFAULT 'activo',
  metadata JSONB DEFAULT '{}',

  -- Auditoría
  subido_por TEXT NOT NULL,
  fecha_documento TIMESTAMP WITH TIME ZONE,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  es_importante BOOLEAN DEFAULT FALSE,

  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_docs_cliente_cliente_id ON public.documentos_cliente(cliente_id);
CREATE INDEX idx_docs_cliente_categoria_id ON public.documentos_cliente(categoria_id);
CREATE INDEX idx_docs_cliente_estado ON public.documentos_cliente(estado);
CREATE INDEX idx_docs_cliente_fecha_vencimiento ON public.documentos_cliente(fecha_vencimiento);
CREATE INDEX idx_docs_cliente_documento_padre_id ON public.documentos_cliente(documento_padre_id);
CREATE INDEX idx_docs_cliente_etiquetas ON public.documentos_cliente USING gin(etiquetas);
CREATE INDEX idx_docs_cliente_importante ON public.documentos_cliente(es_importante);

-- Trigger para updated_at
CREATE TRIGGER update_documentos_cliente_fecha_actualizacion
  BEFORE UPDATE ON public.documentos_cliente
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **2. RLS Policies**

```sql
-- Enable RLS
ALTER TABLE public.documentos_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Los usuarios pueden ver documentos de sus clientes"
  ON public.documentos_cliente FOR SELECT
  USING (auth.uid() = (subido_por::uuid));

CREATE POLICY "Los usuarios pueden crear documentos de sus clientes"
  ON public.documentos_cliente FOR INSERT
  WITH CHECK (auth.uid() = (subido_por::uuid));

CREATE POLICY "Los usuarios pueden actualizar sus documentos de clientes"
  ON public.documentos_cliente FOR UPDATE
  USING (auth.uid() = (subido_por::uuid))
  WITH CHECK (auth.uid() = (subido_por::uuid));

CREATE POLICY "Los usuarios pueden eliminar sus documentos de clientes"
  ON public.documentos_cliente FOR DELETE
  USING (auth.uid() = (subido_por::uuid));
```

### **3. Storage Bucket**

✅ **Ya existe**: `documentos-clientes` (creado en `supabase/storage-clientes.sql`)

**Estructura de carpetas**:
```
documentos-clientes/
└── {user_id}/
    └── {cliente_id}/
        ├── 1234567890-uuid.pdf
        ├── 1234567891-jpg.jpg
        └── 1234567892-docx.docx
```

---

## 🏗️ Arquitectura del Módulo

### **Carpetas a crear**

```
src/modules/clientes/
├── documentos/
│   ├── components/
│   │   ├── upload/
│   │   │   └── documento-upload-cliente.tsx
│   │   ├── lista/
│   │   │   ├── documentos-lista-cliente.tsx
│   │   │   ├── documento-card-cliente.tsx
│   │   │   └── documentos-filtros-cliente.tsx
│   │   ├── viewer/
│   │   │   └── documento-viewer-cliente.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useDocumentoUploadCliente.ts
│   │   ├── useDocumentosCliente.ts
│   │   └── index.ts
│   ├── services/
│   │   └── documentos-cliente.service.ts
│   ├── store/
│   │   └── documentos-cliente.store.ts
│   ├── types/
│   │   └── index.ts
│   └── README.md
```

**Nota**: Las categorías se REUTILIZAN del módulo `src/modules/documentos/` porque son compartidas (misma tabla `categorias_documento`).

---

## 📝 Tipos TypeScript

### **`src/modules/clientes/documentos/types/index.ts`**

```typescript
export interface DocumentoCliente {
  id: string
  cliente_id: string
  categoria_id: string | null
  titulo: string
  descripcion: string | null
  nombre_archivo: string
  nombre_original: string
  tamano_bytes: number
  tipo_mime: string
  url_storage: string
  etiquetas: string[] | null
  version: number
  es_version_actual: boolean
  documento_padre_id: string | null
  estado: string
  metadata: Record<string, any> | null
  subido_por: string
  fecha_documento: string | null
  fecha_vencimiento: string | null
  es_importante: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface SubirDocumentoClienteParams {
  archivo: File
  cliente_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  etiquetas?: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, any>
}
```

---

## 🔧 Service Layer

### **`src/modules/clientes/documentos/services/documentos-cliente.service.ts`**

```typescript
import { supabase } from '@/lib/supabase/client'
import type { DocumentoCliente, SubirDocumentoClienteParams } from '../types'

const BUCKET_NAME = 'documentos-clientes'

export class DocumentosClienteService {
  /**
   * Obtener todos los documentos de un cliente
   */
  static async obtenerDocumentosPorCliente(clienteId: string): Promise<DocumentoCliente[]> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('es_version_actual', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Subir un nuevo documento
   */
  static async subirDocumento(
    params: SubirDocumentoClienteParams,
    userId: string
  ): Promise<DocumentoCliente> {
    const {
      archivo,
      cliente_id,
      categoria_id,
      titulo,
      descripcion,
      etiquetas,
      fecha_documento,
      fecha_vencimiento,
      es_importante,
      metadata,
    } = params

    // 1. Generar nombre único
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${timestamp}-${crypto.randomUUID()}.${extension}`

    // 2. Path en storage: {user_id}/{cliente_id}/{filename}
    const storagePath = `${userId}/${cliente_id}/${nombreArchivo}`

    // 3. Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, archivo, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // 4. Crear registro en BD
    const { data: documento, error: dbError } = await supabase
      .from('documentos_cliente')
      .insert({
        cliente_id,
        categoria_id: categoria_id || null,
        titulo,
        descripcion: descripcion || null,
        nombre_archivo: nombreArchivo,
        nombre_original: archivo.name,
        tamano_bytes: archivo.size,
        tipo_mime: archivo.type,
        url_storage: storagePath,
        etiquetas: etiquetas || [],
        subido_por: userId,
        fecha_documento: fecha_documento || null,
        fecha_vencimiento: fecha_vencimiento || null,
        es_importante: es_importante || false,
        metadata: metadata || {},
        version: 1,
        es_version_actual: true,
        estado: 'activo',
      })
      .select()
      .single()

    if (dbError) {
      // Si falla BD, eliminar archivo
      await supabase.storage.from(BUCKET_NAME).remove([storagePath])
      throw dbError
    }

    return documento
  }

  /**
   * Obtener URL de descarga
   */
  static async obtenerUrlDescarga(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 3600) // 1 hora

    if (error) throw error
    return data.signedUrl
  }

  /**
   * Eliminar documento
   */
  static async eliminarDocumento(documentoId: string): Promise<void> {
    // 1. Obtener info del documento
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_cliente')
      .select('url_storage')
      .eq('id', documentoId)
      .single()

    if (fetchError) throw fetchError

    // 2. Eliminar de storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([documento.url_storage])

    if (storageError) throw storageError

    // 3. Eliminar de BD
    const { error: dbError } = await supabase
      .from('documentos_cliente')
      .delete()
      .eq('id', documentoId)

    if (dbError) throw dbError
  }

  /**
   * Actualizar documento
   */
  static async actualizarDocumento(
    documentoId: string,
    updates: Partial<DocumentoCliente>
  ): Promise<DocumentoCliente> {
    const { data, error } = await supabase
      .from('documentos_cliente')
      .update(updates)
      .eq('id', documentoId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

---

## 🎨 Componentes

### **1. DocumentoUploadCliente** (Modal de subida)

Similar a `DocumentoUpload` de proyectos, pero con:
- `clienteId` en lugar de `proyectoId`
- Bucket `documentos-clientes`
- Service `DocumentosClienteService`

### **2. DocumentosListaCliente** (Lista de documentos)

- Grid de cards con documentos
- Filtros por categoría, etiquetas, importantes
- Búsqueda por nombre
- Acciones: Ver, Descargar, Eliminar

### **3. DocumentoCardCliente** (Card individual)

- Preview del tipo de archivo (ícono según extensión)
- Nombre, tamaño, fecha
- Badges de categoría, etiquetas
- Badge "Importante" si aplica
- Botones de acción

---

## 🔄 Store Zustand

### **`src/modules/clientes/documentos/store/documentos-cliente.store.ts`**

```typescript
import { create } from 'zustand'
import type { DocumentoCliente } from '../types'
import type { CategoriaDocumento } from '@/modules/documentos/types/documento.types'
import { DocumentosClienteService } from '../services/documentos-cliente.service'
import { CategoriasService } from '@/modules/documentos/services/categorias.service'

interface DocumentosClienteState {
  // Datos
  documentos: DocumentoCliente[]
  categorias: CategoriaDocumento[]
  documentoSeleccionado: DocumentoCliente | null

  // Filtros
  categoriaFiltro: string | null
  etiquetasFiltro: string[]
  busqueda: string
  soloImportantes: boolean

  // Estados
  cargandoDocumentos: boolean
  subiendoDocumento: boolean

  // UI
  modalSubirAbierto: boolean
  modalViewerAbierto: boolean
  modalCategoriasAbierto: boolean

  // Acciones
  cargarDocumentos: (clienteId: string) => Promise<void>
  cargarCategorias: (userId: string) => Promise<void>
  subirDocumento: (params: any, userId: string) => Promise<void>
  eliminarDocumento: (documentoId: string) => Promise<void>

  // UI
  abrirModalSubir: () => void
  cerrarModalSubir: () => void
  abrirModalCategorias: () => void
  cerrarModalCategorias: () => void
  seleccionarDocumento: (documento: DocumentoCliente) => void

  // Filtros
  setCategoriaFiltro: (categoriaId: string | null) => void
  setEtiquetasFiltro: (etiquetas: string[]) => void
  setBusqueda: (busqueda: string) => void
  setSoloImportantes: (solo: boolean) => void
  limpiarFiltros: () => void
}

export const useDocumentosClienteStore = create<DocumentosClienteState>((set) => ({
  // Estado inicial
  documentos: [],
  categorias: [],
  documentoSeleccionado: null,
  categoriaFiltro: null,
  etiquetasFiltro: [],
  busqueda: '',
  soloImportantes: false,
  cargandoDocumentos: false,
  subiendoDocumento: false,
  modalSubirAbierto: false,
  modalViewerAbierto: false,
  modalCategoriasAbierto: false,

  // Implementación...
}))
```

---

## 🔗 Integración con Tab de Documentos

### **Modificar `src/app/clientes/[id]/tabs/documentos-tab.tsx`**

```tsx
'use client'

import { FileText, Upload, FolderCog } from 'lucide-react'
import { DocumentosListaCliente } from '@/modules/clientes/documentos/components'
import { useDocumentosClienteStore } from '@/modules/clientes/documentos/store'

interface DocumentosTabProps {
  cliente: Cliente
}

export function DocumentosTab({ cliente }: DocumentosTabProps) {
  const { abrirModalSubir, abrirModalCategorias } = useDocumentosClienteStore()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-800 dark:bg-gray-800'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20'>
              <FileText className='h-6 w-6 text-purple-600 dark:text-purple-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Documentos del Cliente
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Cédula, referencias, cartas laborales, etc.
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={abrirModalCategorias}
              className='flex items-center gap-2 rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50'
            >
              <FolderCog className='h-4 w-4' />
              <span>Categorías</span>
            </button>
            <button
              onClick={abrirModalSubir}
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-purple-700 hover:to-pink-700'
            >
              <Upload className='h-4 w-4' />
              <span>Subir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      <DocumentosListaCliente clienteId={cliente.id} />
    </div>
  )
}
```

---

## ✅ Checklist de Implementación

### **Fase 1: Base de Datos**
- [ ] Crear tabla `documentos_cliente` en Supabase
- [ ] Crear índices
- [ ] Crear trigger `update_updated_at_column`
- [ ] Habilitar RLS
- [ ] Crear políticas RLS
- [ ] Verificar bucket `documentos-clientes` existe

### **Fase 2: Services**
- [ ] Crear `documentos-cliente.service.ts`
- [ ] Método: `obtenerDocumentosPorCliente()`
- [ ] Método: `subirDocumento()`
- [ ] Método: `obtenerUrlDescarga()`
- [ ] Método: `eliminarDocumento()`
- [ ] Método: `actualizarDocumento()`

### **Fase 3: Store**
- [ ] Crear `documentos-cliente.store.ts`
- [ ] Estado: documentos, categorías, filtros
- [ ] Acción: cargarDocumentos
- [ ] Acción: subirDocumento
- [ ] Acción: eliminarDocumento
- [ ] UI: modales (subir, categorías, viewer)

### **Fase 4: Componentes**
- [ ] Crear `documento-upload-cliente.tsx`
- [ ] Crear `documentos-lista-cliente.tsx`
- [ ] Crear `documento-card-cliente.tsx`
- [ ] Crear `documentos-filtros-cliente.tsx`
- [ ] Crear `documento-viewer-cliente.tsx` (opcional)

### **Fase 5: Hooks**
- [ ] Crear `useDocumentoUploadCliente.ts`
- [ ] Crear `useDocumentosCliente.ts`

### **Fase 6: Integración**
- [ ] Modificar `documentos-tab.tsx` para usar sistema completo
- [ ] Agregar modales al componente padre (`cliente-detalle-client.tsx`)
- [ ] Testing de upload
- [ ] Testing de listado
- [ ] Testing de descarga
- [ ] Testing de eliminación

---

## 🎯 Próximos Pasos

1. **Crear SQL de base de datos** (`supabase/documentos-cliente-schema.sql`)
2. **Ejecutar SQL en Supabase** (Dashboard → SQL Editor)
3. **Crear types** (`src/modules/clientes/documentos/types/index.ts`)
4. **Crear service** (`documentos-cliente.service.ts`)
5. **Crear store** (`documentos-cliente.store.ts`)
6. **Crear componentes** (upload, lista, card)
7. **Integrar con tab de documentos**
8. **Testing completo**

---

## 📊 Estimación de Tiempo

- Base de datos: **10 min**
- Service layer: **20 min**
- Store: **15 min**
- Componentes: **45 min**
- Integración: **15 min**
- Testing: **20 min**

**Total estimado**: **~2 horas**

---

## 🎨 Reutilización de Código

**Componentes que SE REUTILIZAN** (ya existen en `src/modules/documentos/`):
- ✅ `CategoriasManager` (gestión de categorías)
- ✅ `CategoriaForm` (crear/editar categoría)
- ✅ `EtiquetasInput` (input de etiquetas)
- ✅ `CategoriaIcon` (ícono de categoría)
- ✅ `CategoriasService` (servicio compartido)

**Componentes NUEVOS** (específicos de clientes):
- 🆕 `DocumentoUploadCliente`
- 🆕 `DocumentosListaCliente`
- 🆕 `DocumentoCardCliente`
- 🆕 `DocumentosFiltrosCliente`
- 🆕 `DocumentosClienteService`
- 🆕 `useDocumentosClienteStore`

---

## 🔐 Seguridad

- ✅ RLS habilitado
- ✅ Solo usuarios autenticados
- ✅ Solo documentos propios (subido_por = auth.uid())
- ✅ Bucket privado (requiere auth)
- ✅ Signed URLs con expiración (1 hora)

---

**Fecha**: 17 de octubre de 2025
**Módulo**: Sistema de Documentos para Clientes
**Estado**: Plan completo - Listo para implementar
