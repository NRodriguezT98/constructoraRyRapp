# 🔐 Configuración de Autenticación - RyR Constructora

## Estado Actual

El sistema está integrado con **Supabase Auth** pero requiere configuración inicial.

## ⚡ Opción Rápida: Deshabilitar RLS (Solo Desarrollo)

Si solo quieres probar el sistema SIN autenticación:

```sql
-- En Supabase SQL Editor
ALTER TABLE categorias_documento DISABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_proyecto DISABLE ROW LEVEL SECURITY;
```

⚠️ **ADVERTENCIA**: Esto deshabilita la seguridad. Solo para desarrollo local.

---

## ✅ Opción Recomendada: Configurar Autenticación Completa

### 1. Crear Usuario de Prueba

Ve a tu proyecto de Supabase → Authentication → Users → Add User

O usa la página de registro:
```
http://localhost:3000/login
```

### 2. Flujo de Autenticación

1. **Registro**: 
   - Ve a `/login`
   - Click en "¿No tienes cuenta? Regístrate"
   - Ingresa email y contraseña (mínimo 6 caracteres)
   - Verifica tu email (si tienes configurado el SMTP)

2. **Login**:
   - Ve a `/login`
   - Ingresa credenciales
   - Serás redirigido a `/proyectos`

3. **Uso del Sistema**:
   - Ahora puedes crear categorías ✅
   - Subir documentos ✅
   - Todo con tu UUID real

### 3. Verificar Usuario Autenticado

El sistema usa `useAuth()` hook que provee:

```tsx
import { useAuth } from '@/contexts/auth-context'

function MiComponente() {
  const { user, loading, signIn, signOut } = useAuth()
  
  // user.id contiene el UUID real
  console.log('Usuario:', user?.id)
}
```

### 4. Archivos Modificados

✅ **Contexto de Auth**: `src/contexts/auth-context.tsx`
✅ **Login Page**: `src/app/login/page.tsx`
✅ **Layout**: `src/app/layout.tsx` (wrapped con AuthProvider)
✅ **Proyecto Detalle**: Usa `user?.id` real
✅ **Documentos Lista**: Usa `user?.id` real
✅ **Upload**: Usa `user?.id` real con validación

### 5. Proteger Rutas (Opcional)

Si quieres redirigir usuarios no autenticados:

```tsx
// En cualquier página
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Cargando...</div>

  return <div>Contenido protegido</div>
}
```

---

## 📋 Checklist de Implementación

- [x] AuthContext creado
- [x] Login page creada
- [x] AuthProvider en layout
- [x] Componentes usando user.id real
- [ ] Crear usuario de prueba en Supabase
- [ ] Probar registro y login
- [ ] Verificar que las políticas RLS funcionan
- [ ] (Opcional) Agregar botón de logout en Sidebar
- [ ] (Opcional) Proteger rutas con middleware

---

## 🚀 Próximos Pasos

1. **Crear usuario** en Supabase Auth
2. **Hacer login** en `/login`
3. **Probar** crear categorías y subir documentos
4. **Verificar** que todo funciona con RLS habilitado

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"

**Causa**: Usuario no autenticado o RLS mal configurado

**Solución**:
1. Verifica que estés logueado
2. Verifica las RLS policies en Supabase
3. Deshabilita RLS temporalmente (opción rápida arriba)

### Error: "Usuario no autenticado" al subir documento

**Causa**: No hay sesión activa

**Solución**:
1. Ve a `/login`
2. Inicia sesión
3. Intenta de nuevo

---

## 📚 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
