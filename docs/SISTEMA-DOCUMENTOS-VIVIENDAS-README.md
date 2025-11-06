# 📚 Sistema de Documentos para Viviendas

## 🎯 Resumen

Sistema completo para gestionar documentos de viviendas con categorías predefinidas del sistema, siguiendo el mismo patrón de Clientes y Proyectos.

---

## ✅ Archivos Creados

### 1. Migración SQL
- **Archivo**: `supabase/migrations/20250106000001_sistema_documentos_viviendas.sql`
- **Descripción**: Crea tabla `documentos_vivienda`, categorías del sistema, índices, triggers, RLS y vista enriquecida

### 2. Service
- **Archivo**: `src/modules/viviendas/services/documentos-vivienda.service.ts`
- **Exports**:
  - `DocumentosViviendaService` - Clase con toda la lógica de BD/Storage
  - `documentosViviendaService` - Singleton instance
  - Tipos: `DocumentoVivienda`, `SubirDocumentoParams`, `ActualizarDocumentoParams`

### 3. Hooks con React Query
- **Archivo**: `src/modules/viviendas/hooks/useDocumentosVivienda.ts`
- **Exports**:
  - `useDocumentosVivienda(viviendaId)` - Hook principal CRUD
  - `useEstadisticasDocumentosVivienda(viviendaId)` - Estadísticas

- **Archivo**: `src/modules/viviendas/hooks/useCategoriasSistemaViviendas.ts`
- **Export**: `useCategoriasSistemaViviendas()` - Acceso a categorías predefinidas

---

## 🚀 Pasos para Implementar

### **PASO 1: Ejecutar Migración SQL** ⚠️ CRÍTICO

```powershell
# En Supabase Studio: SQL Editor
# Copiar y pegar el contenido de:
# supabase/migrations/20250106000001_sistema_documentos_viviendas.sql

# O si tienes Supabase CLI:
supabase migration up
```

**✅ Verifica que se creó:**
- Tabla `documentos_vivienda` (17 columnas)
- Columna `es_sistema` en `categorias_documento`
- 8 categorías predefinidas para viviendas
- Vista `vista_documentos_vivienda`
- Políticas RLS activas

---

### **PASO 2: Crear Bucket de Storage**

```sql
-- En Supabase Studio: Storage
-- Crear nuevo bucket: "documentos-viviendas"

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-viviendas', 'documentos-viviendas', true);

-- Políticas RLS del bucket
CREATE POLICY "Usuarios autenticados pueden subir a documentos-viviendas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-viviendas');

CREATE POLICY "Usuarios autenticados pueden ver documentos-viviendas"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-viviendas');

CREATE POLICY "Solo admins pueden eliminar de documentos-viviendas"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-viviendas' AND
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
);
```

---

### **PASO 3: Actualizar Tipos de Supabase**

```powershell
# Regenerar tipos TypeScript con la nueva tabla
npm run types:supabase
# o
supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad > src/lib/supabase/database.types.ts
```

---

### **PASO 4: Uso en Componentes**

#### **Ejemplo: Formulario de Nueva Vivienda**

```typescript
// src/modules/viviendas/components/formulario-vivienda.tsx

import { useDocumentosVivienda, useCategoriasSistemaViviendas } from '@/modules/viviendas/hooks'

export function FormularioVivienda({ viviendaId }: { viviendaId: string }) {
  const { certificadoTradicion } = useCategoriasSistemaViviendas()
  const { subirDocumento, isSubiendo } = useDocumentosVivienda(viviendaId)

  const handleUploadCertificado = async (file: File) => {
    if (!certificadoTradicion) {
      toast.error('Categoría no encontrada. Ejecute la migración SQL.')
      return
    }

    await subirDocumento({
      viviendaId,
      archivo: file,
      categoriaNombre: 'Certificado de Tradición', // ✅ Auto-categorizado
      titulo: `Certificado de Tradición - Vivienda ${vivienda.numero}`,
      esImportante: true,
    })
  }

  return (
    <FileUploader
      onFileSelect={handleUploadCertificado}
      isLoading={isSubiendo}
      accept=".pdf"
    />
  )
}
```

#### **Ejemplo: Lista de Documentos de Vivienda**

```typescript
// src/modules/viviendas/components/documentos-lista.tsx

import { useDocumentosVivienda } from '@/modules/viviendas/hooks'

export function DocumentosViviendaLista({ viviendaId }: { viviendaId: string }) {
  const {
    documentos,
    isLoading,
    eliminarDocumento,
    descargarDocumento,
  } = useDocumentosVivienda(viviendaId)

  if (isLoading) return <LoadingState />

  return (
    <div className="space-y-4">
      {documentos.map((doc) => (
        <DocumentCard
          key={doc.id}
          documento={doc}
          onEliminar={() => eliminarDocumento(doc.id)}
          onDescargar={() => descargarDocumento({
            id: doc.id,
            nombreOriginal: doc.nombre_original
          })}
        />
      ))}
    </div>
  )
}
```

---

## 📊 Categorías Predefinidas

El sistema crea automáticamente 8 categorías:

