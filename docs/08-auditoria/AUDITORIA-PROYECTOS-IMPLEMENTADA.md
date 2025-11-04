# ✅ Auditoría Implementada - Módulo Proyectos

**Fecha**: 2025-11-04
**Módulo**: Proyectos
**Estado**: ✅ Implementado y Listo

---

## 📋 Resumen

Se ha implementado **auditoría completa** en el módulo de Proyectos, registrando todas las operaciones CRUD:

- ✅ **Crear** proyecto → Registra datos completos + metadata
- ✅ **Actualizar** proyecto → Registra cambios específicos (antes/después)
- ✅ **Eliminar** proyecto → Registra snapshot completo antes de eliminar

---

## 🔍 Operaciones Auditadas

### 1. Creación de Proyecto

**Archivo**: `src/modules/proyectos/services/proyectos.service.ts`
**Método**: `crearProyecto()`

```typescript
await auditService.auditarCreacion(
  'proyectos',
  proyecto.id,
  proyectoCompleto,
  {
    total_manzanas: manzanas.length,
    presupuesto_formateado: `$${proyecto.presupuesto?.toLocaleString()}`,
  },
  'proyectos'
)
```

**¿Qué se registra?**
- ✅ ID del proyecto creado
- ✅ Todos los datos del proyecto (nombre, descripción, ubicación, etc.)
- ✅ Manzanas asociadas
- ✅ Total de manzanas creadas
- ✅ Presupuesto formateado
- ✅ Usuario que creó (automático)
- ✅ Fecha y hora (automático)

---

### 2. Actualización de Proyecto

**Método**: `actualizarProyecto()`

```typescript
// 1. Captura datos ANTES
const proyectoAnterior = await this.obtenerProyecto(id)

// 2. Actualiza en DB
const proyectoActualizado = await supabase.update(...)

// 3. Registra auditoría
await auditService.auditarActualizacion(
  'proyectos',
  id,
  proyectoAnterior,
  proyectoActualizado,
  {
    campos_modificados: Object.keys(updateData),
  },
  'proyectos'
)
```

**¿Qué se registra?**
- ✅ Datos ANTES del cambio (snapshot completo)
- ✅ Datos DESPUÉS del cambio (snapshot completo)
- ✅ Cambios específicos por campo (calculado automáticamente)
- ✅ Lista de campos modificados
- ✅ Usuario que modificó
- ✅ Fecha y hora

**Ejemplo de cambios específicos**:
```json
{
  "nombre": {
    "antes": "Proyecto Los Álamos",
    "despues": "Proyecto Los Álamos - Fase 2"
  },
  "presupuesto": {
    "antes": 500000,
    "despues": 750000
  }
}
```

---

### 3. Eliminación de Proyecto

**Método**: `eliminarProyecto()`

```typescript
// 1. Captura datos ANTES de eliminar
const proyectoEliminado = await this.obtenerProyecto(id)

// 2. Elimina de DB
await supabase.delete(...)

// 3. Registra auditoría
await auditService.auditarEliminacion(
  'proyectos',
  id,
  proyectoEliminado,
  {
    nombre_proyecto: proyectoEliminado.nombre,
    total_manzanas: proyectoEliminado.manzanas.length,
    estado_al_eliminar: proyectoEliminado.estado,
  },
  'proyectos'
)
```

**¿Qué se registra?**
- ✅ Snapshot completo del proyecto eliminado
- ✅ Nombre del proyecto
- ✅ Total de manzanas que tenía
- ✅ Estado en el que estaba
- ✅ Usuario que eliminó
- ✅ Fecha y hora
- ⚠️ **CRÍTICO**: Los datos quedan guardados en `audit_log` aunque el proyecto ya no exista

---

## 🔒 Características de Seguridad

### Fail-Safe (a prueba de fallos)

```typescript
try {
  await auditService.auditarCreacion(...)
} catch (auditError) {
  console.error('Error al auditar:', auditError)
  // No lanzamos error, la auditoría es secundaria
}
```

- ✅ Si la auditoría falla, **NO bloquea** la operación principal
- ✅ Errores de auditoría solo se logean en consola
- ✅ El usuario NO ve errores de auditoría
- ✅ La aplicación sigue funcionando normalmente

### Metadata Automática

El `auditService` agrega automáticamente:

- ✅ **Usuario**: ID y email del usuario autenticado
- ✅ **Rol**: Rol del usuario (Administrador, Gerente, Vendedor)
- ✅ **IP Address**: IP desde donde se hizo el cambio
- ✅ **User Agent**: Navegador/dispositivo usado
- ✅ **Fecha evento**: Timestamp exacto

---

## 📊 Consultas Disponibles

### 1. Ver historial de un proyecto específico

```typescript
import { supabase } from '@/lib/supabase/client'

const { data } = await supabase.rpc('obtener_historial_registro', {
  p_tabla: 'proyectos',
  p_registro_id: 'uuid-del-proyecto',
  p_limit: 50
})
```

