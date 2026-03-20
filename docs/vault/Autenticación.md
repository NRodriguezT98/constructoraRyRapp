# 🔐 Autenticación

> Sistema de auth con Supabase SSR + cookies

---

## Relaciones

- Parte de → [[RyR Constructora]]
- Provisto por → [[Supabase]]
- Gestiona → [[Usuarios]]
- Usa → [[Stack Tecnológico]]

---

## Componentes del Sistema

| Componente | Ubicación | Función |
|-----------|-----------|---------|
| Auth Context | `src/contexts/auth-context.tsx` | Provider de sesión |
| Supabase Client | `src/lib/supabase/client.ts` | Cliente browser con SSR |
| Supabase Server | `src/lib/supabase/server.ts` | Cliente server-side |
| Middleware | `src/lib/supabase/middleware.ts` | Verificación SSR |
| Protected App | `src/components/protected-app.tsx` | Wrapper de rutas |
| Session Interceptor | `src/components/SessionInterceptor.tsx` | Monitoreo |
| Idle Timer | `src/components/IdleTimerProvider.tsx` | Auto-logout |
| Login Page | `src/app/login/page.tsx` | Página de acceso |
| Reset Password | `src/app/reset-password/page.tsx` | Recuperación |

---

## Flujo

```
Login → Supabase Auth → Cookie SSR → Middleware verifica
→ Protected App → Idle Timer monitorea → Auto-logout
```

#infraestructura #auth
