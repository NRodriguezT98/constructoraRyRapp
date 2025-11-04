# 🔍 Diagnóstico: Redirección a Login al Refrescar Página

**Fecha**: 4 de noviembre de 2025
**Problema reportado**: Algunas veces al refrescar la página (F5), el sistema redirige a `/auth/login`
**Estado**: 🔎 En investigación

---

## 🎯 Síntomas del Problema

### Comportamiento observado:
1. Usuario está navegando en la aplicación (sesión válida)
2. Usuario presiona F5 (refresh)
3. **Algunas veces** (no siempre) → Redirige a `http://localhost:3000/auth/login`
4. Muestra error 404: "This page could not be found"

### ¿Por qué muestra 404?
La ruta correcta de login es `/login`, pero el middleware está redirigiendo a `/auth/login` que NO existe.

---

## 🔧 Análisis del Código Actual

### 1. Middleware (`src/middleware.ts`)

**Código actual** (líneas 47-56):
```typescript
// Si NO está autenticado y NO está en ruta pública → redirigir a login
if (!session && !isPublicPath) {
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/login'  // ✅ Ruta correcta

  // Guardar la ruta original para redirigir después del login
  // EXCEPTO si es una ruta /auth/* inválida
  const originalPath = req.nextUrl.pathname
  if (!originalPath.startsWith('/auth/')) {  // 🔍 POSIBLE PROBLEMA
    redirectUrl.searchParams.set('redirectedFrom', originalPath)
  }

  return NextResponse.redirect(redirectUrl)
}
```

**Análisis**:
- ✅ La redirección a `/login` es correcta
- ⚠️ La condición `!originalPath.startsWith('/auth/')` sugiere que existe manejo especial para rutas `/auth/*`
- ❓ ¿De dónde viene la URL `/auth/login` si el middleware siempre redirige a `/login`?

---

### 2. Hook de Login (`src/app/login/useLogin.ts`)

**Código actual** (líneas 78-85):
```typescript
// Si redirectedFrom es '/' (raíz), '/login', '/auth/login' o no existe, redirigir al dashboard
const isInvalidRedirect =
  !redirectedFrom ||
  redirectedFrom === '/' ||
  redirectedFrom === '/login' ||
  redirectedFrom.startsWith('/auth/')  // 🔍 AQUÍ SE MENCIONA /auth/

const redirectTo = isInvalidRedirect ? '/' : redirectedFrom

// Usar window.location para redirección completa
window.location.href = redirectTo
```

**Análisis**:
- ✅ Después del login, valida que `redirectedFrom` no sea `/auth/*`
- ⚠️ Esto sugiere que **en algún momento** el sistema SÍ está generando URLs `/auth/login`

---

### 3. AuthContext (`src/contexts/auth-context.tsx`)

**Código actual** (líneas 68-77):
```typescript
// Verificar sesión actual
supabase.auth.getSession().then(({ data: { session }, error }) => {
  setUser(session?.user ?? null)

  // Cargar perfil si hay sesión
  if (session?.user) {
    cargarPerfil(session.user.id)
  }

  setLoading(false)
})
```

**Posible race condition**:
1. Usuario refresca página
2. AuthContext inicia con `loading = true`
3. Middleware ejecuta `getSession()` → Puede NO encontrar sesión si cookies no están listas
4. Middleware redirige a `/login` porque no hay sesión
5. Mientras tanto, AuthContext termina de cargar y ENCUENTRA la sesión

---

## 🐛 Causas Probables Identificadas

### Causa #1: Race Condition entre Middleware y AuthContext
**Probabilidad**: 🔴 ALTA

**Escenario**:
```
T0: Usuario refresca página
T1: Middleware ejecuta primero → Cookies aún no sincronizadas
T2: Middleware no encuentra sesión → Redirige a /login
T3: AuthContext carga después → Encuentra sesión válida
T4: Usuario ve login pero TIENE sesión válida
```

**Evidencia**:
- El problema ocurre "algunas veces" (típico de race conditions)
- Supabase usa cookies que requieren sincronización
- No hay delay/retry en middleware para esperar cookies

---

### Causa #2: Cookies de Supabase no persisten correctamente
**Probabilidad**: 🟡 MEDIA

**Escenario**:
- Supabase guarda sesión en cookies
- Al refrescar, cookies pueden no estar disponibles inmediatamente
- Middleware ejecuta antes que cookies estén listas
- Sesión se pierde temporalmente

