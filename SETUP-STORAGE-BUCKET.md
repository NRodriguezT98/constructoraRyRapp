# 🔧 SETUP URGENTE: Storage Bucket para Documentos

## ⚠️ PROBLEMA ACTUAL

```
Error: Object not found
POST https://.../storage/v1/object/sign/documentos-proyectos/... 400 (Bad Request)
```

**Causa:** El bucket `documentos-proyectos` **NO EXISTE** en Supabase Storage.

---

## ✅ SOLUCIÓN RÁPIDA (2 minutos)

### **Paso 1: Crear Bucket en Supabase**

1. Ve a tu dashboard de Supabase:
   ```
   https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad
   ```

2. En el menú lateral, click en **"Storage"**

3. Click en botón **"Create bucket"** (o "Nuevo bucket")

4. Llenar el formulario:
   ```
   Bucket Name: documentos-proyectos
   Public: NO (dejar desmarcado)
   File Size Limit: 50MB (opcional)
   Allowed MIME types: * (todos)
   ```

5. Click en **"Create bucket"**

---

### **Paso 2: Configurar Políticas de Seguridad (RLS)**

En el bucket recién creado, click en **"Policies"** y crear estas 3 políticas:

#### **Política 1: Permitir Upload (INSERT)**
```sql
-- Nombre: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-proyectos');
```

#### **Política 2: Permitir Lectura (SELECT)**
```sql
-- Nombre: Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-proyectos');
```

#### **Política 3: Permitir Eliminación (DELETE)**
```sql
-- Nombre: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-proyectos');
```

---

## 🎯 SOLUCIÓN ALTERNATIVA (Si no puedes crear bucket ahora)

### **Opción A: Usar bucket público temporal**

Si quieres probar rápidamente sin configurar seguridad:

1. Crear bucket `documentos-proyectos` como **PÚBLICO**
2. Esto permite uploads/descargas sin autenticación
3. ⚠️ **NO RECOMENDADO PARA PRODUCCIÓN**

### **Opción B: Cambiar a usar URLs públicas**

Modificar el código para no usar signed URLs:

```typescript
// En documentos.service.ts línea ~236
static async obtenerUrlDescarga(storagePath: string): Promise<string> {
  // Si el bucket es público, usar getPublicUrl
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)

  return data.publicUrl
}
```

---

## 📋 VERIFICACIÓN

### **Comprobar que el bucket existe:**

1. Ve a Storage en Supabase Dashboard
2. Deberías ver el bucket `documentos-proyectos`
3. Intenta subir un archivo de prueba manualmente

### **Probar descarga:**

1. En tu app, intenta descargar un documento
2. Si funciona: ✅ Bucket configurado correctamente
3. Si falla: ⚠️ Revisar políticas RLS

---

## 🗂️ Estructura del Storage

Una vez creado, los archivos se guardarán así:

```
documentos-proyectos/
└── {user_id}/
    └── {proyecto_id}/
        ├── 1760509028391-61535acc-367b-4923-afd1-b52084888698.pdf
        ├── 1760509123456-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.jpg
        └── ...
```

---

## 🔐 Políticas de Seguridad Recomendadas

### **Para Producción (más restrictivo):**

```sql
-- Solo el dueño puede subir archivos a su carpeta
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Solo el dueño puede leer sus archivos
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Solo el dueño puede eliminar sus archivos
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-proyectos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🆘 Si Sigue Fallando

### **Error: "Object not found"**

**Posibles causas:**

1. ❌ Bucket no existe → Crear bucket
2. ❌ Archivo no subido → Verificar upload primero
3. ❌ Path incorrecto → Ver logs en consola
4. ❌ Sin permisos RLS → Agregar políticas

### **Debug del Path:**

Agrega esto antes de la línea 236 en `documentos.service.ts`:

```typescript
static async obtenerUrlDescarga(storagePath: string): Promise<string> {
  console.log('🔍 Intentando obtener URL para:', storagePath)
  console.log('📦 Bucket:', BUCKET_NAME)

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600)

  if (error) {
    console.error('❌ Error al crear signed URL:', error)
    throw error
  }

  console.log('✅ URL obtenida:', data.signedUrl)
  return data.signedUrl
}
```

---

## 📊 Estado Actual del Storage

Según el error, estás intentando acceder a:

```
Path: 0526fedb-d451-4c90-9dfc-d4757eaeb04d/
      e13cf32a-d6d3-4136-b145-225b631aceb1/
      1760509028391-61535acc-367b-4923-afd1-b52084888698.pdf

Bucket: documentos-proyectos ❌ NO EXISTE
```

**Acción requerida:** Crear el bucket `documentos-proyectos` en Supabase.

---

## ✅ CHECKLIST

- [ ] Ir a Supabase Dashboard → Storage
- [ ] Crear bucket `documentos-proyectos` (privado)
- [ ] Agregar política: Allow authenticated uploads
- [ ] Agregar política: Allow authenticated reads
- [ ] Agregar política: Allow authenticated deletes
- [ ] Probar subir un documento desde la app
- [ ] Probar descargar el documento
- [ ] ✅ Funciona correctamente

---

## 🎯 Tiempo estimado: 2-5 minutos

**Después de crear el bucket, recarga la app y prueba de nuevo.**

---

**Fecha:** 15 de octubre de 2025
**Issue:** Storage bucket no existe
**Solución:** Crear bucket manualmente en Supabase Dashboard
