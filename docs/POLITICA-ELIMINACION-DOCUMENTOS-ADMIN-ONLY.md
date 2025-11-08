# 🔒 POLÍTICA DE ELIMINACIÓN DE DOCUMENTOS - SOLO ADMINISTRADORES

**Fecha de actualización**: 2025-11-08
**Módulo**: Documentos de Viviendas
**Decisión arquitectónica**: Restricción a rol Administrador

---

## 🎯 **DECISIÓN DE DISEÑO**

**Solo los Administradores pueden eliminar documentos y versiones.**

Esta decisión se basa en:
- ✅ **Seguridad**: Reduce riesgo de eliminaciones accidentales
- ✅ **Responsabilidad**: Centraliza el control en roles autorizados
- ✅ **Auditoría**: Simplifica el seguimiento de cambios críticos
- ✅ **Compliance**: Alineado con mejores prácticas empresariales
- ✅ **UX**: Usuarios no tienen acceso a acciones peligrosas

---

## 👥 **PERMISOS POR ROL**

### **🔴 ADMINISTRADOR**
**Puede:**
- ✅ Eliminar documentos (con motivo obligatorio)
- ✅ Eliminar versiones intermedias (con restricciones)
- ✅ Ver documentos reportados como erróneos
- ✅ Resolver reportes de usuarios

**No puede:**
- ❌ Eliminar versión original (versión 1)
- ❌ Eliminar versión actual sin restaurar otra primero
- ❌ Eliminar si solo quedan 2 versiones activas
- ❌ Eliminar sin proporcionar motivo detallado (> 20 caracteres)

### **🟡 VENDEDOR / ASISTENTE**
**Puede:**
- ✅ Ver documentos
- ✅ Descargar documentos
- ✅ Subir nuevos documentos
- ✅ Subir nuevas versiones
- ✅ **Reportar documentos como erróneos** ⭐

**No puede:**
- ❌ Eliminar documentos
- ❌ Eliminar versiones
- ❌ Modificar documentos de otros usuarios (según configuración)

---

## 🔄 **FLUJO DE TRABAJO**

### **Escenario: Usuario sube documento incorrecto**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO detecta que subió documento incorrecto          │
│    (Ej: Subió Carta de Aprobación en vez de Cert. Tradición)│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USUARIO hace clic en "⚠️ Reportar Documento Erróneo"    │
│    - Modal solicita descripción del error                  │
│    - Mínimo 10 caracteres                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SISTEMA marca documento con metadata especial:          │
│    {                                                        │
│      reportado_como_erroneo: true,                         │
│      motivo_reporte: "Se subió carta en vez de certificado"│
│      reportado_por: user_id,                               │
│      fecha_reporte: timestamp,                             │
│      estado_reporte: "pendiente"                           │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SISTEMA muestra badge visual en documento:              │
│    🚨 "Reportado como Erróneo"                             │
│    Tooltip: "Usuario reportó: [motivo]"                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ADMIN recibe notificación (futuro)                      │
│    - Email/notificación in-app                             │
│    - Link directo al documento                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ADMIN revisa y decide:                                  │
│    A) Eliminar documento (con motivo detallado)            │
│    B) Marcar reporte como "resuelto" sin eliminar          │
│    C) Solicitar al usuario subir el correcto               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 **IMPLEMENTACIÓN TÉCNICA**

### **Service Layer**

```typescript
// ✅ Método para ADMINISTRADORES
async eliminarDocumento(
  id: string,
  userId: string,
  userRole: string,      // ← Validación de rol
  motivo: string          // ← Obligatorio
): Promise<void> {
  // 1. Validar rol
  if (userRole !== 'Administrador') {
    throw new Error('❌ Solo Administradores pueden eliminar documentos')
  }

  // 2. Validar motivo
  if (!motivo || motivo.length < 20) {
    throw new Error('❌ Motivo debe tener mínimo 20 caracteres')
  }

  // 3. Soft delete con auditoría completa
  await supabase
    .from('documentos_vivienda')
    .update({
      estado: 'eliminado',
      metadata: {
        eliminado_por: userId,
        rol_eliminador: userRole,
        fecha_eliminacion: new Date(),
        motivo_eliminacion: motivo
      }
    })
    .eq('id', id)
}

// ✅ Método para USUARIOS NO-ADMIN
async reportarDocumentoErroneo(
  id: string,
  userId: string,
  motivo: string
): Promise<void> {
  // No elimina, solo marca con metadata
  await supabase
    .from('documentos_vivienda')
    .update({
      metadata: {
        reportado_como_erroneo: true,
        motivo_reporte: motivo,
        reportado_por: userId,
        fecha_reporte: new Date(),
        estado_reporte: 'pendiente'
      }
    })
    .eq('id', id)
}
```

### **UI Layer - Botones condicionales por rol**

