# 🔒 Validaciones de Eliminación de Categorías

## 📋 Resumen

Sistema de validaciones para la eliminación segura de categorías de documentos en el sistema RyR Constructora.

---

## ✅ Validaciones Implementadas

### **1️⃣ VALIDACIÓN DE ROL (Obligatoria)**

**Regla:** Solo usuarios con rol `Administrador` pueden eliminar categorías

**Implementación:**
- **Backend:** `CategoriasService.eliminarCategoria()`
- **Frontend:** Botón de eliminar oculto para no-administradores

**Flujo:**
```typescript
// 1. Verificar rol del usuario autenticado
const { data: usuario } = await supabase
  .from('usuarios')
  .select('rol')
  .eq('id', user.id)
  .single()

if (usuario.rol !== 'Administrador') {
  throw new Error('Solo los administradores pueden eliminar categorías')
}
```

**Mensaje de error:**
```
❌ "Solo los administradores pueden eliminar categorías"
```

---

### **2️⃣ VALIDACIÓN DE DOCUMENTOS ASOCIADOS (Crítica)**

**Regla:** No permitir eliminar categorías que tengan documentos asociados en cualquier módulo

**Verificación en 3 tablas:**
- `documentos_proyecto`
- `documentos_cliente`
- `documentos_vivienda`

**Flujo:**
```typescript
// Contar documentos en cada tabla
const { count: countProyectos } = await supabase
  .from('documentos_proyecto')
  .select('id', { count: 'exact', head: true })
  .eq('categoria_id', categoriaId)

// Similar para clientes y viviendas
const totalDocumentos = (countProyectos || 0) + (countClientes || 0) + (countViviendas || 0)

if (totalDocumentos > 0) {
  throw new Error(`No se puede eliminar...`)
}
```

**Mensajes de error:**
```
❌ "No se puede eliminar esta categoría porque tiene 5 documento(s) asociado(s): 3 en Proyectos, 2 en Viviendas"

❌ "No se puede eliminar esta categoría porque tiene 1 documento(s) asociado(s): 1 en Clientes"
```

---

## 🎯 Flujo Completo de Eliminación

```
┌─────────────────────────────────────────────┐
│ 1. Usuario click "Eliminar" (icono 🗑️)     │
│    ↓                                        │
│ 2. ¿Es Administrador?                       │
│    ├─ No  → Botón no visible (UI)          │
│    └─ Sí  → Continuar                       │
│              ↓                              │
│ 3. Modal confirmación                       │
│    "¿Estás seguro de eliminar?"            │
│    ├─ Cancelar → Cerrar modal              │
│    └─ Confirmar → Continuar                 │
│                  ↓                          │
│ 4. Validar rol en Backend                  │
│    ├─ No Admin → ❌ Error                   │
│    └─ Admin    → Continuar                  │
│                  ↓                          │
│ 5. Contar documentos asociados              │
│    ├─ Tiene docs → ❌ Error con detalle     │
│    └─ Sin docs  → ✅ Eliminar               │
│                  ↓                          │
│ 6. Refrescar lista de categorías            │
│    Toast: "Categoría eliminada"             │
└─────────────────────────────────────────────┘
```

---

## 🔧 Archivos Modificados

### **Backend (Service)**
```
src/modules/documentos/services/categorias.service.ts
```
- ✅ Validación de rol de administrador
- ✅ Validación de documentos en 3 tablas
- ✅ Mensajes de error descriptivos

### **Frontend (UI)**
```
src/modules/documentos/components/categorias/categorias-manager.tsx
```
- ✅ Botón eliminar solo visible para administradores
- ✅ Uso de `useAuth()` para verificar rol
- ✅ Tooltip descriptivo

---

## 🧪 Testing

### **Casos de prueba:**

1. ✅ **Usuario no-admin no ve botón eliminar**
2. ✅ **Usuario admin ve botón eliminar**
3. ✅ **Error si categoría tiene documentos en Proyectos**
4. ✅ **Error si categoría tiene documentos en Clientes**
5. ✅ **Error si categoría tiene documentos en Viviendas**
6. ✅ **Éxito si categoría no tiene documentos**
7. ✅ **Error descriptivo con cantidad de documentos**

---

## 📊 Scripts SQL de Verificación

### **Ver uso de categorías:**
```sql
-- Ejecutar: npm run db:exec supabase/verification/validar-eliminacion-categorias.sql
```

### **Resumen de categorías:**
```sql
-- Ejecutar: npm run db:exec supabase/verification/resumen-categorias-final.sql
```

---

## 🚀 Mejoras Futuras (Opcionales)

### **Sugerencias NO implementadas aún:**

1. **Reasignación de documentos:**
   - Permitir reasignar documentos a otra categoría antes de eliminar

2. **Categorías del sistema:**
   - Proteger categorías esenciales con flag `es_sistema`

3. **Advertencia última categoría:**
   - Alertar si es la última categoría del módulo

4. **Soft delete:**
   - Archivado en lugar de eliminación física

5. **Auditoría:**
   - Log de quién eliminó qué categoría y cuándo

---

## 📝 Notas Importantes

- ⚠️ **Doble capa de seguridad:** UI oculta botón + Backend valida rol
- ✅ **Mensajes descriptivos:** Usuario sabe exactamente por qué no puede eliminar
- 🔒 **Solo administradores:** Protege integridad del sistema
- 📊 **Sin datos huérfanos:** Validación evita referencias rotas

---

**Última actualización:** 2025-11-14
**Autor:** Sistema RyR Constructora
