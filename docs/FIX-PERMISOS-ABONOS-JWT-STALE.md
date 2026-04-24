# 🔐 FIX: Permisos de Abonos no se Actualizan en Tiempo Real

**Fecha**: 2026-04-24
**Problema**: Aunque admin activa permiso para `Contabilidad` → `abonos`, usuarios no pueden acceder
**Causa Raíz**: JWT stale (token viejo con permisos obsoletos)
**Estado**: ✅ RESUELTO

---

## 📋 Resumen del Problema

### Síntomas
1. **Administrador** activa `Contabilidad` + `abonos` + `ver` en la tabla `permisos_rol` ✅
2. **Usuario Contabilidad** intenta acceder a `/abonos` ❌ "Acceso denegado"
3. **Usuario hace logout/login** → Acceso funciona ✅

### Por qué ocurría
El middleware valida permisos usando dos fuentes:

```
1ª Opción: JWT claim user_permisos (generado SOLO en login)
           ↓
           Si el usuario hizo login ANTES de actualizar el permiso
           → JWT contiene permisos viejos

2ª Opción: BD (fallback solo si cache vacío)
           ↓
           Si JWT tiene un array (aunque sea viejo), fallback NO se activa
           → Usuario sigue sin acceso
```

---

## 🔍 Arquitectura Antes del Fix

### Flujo de Validación (PROBLEMÁTICO)

```
Usuario hace login
    ↓
[custom_access_token_hook en Supabase]
    ↓
Lee permisos desde BD → Escribe en JWT claim user_permisos
    ↓
JWT generado: user_permisos: ['abonos.ver']
    ↓
Usuario navega a /abonos
    ↓
[middleware.ts]
    ↓
Extrae user_permisos del JWT → ['abonos.ver']
    ↓
¿Validar contra BD?
    → SÍ, pero SOLO si permisosCache.length === 0
    → SI TIENE VALORES, confía en JWT ❌ PROBLEMA
    ↓
(Admin después actualiza permisos en BD)
    ↓
Usuario sigue usando JWT viejo ❌
```

### Código Original (líneas 277-289 de middleware.ts)

```typescript
// ❌ PROBLEMA: Solo consulta BD si cache está VACÍO
if (permisosCache.length === 0 && rol !== 'Administrador') {
  try {
    const { data: permisosBD } = await supabase
      .from('permisos_rol')
      .select('modulo, accion')
      .eq('rol', rol)
      .eq('permitido', true)

    if (permisosBD && permisosBD.length > 0) {
      permisosCache = permisosBD.map(p => `${p.modulo}.${p.accion}`)
    }
  } catch {
    // Si falla, cache queda vacío
  }
}
```

**Lógica defectuosa**:
- Si JWT anterior = `['negociaciones.ver']` (sin abonos)
- Admin actualiza = `['abonos.ver', 'negociaciones.ver']`
- Middleware ve `permisosCache.length === 1` → `false`
- No consulta BD → Usuario sigue sin acceso a abonos ❌

---

## ✅ Solución Implementada

### Cambio en Middleware (src/middleware.ts, línea 277)

```typescript
// ✅ CORRECCIÓN: SIEMPRE consultar BD para no-Admins
// La BD es la fuente de verdad, no el JWT (que puede ser stale)
if (rol !== 'Administrador') {
  try {
    const { data: permisosBD } = await supabase
      .from('permisos_rol')
      .select('modulo, accion')
      .eq('rol', rol)
      .eq('permitido', true)

    if (permisosBD && permisosBD.length > 0) {
      // ✅ SIEMPRE usar permisos de BD (no confiar en JWT stale)
      permisosCache = permisosBD.map(p => `${p.modulo}.${p.accion}`)
      debugLog('✅ Permisos validados desde BD (fuente de verdad)', {
        rol,
        count: permisosCache.length,
        pathname,
      })
    } else {
      // Si la BD retorna nada, usuario sin permisos
      permisosCache = []
      debugLog('⚠️ Usuario sin permisos registrados en BD', {
        rol,
        pathname,
      })
    }
  } catch (error) {
    // Si falla la consulta BD, FALLBACK a JWT como último recurso
    debugLog('⚠️ Error consultando BD, usando JWT como fallback', {
      rol,
      error: (error as Error).message,
    })
    // permisosCache ya tiene valores del JWT
  }
}
```

### Flujo Nuevo (CORRECTO)

```
Usuario hace login ANTES
    ↓ (JWT generado con permisos viejos)
JWT: user_permisos: ['negociaciones.ver']
    ↓
Admin actualiza permisos en BD
    ↓ Nueva BD: Contabilidad | abonos | ver | true
    ↓
Usuario navega a /abonos
    ↓
[middleware.ts]
    ↓
Extrae user_permisos del JWT → ['negociaciones.ver']
    ↓
Consulta BD SIEMPRE (sin importar si cache vacío)
    ↓ BD retorna: ['abonos.ver', 'negociaciones.ver']
    ↓
REEMPLAZA permisosCache con valores BD
    ↓
Valida ruta /abonos necesita 'abonos.ver'
    ↓
¿Existe en permisosCache? SÍ ✅
    ↓
Usuario accede a /abonos ✅
```

