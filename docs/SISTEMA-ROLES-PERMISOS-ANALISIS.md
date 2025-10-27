# 🔐 Sistema de Roles y Permisos - Análisis y Recomendaciones

**Fecha**: 27 de Octubre, 2025
**Estado Actual**: ⚠️ Sistema básico implementado
**Preparado para roles**: 🟡 Parcialmente (requiere extensión)

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### ✅ **LO QUE YA TIENES IMPLEMENTADO**

#### 1. **Autenticación Básica** ✅
```tsx
// src/contexts/auth-context.tsx
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

**Funciona**:
- ✅ Login/Logout
- ✅ Sesiones con Supabase Auth
- ✅ Timeout de sesión (8 horas)
- ✅ `auth.uid()` disponible en todas las queries

---

#### 2. **Row Level Security (RLS)** ✅

**Todas las tablas protegidas con RLS**:
```sql
-- Ejemplo actual (muy permisivo)
CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (true);  -- ⚠️ Cualquier usuario autenticado ve TODO
```

**Estado**:
- ✅ RLS habilitado en TODAS las tablas
- ⚠️ Políticas actuales: **MUY PERMISIVAS** (cualquier usuario autenticado tiene acceso completo)
- ✅ Infraestructura lista para restringir por roles

---

#### 3. **Auditoría de Acciones** ✅
```typescript
// src/services/audit-log.service.ts
auditLogService.logSessionExpirada(email, timeout)
auditLogService.logLogout(email)
```

**Listo para**: Registrar acciones por rol/usuario

---

### ❌ **LO QUE AÚN NO TIENES**

#### 1. **Tabla de Usuarios con Roles** ❌
```sql
-- NO EXISTE ACTUALMENTE
CREATE TABLE usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nombres TEXT,
  apellidos TEXT,
  rol TEXT NOT NULL DEFAULT 'Vendedor', -- ⚠️ Falta definir
  estado TEXT NOT NULL DEFAULT 'Activo',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

**Impacto**: No hay forma de diferenciar roles en el frontend

---

#### 2. **Enum de Roles Definido** ❌
```sql
-- NO EXISTE
CREATE TYPE rol_usuario AS ENUM (
  'Administrador',
  'Gerente',
  'Vendedor',
  'Consulta'
);
```

---

#### 3. **Hook de Autorización** ❌
```tsx
// NO EXISTE
const { hasPermission, canEdit, canDelete, role } = useAuthorization()

if (!hasPermission('clientes.crear')) {
  return <AccesoDenegado />
}
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN DE ROLES

### 📋 **PASO 1: Definir Estructura de Roles**

#### Roles Sugeridos

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Administrador** | Todo | Acceso completo al sistema |
| **Gerente** | Ver todo, Crear, Editar | No puede eliminar registros críticos |
| **Vendedor** | Ver asignados, Crear clientes/negociaciones, Editar propios | Solo sus clientes y negociaciones |
| **Consulta** | Solo lectura | Ver reportes, no puede modificar nada |

---

### 📋 **PASO 2: Crear Tabla de Usuarios** (SQL)

```sql
-- =====================================================
-- MIGRACIÓN: Crear sistema de roles y permisos
-- =====================================================

-- 1. Crear enum de roles
CREATE TYPE rol_usuario AS ENUM (
  'Administrador',
  'Gerente',
  'Vendedor',
  'Consulta'
);

-- 2. Crear tabla de usuarios (perfil extendido)
CREATE TABLE public.usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'Vendedor',
  estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  telefono TEXT,
  avatar_url TEXT,

  -- Metadatos
  configuracion JSONB DEFAULT '{}'::jsonb, -- Preferencias del usuario
  proyectos_asignados UUID[], -- Array de IDs de proyectos a los que tiene acceso

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  creado_por UUID REFERENCES auth.users(id),

  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);

-- 3. Crear índices
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX idx_usuarios_estado ON public.usuarios(estado);
CREATE INDEX idx_usuarios_email ON public.usuarios(email);

