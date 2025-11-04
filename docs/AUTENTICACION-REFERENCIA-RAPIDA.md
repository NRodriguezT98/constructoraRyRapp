# 🚀 Autenticación - Referencia Rápida

> **Acceso rápido a soluciones comunes**
> Para documentación completa: [`SISTEMA-AUTENTICACION-COMPLETO.md`](./SISTEMA-AUTENTICACION-COMPLETO.md)

---

## ⚡ Soluciones Rápidas

### 🔴 EMERGENCIA: Reset password no funciona

```typescript
// ❌ NUNCA usar esto (se cuelga con PKCE):
await supabase.auth.updateUser({ password })

// ✅ SIEMPRE usar API REST directa:
const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ password: newPassword })
})
```

---

### 🔴 EMERGENCIA: Loop Login → Dashboard → Login

**Causa**: Cookies no se guardan en middleware

**Solución**:
```typescript
// middleware.ts
const response = NextResponse.next({
  request: { headers: request.headers }
})

const supabase = createServerClient(url, key, {
  cookies: {
    set(name, value, options) {
      response.cookies.set({ name, value, ...options }) // ← CRÍTICO
    }
  }
})

return response // ← Retornar response modificado
```

---

### 🔴 EMERGENCIA: Redirección incorrecta después de login

**Causa**: `redirectedFrom` guarda `/auth/*`

**Solución en middleware**:
```typescript
if (!request.nextUrl.pathname.startsWith('/auth/')) {
  redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
}
```

**Solución en useLogin**:
```typescript
function getRedirectUrl(): string {
  const redirectedFrom = params.get('redirectedFrom')

  if (!redirectedFrom ||
      redirectedFrom.startsWith('/auth/') ||
      redirectedFrom === '/login') {
    return '/dashboard'
  }

  return redirectedFrom
}
```

---

## 📋 Checklist de Debugging

### Login no funciona
```bash
# 1. Verificar usuario en Supabase
SELECT email, email_confirmed_at
FROM auth.users
WHERE email = 'usuario@ejemplo.com';

# 2. Si no está confirmado:
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'usuario@ejemplo.com';
```

### Reset password - Formulario no aparece
```javascript
// Abrir DevTools Console y buscar:
"✅ SESIÓN DETECTADA EXITOSAMENTE"

// Si no aparece, verificar:
// 1. URL tiene ?code=xxx
// 2. Redirect URL configurada en Supabase
// 3. onAuthStateChange está funcionando
```

### Reset password - Cambio no funciona
```javascript
// Buscar en consola:
"📡 RESPUESTA DE API REST"
"Status: 200"  // ← Debe ser 200

// Si es 400/401/403:
// - Verificar access_token válido
// - Verificar variables de entorno
// - Verificar headers correctos
```

---

## 🗂️ Archivos Críticos

| Archivo | Para qué sirve | Cuándo modificar |
|---------|----------------|------------------|
| `middleware.ts` | Proteger rutas, validar sesiones | Agregar/quitar rutas protegidas |
| `app/login/useLogin.ts` | Lógica de login | Cambiar flujo de autenticación |
| `app/reset-password/page.tsx` | Reset con PKCE + API REST | ⚠️ NO modificar (tiene bugs resueltos) |
| `lib/supabase/client.ts` | Cliente Supabase browser | Cambiar configuración de Supabase |

---

## 🔧 Comandos Útiles

### Ver sesión actual
```typescript
// En browser console
const supabase = createBrowserClient(url, key)
const { data: { session } } = await supabase.auth.getSession()
console.log(session)
```

### Ver cookies de auth
```javascript
// Abrir DevTools → Application → Cookies
// Buscar: sb-<project-ref>-auth-token
```

### Limpiar sesión manualmente
```javascript
// En browser console
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
})
location.reload()
```

---

## ⚠️ NUNCA HACER

```typescript
// ❌ Usar updateUser() con sesiones PKCE (se cuelga)
await supabase.auth.updateUser({ password })

// ❌ Asumir que getSession() siempre funciona rápido
const { session } = await supabase.auth.getSession()

// ❌ Guardar /auth/* en redirectedFrom
redirectUrl.searchParams.set('redirectedFrom', '/auth/login')

// ❌ Olvidar retornar response modificado en middleware
return NextResponse.next() // ← cookies no se guardan
```

---

## ✅ SIEMPRE HACER

```typescript
// ✅ Usar API REST para updateUser en PKCE
fetch(`${url}/auth/v1/user`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ password })
})

// ✅ Usar onAuthStateChange para detectar sesiones PKCE
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    setCurrentSession(session)
  }
})

// ✅ Filtrar /auth/* de redirectedFrom
if (!pathname.startsWith('/auth/')) {
  redirectUrl.searchParams.set('redirectedFrom', pathname)
}

// ✅ Retornar response con cookies en middleware
return response
```

---

## 🎯 Testing Rápido

```bash
# 1. Login
✅ Email + password correctos → Dashboard
❌ Email + password incorrectos → Error visible

# 2. Logout
✅ Click en logout → Cierra sesión y va a /login

# 3. Reset Password
✅ Solicitar reset → Email llega
✅ Click en enlace → Formulario aparece
✅ Cambiar contraseña → Status 200 OK
✅ Esperar 2s → Redirige a /login
✅ Login con nueva contraseña → Entra al dashboard

# 4. Middleware
✅ /dashboard sin sesión → /login?redirectedFrom=/dashboard
✅ /login con sesión → /dashboard
✅ /reset-password?code=xxx → Permite acceso
```

---

## 📞 Contacto de Soporte

Si encuentras un problema no documentado aquí:

1. **Revisar logs de consola** (DevTools)
2. **Verificar configuración de Supabase** (Dashboard)
3. **Consultar documentación completa**: [`SISTEMA-AUTENTICACION-COMPLETO.md`](./SISTEMA-AUTENTICACION-COMPLETO.md)
4. **Verificar variables de entorno** (`.env.local`)

---

**Última actualización**: 3 de Noviembre, 2025
**Versión**: 1.0.0