| Categoría | Color | Icono | Uso |
|-----------|-------|-------|-----|
| **Certificado de Tradición** | Verde (`#10b981`) | FileText | Certificados de libertad y tradición |
| **Escrituras Públicas** | Azul (`#3b82f6`) | FileCheck | Documentos notariales |
| **Planos Arquitectónicos** | Ámbar (`#f59e0b`) | Ruler | Planos de diseño |
| **Licencias y Permisos** | Púrpura (`#8b5cf6`) | Shield | Licencias de construcción |
| **Avalúos Comerciales** | Cyan (`#06b6d4`) | DollarSign | Avalúos y certificados |
| **Fotos de Progreso** | Rosa (`#ec4899`) | Camera | Registro fotográfico |
| **Contrato de Promesa** | Rojo (`#f43f5e`) | FileSignature | Contratos de promesa |
| **Recibos de Servicios** | Lima (`#84cc16`) | Receipt | Recibos de pagos |

**✅ Estas categorías:**
- Están marcadas como `es_sistema = true` (no se pueden eliminar)
- Solo aparecen en módulo `viviendas`
- Están disponibles para todos los usuarios
- Se cargan automáticamente al instalar la migración

---

## 🔧 API del Hook Principal

```typescript
const {
  // ✅ Data
  documentos,           // DocumentoVivienda[]
  isLoading,            // boolean
  error,                // Error | null

  // ✅ Actions (todas con React Query mutations)
  subirDocumento,       // (params: SubirDocumentoParams) => Promise<DocumentoVivienda>
  actualizarDocumento,  // (params: ActualizarDocumentoParams) => Promise<DocumentoVivienda>
  eliminarDocumento,    // (id: string) => Promise<void>
  descargarDocumento,   // ({ id, nombreOriginal }) => Promise<boolean>
  refetch,              // () => Promise<QueryObserverResult>

  // ✅ States
  isSubiendo,           // boolean
  isActualizando,       // boolean
  isEliminando,         // boolean
  isDescargando,        // boolean
} = useDocumentosVivienda(viviendaId)
```

---

## 📋 Checklist de Implementación

### Pre-requisitos
- [ ] Supabase configurado y conectado
- [ ] React Query Provider instalado
- [ ] Tipos de Supabase actualizados

### Migración
- [ ] Ejecutar SQL en Supabase Studio
- [ ] Verificar tabla `documentos_vivienda` creada
- [ ] Verificar 8 categorías insertadas
- [ ] Crear bucket `documentos-viviendas`
- [ ] Configurar políticas RLS del bucket

### Código
- [ ] Service creado (`documentos-vivienda.service.ts`)
- [ ] Hooks creados (`useDocumentosVivienda.ts`, `useCategoriasSistemaViviendas.ts`)
- [ ] Barrel export actualizado (`hooks/index.ts`)
- [ ] Regenerar tipos de Supabase

### Testing
- [ ] Probar subir documento con auto-categorización
- [ ] Probar listar documentos de una vivienda
- [ ] Probar actualizar metadata de documento
- [ ] Probar eliminar documento (soft delete)
- [ ] Probar descargar documento
- [ ] Verificar que categorías del sistema no se pueden eliminar

---

## 🎯 Ventajas del Sistema

1. **✅ Consistencia**: Mismo patrón que Clientes y Proyectos
2. **✅ Auto-categorización**: Certificado de tradición se sube con categoría automática
3. **✅ Categorías predefinidas**: No hay que crearlas manualmente
4. **✅ Seguridad**: RLS + políticas estrictas
5. **✅ Escalabilidad**: Fácil agregar nuevas categorías
6. **✅ Versionado**: Soporte para múltiples versiones del mismo documento
7. **✅ Auditoría**: Triggers de `updated_at` + metadata JSON
8. **✅ Performance**: Índices optimizados + React Query cache

---

## 🚨 Errores TypeScript Esperados

**ANTES de ejecutar la migración SQL**, verás errores de TypeScript porque:
- La tabla `documentos_vivienda` NO EXISTE aún en la BD
- Los tipos de Supabase no incluyen la tabla
- El servicio intenta usar una tabla que no está en el schema

**✅ Estos errores DESAPARECERÁN automáticamente después de:**
1. Ejecutar la migración SQL
2. Regenerar tipos con `npm run types:supabase`

---

## 📚 Referencias

- **Migración SQL**: `supabase/migrations/20250106000001_sistema_documentos_viviendas.sql`
- **Service**: `src/modules/viviendas/services/documentos-vivienda.service.ts`
- **Hooks**: `src/modules/viviendas/hooks/useDocumentosVivienda.ts`
- **Patrón de Clientes**: `src/app/clientes/[id]/tabs/documentos-tab.tsx`
- **Schema DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

## 💡 Próximos Pasos

1. Ejecutar migración SQL
2. Crear bucket en Supabase Storage
3. Regenerar tipos TypeScript
4. Probar subir certificado de tradición en formulario de vivienda
5. Implementar tab de documentos en detalle de vivienda (similar a clientes)

---

**¿Listo para ejecutar la migración? 🚀**
