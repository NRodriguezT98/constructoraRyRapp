# 📸 GUÍA VISUAL: Crear Bucket en Supabase (Paso a Paso)

## ✅ CONFIRMACIÓN: El bucket NO EXISTE actualmente

Ejecuté un diagnóstico y confirmé que **NO hay ningún bucket** en tu proyecto de Supabase.

```
Buckets encontrados: 0
Bucket "documentos-proyectos": ❌ NO EXISTE
```

---

## 🎯 CREAR BUCKET MANUALMENTE (3 minutos)

### **Paso 1: Abrir Dashboard de Storage**

Abre esta URL en tu navegador:

```
https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/storage/buckets
```

O desde el dashboard:
1. Abre: https://supabase.com/dashboard
2. Selecciona proyecto: **constructoraRyR** (swyjhwgvkfcfdtemkyad)
3. En menú lateral izquierdo, click en **"Storage"**

---

### **Paso 2: Crear Nuevo Bucket**

En la página de Storage, deberías ver:

```
┌────────────────────────────────────────┐
│  Storage                               │
│                                        │
│  [+ New bucket]  [↻ Refresh]          │
│                                        │
│  No buckets created yet                │
│  Create your first storage bucket      │
└────────────────────────────────────────┘
```

Click en el botón **"New bucket"** (o "+ New bucket")

---

### **Paso 3: Configurar el Bucket**

Aparecerá un formulario. Llenar así:

```
┌────────────────────────────────────────┐
│  Create a new bucket                   │
├────────────────────────────────────────┤
│                                        │
│  Name *                                │
│  ┌──────────────────────────────────┐  │
│  │ documentos-proyectos             │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [ ] Public bucket                     │  ← DEJAR DESMARCADO
│  Make all files public                 │
│                                        │
│  File size limit (optional)            │
│  ┌──────────────────────────────────┐  │
│  │ 50                             MB│  │
│  └──────────────────────────────────┘  │
│                                        │
│  Allowed MIME types (optional)         │
│  ┌──────────────────────────────────┐  │
│  │ */*                              │  │  ← Todos los tipos
│  └──────────────────────────────────┘  │
│                                        │
│         [Cancel]  [Create bucket]      │
└────────────────────────────────────────┘
```

**IMPORTANTE:**
- ✅ Name: `documentos-proyectos` (exacto, sin espacios)
- ❌ Public bucket: **DESMARCADO** (debe estar en blanco)
- ✅ File size limit: `50 MB` (opcional)
- ✅ MIME types: `*/*` o dejarlo vacío

Click en **"Create bucket"**

---

### **Paso 4: Configurar Políticas RLS**

Después de crear el bucket, verás:

```
┌────────────────────────────────────────┐
│  documentos-proyectos                  │
│  Private bucket                        │
│                                        │
│  [Configuration] [Policies] [Files]    │
└────────────────────────────────────────┘
```

Click en la pestaña **"Policies"**

Verás:

```
┌────────────────────────────────────────┐
│  Storage policies                      │
│                                        │
│  [+ New policy]                        │
│                                        │
│  No policies created yet               │
└────────────────────────────────────────┘
```

#### **Crear Política 1: Upload (INSERT)**

1. Click en **"New policy"**
2. Click en **"For full customization"** (o "Create policy from scratch")
3. Llenar:

```
Policy name: Allow authenticated uploads
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'documentos-proyectos'
```

4. Click **"Save policy"**

#### **Crear Política 2: Read (SELECT)**

1. Click en **"New policy"** otra vez
2. Click en **"Create policy from scratch"**
3. Llenar:

```
Policy name: Allow authenticated reads
Allowed operation: SELECT
Target roles: authenticated

USING expression:
bucket_id = 'documentos-proyectos'
```

4. Click **"Save policy"**

#### **Crear Política 3: Delete (DELETE)**

1. Click en **"New policy"** otra vez
2. Click en **"Create policy from scratch"**
3. Llenar:

```
Policy name: Allow authenticated deletes
Allowed operation: DELETE
Target roles: authenticated

USING expression:
bucket_id = 'documentos-proyectos'
```

4. Click **"Save policy"**

---

### **Paso 5: Verificar**

Después de crear las 3 políticas, deberías ver:

```
┌────────────────────────────────────────────────────────┐
│  Storage policies                                      │
│                                                        │
│  [+ New policy]                                        │
│                                                        │
│  ✓ Allow authenticated uploads      INSERT  [Edit]    │
│  ✓ Allow authenticated reads        SELECT  [Edit]    │
│  ✓ Allow authenticated deletes      DELETE  [Edit]    │
└────────────────────────────────────────────────────────┘
```

---

## ✅ VERIFICAR QUE FUNCIONA

Una vez creado el bucket y las políticas, ejecuta este comando:

```bash
node scripts/test-storage.js
```

Deberías ver:

```
✅ Encontrados 1 bucket(s):
   - documentos-proyectos (privado)

✅ El bucket "documentos-proyectos" EXISTE
```

---

## 🧪 PROBAR EN LA APP

1. Recarga tu aplicación (F5)
2. Ve a un proyecto
3. Click en tab "Documentos"
4. Click en "Subir Documento"
5. Sube un archivo de prueba
6. ✅ Debería funcionar correctamente

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Problema 1: No puedo ver el botón "New bucket"**

**Causa:** No tienes permisos de administrador en el proyecto

**Solución:**
- Verifica que estás en el proyecto correcto (constructoraRyR)
- Verifica que eres el dueño del proyecto
- Si es un proyecto compartido, pide al dueño que cree el bucket

---

### **Problema 2: Error al crear política**

**Causa:** Sintaxis incorrecta en la expresión SQL

**Solución:** Copia y pega exactamente:

```sql
-- Para INSERT y SELECT y DELETE:
bucket_id = 'documentos-proyectos'
```

---

### **Problema 3: Sigue sin funcionar después de crear el bucket**

**Causa:** Las políticas RLS no están bien configuradas

**Solución:**
1. Ve a la pestaña "Policies" del bucket
2. Verifica que existan las 3 políticas
3. Verifica que el nombre del bucket en las políticas sea exactamente `documentos-proyectos`
4. Recarga la app

---

## 📊 RESUMEN

### Antes:
```
❌ Buckets: 0
❌ documentos-proyectos: NO EXISTE
❌ Upload: FALLA
❌ Download: FALLA
```

### Después:
```
✅ Buckets: 1
✅ documentos-proyectos: EXISTE (privado)
✅ Políticas: 3 configuradas
✅ Upload: FUNCIONA
✅ Download: FUNCIONA
```

---

**Si después de seguir estos pasos sigues teniendo problemas, ejecuta:**

```bash
node scripts/test-storage.js
```

Y compárteme el resultado completo.
