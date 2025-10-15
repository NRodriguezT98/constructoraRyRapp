# 📄 Módulo de Documentos

Sistema completo de gestión de documentos para proyectos de construcción.

---

## 📋 Índice

- [Descripción](#descripción)
- [Características](#características)
- [Estructura](#estructura)
- [Hooks](#hooks)
- [Componentes](#componentes)
- [Servicios](#servicios)
- [Uso](#uso)
- [Ejemplos](#ejemplos)

---

## 📝 Descripción

El módulo de Documentos permite subir, organizar, categorizar y gestionar todos los documentos relacionados con proyectos de construcción. Soporta múltiples formatos de archivo, categorización personalizada, etiquetas, vencimientos y más.

### **Formatos Soportados**
- 📄 PDF, Word, Excel, PowerPoint
- 🖼️ Imágenes (JPG, PNG, WebP)
- 📐 Archivos CAD (DWG, DXF)
- 🗜️ Archivos comprimidos (ZIP, RAR)
- 📝 Archivos de texto

### **Límites**
- Tamaño máximo: **50 MB** por archivo
- Storage: Supabase Storage bucket `documentos-proyectos`

---

## ✨ Características

### **Gestión de Documentos**
- ✅ Upload con Drag & Drop
- ✅ Validación automática de archivos
- ✅ Preview de archivos
- ✅ Descarga con URLs firmadas
- ✅ Archivar/Eliminar documentos

### **Categorización**
- ✅ Categorías personalizables por usuario
- ✅ Iconos y colores customizables
- ✅ Categorías por defecto (Licencias, Planos, Contratos, etc.)
- ✅ Drag & Drop para reordenar

### **Organización**
- ✅ Etiquetas (tags) múltiples
- ✅ Marcar como importante
- ✅ Fechas de documento y vencimiento
- ✅ Alertas de vencimiento (30 días)
- ✅ Metadata personalizable

### **Filtros y Búsqueda**
- ✅ Búsqueda por título/descripción
- ✅ Filtrar por categoría
- ✅ Filtrar por etiquetas
- ✅ Solo documentos importantes
- ✅ Vista grid/lista

---

## 🗂️ Estructura

```
src/modules/documentos/
├── components/              # Componentes UI
│   ├── categorias/         # Gestión de categorías
│   │   ├── categoria-form.tsx
│   │   └── categorias-manager.tsx
│   ├── lista/              # Lista y cards de documentos
│   │   ├── documento-card.tsx
│   │   ├── documentos-filtros.tsx
│   │   └── documentos-lista.tsx
│   ├── shared/             # Componentes compartidos
│   │   ├── categoria-icon.tsx
│   │   └── etiquetas-input.tsx
│   ├── upload/             # Subida de documentos
│   │   └── documento-upload.tsx
│   └── viewer/             # Visualización
│       └── documento-viewer.tsx
├── hooks/                  # Hooks personalizados
│   ├── useDocumentosLista.ts
│   ├── useCategoriasManager.ts
│   ├── useDocumentoUpload.ts
│   ├── useDocumentoCard.ts
│   └── index.ts
├── services/               # Servicios de API/DB
│   ├── documentos.service.ts
│   ├── categorias.service.ts
│   └── index.ts
├── store/                  # Estado global (Zustand)
│   └── documentos.store.ts
├── schemas/                # Validaciones (Zod)
│   └── documento.schema.ts
├── styles/                 # Estilos centralizados
│   ├── classes.ts
│   └── index.ts
└── types/                  # TypeScript types
    ├── documento.types.ts
    └── index.ts
```

---

## 🎣 Hooks

### **useDocumentosLista**

Hook principal para listar y filtrar documentos.

```typescript
import { useDocumentosLista } from '@/modules/documentos/hooks'

const {
  vista,                    // 'grid' | 'lista'
  setVista,
  documentosFiltrados,      // Documentos después de filtros
  cargandoDocumentos,
  hasDocumentos,
  handleView,               // Ver documento
  handleDownload,           // Descargar
  handleToggleImportante,   // Toggle importante
  handleArchive,            // Archivar
  handleDelete,             // Eliminar
  getCategoriaByDocumento,  // Helper
} = useDocumentosLista({
  proyectoId: 'uuid',
  onViewDocumento: (doc) => console.log(doc)
})
```

**Características:**
- ✅ Filtrado automático por categoría/etiquetas/búsqueda
- ✅ Manejo de modal viewer
- ✅ Todos los handlers optimizados con `useCallback`

---

### **useCategoriasManager**

Hook para gestionar categorías personalizadas.

```typescript
import { useCategoriasManager } from '@/modules/documentos/hooks'

const {
  modo,                     // 'lista' | 'crear' | 'editar'
  categorias,
  tieneCategorias,
  handleIrACrear,
  handleIrAEditar,
  handleCrear,
  handleActualizar,
  handleEliminar,
  handleInicializarDefault,
} = useCategoriasManager({ userId: 'uuid' })
```

**Características:**
- ✅ Navegación entre modos
- ✅ CRUD completo
- ✅ Inicialización con categorías por defecto

---

### **useDocumentoUpload**

Hook para subir documentos con Drag & Drop.

```typescript
import { useDocumentoUpload } from '@/modules/documentos/hooks'

const {
  isDragging,
  archivoSeleccionado,
  errorArchivo,
  subiendoDocumento,
  categorias,
  fileInputRef,
  register,               // React Hook Form
  handleSubmit,
  handleDragOver,
  handleDrop,
  limpiarArchivo,
} = useDocumentoUpload({
  proyectoId: 'uuid',
  onSuccess: () => console.log('Subido!')
})
```

**Características:**
- ✅ Drag & Drop completo
- ✅ Validación con Zod
- ✅ Autocompletado de título
- ✅ Integration con React Hook Form

---

### **useDocumentoCard**

Hook simple para cards con menú desplegable.

```typescript
import { useDocumentoCard } from '@/modules/documentos/hooks'

const {
  menuAbierto,
  menuRef,      // Ref con useClickOutside
  toggleMenu,
  cerrarMenu,
} = useDocumentoCard()
```

**Características:**
- ✅ Usa `useClickOutside` de shared
- ✅ Click outside automático

---

## 🧩 Componentes

### **DocumentosLista**

Componente principal para listar documentos.

```tsx
<DocumentosLista
  proyectoId="uuid"
  onViewDocumento={(doc) => console.log(doc)}
  onUploadClick={() => setModalAbierto(true)}
/>
```

**Props:**
- `proyectoId` (string): ID del proyecto
- `onViewDocumento?` (function): Callback al ver documento
- `onUploadClick?` (function): Callback para abrir modal upload

---

### **DocumentoUpload**

Formulario de subida con Drag & Drop.

```tsx
<DocumentoUpload
  proyectoId="uuid"
  onSuccess={() => {
    console.log('¡Documento subido!')
    setModalAbierto(false)
  }}
  onCancel={() => setModalAbierto(false)}
/>
```

**Props:**
- `proyectoId` (string): ID del proyecto
- `onSuccess?` (function): Callback después de subir
- `onCancel?` (function): Callback al cancelar

---

### **CategoriasManager**

Gestión completa de categorías.

```tsx
<CategoriasManager
  userId="uuid"
  onClose={() => setModalAbierto(false)}
/>
```

**Props:**
- `userId` (string): ID del usuario
- `onClose` (function): Callback al cerrar

---

## 🔧 Servicios

### **DocumentosService**

```typescript
import { DocumentosService } from '@/modules/documentos/services'

// Subir documento
await DocumentosService.subirDocumento(params, userId)

// Obtener URL de descarga
const url = await DocumentosService.obtenerUrlDescarga(storagePath)

// Archivar documento
await DocumentosService.archivarDocumento(documentoId)

// Eliminar documento
await DocumentosService.eliminarDocumento(documentoId)
```

---

### **CategoriasService**

```typescript
import { CategoriasService } from '@/modules/documentos/services'

// Obtener categorías del usuario
const categorias = await CategoriasService.obtenerCategorias(userId)

// Crear categoría
await CategoriasService.crearCategoria(userId, data)

// Actualizar categoría
await CategoriasService.actualizarCategoria(categoriaId, data)

// Eliminar categoría
await CategoriasService.eliminarCategoria(categoriaId)
```

---

## 💾 Store (Zustand)

```typescript
import { useDocumentosStore } from '@/modules/documentos/store'

const {
  documentos,
  categorias,
  cargandoDocumentos,

  // Filtros
  categoriaFiltro,
  etiquetasFiltro,
  busqueda,
  soloImportantes,

  // Acciones
  cargarDocumentos,
  cargarCategorias,
  subirDocumento,
  toggleImportante,
  eliminarDocumento,

  // Setters de filtros
  setCategoriaFiltro,
  setEtiquetasFiltro,
  setBusqueda,
  setSoloImportantes,
} = useDocumentosStore()
```

---

## 📖 Uso Completo

### **Ejemplo: Página de Proyecto con Documentos**

```tsx
'use client'

import { useState } from 'react'
import { Modal } from '@/shared/components/ui/Modal'
import { DocumentosLista, DocumentoUpload } from '@/modules/documentos/components'

export default function ProyectoPage({ params }: { params: { id: string } }) {
  const [modalUpload, setModalUpload] = useState(false)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos del Proyecto</h1>
        <button
          onClick={() => setModalUpload(true)}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-white"
        >
          Subir Documento
        </button>
      </div>

      <DocumentosLista
        proyectoId={params.id}
        onUploadClick={() => setModalUpload(true)}
      />

      <Modal
        isOpen={modalUpload}
        onClose={() => setModalUpload(false)}
        title="Subir Documento"
        size="xl"
      >
        <DocumentoUpload
          proyectoId={params.id}
          onSuccess={() => setModalUpload(false)}
          onCancel={() => setModalUpload(false)}
        />
      </Modal>
    </div>
  )
}
```

---

## 🎨 Estilos

Usar estilos centralizados:

```typescript
import { documentoClasses, documentoAnimations } from '@/modules/documentos/styles'

// En componente
<div className={documentoClasses.card.base}>
  {/* ... */}
</div>

// Con Framer Motion
<motion.div {...documentoAnimations.card}>
  {/* ... */}
</motion.div>
```

---

## 🔐 Seguridad

### **Supabase Storage Policies**

```sql
-- Solo usuarios autenticados pueden subir
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentos-proyectos');

-- Solo usuarios autenticados pueden leer
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documentos-proyectos');
```

### **Row Level Security (RLS)**

Todos los documentos tienen RLS habilitado:
- Solo el creador puede ver/editar/eliminar sus documentos
- Los documentos están vinculados a proyectos
- Las categorías son privadas por usuario

---

## 🧪 Testing

```typescript
// Ejemplo de test para hook
import { renderHook } from '@testing-library/react-hooks'
import { useDocumentosLista } from '@/modules/documentos/hooks'

test('useDocumentosLista filtra documentos', () => {
  const { result } = renderHook(() => useDocumentosLista({ proyectoId: '123' }))

  expect(result.current.documentosFiltrados).toBeDefined()
})
```

---

## 📊 Performance

### **Optimizaciones Aplicadas**

- ✅ `useCallback` en todos los handlers
- ✅ `useMemo` para filtrado de documentos
- ✅ Lazy loading de imágenes
- ✅ Debounce en búsqueda
- ✅ URLs firmadas con caché (1 hora)
- ✅ Componentes < 310 líneas

### **Métricas**

| Métrica | Valor |
|---------|-------|
| Componentes refactorizados | 4/4 |
| Hooks creados | 4 |
| Líneas reducidas | ~350 |
| useState eliminados | 11 |
| useEffect eliminados | 3 |

---

## 🐛 Troubleshooting

### **Error: "Object not found"**

**Causa:** Bucket de Supabase no existe
**Solución:** Crear bucket `documentos-proyectos` en Supabase Dashboard

### **Error: "File too large"**

**Causa:** Archivo > 50 MB
**Solución:** Reducir tamaño o aumentar límite en Supabase

### **Error: "Invalid file type"**

**Causa:** Formato no soportado
**Solución:** Ver lista de formatos soportados arriba

---

## 📚 Referencias

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 📝 Changelog

### **v1.0.0** (15 de octubre de 2025)
- ✅ Refactorización completa del módulo
- ✅ Hooks separados por responsabilidad
- ✅ Componentes presentacionales puros
- ✅ Estilos centralizados
- ✅ Documentación completa

---

**Mantenido por:** GitHub Copilot
**Última actualización:** 15 de octubre de 2025
