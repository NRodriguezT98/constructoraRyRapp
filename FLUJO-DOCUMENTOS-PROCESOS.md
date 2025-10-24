# 📁 FLUJO COMPLETO: Documentos de Procesos

## 🎯 OBJETIVO

Permitir que los documentos subidos en la pestaña **"Actividad"** (durante los pasos del proceso) aparezcan automáticamente en la pestaña **"Documentos"** del cliente.

---

## 🔄 FLUJO COMPLETO

```
1. Usuario abre Cliente → Tab "Actividad"
2. Expande un paso del proceso
3. Click en botón "Adjuntar" de un documento requerido
4. Selecciona archivo (PDF/JPG/PNG/DOC/DOCX, <10MB)

   ↓

5. Sistema sube archivo a Storage:
   📦 Bucket: documentos-procesos
   📁 Path: {userId}/procesos/{negociacionId}/{pasoId}/{nombre}_{timestamp}.ext

   ↓

6. Sistema guarda en 2 lugares:

   ✅ Tabla: negociaciones_procesos
      → Campo: documentos_completados[documentoId] = URL
      → Para: Marcar paso como completado

   ✅ Tabla: documentos_cliente
      → Campos: titulo, url_storage, cliente_id, etc.
      → Para: Aparecer en pestaña "Documentos"

   ↓

7. Usuario ve documento en:
   - ✅ Actividad → Botón cambia a "Descargar" (verde)
   - ✅ Documentos → Aparece en lista de documentos
```

---

## 📋 EJEMPLOS PRÁCTICOS

### **Caso 1: Subir Promesa de Compraventa**

**Pestaña Actividad:**
```
Paso 1: Envío de promesa de compraventa
├─ 📄 Promesa de compraventa firmada  [🔼 Adjuntar]
└─ 📄 Captura de pantalla envío      [🔼 Adjuntar]
```

**Acción:** Click en "Adjuntar" → Seleccionar `promesa-firmada.pdf`

**Resultado en Storage:**
```
documentos-procesos/
└── a1b2c3d4-.../
    └── procesos/
        └── nego-uuid-123/
            └── paso-uuid-456/
                └── Promesa_Compraventa_1729800000.pdf
```

**Resultado en DB:**

**Tabla: negociaciones_procesos**
```json
{
  "paso_id": "paso-uuid-456",
  "documentos_completados": {
    "doc-promesa-id": "https://...documentos-procesos/.../Promesa_Compraventa_1729800000.pdf"
  }
}
```

**Tabla: documentos_cliente**
```json
{
  "id": "nuevo-uuid-doc",
  "cliente_id": "cliente-uuid-789",
  "titulo": "Promesa de compraventa firmada",
  "url_storage": "https://...documentos-procesos/.../Promesa_Compraventa_1729800000.pdf",
  "nombre_original": "promesa-firmada.pdf",
  "tamano_bytes": 2048000,
  "tipo_mime": "application/pdf",
  "subido_por": "usuario-uuid-abc",
  "etiquetas": ["Proceso", "Negociación"],
  "es_requerido": true,
  "es_importante": false,
  "estado": "activo"
}
```

**Pestaña Documentos:**
```
📄 Promesa de compraventa firmada
   📅 Subido: 24/10/2025
   👤 Por: Usuario ABC
   🏷️ Etiquetas: Proceso, Negociación
   [👁️ Ver] [⬇️ Descargar] [⭐ Importante]
```

---

### **Caso 2: Paso con múltiples documentos**

**Pestaña Actividad:**
```
Paso 3: Radicación de Crédito
├─ 📄 Carta Laboral             [🔼 Adjuntar]
└─ 📄 Extractos Bancarios       [🔼 Adjuntar]
```

**Usuario sube ambos:**

**Storage:**
```
documentos-procesos/
└── usuario-id/
    └── procesos/
        └── nego-id/
            └── paso-3-id/
                ├── Carta_Laboral_1729800000.pdf
                └── Extractos_Bancarios_1729800001.pdf
```

**Pestaña Documentos:** Ahora muestra 2 documentos nuevos
```
📄 Carta Laboral
📄 Extractos Bancarios
```

---

