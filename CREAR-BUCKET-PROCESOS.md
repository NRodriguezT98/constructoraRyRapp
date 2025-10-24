# 📦 CREAR BUCKET: documentos-procesos

## ⚡ INSTRUCCIONES RÁPIDAS

### 1️⃣ Ve a Supabase Dashboard → Storage → Create bucket

**Configuración:**
- **Name:** `documentos-procesos`
- **Public:** ✅ Yes (checked)
- **Allowed MIME types:** Dejar vacío (permite todos)
- **File size limit:** 10 MB

### 2️⃣ Luego ejecuta este SQL en el SQL Editor

```sql
-- 🔓 Políticas RLS COMPARTIDAS para documentos-procesos
-- Todo el equipo puede ver, subir y gestionar documentos

-- Política: Ver todos los documentos de procesos
CREATE POLICY "Ver todos los documentos de procesos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-procesos');

-- Política: Subir documentos de procesos
CREATE POLICY "Subir documentos de procesos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-procesos');

-- Política: Actualizar documentos de procesos
CREATE POLICY "Actualizar documentos de procesos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos-procesos');

-- Política: Eliminar documentos de procesos
CREATE POLICY "Eliminar documentos de procesos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-procesos');
```

---

## ✅ VERIFICACIÓN

Después de ejecutar, verifica que tienes 4 políticas en:
**Storage → documentos-procesos → Policies**

---

## 📁 ESTRUCTURA DE ARCHIVOS

Los documentos se guardarán así:
```
documentos-procesos/
└── {userId}/
    └── procesos/
        └── {negociacionId}/
            └── {pasoId}/
                ├── Promesa_Compraventa_1729800000.pdf
                ├── Carta_Aprobacion_1729900000.pdf
                └── Escritura_Publica_1730000000.pdf
```

**Ejemplo real:**
```
documentos-procesos/
└── a1b2c3d4-5678-90ab-cdef-1234567890ab/
    └── procesos/
        └── nego-uuid-123/
            └── paso-uuid-456/
                └── Promesa_Compraventa_1729800123456.pdf
```

---

## 🔐 SEGURIDAD

✅ **TODO EL EQUIPO PUEDE:**
- Ver todos los documentos de procesos
- Subir documentos en cualquier proceso
- Actualizar documentos existentes
- Eliminar documentos

✅ **BENEFICIOS DEL MODELO COMPARTIDO:**
- Colaboración fluida entre compañeros
- Historial completo visible en pestaña "Documentos"
- Continuidad en caso de ausencia de un compañero
- Auditoría completa del proceso

⚠️ **NOTA:** Los documentos se guardan con el userId del que sube, pero TODOS pueden verlos/gestionarlos.

---

## 🎯 CÓMO FUNCIONA CON MÚLTIPLES DOCUMENTOS

### Ejemplo: Paso con 2 documentos requeridos

**Paso 3: Radicación de Crédito**
- Documento 1: "Carta Laboral" → Botón Adjuntar ①
- Documento 2: "Extractos Bancarios" → Botón Adjuntar ②

**Cada botón es independiente:**

```
📄 Carta Laboral          [🔼 Adjuntar]  ← Click aquí para subir Carta
📄 Extractos Bancarios    [🔼 Adjuntar]  ← Click aquí para subir Extractos
```

**Después de subir:**

```
📄 Carta Laboral          [⬇️ Descargar] ← Archivo subido
📄 Extractos Bancarios    [🔼 Adjuntar]  ← Aún pendiente
```

**Al finalizar:**

```
📄 Carta Laboral          [⬇️ Descargar] ← Subido ✅
📄 Extractos Bancarios    [⬇️ Descargar] ← Subido ✅
```

---

## 📋 NOTAS IMPORTANTES

1. **Límite de tamaño:** 10MB por archivo (validado en código)
2. **Formatos permitidos:** PDF, JPG, PNG, DOC, DOCX
3. **Nombres de archivo:** Se limpian automáticamente (sin acentos, espacios)
4. **Timestamp:** Se agrega automáticamente para evitar colisiones
5. **Re-upload:** Puedes reemplazar un documento subiéndolo de nuevo

---

## 🚀 SIGUIENTE PASO

Después de crear el bucket y ejecutar las políticas:

1. Recarga la app
2. Ve a Cliente → Tab "Actividad"
3. Expande un paso
4. Click en botón "Adjuntar" de cualquier documento
5. Selecciona archivo
6. ¡Listo! Se subirá automáticamente

---

## 🐛 TROUBLESHOOTING

**Error: "new row violates row-level security policy"**
→ Verifica que las 4 políticas estén creadas correctamente

**Error: "Bucket not found"**
→ Crea el bucket manualmente desde Dashboard → Storage

**Error: "El archivo no puede superar los 10MB"**
→ Reduce el tamaño del archivo o ajusta el límite en el código

**Documentos no aparecen después de subir**
→ Verifica en Storage → documentos-procesos → tu carpeta userId/
