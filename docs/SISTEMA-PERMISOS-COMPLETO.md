# 🔐 Sistema de Permisos Configurable - Documentación Completa

**Fecha de implementación**: 14 de noviembre de 2025
**Versión**: 2.0.0
**Tipo**: Sistema basado en BD + React Query

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Roles del Sistema](#roles-del-sistema)
3. [Uso en Componentes](#uso-en-componentes)
4. [Gestión de Permisos (Admin)](#gestión-de-permisos-admin)
5. [Validación API/RLS](#validación-apirls)
6. [Migración del Sistema Antiguo](#migración-del-sistema-antiguo)
7. [Testing](#testing)

---

## 🏗️ Arquitectura General

### **Stack Tecnológico**

```
Frontend:
├── React Query → Cache automático de permisos
├── Zustand → (NO se usa para permisos, solo UI state)
└── TypeScript → Tipado estricto

Backend:
├── Supabase (PostgreSQL)
├── RLS Policies → Validación server-side
└── Función tiene_permiso() → Helper SQL
```

### **Flujo de Datos**

```
1. Usuario hace login → Auth Context
2. Hook usePermisosQuery → Consulta permisos_rol (WHERE rol = user.rol)
3. React Query → Cachea permisos (5 min stale)
4. Componentes → Usan hook para verificar permisos
5. Operaciones CRUD → RLS valida con tiene_permiso()
```

### **Estructura de Tablas**

```sql
-- Tabla principal de permisos
permisos_rol (
  id UUID PRIMARY KEY,
  rol TEXT ('Administrador' | 'Contador' | 'Supervisor' | 'Gerencia'),
  modulo TEXT ('proyectos' | 'viviendas' | 'clientes' | ...),
  accion TEXT ('ver' | 'crear' | 'editar' | 'eliminar' | 'aprobar' | ...),
  permitido BOOLEAN,
  descripcion TEXT,
  creado_en TIMESTAMP,
  actualizado_en TIMESTAMP,
  actualizado_por UUID
)
```

---

## 👤 Roles del Sistema

### **1. Administrador** (Control Total)

**Ubicación**: Usuario en Cali
**Permisos**: Acceso completo a TODO el sistema (bypass automático)

```typescript
// Todos los módulos:
['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar', 'gestionar']
```

**Capacidades únicas**:
- Gestionar permisos de otros roles
- Crear/editar/eliminar usuarios
- Acceso a configuración del sistema
- Aprobar negociaciones críticas

---

### **2. Contador** (Crear/Editar sin Eliminar)

**Ubicación**: Equipo contable
**Permisos**: Puede crear y modificar datos, pero NO eliminar

```typescript
// Proyectos, Viviendas, Clientes, Documentos:
['ver', 'crear', 'editar', 'exportar']

// Abonos (CRÍTICO):
['ver', 'crear', 'editar', 'aprobar', 'exportar']

// Negociaciones:
['ver', 'crear', 'editar']

// NO PUEDE:
- eliminar (ningún módulo)
- gestionar usuarios
- modificar configuración
```

---

### **3. Supervisor** (Solo Lectura)

**Ubicación**: Administrador de obra (Guacarí)
**Permisos**: Consulta y exportación únicamente

```typescript
// Proyectos, Viviendas, Clientes, Documentos:
['ver', 'exportar']

// Reportes:
['ver', 'exportar']

// NO PUEDE:
- crear, editar, eliminar (ningún módulo)
- ver usuarios del sistema
- acceder a auditorías
```

---

### **4. Gerencia** (Lectura + Reportes Avanzados)

**Ubicación**: Ejecutivos
**Permisos**: Consulta completa + aprobaciones estratégicas

```typescript
// Proyectos, Viviendas, Clientes, Documentos:
['ver', 'exportar']

// Negociaciones:
['ver', 'aprobar']

// Abonos:
['ver', 'aprobar', 'exportar']

// Auditorías (ACCESO COMPLETO):
['ver', 'exportar']

// Reportes:
['ver', 'exportar']

// NO PUEDE:
- crear, editar, eliminar datos
- gestionar usuarios
- modificar configuración
```

---

## 💻 Uso en Componentes

### **Hook Principal: `usePermisosQuery`**

```tsx
import { usePermisosQuery } from '@/modules/usuarios/hooks'

function MiComponente() {
  const {
    puede,        // (modulo, accion) => boolean
    esAdmin,      // boolean
    esContador,   // boolean
    esSupervisor, // boolean
    esGerencia,   // boolean
    isLoading,    // boolean
  } = usePermisosQuery()

  if (isLoading) return <Loading />

  return (
    <div>
      {puede('documentos', 'eliminar') && (
        <DeleteButton />
      )}

      {esAdmin && (
        <AdminPanel />
      )}
    </div>
  )
}
```

### **Verificar Múltiples Permisos**

```tsx
const {
  puedeAlguno,  // OR: al menos uno
  puedeTodos,   // AND: todos requeridos
} = usePermisosQuery()

// Mostrar si puede crear O editar
if (puedeAlguno('viviendas', ['crear', 'editar'])) {
  return <FormularioVivienda />
}

// Mostrar solo si puede editar Y eliminar
if (puedeTodos('proyectos', ['editar', 'eliminar'])) {
  return <PanelAdmin />
}
```

### **Componente Protegido**

```tsx
import { ProtectedAction } from '@/modules/usuarios/components'

function Toolbar() {
  return (
    <div>
      <ProtectedAction modulo="clientes" accion="crear">
        <CreateClienteButton />
      </ProtectedAction>

      <ProtectedAction
        modulo="proyectos"
        acciones={['editar', 'eliminar']}
        fallback={<p>Sin permiso</p>}
      >
        <EditDeletePanel />
      </ProtectedAction>
    </div>
  )
}
```

---

## ⚙️ Gestión de Permisos (Admin)

### **Componente: PermisosMatrix**

Solo visible para Administrador. Permite editar permisos en tiempo real.

```tsx
import { PermisosMatrix } from '@/modules/usuarios/components/PermisosMatrix'

export default function PermisosPage() {
  return <PermisosMatrix />
}
```

**Características**:
- Matriz visual Rol × Módulo × Acción
- Switches para activar/desactivar permisos
- Cambios se reflejan inmediatamente
- Filtro por rol
- **Administrador NO puede editarse** (bypass automático)

### **Integración en Página de Usuarios**

```tsx
import { UsuariosTabs } from '@/modules/usuarios/components/UsuariosTabs'
import { ListadoUsuarios } from '@/modules/usuarios/components/ListadoUsuarios'

export default function UsuariosPage() {
  return (
    <UsuariosTabs>
      <ListadoUsuarios />
    </UsuariosTabs>
  )
}
```

Tabs disponibles:
- **Usuarios**: Listado y gestión de usuarios
- **Permisos**: Matriz de permisos (solo Admin)
- **Configuración**: Settings del sistema (solo Admin)

---

## 🔒 Validación API/RLS

### **Políticas RLS Aplicadas**

```sql
-- Ejemplo: Tabla proyectos
CREATE POLICY "Usuarios pueden ver proyectos con permisos"
  ON proyectos
  FOR SELECT
  USING (tiene_permiso(auth.uid(), 'proyectos', 'ver'));

CREATE POLICY "Usuarios pueden eliminar proyectos con permisos"
  ON proyectos
  FOR DELETE
  USING (tiene_permiso(auth.uid(), 'proyectos', 'eliminar'));
```

### **Tablas Protegidas**

✅ Políticas RLS activas en:
- `proyectos`
- `viviendas`
- `clientes`
- `documentos_proyecto`

⏳ Pendientes (cuando se creen):
- `abonos`
- `negociaciones`
- `auditorias`

### **Función SQL Helper**

```sql
-- Verificar permiso desde cualquier query
SELECT tiene_permiso(
  auth.uid(),        -- UUID del usuario
  'proyectos',       -- Módulo
  'eliminar'         -- Acción
);
-- Retorna: true/false
```

**Bypass automático**: Administrador siempre retorna `true`.

---

## 🔄 Migración del Sistema Antiguo

### **Sistema Antiguo (Hardcodeado)**

```tsx
// ❌ Deprecado (pero aún funcional)
import { usePermissions } from '@/modules/usuarios/hooks'

const { esAdmin, esGerente, esVendedor } = usePermissions()
```

**Problemas**:
- Permisos hardcodeados en código
- Requiere deployment para cambios
- No tiene roles Contador, Supervisor, Gerencia

---

### **Sistema Nuevo (React Query + BD)**

```tsx
// ✅ Recomendado
import { usePermisosQuery } from '@/modules/usuarios/hooks'

const { esAdmin, esContador, esSupervisor, esGerencia } = usePermisosQuery()
```

**Ventajas**:
- Permisos configurables desde UI
- Cambios en tiempo real
- Cache automático
- Validación server-side con RLS

---

### **Guía de Migración**

```tsx
// ANTES (Sistema Antiguo)
import { usePermissions } from '@/modules/usuarios/hooks'

function MiComponente() {
  const { puede } = usePermissions()

  if (puede('clientes', 'crear')) {
    return <Button>Crear</Button>
  }
}

// DESPUÉS (Sistema Nuevo)
import { usePermisosQuery } from '@/modules/usuarios/hooks'

function MiComponente() {
  const { puede, isLoading } = usePermisosQuery()

  if (isLoading) return <Loading />

  if (puede('clientes', 'crear')) {
    return <Button>Crear</Button>
  }
}
```

**Cambios necesarios**:
1. Importar `usePermisosQuery` en lugar de `usePermissions`
2. Agregar manejo de `isLoading`
3. Actualizar helpers: `esGerente` → `esGerencia`, `esVendedor` → `esContador`

---

## 🧪 Testing

### **Verificar Permisos por Rol**

```tsx
// Test manual en componente
import { usePermisosQuery } from '@/modules/usuarios/hooks'

function DebugPermisos() {
  const permisos = usePermisosQuery()

  console.log('Rol actual:', permisos.rol)
  console.log('¿Es admin?:', permisos.esAdmin)
  console.log('Módulos accesibles:', permisos.modulosConAcceso)
  console.log('Permisos en documentos:', permisos.permisosModulo('documentos'))
  console.log('Todos los permisos:', permisos.todosLosPermisos)

  return <pre>{JSON.stringify(permisos, null, 2)}</pre>
}
```

### **Verificar RLS Policies**

```sql
-- Ejecutar como usuario específico
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Intentar operación
SELECT * FROM proyectos;  -- Debe retornar solo si tiene permiso 'ver'
DELETE FROM proyectos WHERE id = 'xxx';  -- Debe fallar si no tiene permiso 'eliminar'
```

### **Casos de Prueba Manuales**

#### **1. Administrador**
- ✅ Puede ver matriz de permisos
- ✅ Puede editar permisos de otros roles
- ✅ Puede crear/editar/eliminar en todos los módulos
- ✅ Bypass automático en RLS

#### **2. Contador**
- ✅ Puede crear y editar proyectos
- ❌ NO puede eliminar proyectos
- ✅ Puede aprobar abonos
- ❌ NO puede ver matriz de permisos

#### **3. Supervisor**
- ✅ Puede ver proyectos y exportar
- ❌ NO puede crear proyectos
- ❌ NO puede editar proyectos
- ❌ NO puede acceder a usuarios

#### **4. Gerencia**
- ✅ Puede ver auditorías completas
- ✅ Puede aprobar negociaciones
- ✅ Puede exportar reportes avanzados
- ❌ NO puede editar datos

---

## 📊 Resumen de Implementación

### ✅ **Completado**

- [x] Tabla `permisos_rol` con 196 permisos
- [x] Función `tiene_permiso()` SQL
- [x] Hook `usePermisosQuery` con React Query
- [x] Service `permisos.service.ts`
- [x] Componente `PermisosMatrix`
- [x] Componente `UsuariosTabs`
- [x] RLS Policies en 4 tablas críticas
- [x] Tipos TypeScript sincronizados
- [x] Migración de roles (4 roles nuevos)

### ⏳ **Pendiente**

- [ ] Migrar todos los componentes a `usePermisosQuery`
- [ ] Agregar RLS en tablas `abonos` y `negociaciones` (cuando se creen)
- [ ] Testing automatizado con Jest
- [ ] Documentación de API endpoints

---

## 📞 Soporte

**Archivos clave**:
- Hook: `src/modules/usuarios/hooks/usePermisosQuery.ts`
- Service: `src/modules/usuarios/services/permisos.service.ts`
- Types: `src/modules/usuarios/types/index.ts`
- Matrix UI: `src/modules/usuarios/components/PermisosMatrix.tsx`
- Migraciones: `supabase/migrations/020_*.sql`, `021_*.sql`, `022_*.sql`

**Comandos útiles**:
```bash
# Regenerar tipos después de cambios en BD
npm run types:generate

# Ejecutar migración SQL
npm run db:exec supabase/migrations/<archivo>.sql

# Verificar TypeScript
npm run type-check
```

---

**Última actualización**: 14 de noviembre de 2025
**Mantenedor**: Sistema RyR
**Versión de documentación**: 1.0.0