## 🔐 SEGURIDAD (MODELO COMPARTIDO)

### ✅ Políticas RLS - Storage

**TODO el equipo puede:**
- Ver todos los documentos de procesos
- Subir documentos en cualquier proceso
- Actualizar documentos existentes
- Eliminar documentos

```sql
-- Ver todos
CREATE POLICY "Ver todos los documentos de procesos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-procesos');

-- Subir
CREATE POLICY "Subir documentos de procesos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-procesos');
```

### ✅ Beneficios del Modelo Compartido

1. **Colaboración fluida**: Si un compañero está de vacaciones, otro puede ver/completar procesos
2. **Historial completo**: Toda la documentación visible en pestaña "Documentos"
3. **Auditoría**: Se guarda quién subió cada documento (`subido_por`)
4. **Continuidad**: No se bloquean procesos por ausencia de usuarios

---

## 📊 DIFERENCIA CON BUCKET CLIENTES

### Bucket: `documentos-clientes`
- **Propósito:** Documentos generales del cliente (cédula, RUT, etc.)
- **Subidos desde:** Pestaña "Documentos" → Botón "Subir Documento"
- **Política:** Compartido (todos ven todo)

### Bucket: `documentos-procesos`
- **Propósito:** Documentos específicos de pasos del proceso
- **Subidos desde:** Pestaña "Actividad" → Botón "Adjuntar"
- **Política:** Compartido (todos ven todo) ⬅️ **ACTUALIZADO**
- **Extra:** También se guarda en `documentos_cliente` para historial

---

## ✅ INSTRUCCIONES DE SETUP

### 1️⃣ Crear bucket en Supabase Dashboard

1. Ve a: **Storage → Create bucket**
2. Configuración:
   - **Name:** `documentos-procesos`
   - **Public:** ✅ Yes
   - **File size limit:** 10 MB
3. Click **"Create bucket"**

### 2️⃣ Ejecutar políticas RLS

1. Ve a: **SQL Editor → New Query**
2. Copia y pega:

```sql
-- 🔓 Políticas RLS COMPARTIDAS para documentos-procesos

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

3. Click **"Run"**
4. Verifica: **Storage → documentos-procesos → Policies** (deben aparecer 4)

### 3️⃣ Probar

1. Recarga app (F5)
2. Ve a: **Cliente → Tab "Actividad"**
3. Expande un paso
4. Click "Adjuntar" en cualquier documento
5. Sube archivo
6. Verifica:
   - ✅ Botón cambia a "Descargar" (verde)
   - ✅ Aparece en **Tab "Documentos"**

---

## 🎯 RESULTADO FINAL

**ANTES:** Documentos subidos en "Actividad" quedaban solo en el proceso

**AHORA:** Documentos subidos en "Actividad" también aparecen en pestaña "Documentos"

```
Actividad (subir)  ─┬──→  Storage: documentos-procesos
                    │
                    ├──→  Tabla: negociaciones_procesos (para progreso)
                    │
                    └──→  Tabla: documentos_cliente (para historial)
                                        ↓
                               Documentos (ver)
```

---

## 🚀 NEXT STEPS

1. ✅ Crear bucket (manual)
2. ✅ Ejecutar políticas RLS (SQL)
3. ✅ Probar subida de documento
4. ✅ Verificar aparece en "Documentos"
5. ✅ Probar con múltiples documentos
6. ✅ Probar descarga

---

## 🐛 TROUBLESHOOTING

**❌ Error: "new row violates row-level security policy"**
→ Ejecuta las 4 políticas RLS en SQL Editor

**❌ Error: "Bucket not found"**
→ Crea bucket manualmente en Dashboard → Storage

**❌ Documento no aparece en "Documentos"**
→ Verifica en tabla `documentos_cliente` que se insertó correctamente:
```sql
SELECT * FROM documentos_cliente
WHERE cliente_id = 'tu-cliente-id'
ORDER BY fecha_creacion DESC
LIMIT 5;
```

**❌ Error al subir archivo**
→ Verifica:
- Archivo < 10MB
- Formato permitido (PDF/JPG/PNG/DOC/DOCX)
- Usuario autenticado (`user.id` existe)

---

¡Listo! 🎉
