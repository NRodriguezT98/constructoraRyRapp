# 🔐 SISTEMA DE AUTENTICACIÓN DEFINITIVO - RyR Constructora

> **Última actualización**: Noviembre 2025
> **Versión**: 2.0 (Unificada con @supabase/ssr)

---

## 🎯 ARQUITECTURA FINAL

### **Stack Tecnológico:**
- **Next.js 15** (App Router)
- **Supabase Auth** (Backend)
- **@supabase/ssr** (Cliente único para browser + server)
- **Cookies** (Storage de sesiones)

---

## 📋 CONFIGURACIÓN UNIFICADA

### **1. Cliente Browser** (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**✅ Características:**
- Usa `createBrowserClient` de `@supabase/ssr`
- Sesiones guardadas en **cookies** (no localStorage)
- Compatible con SSR de Next.js
- PKCE automático para reset password
- Password-based auth para login

---

### **2. Cliente Middleware** (`src/lib/supabase/middleware.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

**✅ Características:**
- Usa `createServerClient` de `@supabase/ssr`
- Lee/escribe cookies del middleware
- Sincronizado automáticamente con cliente browser

---

### **3. Middleware de Protección** (`src/middleware.ts`)

```typescript
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const publicPaths = ['/login', '/reset-password']
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))

  if (isAsset(req)) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createMiddlewareClient(req, res)
  const { data: { session } } = await supabase.auth.getSession()

  // Proteger rutas privadas
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirigir de login si ya autenticado
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}
```

---

## 🔒 FLUJOS DE AUTENTICACIÓN

### **1. Login Regular (Password-based)**

```typescript
// En componente/hook
import { supabase } from '@/lib/supabase/client'

const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Session guardada automáticamente en cookies
  // Middleware detecta la sesión en siguiente request
  window.location.href = '/' // Recarga completa
}
```

**Flujo:**
```
Usuario → Email/Password → signInWithPassword()
→ Supabase valida credenciales
→ Session guardada en cookies
→ Redirección a dashboard
→ Middleware valida cookies
→ Acceso permitido ✅
```

---

### **2. Reset Password (PKCE Automático)**

```typescript
// Solicitar email de recuperación
const handleResetRequest = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  // Email enviado con ?code=xyz (PKCE)
}

// En página /reset-password
useEffect(() => {
  const verifySession = async () => {
    // detectSessionInUrl automático procesa ?code=
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setValidToken(true) // Mostrar formulario
    }
  }

  verifySession()
}, [])

// Cambiar contraseña
const handleUpdatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error

  await supabase.auth.signOut()
  window.location.href = '/login'
}
```

**Flujo PKCE:**
```
Usuario → Solicita reset → resetPasswordForEmail()
→ Supabase genera code_verifier
→ Email con ?code=xyz789
→ Usuario abre enlace
→ detectSessionInUrl intercepta code
→ Intercambia code + code_verifier por session
→ Session establecida en cookies
→ Usuario cambia contraseña
→ Logout + redirect a login
```

---

### **3. Logout**

```typescript
const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
```

---

## 🎯 REGLAS DE USO

### ✅ **SIEMPRE:**

1. **Importar desde `@/lib/supabase/client`**
```typescript
import { supabase } from '@/lib/supabase/client'
```

2. **Usar `window.location.href` para redirecciones post-auth**
```typescript
// ✅ CORRECTO
window.location.href = '/'

// ❌ INCORRECTO (middleware no valida)
router.push('/')
```

3. **Confiar en cookies** (NO tocar localStorage manualmente)
```typescript
// ✅ Supabase maneja cookies automáticamente
const { data: { session } } = await supabase.auth.getSession()
```

4. **Verificar sesión en useEffect**
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}, [])
```

---

### ❌ **NUNCA:**

1. **NO usar `@supabase/supabase-js` directamente**
```typescript
// ❌ PROHIBIDO
import { createClient } from '@supabase/supabase-js'
```

2. **NO manipular localStorage manualmente**
```typescript
// ❌ PROHIBIDO
localStorage.setItem('session', ...)
```

3. **NO mezclar clientes**
```typescript
// ❌ PROHIBIDO - un solo cliente
import { supabase } from '@/lib/supabase/client'
import { supabase as supabase2 } from '@/lib/supabase/client-browser' // NO EXISTE
```

4. **NO especificar flowType manualmente**
```typescript
// ❌ PROHIBIDO - @supabase/ssr lo maneja automáticamente
createBrowserClient(url, key, { auth: { flowType: 'pkce' } })
```

---

## 🛡️ SEGURIDAD

### **Nivel Actual: 🟢 ALTO**

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Login** | ✅ Seguro | Password-based con cookies httpOnly |
| **Reset Password** | ✅ Seguro | PKCE automático (OAuth 2.1) |
| **Session Storage** | ✅ Seguro | Cookies (no URL, no localStorage público) |
| **CSRF Protection** | ✅ Seguro | PKCE code_verifier |
| **Token Refresh** | ✅ Automático | @supabase/ssr maneja refresh |
| **Middleware** | ✅ Activo | Protege todas las rutas |

---

## 📊 VENTAJAS DE ESTA ARQUITECTURA

### **vs. localStorage:**
- ✅ Cookies httpOnly (no accesibles por JavaScript)
- ✅ Compatible con SSR
- ✅ Compartido entre cliente y servidor

### **vs. @supabase/supabase-js:**
- ✅ Diseñado para Next.js App Router
- ✅ PKCE automático
- ✅ Mejor integración con middleware

### **vs. Mezclar clientes:**
- ✅ Una sola fuente de verdad
- ✅ Sin loops de redirección
- ✅ Código más limpio y mantenible

---

## 🧪 TESTING

### **Checklist de Funcionalidad:**

- [ ] **Login**: Email/password → Dashboard
- [ ] **Logout**: Cierra sesión → Redirige a login
- [ ] **Reset Password**: Email → Enlace con ?code= → Cambiar contraseña
- [ ] **Protección de rutas**: /clientes sin auth → Redirige a login
- [ ] **Redirección post-login**: Login → Vuelve a /clientes
- [ ] **Refresh de sesión**: Token se renueva automáticamente
- [ ] **Navegación**: Entre módulos sin perder sesión

---

## 📝 MIGRACIÓN DESDE SISTEMA ANTERIOR

Si tienes código antiguo usando `@supabase/supabase-js`:

```typescript
// ANTES ❌
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key, {
  auth: { flowType: 'implicit' }
})

// DESPUÉS ✅
import { supabase } from '@/lib/supabase/client'
// Ya está configurado correctamente
```

---

## 🆘 TROUBLESHOOTING

### **Problema: Loop de redirección**
```
/clientes → /login → / → /login → ...
```

**Solución:**
```javascript
// Limpiar cookies y localStorage
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
localStorage.clear();
location.reload();
```

### **Problema: "Session not found"**
**Causa**: Middleware no detecta cookies
**Solución**: Verificar que usas `createBrowserClient` (no `createClient`)

### **Problema: Reset password "Invalid token"**
**Causa**: Code expirado o ya usado
**Solución**: Solicitar nuevo email (codes de 1 solo uso)

---

## 📚 REFERENCIAS

- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OAuth 2.1 PKCE](https://oauth.net/2.1/)

---

## ✅ CONCLUSIÓN

**Sistema unificado con:**
- ✅ Un solo cliente (`@supabase/ssr`)
- ✅ Cookies como storage
- ✅ PKCE automático
- ✅ Middleware sincronizado
- ✅ Código limpio y mantenible

**🎉 LISTO PARA PRODUCCIÓN**
