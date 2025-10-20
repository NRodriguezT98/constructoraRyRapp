# 🆔 Crear Bucket para Documentos de Clientes

## ❌ ERROR ACTUAL

```
StorageApiError: Bucket not found
```

**Causa:** El bucket `documentos-clientes` no existe en tu proyecto de Supabase.

---

## ✅ SOLUCIÓN RÁPIDA (5 minutos)

### **Paso 1: Abrir Storage Dashboard**

Abre esta URL:

```
https://supabase.com/dashboard/project/swyjhwgvkfcfdtemkyad/storage/buckets
```

---

### **Paso 2: Crear Bucket**

Click en **"New bucket"** y configurar:

```
┌────────────────────────────────────────┐
│  Create a new bucket                   │
├────────────────────────────────────────┤
│  Name *                                │
│  ┌──────────────────────────────────┐  │
│  │ documentos-clientes              │  │  ← IMPORTANTE: Exacto
│  └──────────────────────────────────┘  │
│                                        │
│  [ ] Public bucket                     │  ← DESMARCADO (privado)
│                                        │
│  File size limit                       │
│  ┌──────────────────────────────────┐  │
│  │ 10                             MB│  │
│  └──────────────────────────────────┘  │
│                                        │
│  Allowed MIME types                    │
│  ┌──────────────────────────────────┐  │
│  │ application/pdf,image/*          │  │  ← PDFs e imágenes
│  └──────────────────────────────────┘  │
│                                        │
│         [Cancel]  [Create bucket]      │
└────────────────────────────────────────┘
```

**Configuración:**
- ✅ Name: `documentos-clientes` (sin espacios)
- ❌ Public bucket: **DESMARCADO**
- ✅ File size limit: `10 MB` (suficiente para cédulas)
- ✅ MIME types: `application/pdf,image/*` (PDFs y fotos)

Click **"Create bucket"**

---

### **Paso 3: Configurar Políticas RLS**

Click en la pestaña **"Policies"** del bucket recién creado.

#### **Política 1: Subir archivos (INSERT)**

Click **"New policy"** → **"Create policy from scratch"**

```
Policy name: Permitir subir cédulas
Allowed operation: INSERT
Target roles: authenticated

Policy definition - WITH CHECK:
(bucket_id = 'documentos-clientes')
```

#### **Política 2: Leer archivos (SELECT)**

Click **"New policy"** → **"Create policy from scratch"**

```
Policy name: Permitir leer cédulas
Allowed operation: SELECT
Target roles: authenticated

Policy definition - USING:
(bucket_id = 'documentos-clientes')
```

#### **Política 3: Eliminar archivos (DELETE)**

Click **"New policy"** → **"Create policy from scratch"**

```
Policy name: Permitir eliminar cédulas
Allowed operation: DELETE
Target roles: authenticated

Policy definition - USING:
(bucket_id = 'documentos-clientes')
```

---

### **Paso 4: Verificar Configuración Final**

Deberías ver 3 políticas activas:

```
✓ Permitir subir cédulas      INSERT
✓ Permitir leer cédulas       SELECT
✓ Permitir eliminar cédulas   DELETE
```

---

## 🧪 PROBAR EN LA APP

1. **Recarga la aplicación** (F5)
2. Ve a **Clientes** → Abre un cliente
3. Click en tab **"Documentos"**
4. En la sección **"Documentos de Identidad"**
5. Click en **"📤 Subir Cédula"**
6. Sube un PDF de prueba
7. ✅ Debería funcionar correctamente

---

## 📊 ESTRUCTURA DE ARCHIVOS EN EL BUCKET

Los archivos se organizan así:

```
documentos-clientes/
└── clientes/
    └── {cliente_id}/
        ├── cedula-{timestamp}.pdf
        ├── cedula-reverso-{timestamp}.pdf
        └── carta-aprobacion-{timestamp}.pdf
```

Ejemplo:
```
documentos-clientes/clientes/30a13bba-ea2f-4eff-aa70-aa71b7a85cdf/cedula-1760971917942.pdf
```

---

## 🆘 TROUBLESHOOTING

### **Error: "Bucket not found"**
- ✅ Verifica que el nombre sea exactamente `documentos-clientes`
- ✅ Recarga la aplicación (F5)
- ✅ Verifica que estés logueado

### **Error: "new row violates row-level security"**
- ✅ Verifica que las 3 políticas estén creadas
- ✅ Verifica que el target role sea `authenticated`
- ✅ Cierra sesión y vuelve a entrar

### **Error: "File size exceeds limit"**
- ✅ Ajusta el límite en Bucket Configuration
- ✅ Comprime el PDF antes de subirlo

---

## ✅ CONFIRMACIÓN

Una vez hecho esto, ejecuta en tu app:

1. Abre un cliente
2. Tab Documentos
3. Sube una cédula
4. Deberías ver:

```
✅ Cédula subida exitosamente
📄 cedula-1760971917942.pdf
🗑️ [Botón eliminar]
```

---

## 📋 RESUMEN

| Paso | Estado | Descripción |
|------|--------|-------------|
| 1 | ⏳ | Crear bucket `documentos-clientes` |
| 2 | ⏳ | Configurar como privado (no público) |
| 3 | ⏳ | Crear política INSERT |
| 4 | ⏳ | Crear política SELECT |
| 5 | ⏳ | Crear política DELETE |
| 6 | ⏳ | Probar subida de cédula |

**Tiempo estimado:** 5 minutos

---

Si después de seguir estos pasos sigues teniendo problemas, compárteme:
1. Screenshot de la lista de buckets en Supabase
2. Screenshot de las políticas del bucket
3. El error completo en la consola
