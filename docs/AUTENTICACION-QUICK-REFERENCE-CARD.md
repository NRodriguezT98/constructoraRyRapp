# 🔐 Autenticación - Quick Reference Card

> **Tarjeta de referencia rápida - Imprimir y tener a mano**

---

## 🚨 EMERGENCIAS

### Reset password no funciona
```typescript
// ❌ NUNCA
await supabase.auth.updateUser({ password })

// ✅ SIEMPRE (API REST directa)
fetch(`${SUPABASE_URL}/auth/v1/user`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': SUPABASE_ANON_KEY
  },
  body: JSON.stringify({ password })
})
```

### Loop Login → Dashboard → Login
```typescript
// middleware.ts - Retornar response con cookies
const response = NextResponse.next()
const supabase = createServerClient(url, key, {
  cookies: {
    set(name, value, options) {
      response.cookies.set({ name, value, ...options })
    }
  }
})
return response // ← CRÍTICO
```

---

## 📁 ARCHIVOS CRÍTICOS

| Archivo | Nunca tocar | Puede modificar |
|---------|-------------|-----------------|
| `middleware.ts` | ❌ Lógica core | ✅ Rutas protegidas |
| `app/login/useLogin.ts` | ❌ Lógica auth | ✅ UI messages |
| `app/reset-password/page.tsx` | ⚠️ API REST parte | ✅ UI/estilos |

---

## 🔧 COMANDOS ÚTILES

```javascript
// Ver sesión actual (Browser Console)
const { data } = await supabase.auth.getSession()
console.log(data.session)

// Limpiar cookies manualmente
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
})
```

---

## ✅ CHECKLIST DE TESTING

```
Login:
□ Credenciales correctas → Dashboard
□ Credenciales incorrectas → Error
□ Redirección a URL original

Reset Password:
□ Email llega (5-10s)
□ Formulario aparece
□ Status 200 OK en API
□ Redirección a /login (2s)
□ Login con nueva contraseña
```

---

## 🚫 NUNCA HACER

```typescript
// ❌ updateUser() con PKCE (se cuelga)
await supabase.auth.updateUser({ password })

// ❌ Asumir getSession() rápido
const { session } = await supabase.auth.getSession()

// ❌ Guardar /auth/* en redirectedFrom
redirectUrl.searchParams.set('redirectedFrom', '/auth/login')
```

---

## ✅ SIEMPRE HACER

```typescript
// ✅ API REST para updateUser
fetch(`${url}/auth/v1/user`, {
  method: 'PUT',
  body: JSON.stringify({ password })
})

// ✅ onAuthStateChange para PKCE
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') setSession(session)
})

// ✅ Filtrar /auth/* de redirectedFrom
if (!pathname.startsWith('/auth/')) {
  redirectUrl.searchParams.set('redirectedFrom', pathname)
}
```

---

## 📞 AYUDA RÁPIDA

**Docs completas**: `docs/SISTEMA-AUTENTICACION-COMPLETO.md`
**Troubleshooting**: `docs/AUTENTICACION-REFERENCIA-RAPIDA.md`
**Resumen ejecutivo**: `docs/AUTENTICACION-RESUMEN-EJECUTIVO.md`

---

**v1.0.0** | 3 Nov 2025 | RyR Constructora
