# 🗑️ POLÍTICA DE ELIMINACIÓN DE VERSIONES DE DOCUMENTOS

**Fecha de creación**: 2025-11-08
**Módulo**: Documentos de Viviendas
**Objetivo**: Mantener integridad de datos y trazabilidad de auditoría

---

## 📋 RESUMEN EJECUTIVO

Para mantener la aplicación en buen estado, la eliminación de versiones de documentos está **controlada por reglas de negocio estrictas** que protegen la integridad del historial y la trazabilidad.

---

## ✅ VERSIONES QUE **SÍ** SE PUEDEN ELIMINAR

### 1. **Versiones intermedias (ni actual, ni original)**
- **Ejemplo**: Si tienes versiones 1, 2, 3, 4, 5 (actual) → Puedes eliminar 2, 3, 4
- **Razón**: Son versiones de trabajo que pueden contener errores o duplicados
- **Condición**: Debe quedar al menos 2 versiones activas (original + actual)

### 2. **Versiones subidas por error**
- Archivos incorrectos, duplicados accidentales
- **Razón**: Limpieza de datos innecesarios

### 3. **Versiones con información sensible**
- Datos personales no autorizados, información confidencial
- **Razón**: Cumplimiento de protección de datos (GDPR, LOPD)

---

## ❌ VERSIONES QUE **NO** SE PUEDEN ELIMINAR

### 1. **Versión ORIGINAL (versión 1)** 🛡️
- **Regla**: `version === 1` → **PROTEGIDA**
- **Razón**:
  - Es el documento fundacional
  - Pérdida de trazabilidad completa
  - Punto de partida histórico
- **Excepción**: Solo Admin con motivo justificado (no implementado aún)
- **Badge visual**: "⭐ Original" + "🔒 Protegida"

### 2. **Versión ACTUAL (es_version_actual = true)** 🛡️
- **Regla**: `es_version_actual === true` → **PROTEGIDA**
- **Razón**:
  - Es la versión vigente
  - Usuarios dependen de ella
  - Evita inconsistencias
- **Solución**: Primero restaurar otra versión, luego eliminar
- **Badge visual**: "✓ Actual" + "🔒 Protegida"

### 3. **Última versión disponible** 🛡️
- **Regla**: Si `versionesActivas.length <= 2` → **NO PERMITIR**
- **Razón**:
  - Dejaría el documento sin contenido útil
  - Debe mantener al menos original + actual
- **Error**: "Debe mantener al menos 2 versiones activas"

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Backend (Service)**
```typescript
// Archivo: documentos-vivienda.service.ts

async eliminarVersion(versionId: string, userId: string, motivo: string) {
  // ✅ VALIDACIÓN 1: No eliminar versión ACTUAL
  if (version.es_version_actual) {
    throw new Error('❌ No se puede eliminar la versión actual')
  }

  // ✅ VALIDACIÓN 2: No eliminar versión ORIGINAL
  if (version.version === 1) {
    throw new Error('❌ No se puede eliminar la versión original')
  }

  // ✅ VALIDACIÓN 3: Mantener al menos 2 versiones activas
  if (versionesActivas.length <= 2) {
    throw new Error('❌ Debe mantener al menos 2 versiones activas')
  }

  // ✅ SOFT DELETE (no elimina archivo físico)
  await this.supabase
    .from('documentos_vivienda')
    .update({ estado: 'eliminado', metadata: { ... } })
    .eq('id', versionId)
}
```

### **Frontend (Componente)**
```typescript
// Archivo: documento-versiones-modal-vivienda.tsx

// Lógica de validación en UI
const esActual = version.es_version_actual
const esOriginal = version.version === 1
const versionesActivas = versiones.filter(v => v.estado === 'activo').length
const puedeEliminar = !esActual && !esOriginal && versionesActivas > 2

// Botón deshabilitado si no se puede eliminar
<button
  disabled={!puedeEliminar || eliminando}
  title={tooltipEliminar}
>
  Eliminar
</button>
```

---

## 🎨 INDICADORES VISUALES

### **Badges en el historial de versiones:**

1. **Versión Actual**:
   - Badge: `✓ Actual` (verde)
   - Badge: `🔒 Protegida` (ámbar)
   - Botón "Eliminar": Deshabilitado con tooltip

2. **Versión Original**:
   - Badge: `⭐ Original` (azul)
   - Badge: `🔒 Protegida` (ámbar)
   - Botón "Eliminar": Deshabilitado con tooltip

3. **Versión Intermedia Eliminable**:
   - Badge: `Versión X` (gris)
   - Botón "Eliminar": Habilitado

---

## 🔍 CASOS DE USO

### **Caso 1: Documento con 5 versiones**
```
Versión 1 (Original)     → ❌ NO SE PUEDE ELIMINAR (es original)
Versión 2                → ✅ SE PUEDE ELIMINAR
Versión 3                → ✅ SE PUEDE ELIMINAR
Versión 4                → ✅ SE PUEDE ELIMINAR
Versión 5 (Actual)       → ❌ NO SE PUEDE ELIMINAR (es actual)
```

### **Caso 2: Documento con 3 versiones**
```
Versión 1 (Original)     → ❌ NO SE PUEDE ELIMINAR (es original)
Versión 2                → ✅ SE PUEDE ELIMINAR
Versión 3 (Actual)       → ❌ NO SE PUEDE ELIMINAR (es actual)
```

### **Caso 3: Documento con 2 versiones (mínimo)**
```
Versión 1 (Original)     → ❌ NO SE PUEDE ELIMINAR (es original)
Versión 2 (Actual)       → ❌ NO SE PUEDE ELIMINAR (es actual)
```
**Resultado**: Ninguna versión se puede eliminar (protección total)

---

## 📊 BENEFICIOS

✅ **Integridad de datos**: Historial completo siempre disponible
✅ **Auditoría**: Trazabilidad desde la versión original
✅ **Seguridad**: Evita eliminación accidental de documentos importantes
✅ **Cumplimiento legal**: Mantiene evidencia documental
✅ **UX clara**: Usuarios entienden por qué no pueden eliminar

---

## 🚀 MEJORAS FUTURAS (No implementadas)

1. **Eliminación de versión original por Admin**
   - Solo rol `Administrador` con motivo obligatorio
   - Log en `audit_log_seguridad`

2. **Protección por antigüedad**
   - Versiones > 90 días → Bloqueadas automáticamente
   - Solo Admin puede eliminar

3. **Papelera de reciclaje**
   - Versiones eliminadas van a "papelera" por 30 días
   - Posibilidad de restaurar antes de eliminación física

4. **Permisos granulares**
   - Configurar por rol quién puede eliminar versiones
   - Límites de antigüedad por tipo de documento

---

## 📝 REGISTRO DE CAMBIOS

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-11-08 | Implementación inicial de políticas de eliminación | Sistema |

---

## 📚 REFERENCIAS

- **Código**: `src/modules/viviendas/services/documentos-vivienda.service.ts` (línea 740)
- **Componente**: `src/modules/viviendas/components/documentos/documento-versiones-modal-vivienda.tsx`
- **Schema DB**: `supabase/migrations/20250106000001_sistema_documentos_viviendas.sql`