---

## 🎯 Impacto

### Antes del Fix
- ❌ Cambios de permisos **NO reflejados** hasta logout/login
- ❌ Confusión en admin: "¿Por qué no funciona si lo actué?"
- ⚠️ Usuario de Contabilidad bloquedao aunque tenga permisos

### Después del Fix
- ✅ Cambios de permisos **efectivos inmediatamente**
- ✅ Middleware **SIEMPRE consulta BD** como fuente de verdad
- ✅ JWT es solo **optimización** (para estadísticas, logs, etc.)
- ⚡ **Performance**: 1 query extra por request (negligible, RLS es rápida)

---

## 🔧 Cómo Verificar

### Para el usuario de Contabilidad
```bash
# Paso 1: Admin activa permiso
# Ir a: Usuarios → Tab "Permisos" → Fila "Abonos" → Columna "Contabilidad" → Check ✓

# Paso 2: Usuario de Contabilidad intenta acceder
# NO necesita hacer logout/login
# Navega a /abonos
# ✅ Debería funcionar INMEDIATAMENTE
```

### Para verificar en BD (SQL)
```sql
-- Verificar que el permiso está activo
SELECT * FROM permisos_rol
WHERE rol = 'Contabilidad'
  AND modulo = 'abonos'
  AND accion = 'ver'
  AND permitido = true;

-- Resultado esperado: 1 fila
```

### Para ver logs del middleware
```typescript
// El middleware ahora logea:
debugLog('✅ Permisos validados desde BD (fuente de verdad)', {
  rol: 'Contabilidad',
  count: 3,  // Debería incluir abonos.ver
  pathname: '/abonos'
})
```

---

## 📊 Comparación: JWT vs BD

| Aspecto | JWT claim | BD (permisos_rol) |
|---------|-----------|------------------|
| **Actualización** | ⏱️ Solo en login | ✅ Inmediata |
| **Confiabilidad** | ⚠️ Puede estar stale | ✅ Fuente de verdad |
| **Performance** | ⚡ 0ms (en memoria) | ⏱️ 1 query RLS |
| **Consistencia** | ❌ Eventual | ✅ Fuerte |
| **Caso de uso** | Caché de corta duración | Validación de verdad |

---

## 🔐 Seguridad

### ¿Hay riesgo de consultar BD en cada request?
**No**, por estas razones:

1. **RLS Policy protege acceso**:
   ```sql
   CREATE POLICY "Usuarios pueden ver permisos de su rol"
     ON permisos_rol
     FOR SELECT
     TO authenticated
     USING (rol = (auth.jwt() ->> 'user_rol'))
   ```
   → Solo ve permisos de su propio rol

2. **Consulta optimizada**:
   ```sql
   SELECT modulo, accion FROM permisos_rol
   WHERE rol = 'Contabilidad'
     AND permitido = true
   ```
   → Índice: `idx_permisos_rol_rol_modulo(rol, modulo)` ✅ rápida

3. **Fallback a JWT si BD falla**:
   - Si Supabase no responde → usa JWT viejo (mejor que denegar todo)

---

## 📝 Checklist de Validación

- [x] Middleware **SIEMPRE** consulta BD para no-Admins
- [x] JWT es solo cache/optimization, no fuente de verdad
- [x] Cambios de permisos en admin son **inmediatos**
- [x] Logs claros en `debugLog()` para diagnóstico
- [x] RLS protege contra acceso no autorizado
- [x] Fallback a JWT si BD falla (resilencia)
- [x] Performance: índice en `permisos_rol(rol, modulo)`

---

## 🚀 Próximas Mejoras (Futuro)

### Si se requiere mejor performance
1. **Agregar caché en Redis**:
   ```
   BD → Redis (TTL 5 min) → Middleware
   ```
   Mantener performance pero actualizar cada 5 min

2. **Agregar timestamp a JWT**:
   ```
   JWT: user_permisos_timestamp: 1713960000
   Middleware: ¿JWT > 15 min? → Consultar BD
   ```

3. **Webhook de invalidación**:
   ```
   Admin actualiza permiso → Trigger Supabase → Invalida Redis
   ```

---

## 📚 Referencias

- **Middleware**: [src/middleware.ts](../src/middleware.ts#L277)
- **Hook JWT**: [supabase/migrations/20260423_fix_permisos_performance.sql](../supabase/migrations/20260423_fix_permisos_performance.sql#L40)
- **RLS Policy**: [supabase/migrations/020_crear_sistema_permisos.sql](../supabase/migrations/020_crear_sistema_permisos.sql)
- **Query**: [src/lib/auth/server.ts](../src/lib/auth/server.ts#L176)

---

## ✅ Estado: RESUELTO

**Cambios realizados**:
- ✅ Middleware modificado para SIEMPRE consultar BD
- ✅ Logs mejorados para diagnóstico
- ✅ Documentación completada

**Usuarios afectados**:
- Contabilidad (y cualquier rol no-Admin)

**Tiempo de implementación**: Inmediato (sin logout requerido)
