# 🔧 FIX: Error "Object not found" en Documentos de Viviendas

## ❌ PROBLEMA

**Error:**
```
StorageApiError: Object not found
Error al generar URL: Object not found
```

**Causa:**
Existen registros en la tabla `documentos_vivienda` que **NO tienen archivos físicos** en Storage.

Esto ocurre cuando:
1. El registro se creó en la BD pero falló la subida a Storage
2. El archivo fue eliminado manualmente de Storage
3. Hubo un error durante el proceso de subida

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Validación antes de crear URL firmada

El service ahora **verifica que el archivo exista** antes de intentar crear la URL:

```typescript
// En documentos-vivienda.service.ts
async obtenerUrlFirmada(id: string) {
  // 1. Obtener info del documento de BD
  const documento = await obtenerDocumento(id)

  // 2. Verificar que existe en Storage ✅ NUEVO
  const fileExists = await verificarArchivoExiste(vivienda_id, nombre_archivo)

  if (!fileExists) {
    throw new Error('El archivo no existe en Storage')
  }

  // 3. Crear URL firmada
  return createSignedUrl(filePath)
}
```

### 2. Mensaje de error amigable en UI

```typescript
// En useDocumentosVivienda.ts
onError: (error) => {
  if (message.includes('no existe en Storage')) {
    toast.error(
      'El archivo físico no se encuentra disponible.',
      {
        description: 'Podría haber sido eliminado. Contacta al administrador.'
      }
    )
  }
}
```

---

## 🛠️ CÓMO LIMPIAR DOCUMENTOS HUÉRFANOS

### Opción 1: Eliminar registros sin archivo (RECOMENDADO)

Ejecuta este SQL para marcar como eliminados los registros sin archivo en Storage:

```sql
-- PASO 1: Listar documentos potencialmente huérfanos
SELECT
    id,
    titulo,
    nombre_archivo,
    vivienda_id,
    fecha_creacion
FROM documentos_vivienda
WHERE estado = 'activo'
ORDER BY fecha_creacion DESC;

-- PASO 2: Marcar como eliminados (después de verificar en Storage)
-- ⚠️ EJECUTAR SOLO DESPUÉS DE CONFIRMAR QUE NO EXISTEN EN STORAGE
UPDATE documentos_vivienda
SET estado = 'eliminado'
WHERE id IN (
    -- IDs de documentos sin archivo en Storage
    'id-del-documento-huerfano-1',
    'id-del-documento-huerfano-2'
);
```

### Opción 2: Re-subir archivos faltantes

Si tienes los archivos originales:

1. Ir a **Viviendas** → **Ver Detalle** → **Documentos**
2. Click en **"Subir Documento"**
3. Seleccionar archivo
4. Guardar

El nuevo archivo reemplazará el registro huérfano.

---

## 📊 VERIFICAR ESTADO ACTUAL

### Script SQL de verificación:

```bash
node ejecutar-sql.js supabase/verification/verificar-documentos-storage.sql
```

Este script muestra:
- Total de documentos en BD
- Documentos por vivienda
- Nombres de archivos con caracteres problemáticos

---

## 🔍 DEBUGGING

### Ver logs en Console del navegador:

```javascript
// Cuando intentas "Ver" un documento:
📄 Obteniendo URL para visualizar: {...}
✅ Archivo existe en Storage
✅ URL firmada creada: https://...

// O si falla:
❌ Archivo no encontrado en Storage: {...}
```

---

## 🚀 PREVENIR EN EL FUTURO

### Transacción atómica en subida:

El método `subirDocumento()` ya tiene rollback automático:

```typescript
try {
  // 1. Subir a Storage
  await storage.upload(file)

  // 2. Crear registro en BD
  await db.insert(documento)

  return documento
} catch (error) {
  // Si falla BD, eliminar de Storage ✅
  await storage.remove(file)
  throw error
}
```

---

## ✅ CHECKLIST

- [x] Service valida existencia antes de crear URL
- [x] Mensaje de error amigable en UI
- [x] Logs detallados para debugging
- [x] Script de verificación SQL creado
- [ ] **Ejecutar limpieza de documentos huérfanos** ← PENDIENTE
- [ ] **Verificar que nuevos uploads funcionen** ← PENDIENTE

---

## 📝 CASO ESPECÍFICO ACTUAL

**Documento con error:**
```
Archivo: MAT. INM. CASA A7 - LAS AMERICAS 2 - 373-146214 - OCTUBRE 10 DE 2025.pdf
Vivienda ID: 66b7afe8-9d05-4c14-902a-eb1988d545e1
```

**Acciones:**
1. ✅ Verificar en Supabase Storage si el archivo existe
2. ⚠️ Si NO existe → Marcar como eliminado en BD
3. ✅ O volver a subir el archivo original

---

## 🎯 PRÓXIMOS PASOS

1. **Verificar archivos en Supabase Storage:**
   - Ir a: Dashboard → Storage → `documentos-viviendas`
   - Buscar carpeta: `66b7afe8-9d05-4c14-902a-eb1988d545e1`
   - Ver si el archivo PDF existe

2. **Si el archivo NO existe:**
   ```sql
   -- Marcar como eliminado
   UPDATE documentos_vivienda
   SET estado = 'eliminado'
   WHERE id = 'ID-DEL-DOCUMENTO';
   ```

3. **Si el archivo SÍ existe:**
   - El problema es de permisos RLS
   - Revisar políticas de Storage

---

**Fecha:** 2025-11-07
**Status:** ✅ Validación implementada, pendiente limpieza de datos
