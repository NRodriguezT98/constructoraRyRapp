# 🔒 Deshabilitar Registro Público en Supabase

## ⚠️ IMPORTANTE: Ejecutar en Supabase Dashboard

Para asegurar que nadie pueda registrarse sin autorización:

### Opción 1: Dashboard de Supabase (Recomendado)

1. Ve a **Supabase Dashboard**
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Providers**
4. En la sección **Email**:
   - ✅ Habilita "Email provider"
   - ❌ DESHABILITA "Enable email signups"
   - Guarda cambios

### Opción 2: SQL (Alternativa)

Si prefieres hacer  esto por SQL, ejecuta:

```sql
-- Nota: Esta configuración se maneja mejor desde el dashboard
-- Pero puedes verificar la configuración actual con:
SELECT * FROM auth.config;
```

---

## ✅ Resultado Esperado

Después de deshabilitar signups:
- ✅ Usuarios existentes pueden hacer login
- ❌ Nuevos usuarios NO pueden registrarse desde la UI
- ✅ Solo admins pueden crear usuarios (futuro feature)

---

## 🔐 Crear Usuarios Manualmente (Mientras tanto)

### Método 1: Dashboard de Supabase

1. Ve a **Authentication** → **Users**
2. Click "Invite user" o "Add user"
3. Ingresa email y contraseña temporal
4. El usuario recibirá email para activar cuenta

### Método 2: SQL (Avanzado)

```sql
-- Crear usuario nuevo
-- IMPORTANTE: Solo para admins de la base de datos
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'nuevo@usuario.com',
  crypt('contraseña_temporal_123', gen_salt('bf')),  -- Contraseña encriptada
  NOW(),  -- Email confirmado
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

**⚠️ ADVERTENCIA**: Este método es avanzado y debe usarse con cuidado.

---

## 📋 Checklist de Seguridad

- [ ] Deshabilitar "Enable email signups" en Supabase Dashboard
- [x] Remover toggle de registro de la UI de login
- [x] Cambiar botón a solo "Iniciar Sesión"
- [x] Agregar botón "¿Olvidaste tu contraseña?"
- [ ] Crear usuarios manualmente para tu equipo
- [ ] (Futuro) Implementar panel de admin para crear usuarios

---

## 🎯 Próximo Paso

Implementar sistema de reset password para usuarios existentes.
