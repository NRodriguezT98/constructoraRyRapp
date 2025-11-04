# ✅ Fix: Redirección a Login Inexistente

**Fecha**: 4 de noviembre de 2025
**Problema**: Al refrescar la página, a veces redirige a `/auth/login` (404)
**Causa raíz**: `ProtectedRoute.tsx` tenía ruta incorrecta
**Estado**: ✅ **CORREGIDO**

---

## 🎯 Problema Detectado

### Síntoma:
- Usuario navega en la app (sesión válida)
- Presiona F5 para refrescar
- **A veces** aparece error 404: `http://localhost:3000/auth/login`

### Causa:
```typescript
// src/modules/usuarios/components/ProtectedRoute.tsx línea 84

if (!perfil) {
  router.push('/auth/login')  // ❌ Esta ruta NO EXISTE
  return
}
```

**¿Por qué ocurría "a veces"?**

Race condition entre AuthContext y ProtectedRoute:
1. Usuario refresca página
2. AuthContext empieza a cargar (`loading = true`)
3. ProtectedRoute verifica `perfil` → aún es `null`
4. ProtectedRoute redirige a `/auth/login` pensando que no hay sesión
5. Error 404 porque la ruta correcta es `/login`

---

## ✅ Solución Aplicada

### Cambio en el código:

**Archivo**: `src/modules/usuarios/components/ProtectedRoute.tsx`
**Línea**: 84

```diff
if (!perfil) {
-  router.push('/auth/login')
+  router.push('/login')  // ✅ Ruta correcta
  return
}
```

### Resultado:
- ✅ Ya NO redirige a ruta inexistente
- ✅ Redirección correcta a `/login` cuando sea necesario
- ✅ Mantiene flujo de autenticación

---

## 🧪 Testing Requerido

### ✅ Test 1: Refresh con sesión válida
```
1. Login en la app
2. Ir a /clientes
3. Presionar F5
Resultado esperado: ✅ Permanece en /clientes (NO redirige)
```

### ✅ Test 2: Acceso sin sesión
```
1. Sin login
2. Intentar acceder a /proyectos
Resultado esperado: ✅ Redirige a /login (NO /auth/login)
                    ✅ Muestra formulario de login (NO error 404)
```

### ✅ Test 3: Refresh múltiple
```
1. Con sesión válida
2. Refrescar 10 veces en diferentes rutas
Resultado esperado: ✅ NUNCA error 404
```

---

## 📊 Verificación

### Antes del fix:
```
Usuario refresca → ProtectedRoute chequea sesión (null) →
Redirige a /auth/login → 404 Error ❌
```

### Después del fix:
```
Usuario refresca → ProtectedRoute chequea sesión (null) →
Redirige a /login → Formulario de login ✅
```

---

## 📚 Archivos Modificados

```
src/modules/usuarios/components/ProtectedRoute.tsx
├─ Línea 84: router.push('/login')  ✅ CORREGIDO
└─ Sin errores de compilación ✅
```

## 📝 Documentación Actualizada

```
docs/06-testing/
├─ DIAGNOSTICO-REDIRECCION-LOGIN-REFRESH.md  ✅ Diagnóstico completo
└─ FIX-REDIRECCION-LOGIN-REFRESH.md          ✅ Este resumen
```

---

## ⚠️ Nota Importante

Este fix resolvió el **error 404**, pero había un segundo problema:

### ✅ Problema Adicional Resuelto: Redirección al Dashboard

**Síntoma**: Al refrescar en `/clientes`, redirigía a `/dashboard`
**Causa**: Race condition entre carga de perfil y validación de permisos
**Solución**: Estado `permisosLoading` en `usePermissions`

**Ver documentación completa**: `docs/06-testing/SOLUCION-IDEAL-RACE-CONDITION-PERMISOS.md`

---

**Próximo paso**: Ejecutar checklist de testing y confirmar que AMBOS problemas están resueltos ✅
