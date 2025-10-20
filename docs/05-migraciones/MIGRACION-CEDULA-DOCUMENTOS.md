# 🆔 MIGRACIÓN: Unificar Cédula con Documentos

## 📋 Resumen
Convertir la cédula de una sección separada a un documento más dentro del sistema de documentos del cliente, marcado con el flag `es_documento_identidad = true`.

---

## ✅ PASO 1: Ejecutar Migración SQL

### Ir a Supabase Dashboard:
1. Abre: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Copia el contenido de: `supabase/migrations/20250120_add_es_documento_identidad.sql`
3. **Ejecuta el script completo** en el SQL Editor

### ¿Qué hace la migración?
- ✅ Agrega campo `es_documento_identidad` boolean
- ✅ Crea índice para búsquedas rápidas
- ✅ Crea categoría "Documentos de Identidad"
- ✅ **Migra cédulas existentes** de `clientes.documento_identidad_url` → `documentos_cliente`
- ✅ Crea vista `v_clientes_con_cedula` (helper)
- ✅ Crea función `puede_crear_negociacion()` (validación)

---

## ✅ PASO 2: Verificar Datos Migrados

```sql
-- Ver cédulas migradas
SELECT
  c.nombres,
  c.apellidos,
  dc.titulo,
  dc.es_documento_identidad,
  dc.es_importante,
  dc.estado
FROM clientes c
INNER JOIN documentos_cliente dc ON dc.cliente_id = c.id
WHERE dc.es_documento_identidad = TRUE;

-- Verificar función
SELECT puede_crear_negociacion('uuid-del-cliente-con-cedula'); -- Debe devolver true
SELECT puede_crear_negociacion('uuid-del-cliente-sin-cedula'); -- Debe devolver false
```

---

## ✅ PASO 3: Actualizar Componentes

### 3.1 Eliminar Sección de Cédula Arriba

**Archivo**: `src/app/clientes/[id]/tabs/documentos-tab.tsx`

**ANTES**:
```tsx
<SeccionDocumentosIdentidad ... />
<div className="border-t ..."></div>
<HeaderDocumentos />
<DocumentosListaCliente />
```

**DESPUÉS**:
```tsx
<HeaderDocumentos />
<DocumentosListaCliente />
```

### 3.2 Actualizar Modal de Cédula

**Archivo**: `src/modules/clientes/components/modals/modal-subir-cedula.tsx`

Cambiar a usar el servicio normal pero con `es_documento_identidad: true`:

```typescript
await DocumentosClienteService.subirDocumento({
  archivo,
  cliente_id: clienteId,
  categoria_id: categoriaIdentidadId, // Categoría "Documentos de Identidad"
  titulo: `Cédula de Ciudadanía - ${numeroDocumento}`,
  descripcion: `Documento de identidad del cliente`,
  es_importante: true,
  es_documento_identidad: true, // 🆔 CLAVE
}, user.id)
```

### 3.3 Mostrar Badge "REQUERIDO" en Card

**Archivo**: `src/modules/documentos/components/lista/documento-card-horizontal.tsx`

Agregar después del badge "Importante":

```tsx
{documento.es_documento_identidad && (
  <span className='flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300'>
    <ShieldCheck size={12} />
    REQUERIDO
  </span>
)}
```

---

## ✅ PASO 4: Validación de Negociación

### Actualizar hook de negociación

**Archivo**: `src/modules/clientes/hooks/useRegistrarInteres.ts`

Cambiar validación:

**ANTES**:
```typescript
if (!cliente.documento_identidad_url) {
  toast.error('Debes subir la cédula antes de crear una negociación')
  return
}
```

**DESPUÉS**:
```typescript
const tieneCedula = await DocumentosClienteService.tieneCedulaActiva(cliente.id)
if (!tieneCedula) {
  toast.error('Debes subir la cédula antes de crear una negociación')
  return
}
```

---

## ✅ PASO 5: Limpiar Código Legacy

### Archivos a eliminar:
- ❌ `src/modules/clientes/components/documentos/seccion-documentos-identidad.tsx`
- ❌ `src/modules/clientes/components/modals/modal-subir-cedula.tsx` (opcional - se puede adaptar)

### Archivos a actualizar:
- ✅ `documentos-tab.tsx` - quitar sección cédula
- ✅ `useRegistrarInteres.ts` - cambiar validación
- ✅ `documento-card-horizontal.tsx` - agregar badge REQUERIDO

---

## 🎨 Resultado Visual

### ANTES:
```
┌─────────────────────────────────────────┐
│ 📄 Documentos de Identidad (Requeridos)│
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Cédula Cargada                   │ │
│ │ [Ver] [Reemplazar] [Eliminar]       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
─────────────────────────────────────────── (separador)
┌─────────────────────────────────────────┐
│ 📄 Otros Documentos                     │
│ - Documento 1                           │
│ - Documento 2                           │
└─────────────────────────────────────────┘
```

### DESPUÉS:
```
┌───────────────────────────────────────────────────────────────────┐
│ 📄 Documentos del Cliente          [Categorías] [Subir Documento]│
├───────────────────────────────────────────────────────────────────┤
│ [🆔] │ Cédula - 1107548555  [REQUERIDO][⭐] │ [Ver] [↓] [⋮]     │
│ IDENTIFICACIÓN │ Documento cargado  • PDF • 2.1 MB              │
├───────────────────────────────────────────────────────────────────┤
│ [📋] │ Carta Aprobación A13  [⭐]          │ [Ver] [↓] [⋮]     │
│ APROBACIONES │ Carta de...           • PDF • 3.4 MB             │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Testing Checklist

Después de implementar, probar:

- [ ] Cédulas existentes aparecen en la lista de documentos
- [ ] Badge "REQUERIDO" visible en cédula
- [ ] No puedo crear negociación sin cédula
- [ ] Puedo crear negociación con cédula activa
- [ ] Subir nueva cédula marca automáticamente `es_documento_identidad = true`
- [ ] Eliminar cédula activa muestra advertencia especial
- [ ] Filtro por categoría "Documentos de Identidad" funciona
- [ ] Vista horizontal muestra correctamente toda la info

---

## 🚨 Rollback (si algo falla)

```sql
-- Revertir migración
ALTER TABLE documentos_cliente DROP COLUMN IF EXISTS es_documento_identidad;
DROP VIEW IF EXISTS v_clientes_con_cedula;
DROP FUNCTION IF EXISTS puede_crear_negociacion;
DROP INDEX IF EXISTS idx_documentos_cliente_es_identidad;

-- Restaurar código anterior desde Git
git checkout HEAD -- src/app/clientes/[id]/tabs/documentos-tab.tsx
git checkout HEAD -- src/modules/clientes/hooks/useRegistrarInteres.ts
```

---

## 📊 Métricas de Éxito

- ✅ **-150 líneas de código** (eliminar SeccionDocumentosIdentidad)
- ✅ **+1 campo DB** (es_documento_identidad)
- ✅ **+2 funciones helper** (tieneCedulaActiva, obtenerCedula)
- ✅ **UI más limpia** (una sola lista)
- ✅ **Más flexible** (múltiples docs de identidad: cédula + pasaporte + RUT)

---

## ⏭️ Siguiente Paso

Una vez completado:
1. Ejecutar migración SQL ✅
2. Recargar app (F5)
3. Verificar que cédulas aparecen en lista
4. **Aprobar diseño de cards horizontales**
5. Replicar en módulo Proyectos

**¿Procedemos a ejecutar la migración SQL?**