-- 4. Trigger para actualizar fecha
CREATE TRIGGER update_usuarios_fecha_actualizacion
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Función para crear usuario automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nombres, apellidos, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombres', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
    'Vendedor' -- Rol por defecto
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger en auth.users para crear perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Políticas RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver otros usuarios
CREATE POLICY "Usuarios pueden ver perfiles"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (true);

-- Solo administradores pueden crear usuarios
CREATE POLICY "Solo admins pueden crear usuarios"
  ON public.usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- Usuarios pueden actualizar su propio perfil, admins pueden actualizar cualquiera
CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON public.usuarios FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() -- Propio perfil
    OR EXISTS ( -- O es admin
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- Solo administradores pueden eliminar usuarios
CREATE POLICY "Solo admins pueden eliminar usuarios"
  ON public.usuarios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );
```

---

### 📋 **PASO 3: Extender AuthContext** (TypeScript)

```tsx
// src/contexts/auth-context.tsx
import { supabase } from '@/lib/supabase/client-browser'
import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

// Tipo de usuario extendido
export type RolUsuario = 'Administrador' | 'Gerente' | 'Vendedor' | 'Consulta'

export interface UsuarioPerfil {
  id: string
  email: string
  nombres: string
  apellidos: string
  rol: RolUsuario
  estado: 'Activo' | 'Inactivo' | 'Suspendido'
  telefono?: string
  avatar_url?: string
  proyectos_asignados?: string[]
  configuracion?: Record<string, any>
}

