# 🤔 Decisión: ¿Cómo Manejar la Cédula del Cliente?

## 🔴 PROBLEMA IDENTIFICADO

Hay **confusión entre dos sistemas diferentes**:

1. **Campo directo** en tabla `clientes` (documento_identidad_url)
2. **Módulo de documentos** con categorías

**NO deben mezclarse. Debemos elegir UNO.**

---

## ✅ **OPCIÓN A: Campo Directo en Tabla Clientes** (Recomendado)

### Cómo funciona:
```sql
-- Tabla clientes (YA EXISTE en tu schema)
CREATE TABLE clientes (
  id UUID PRIMARY KEY,
  nombres TEXT,
  numero_documento TEXT,
  documento_identidad_url TEXT,  ← ESTE CAMPO
  -- ... otros campos
);
```

### Ventajas:
✅ **Acceso inmediato**: `cliente.documento_identidad_url`
✅ **No requiere joins**: Todo en una consulta
✅ **Validación simple**: `if (!cliente.documento_identidad_url)`
✅ **No interfiere con módulo de documentos**
✅ **Más rápido de implementar** (1.5 horas)

### Desventajas:
❌ No tiene versionado (si cambia cédula, se sobreescribe)
❌ No usa el módulo de documentos existente
❌ Campo "huérfano" (no está integrado con sistema de docs)

### Implementación:
```typescript
// 1. Subir archivo a Storage
const filePath = `clientes/${clienteId}/cedula.pdf`;
const { data } = await supabase.storage
  .from('documentos-clientes')
  .upload(filePath, file);

// 2. Actualizar campo directo
await supabase
  .from('clientes')
  .update({ documento_identidad_url: publicUrl })
  .eq('id', clienteId);

// 3. Leer en cualquier consulta
const { data: cliente } = await supabase
  .from('clientes')
  .select('*, documento_identidad_url')  ← Directo
  .eq('id', clienteId)
  .single();

// 4. Validar
if (!cliente.documento_identidad_url) {
  // Bloquear creación
}
```

### Flujo de usuario:
```
1. Crear cliente (campo opcional)
2. Ver detalle → Banner si falta
3. Click "Subir Cédula" → Modal con upload
4. Archivo se sube a Storage
5. URL se guarda en clientes.documento_identidad_url
6. Banner desaparece
```

**NO interactúa con el módulo de documentos en absoluto.**

---

## ✅ **OPCIÓN B: Integrar con Módulo de Documentos** (Más completo)

### Cómo funciona:
```sql
-- 1. Crear categoría especial "Cédula de Ciudadanía"
INSERT INTO categorias_documentos (nombre, descripcion, es_sistema)
VALUES ('Cédula de Ciudadanía', 'Documento de identidad oficial', true);

-- 2. Usar tabla documentos existente
documentos {
  id
  cliente_id
  categoria_id  ← ID de categoría "Cédula"
  archivo_url
  version
  fecha_carga
}
```

### Ventajas:
✅ **Usa sistema existente**: Todo unificado en módulo de documentos
✅ **Versionado automático**: Historial si cambia cédula
✅ **Categorías predefinidas**: Consistencia de datos
✅ **UI ya existe**: Tab "Documentos" ya implementado
✅ **Auditoría completa**: Quién subió, cuándo, versiones

### Desventajas:
❌ **Más complejo de validar**: Requiere join y filtro por categoría
❌ **Requiere categoría "sistema"**: Nueva tabla o campo
❌ **Consultas más lentas**: JOIN clientes + documentos + categorias
❌ **Más código**: Lógica adicional para filtrar categoría especial

### Implementación:
```typescript
// 1. Crear categoría "Cédula" (una sola vez)
const { data: categoria } = await supabase
  .from('categorias_documentos')
  .insert({
    nombre: 'Cédula de Ciudadanía',
    descripcion: 'Documento de identidad oficial',
    es_sistema: true,  // No editable/eliminable
    icono: 'id-card'
  })
  .select()
  .single();

// 2. Subir como documento normal
await crearDocumento({
  cliente_id: clienteId,
  categoria_id: categoria.id,  ← Categoría fija "Cédula"
  archivo_url: publicUrl,
  nombre_archivo: 'Cédula de Ciudadanía'
});

// 3. Validar (MÁS COMPLEJO)
const { data: cedula } = await supabase
  .from('documentos')
  .select('*, categoria:categorias_documentos(*)')
  .eq('cliente_id', clienteId)
  .eq('categoria.nombre', 'Cédula de Ciudadanía')
  .order('version', { ascending: false })
  .limit(1)
  .single();

if (!cedula) {
  // Bloquear creación
}
```