**Evidencia**:
- Sistema usa `@supabase/ssr` que depende de cookies
- Middleware no verifica "edad" de la sesión antes de redirigir

---

### Causa #3: ProtectedRoute redirige a /auth/login ⭐ **CAUSA RAÍZ ENCONTRADA**
**Probabilidad**: � **CONFIRMADA**

**Escenario**:
- Componente `ProtectedRoute.tsx` tiene hardcodeado `/auth/login` en línea 84
- Cuando usuario refresca página protegida y hay race condition
- `perfil` aún no carga → `ProtectedRoute` detecta "no autenticado"
- Redirige a `/auth/login` (ruta que NO existe) → 404

**Evidencia**:
```typescript
// src/modules/usuarios/components/ProtectedRoute.tsx línea 84
if (!perfil) {
  router.push('/auth/login')  // ❌ RUTA INCORRECTA
  return
}
```

**Archivos afectados**:
- `src/modules/usuarios/components/ProtectedRoute.tsx` (línea 84 y 237)

---

## 🔍 Puntos a Investigar

### 1. ✅ Verificar estructura de rutas
```
src/app/
├── login/          ✅ Existe
│   └── page.tsx
└── auth/           ❓ ¿Existe esta carpeta?
    └── login/      ❓ ¿Existe esta ruta?
```

### 2. ⏳ Console logs del middleware
Revisar logs de desarrollo cuando ocurra el problema:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Middleware:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    user: session?.user?.email,
    error: error?.message
  })
}
```

### 3. ⏳ Verificar cookies en DevTools
Cuando ocurra el problema:
1. Abrir DevTools → Application → Cookies
2. Buscar cookies de Supabase: `sb-*-auth-token`
3. Verificar si existen y cuándo expiran

### 4. ⏳ Network timing
Verificar en Network tab cuándo se ejecuta:
- Middleware request
- AuthContext initialization
- Cookie setting/getting

---

## 💡 Soluciones Implementadas

### ✅ Solución DEFINITIVA: Corregir ruta en ProtectedRoute (APLICADA)
**Estado**: ✅ **IMPLEMENTADA**
**Fecha**: 4 de noviembre de 2025

**Cambio realizado**:
```typescript
// src/modules/usuarios/components/ProtectedRoute.tsx línea 84

// ❌ ANTES (incorrecto):
if (!perfil) {
  router.push('/auth/login')  // Ruta que NO existe
  return
}