interface AuthContextType {
  user: User | null
  perfil: UsuarioPerfil | null // ⭐ NUEVO
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refrescarPerfil: () => Promise<void> // ⭐ NUEVO
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null) // ⭐ NUEVO
  const [loading, setLoading] = useState(true)

  // Función para cargar perfil del usuario
  const cargarPerfil = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setPerfil(data)

      // Actualizar último acceso
      await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error cargando perfil:', error)
      setPerfil(null)
    }
  }

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        cargarPerfil(session.user.id)
      }
      setLoading(false)
    })

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await cargarPerfil(session.user.id)
      } else {
        setPerfil(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setPerfil(null)
  }

  const refrescarPerfil = async () => {
    if (user) {
      await cargarPerfil(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      perfil, // ⭐ NUEVO
      loading,
      signIn,
      signUp: async () => {}, // Implementar según necesites
      signOut,
      refrescarPerfil // ⭐ NUEVO
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

### 📋 **PASO 4: Crear Hook de Autorización**

```tsx
// src/hooks/useAuthorization.ts
import { useAuth } from '@/contexts/auth-context'
import type { RolUsuario } from '@/contexts/auth-context'

type Modulo = 'clientes' | 'proyectos' | 'viviendas' | 'abonos' | 'documentos' | 'admin'
type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar'

interface PermisoDefinicion {
  modulo: Modulo
  accion: Accion
}

// Matriz de permisos por rol
const PERMISOS: Record<RolUsuario, Record<Modulo, Accion[]>> = {
  Administrador: {
    clientes: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    proyectos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    viviendas: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    abonos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    documentos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    admin: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
  },
  Gerente: {
    clientes: ['ver', 'crear', 'editar', 'exportar'],
    proyectos: ['ver', 'crear', 'editar', 'exportar'],
    viviendas: ['ver', 'crear', 'editar', 'exportar'],
    abonos: ['ver', 'crear', 'editar', 'exportar'],
    documentos: ['ver', 'crear', 'editar', 'exportar'],
    admin: ['ver', 'exportar'],
  },
  Vendedor: {
    clientes: ['ver', 'crear', 'editar'], // Solo sus clientes
    proyectos: ['ver'], // Solo lectura
    viviendas: ['ver'], // Solo lectura
    abonos: ['ver', 'crear'], // Registrar abonos
    documentos: ['ver', 'crear', 'editar'], // Sus documentos
    admin: [], // Sin acceso
  },
  Consulta: {
    clientes: ['ver', 'exportar'],
    proyectos: ['ver', 'exportar'],
    viviendas: ['ver', 'exportar'],
    abonos: ['ver', 'exportar'],
    documentos: ['ver'],
    admin: [], // Sin acceso
  },
}

export function useAuthorization() {
  const { perfil } = useAuth()

  const hasPermission = (modulo: Modulo, accion: Accion): boolean => {
    if (!perfil) return false
    const permisosRol = PERMISOS[perfil.rol]
    const permisosModulo = permisosRol[modulo] || []
    return permisosModulo.includes(accion)
  }

  const canView = (modulo: Modulo) => hasPermission(modulo, 'ver')
  const canCreate = (modulo: Modulo) => hasPermission(modulo, 'crear')
  const canEdit = (modulo: Modulo) => hasPermission(modulo, 'editar')
  const canDelete = (modulo: Modulo) => hasPermission(modulo, 'eliminar')
  const canExport = (modulo: Modulo) => hasPermission(modulo, 'exportar')

  const isAdmin = perfil?.rol === 'Administrador'
  const isGerente = perfil?.rol === 'Gerente'
  const isVendedor = perfil?.rol === 'Vendedor'
  const isConsulta = perfil?.rol === 'Consulta'

  return {
    perfil,
    role: perfil?.rol,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    isAdmin,
    isGerente,
    isVendedor,
    isConsulta,
  }
}
```

---

### 📋 **PASO 5: Actualizar Políticas RLS con Roles**

```sql
-- =====================================================
-- ACTUALIZAR RLS: Clientes con restricción por rol
-- =====================================================

-- Eliminar políticas permisivas actuales
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar clientes" ON clientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar clientes" ON clientes;

-- POLÍTICA SELECT: Depende del rol
CREATE POLICY "Usuarios pueden ver clientes según rol"
  ON clientes FOR SELECT
  TO authenticated
  USING (
    -- Admins y Gerentes ven TODO
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('Administrador', 'Gerente', 'Consulta')
    )
    OR
    -- Vendedores solo ven clientes que ellos crearon
    (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol = 'Vendedor'
      )
      AND usuario_registro = auth.uid()
    )
  );

-- POLÍTICA INSERT: Solo Admins, Gerentes y Vendedores
CREATE POLICY "Usuarios pueden crear clientes según rol"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('Administrador', 'Gerente', 'Vendedor')
    )
  );

-- POLÍTICA UPDATE: Depende del rol
CREATE POLICY "Usuarios pueden actualizar clientes según rol"
  ON clientes FOR UPDATE
  TO authenticated
  USING (
    -- Admins y Gerentes pueden editar TODO
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND rol IN ('Administrador', 'Gerente')
    )
    OR
    -- Vendedores solo editan sus propios clientes
    (
      EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol = 'Vendedor'
      )
      AND usuario_registro = auth.uid()
    )
  );

-- POLÍTICA DELETE: Solo Administradores
CREATE POLICY "Solo admins pueden eliminar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );
```

**Aplicar mismo patrón a**: `proyectos`, `viviendas`, `abonos`, `negociaciones`, etc.

---

### 📋 **PASO 6: Proteger UI con Permisos**

```tsx
// Ejemplo: Botón de crear cliente
import { useAuthorization } from '@/hooks/useAuthorization'

export function ClientesHeader() {
  const { canCreate } = useAuthorization()

  return (
    <div className="header">
      <h1>Clientes</h1>

      {canCreate('clientes') && (
        <Button onClick={handleNuevoCliente}>
          Nuevo Cliente
        </Button>
      )}
    </div>
  )
}
```

```tsx
// Ejemplo: Proteger ruta completa
import { useAuthorization } from '@/hooks/useAuthorization'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AdminPage() {
  const { canView, isAdmin } = useAuthorization()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin) {
      router.push('/proyectos') // Redirigir si no es admin
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección</p>
      </div>
    )
  }

  return <div>Panel de Administración</div>
}
```

---

## 📊 MATRIZ DE PERMISOS SUGERIDA

| Módulo | Admin | Gerente | Vendedor | Consulta |
|--------|-------|---------|----------|----------|
| **Clientes** |
| Ver todos | ✅ | ✅ | ❌ (solo suyos) | ✅ |
| Crear | ✅ | ✅ | ✅ | ❌ |
| Editar todos | ✅ | ✅ | ❌ (solo suyos) | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |
| Exportar | ✅ | ✅ | ❌ | ✅ |
| **Proyectos** |
| Ver | ✅ | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ❌ | ❌ |
| Editar | ✅ | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |
| **Viviendas** |
| Ver | ✅ | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ❌ | ❌ |
| Editar | ✅ | ✅ | ❌ | ❌ |
| Cambiar estado | ✅ | ✅ | ❌ | ❌ |
| **Abonos** |
| Ver todos | ✅ | ✅ | ❌ (solo suyos) | ✅ |
| Registrar | ✅ | ✅ | ✅ | ❌ |
| Anular | ✅ | ✅ | ❌ | ❌ |
| **Admin** |
| Usuarios | ✅ | ❌ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ | ❌ |
| Auditoría | ✅ | ✅ | ❌ | ❌ |

---

## 🚀 RESUMEN DE IMPLEMENTACIÓN

### ✅ **Ya tienes (80% del trabajo)**:
1. ✅ Autenticación con Supabase
2. ✅ RLS habilitado en todas las tablas
3. ✅ `auth.uid()` funcionando
4. ✅ Contexto de autenticación
5. ✅ Infraestructura lista

### 🔧 **Necesitas agregar (20% restante)**:
1. ⭐ Tabla `usuarios` con campo `rol`
2. ⭐ Enum `rol_usuario`
3. ⭐ Extender `AuthContext` con perfil
4. ⭐ Hook `useAuthorization()`
5. ⭐ Actualizar políticas RLS con condiciones de rol
6. ⭐ Proteger UI con `canCreate()`, `canEdit()`, etc.

---

## 📅 ESTIMACIÓN DE TIEMPO

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| Crear migración SQL (tabla usuarios + enum) | 30 min | 🔴 Alta |
| Extender AuthContext con perfil | 1 hora | 🔴 Alta |
| Crear hook useAuthorization | 1 hora | 🔴 Alta |
| Actualizar RLS de clientes | 30 min | 🟡 Media |
| Actualizar RLS de proyectos | 30 min | 🟡 Media |
| Actualizar RLS de viviendas | 30 min | 🟡 Media |
| Actualizar RLS de abonos | 30 min | 🟡 Media |
| Proteger UI (botones, rutas) | 2 horas | 🟡 Media |
| Crear página de administración de usuarios | 3 horas | 🟢 Baja |
| Testing completo | 2 horas | 🟡 Media |

**Total estimado**: **12 horas** (~1.5 días de trabajo)

---

## 🎯 CONCLUSIÓN

### ✅ **Respuesta a tu pregunta**:

> "¿Estamos preparados para limitar funciones según roles?"

**SÍ, están al 80% preparados**:
- ✅ Infraestructura de autenticación funcional
- ✅ RLS implementado (aunque permisivo)
- ✅ Arquitectura modular lista
- ⚠️ Falta: Tabla de usuarios, hook de autorización, actualizar RLS

**Esfuerzo requerido**: 1-2 días de desarrollo

---

**Siguiente paso recomendado**:
1. Crear la migración SQL de la tabla `usuarios`
2. Asignar un rol a tu usuario de prueba
3. Crear el hook `useAuthorization()`
4. Probar en un módulo (ej: Clientes)

¿Quieres que te ayude a implementar alguno de estos pasos? 🚀