### Flujo de usuario:
```
1. Crear cliente
2. Ver detalle → Tab "Documentos"
3. Sección "Documentos de Identidad" (nueva)
   - Categoría "Cédula de Ciudadanía" (predefinida)
   - [Subir] → Modal del módulo de documentos
4. Se crea registro en tabla documentos
5. Aparece en lista de documentos del cliente
```

**Interactúa completamente con módulo de documentos existente.**

---

## ✅ **OPCIÓN C: Híbrido (Campo + Referencia)** (Más robusto)

### Cómo funciona:
```sql
-- Tabla clientes mantiene referencia
clientes {
  id
  documento_identidad_id UUID  ← REFERENCIA a documentos
}

-- Tabla documentos almacena archivo
documentos {
  id  ← Este ID se guarda en clientes
  categoria_id (Cédula)
  archivo_url
  version
}
```

### Ventajas:
✅ **Acceso rápido**: JOIN simple por ID
✅ **Versionado**: Usa sistema de documentos
✅ **Validación fácil**: `if (!cliente.documento_identidad_id)`
✅ **Historial completo**: Todas las versiones en documentos
✅ **Categoría predefinida**: Consistencia de datos

### Desventajas:
❌ **Más complejo**: Requiere JOIN siempre
❌ **Dos actualizaciones**: Crear documento + actualizar cliente
❌ **Migración**: Agregar campo nuevo a clientes

### Implementación:
```typescript
// 1. Subir como documento
const { data: documento } = await crearDocumento({
  cliente_id: clienteId,
  categoria_id: categoriaCedulaId,
  archivo_url: publicUrl
});

// 2. Actualizar referencia en cliente
await supabase
  .from('clientes')
  .update({ documento_identidad_id: documento.id })
  .eq('id', clienteId);

// 3. Validar
const { data: cliente } = await supabase
  .from('clientes')
  .select('*, cedula:documento_identidad_id(*)')
  .eq('id', clienteId)
  .single();

if (!cliente.cedula) {
  // Bloquear
}
```

---

## 📊 COMPARACIÓN RÁPIDA

| Aspecto | Opción A (Campo) | Opción B (Categoría) | Opción C (Híbrido) |
|---------|------------------|----------------------|-------------------|
| **Complejidad** | ⭐ Baja | ⭐⭐⭐ Alta | ⭐⭐ Media |
| **Velocidad consultas** | ⭐⭐⭐ Rápida | ⭐ Lenta (JOIN) | ⭐⭐ Media |
| **Versionado** | ❌ No | ✅ Sí | ✅ Sí |
| **Integración docs** | ❌ No | ✅ Total | ✅ Parcial |
| **Tiempo desarrollo** | 1.5 hrs | 3 hrs | 2.5 hrs |
| **Validación** | ⭐⭐⭐ Simple | ⭐ Compleja | ⭐⭐ Media |
| **Migración DB** | ✅ Ya existe | ⚠️ Crear categoría | ⚠️ Agregar campo |

---

## 🎯 MI RECOMENDACIÓN

### **OPCIÓN A: Campo Directo** ⭐⭐⭐⭐⭐

**¿Por qué?**
1. **Simplicidad**: La cédula es UN documento crítico, no varios
2. **Velocidad**: Consultas directas, sin JOINs innecesarios
3. **Validación obvia**: `!cliente.documento_identidad_url`
4. **Ya existe el campo**: `documento_identidad_url` ya está en tu schema
5. **No contamina módulo de docs**: Ese módulo es para docs generales/múltiples

**¿Cuándo NO usarla?**
- Si necesitas historial de versiones de cédula
- Si quieres TODO centralizado en módulo de documentos

---

## 🚀 ¿QUÉ ENFOQUE ELIGES?

### Opción A (Campo Directo) - RECOMENDADA
```
✅ Implemento ModalSubirCedula que actualiza clientes.documento_identidad_url
✅ Banner valida cliente.documento_identidad_url
✅ NO toca módulo de documentos
⏱️ Tiempo: 1.5 horas
```

### Opción B (Categoría en Docs)
```
✅ Creo categoría "Cédula de Ciudadanía" (es_sistema: true)
✅ ModalSubirCedula usa servicio de documentos
✅ Validación consulta documentos por categoría
⏱️ Tiempo: 3 horas
```

### Opción C (Híbrido)
```
✅ Agrego campo documento_identidad_id a clientes
✅ Subo como documento + actualizo referencia
✅ Validación por JOIN
⏱️ Tiempo: 2.5 horas
```

---

## 📝 TU DECISIÓN

**Escribe A, B o C** y procedo a implementar el enfoque que prefieras.

O si tienes dudas, pregúntame:
- ¿Necesitas historial de versiones de cédula?
- ¿Prefieres TODO en un solo sistema?
- ¿Velocidad es más importante que versionado?