**Resultado**:
```json
[
  {
    "accion": "UPDATE",
    "fecha_evento": "2025-11-04T10:30:00Z",
    "usuario_email": "admin@ryr.com",
    "cambios_especificos": {
      "estado": {
        "antes": "en_planificacion",
        "despues": "en_construccion"
      }
    }
  },
  {
    "accion": "CREATE",
    "fecha_evento": "2025-11-01T08:00:00Z",
    "usuario_email": "gerente@ryr.com"
  }
]
```

### 2. Ver actividad de un usuario

```typescript
const { data } = await supabase.rpc('obtener_actividad_usuario', {
  p_usuario_id: 'uuid-del-usuario',
  p_dias: 30,
  p_limit: 100
})
```

### 3. Ver resumen por módulo

```typescript
const { data } = await supabase
  .from('v_auditoria_por_modulo')
  .select('*')
```

---

## 🧪 Cómo Probar

### Prueba 1: Crear Proyecto

1. Ve a **Proyectos** → **Nuevo Proyecto**
2. Llena el formulario y guarda
3. Verifica en Supabase:

```sql
SELECT * FROM audit_log
WHERE tabla = 'proyectos'
AND accion = 'CREATE'
ORDER BY fecha_evento DESC
LIMIT 1;
```

**Deberías ver**:
- ✅ `accion = 'CREATE'`
- ✅ `datos_nuevos` con toda la info del proyecto
- ✅ `datos_anteriores = NULL`
- ✅ `usuario_email` = tu email
- ✅ `metadata` con `total_manzanas` y `presupuesto_formateado`

### Prueba 2: Actualizar Proyecto

1. Edita un proyecto existente (cambia nombre o presupuesto)
2. Guarda cambios
3. Verifica en Supabase:

```sql
SELECT
  accion,
  usuario_email,
  cambios_especificos,
  fecha_evento
FROM audit_log
WHERE tabla = 'proyectos'
AND accion = 'UPDATE'
ORDER BY fecha_evento DESC
LIMIT 1;
```

**Deberías ver**:
- ✅ `cambios_especificos` solo con los campos modificados
- ✅ Valores `antes` y `despues` para cada campo

### Prueba 3: Eliminar Proyecto

1. Elimina un proyecto (⚠️ **CUIDADO** en producción)
2. Verifica en Supabase:

```sql
SELECT * FROM audit_log
WHERE tabla = 'proyectos'
AND accion = 'DELETE'
ORDER BY fecha_evento DESC
LIMIT 1;
```

**Deberías ver**:
- ✅ `datos_anteriores` con snapshot completo
- ✅ `datos_nuevos = NULL`
- ✅ `metadata` con nombre del proyecto eliminado

---

## 📈 Próximos Pasos

### ✅ Completado:
- [x] Implementar auditoría en `crearProyecto()`
- [x] Implementar auditoría en `actualizarProyecto()`
- [x] Implementar auditoría en `eliminarProyecto()`
- [x] Manejo de errores con try/catch
- [x] Metadata personalizada por operación
- [x] Documentación completa

### 🔜 Siguientes módulos:

1. **Viviendas** (operaciones similares a proyectos)
2. **Clientes** (operaciones similares a proyectos)
3. **Negociaciones** (CRÍTICO - incluye cambios de estado)
4. **Abonos** (CRÍTICO - involucra dinero)

### 🎨 Componentes UI (futuro):

- [ ] Componente `<HistorialAuditoria />` para mostrar cambios
- [ ] Modal de "Ver Historial" en detalle de proyecto
- [ ] Badge de "Última modificación por X"
- [ ] Timeline de cambios

---

## 🐛 Troubleshooting

### Error: "audit_log table does not exist"

**Solución**: Ejecutar migración:
```bash
# Copiar contenido de supabase/migrations/20251104_create_audit_log.sql
# Pegar en Supabase Dashboard → SQL Editor → Run
```

### Error: "permission denied for table audit_log"

**Solución**: Las políticas RLS están configuradas. Solo administradores pueden leer `audit_log`. El servicio inserta con `authenticated` role.

### No se registran auditorías

**Verificar**:
1. ¿El usuario está autenticado? (`auth.uid()` debe existir)
2. ¿Hay errores en consola del navegador?
3. ¿La migración se ejecutó correctamente?

```sql
-- Verificar que la tabla existe
SELECT COUNT(*) FROM audit_log;

-- Ver últimas auditorías
SELECT * FROM audit_log ORDER BY fecha_evento DESC LIMIT 10;
```

---

## 📚 Referencias

- **Plan completo**: `docs/08-auditoria/PLAN-AUDITORIA-COMPLETA.md`
- **Implementación general**: `docs/08-auditoria/IMPLEMENTACION-AUDITORIA.md`
- **Servicio TypeScript**: `src/services/audit.service.ts`
- **Tipos**: `src/types/audit.types.ts`
- **Migración SQL**: `supabase/migrations/20251104_create_audit_log.sql`