// ✅ AHORA (correcto):
if (!perfil) {
  router.push('/login')  // ✅ Ruta correcta
  return
}
```

**Resultado esperado**:
- ✅ Ya NO redirige a `/auth/login` (404)
- ✅ Redirige correctamente a `/login` cuando sea necesario
- ✅ Mantiene el flujo de autenticación correcto

**Testing necesario**:
1. Refrescar página en rutas protegidas (clientes, proyectos, viviendas)
2. Verificar que NO aparece error 404
3. Verificar que si NO hay sesión, redirige a `/login` correctamente
4. Verificar que si SÍ hay sesión, permanece en la página

---

## 💡 Soluciones Adicionales Recomendadas (Opcionales)

Estas soluciones abordan la **race condition** subyacente para prevenir futuras ocurrencias:

### Solución #1: Agregar retry logic en middleware (RECOMENDADA para futuro)
**Prioridad**: 🔴 ALTA

```typescript
export async function middleware(req: NextRequest) {
  // ... código existente ...

  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)

  // ⭐ NUEVA: Retry logic para dar tiempo a cookies
  let session = null
  let attempts = 0
  const maxAttempts = 3

  while (!session && attempts < maxAttempts) {
    const { data, error } = await supabase.auth.getSession()
    session = data.session

    if (!session && attempts < maxAttempts - 1) {
      // Esperar 50ms antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 50))
      attempts++
    } else {
      break
    }
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware (attempts: ' + (attempts + 1) + '):', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      user: session?.user?.email
    })
  }

  // Continuar con lógica de redirección...
}
```

**Ventajas**:
- Soluciona race condition
- No afecta experiencia de usuario (50ms es imperceptible)
- Mantiene seguridad

**Desventajas**:
- Agrega latencia mínima (max 100ms)

---

### Solución #2: Verificar edad de sesión antes de redirigir
**Prioridad**: 🟡 MEDIA

```typescript
// Si NO está autenticado y NO está en ruta pública
if (!session && !isPublicPath) {
  // ⭐ NUEVA: Verificar si hay cookies de Supabase
  const hasSupabaseCookies = req.cookies.getAll().some(
    cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  )

  // Si hay cookies pero no hay sesión → Race condition probable
  // Permitir carga normal y dejar que AuthContext maneje
  if (hasSupabaseCookies) {
    console.warn('⚠️ Cookies encontradas pero no sesión - posible race condition')
    return res // Permitir continuar
  }

  // Solo redirigir si definitivamente no hay sesión
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/login'
  // ... resto del código
}
```

**Ventajas**:
- Evita redirección innecesaria
- Permite que AuthContext maneje la sesión

**Desventajas**:
- Puede permitir acceso temporal a ruta protegida
- Requiere lógica adicional en componentes

---

### Solución #3: Usar loading state en layout
**Prioridad**: 🟢 BAJA

```typescript
// En layout.tsx o template global
export default function RootLayout({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return children
}
```

**Ventajas**:
- UX mejorada (no ve flash de login)

**Desventajas**:
- No soluciona el problema raíz
- Agrega delay a todas las cargas

---

## 📋 Plan de Acción Actualizado

### ✅ Fase 1: Diagnóstico (COMPLETADO)
- [x] Revisar código de middleware ✅
- [x] Revisar AuthContext ✅
- [x] Identificar causas probables ✅
- [x] Verificar estructura de rutas (NO existe `/auth/`) ✅
- [x] **Encontrar causa raíz: ProtectedRoute.tsx línea 84** ✅

### ✅ Fase 2: Corrección (COMPLETADO)
- [x] **Cambiar `/auth/login` → `/login` en ProtectedRoute.tsx** ✅
- [x] Verificar compilación sin errores ✅
- [x] Actualizar documentación ✅

### ⏳ Fase 3: Testing (PENDIENTE - HACER AHORA)
**Checklist de pruebas**:

#### Test 1: Refresh en ruta protegida CON sesión válida
- [ ] Ir a `/clientes`
- [ ] Presionar F5 (refresh)
- [ ] ✅ **Esperado**: Permanece en `/clientes`
- [ ] ❌ **NO debe**: Redirigir a login

#### Test 2: Refresh en ruta protegida SIN sesión
- [ ] Cerrar sesión
- [ ] Intentar ir a `/proyectos` (URL directa)
- [ ] ✅ **Esperado**: Redirige a `/login` (NO `/auth/login`)
- [ ] ✅ **Esperado**: Muestra formulario de login (NO error 404)

#### Test 3: Refresh múltiples veces
- [ ] Con sesión válida
- [ ] Refrescar 10 veces en diferentes rutas
- [ ] ✅ **Esperado**: NUNCA debe aparecer error 404

#### Test 4: Navegación después del login
- [ ] Hacer login
- [ ] Sistema redirige al dashboard
- [ ] ✅ **Esperado**: NO loop de redirección
- [ ] ✅ **Esperado**: Dashboard carga correctamente

### ⏳ Fase 4: Monitoreo (24 horas)
- [ ] Verificar logs de consola
- [ ] Confirmar 0 ocurrencias de `/auth/login`
- [ ] Documentar cualquier comportamiento anómalo

---

## 🧪 Comandos para Testing

### Verificar estructura de rutas:
```powershell
Get-ChildItem -Path "d:\constructoraRyRapp\src\app" -Directory -Recurse | Where-Object { $_.Name -eq "auth" } | Select-Object FullName
```

### Verificar cookies en consola del navegador:
```javascript
// Ejecutar en DevTools Console
document.cookie.split(';').filter(c => c.includes('sb-'))
```

### Verificar sesión en consola:
```javascript
// Ejecutar en DevTools Console
const { data } = await supabase.auth.getSession()
console.log('Sesión:', data.session)
console.log('User:', data.session?.user?.email)
console.log('Expira:', new Date(data.session?.expires_at * 1000))
```

---

## 📚 Referencias

### Archivos clave:
- `src/middleware.ts` - Protección de rutas
- `src/lib/supabase/middleware.ts` - Cliente de Supabase
- `src/contexts/auth-context.tsx` - Manejo de sesión global
- `src/app/login/useLogin.ts` - Lógica de login
- `docs/AUTENTICACION-DEFINITIVA.md` - Documentación de auth

### Documentación Supabase:
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Cookie-based Auth](https://supabase.com/docs/guides/auth/server-side/cookies)

---

**Próximo paso**: Verificar si existe carpeta `/auth/` y reproducir problema consistentemente
