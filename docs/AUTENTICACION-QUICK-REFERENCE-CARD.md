# 🔐 Autenticación V3.0 - Quick Reference Card

> **Sistema Server Components - Referencia Rápida**
> **Versión**: 3.0.0 | **Actualizado**: Nov 4, 2025

---

## 🎯 ARQUITECTURA EN 30 SEGUNDOS

```
Request → Middleware (valida auth + rol)
         ↓
       Server Component (calcula permisos)
         ↓
       Client Component (renderiza UI)
```

**Regla de oro**: Permisos SIEMPRE en servidor, NUNCA en cliente.

---

## 🚨 EMERGENCIAS

### "TypeError: Cannot read 'canCreate' of undefined"

**Solución rápida**:
```typescript
// ✅ Server Component - Pasar props con spread
export default async function Page() {
  const permisos = await getServerPermissions()
  return <Content {...permisos} /> // ← Spread operator
}

// ✅ Client Component - Default values
export function Content({
  canCreate = false, // ← Default value
  canEdit = false,
}: Props = {}) { // ← Default object
  return <div>...</div>
}
```

### "Infinite re-renders"

**Causa**: useEffect con función en dependencias
```typescript
// ❌ INCORRECTO
const { cargarDatos } = useStore()
useEffect(() => {
  cargarDatos() // Loop infinito
}, [cargarDatos])

// ✅ CORRECTO
const { cargarDatos, datosInicializados } = useStore()
useEffect(() => {
  if (!datosInicializados) {
    cargarDatos()
  }
}, [datosInicializados, cargarDatos])
```

### Reset password no funciona

```typescript
// ❌ NUNCA (se cuelga con PKCE)
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

---

## 📁 ARCHIVOS CRÍTICOS V3.0

| Archivo | Responsabilidad | Nunca Tocar |
|---------|----------------|-------------|
| `src/middleware.ts` | Validación auth + rol | ❌ Lógica core |
| `src/lib/auth/server.ts` | Cálculo de permisos | ❌ getServerPermissions() |
| `src/contexts/auth-context.tsx` | Solo datos usuario UI | ✅ Puede modificar UI |
| `app/**/page.tsx` | Server Components | ✅ Solo para pasar props |

---

## 🔧 PATRÓN SERVER COMPONENT

```typescript
// ✅ Server Component (page.tsx)
import { getServerPermissions } from '@/lib/auth/server'

export default async function Page() {
  const permisos = await getServerPermissions()
  return <Content {...permisos} />
}

// ✅ Client Component (*-content.tsx)
'use client'

interface Props {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function Content({ canCreate, canEdit }: Props = {}) {
  return (
    <div>
      {canCreate && <Button>Nuevo</Button>}
      {canEdit && <EditForm />}
    </div>
  )
}
```

---

## ✅ CHECKLIST DE MIGRACIÓN

Cuando migres un módulo nuevo:

```
□ Crear Server Component (page.tsx)
□ Llamar getServerPermissions()
□ Pasar props con spread operator {...permisos}
□ Client Component con 'use client'
□ Props interface con valores opcionales
□ Default values en destructuring
□ Renderizado condicional {canCreate && ...}
□ NO usar usePermissions hook
□ NO usar wrapper components
□ Verificar logs en consola
```

---

## 🚫 NUNCA HACER

```typescript
// ❌ usePermissions en Client Component
const { canCreate } = usePermissions()

// ❌ Wrapper components
<CanCreate modulo="proyectos">
  <Button />
</CanCreate>

// ❌ Asumir props siempre existen
const handleClick = () => {
  if (canCreate) { ... } // undefined si no hay default
}

// ❌ Calcular permisos en cliente
const canEdit = user.rol === 'Administrador'
```

---

## ✅ SIEMPRE HACER

```typescript
// ✅ Props con defaults
export function Component({
  canCreate = false,
  canEdit = false,
}: Props = {}) {
  // ...
}

// ✅ Conditional rendering
{canCreate && <Button />}

// ✅ Optional callbacks
<Header onNuevo={canCreate ? handleNuevo : undefined} />

// ✅ Logs para debugging
console.log('[CLIENT] Props:', { canCreate, canEdit })
```

---

## 🎯 MATRIZ DE PERMISOS

| Rol | canView | canCreate | canEdit | canDelete | isAdmin |
|-----|---------|-----------|---------|-----------|---------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gerente** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Vendedor** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🐛 DEBUGGING RÁPIDO

```javascript
// Browser Console - Ver sesión
const { data } = await supabase.auth.getSession()
console.log(data.session)

// Ver permisos en Client Component
console.log('[CLIENT] Permisos recibidos:', {
  canCreate,
  canEdit,
  canDelete,
})

// Verificar middleware headers (DevTools → Network)
x-user-id: <uuid>
x-user-rol: Administrador
x-user-email: admin@ryr.com
```

---

## 📞 AYUDA RÁPIDA

**Sistema V3.0 (Server Components)**:
- `docs/AUTENTICACION-SERVER-COMPONENTS-V3.md` ⭐ **NUEVO**

**Login/Reset (V2.0)**:
- `docs/AUTENTICACION-DEFINITIVA.md`
- `docs/SISTEMA-AUTENTICACION-COMPLETO.md`

**Database Schema**:
- `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

---

**v3.0.0** | 4 Nov 2025 | RyR Constructora