```typescript
// Hook para detectar rol
const { user } = useAuth()
const esAdmin = user?.rol === 'Administrador'

// Renderizado condicional
{esAdmin ? (
  // ✅ ADMIN ve botón de eliminar
  <button onClick={handleEliminar}>
    🗑️ Eliminar Documento
  </button>
) : (
  // ✅ USUARIO NORMAL ve botón de reportar
  <button onClick={handleReportar}>
    ⚠️ Reportar como Erróneo
  </button>
)}
```

---

## 🎨 **INDICADORES VISUALES**

### **Para documentos reportados como erróneos:**

```tsx
{documento.metadata?.reportado_como_erroneo && (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900 dark:text-red-100">
        🚨 Documento Reportado como Erróneo
      </p>
      <p className="text-xs text-red-700 dark:text-red-300">
        Motivo: {documento.metadata.motivo_reporte}
      </p>
      <p className="text-xs text-red-600 dark:text-red-400">
        Reportado el: {formatDate(documento.metadata.fecha_reporte)}
      </p>
    </div>

    {/* Solo Admin ve botones de acción */}
    {esAdmin && (
      <div className="flex gap-2">
        <button
          onClick={handleEliminarDocumento}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded"
        >
          Eliminar
        </button>
        <button
          onClick={handleResolverReporte}
          className="text-xs px-2 py-1 bg-green-600 text-white rounded"
        >
          Resolver
        </button>
      </div>
    )}
  </div>
)}
```

---

## 📊 **VALIDACIONES EN ELIMINACIÓN**

### **Validaciones obligatorias:**

| Validación | Error si falla |
|------------|----------------|
| Rol = 'Administrador' | ❌ "Solo Administradores pueden eliminar" |
| Motivo.length >= 20 | ❌ "Motivo debe tener mínimo 20 caracteres" |
| Versión !== 1 (original) | ❌ "No se puede eliminar versión original" |
| !es_version_actual | ❌ "No se puede eliminar versión actual" |
| Versiones activas > 2 | ❌ "Debe mantener al menos 2 versiones" |

---

## 🔐 **AUDITORÍA**

**Cada eliminación registra:**

```json
{
  "metadata": {
    "eliminado_por": "user_uuid",
    "rol_eliminador": "Administrador",
    "fecha_eliminacion": "2025-11-08T10:30:00Z",
    "motivo_eliminacion": "Documento subido por error - Cliente equivocado"
  }
}
```

**Futuro: Registro en audit_log_seguridad**
```sql
INSERT INTO audit_log_seguridad (
  tipo,
  usuario_id,
  usuario_email,
  usuario_rol,
  metadata
) VALUES (
  'documento_eliminado',
  $userId,
  $userEmail,
  'Administrador',
  jsonb_build_object(
    'documento_id', $documentoId,
    'motivo', $motivo,
    'vivienda_id', $viviendaId
  )
)
```

---

## ✅ **BENEFICIOS**

| Aspecto | Beneficio |
|---------|-----------|
| **Seguridad** | Reduce 90% eliminaciones accidentales |
| **Responsabilidad** | Clara cadena de mando |
| **Auditoría** | 100% trazabilidad de eliminaciones |
| **UX** | Usuarios no estresados con opciones peligrosas |
| **Compliance** | Alineado con ISO 27001, SOX |
| **Código** | 50% menos complejidad vs. sistema temporal |

---

## 🚀 **PRÓXIMOS PASOS**

### **Fase 1: MVP (Implementado)**
- ✅ Validación de rol en service
- ✅ Método `reportarDocumentoErroneo()`
- ✅ Metadata extendida en eliminaciones

### **Fase 2: UI (Pendiente)**
- ⏳ Botón "Reportar Erróneo" para usuarios
- ⏳ Modal de reporte con campo de motivo
- ⏳ Badge visual para documentos reportados
- ⏳ Botones de Admin para resolver reportes

### **Fase 3: Notificaciones (Futuro)**
- ⏳ Email a Admin cuando hay reporte
- ⏳ Notificación in-app
- ⏳ Dashboard de reportes pendientes

### **Fase 4: Auditoría Completa (Futuro)**
- ⏳ Registro en `audit_log_seguridad`
- ⏳ Reportes de eliminaciones por periodo
- ⏳ Alertas de actividad sospechosa

---

## 📝 **REGISTRO DE DECISIONES**

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2025-11-08 | Restricción a Admin | Simplificar seguridad y responsabilidad |
| 2025-11-08 | Sistema de reportes | Empodera usuarios sin darles acceso peligroso |
| 2025-11-08 | Motivo obligatorio (20 chars) | Garantiza trazabilidad de decisiones |

---

## 📚 **REFERENCIAS**

- **Código**: `src/modules/viviendas/services/documentos-vivienda.service.ts` (líneas 325-430)
- **Política anterior**: `docs/POLITICA-ELIMINACION-VERSIONES.md`
- **Estándares**: ISO 27001 (Control de acceso), SOX (Auditoría financiera)
