# 🔄 Guía de Migración: Sistema de Permisos v1 → v2

**Fecha**: 14 de noviembre de 2025
**Autor**: Sistema RyR
**Versión objetivo**: 2.0.0

---

## 📋 ¿Qué Cambia?

### Sistema Antiguo (v1)
- ❌ Permisos hardcodeados en código
- ❌ Requiere deployment para cambios
- ❌ Roles: Administrador, Gerente, Vendedor
- ❌ Sin validación server-side

### Sistema Nuevo (v2)
- ✅ Permisos configurables desde UI
- ✅ Cambios en tiempo real
- ✅ Roles: Administrador, Contador, Supervisor, Gerencia
- ✅ Validación RLS en base de datos
- ✅ React Query para cache automático

---

## 🔧 Migración de Hooks

### ANTES (v1)

```tsx
import { usePermissions } from '@/modules/usuarios/hooks'

function MiComponente() {
  const {
    puede,
    esAdmin,
    esGerente,     // ❌ Ya no existe
    esVendedor,    // ❌ Ya no existe
  } = usePermissions()

  if (puede('clientes', 'crear')) {
    return <Button>Crear</Button>
  }
}
```

### DESPUÉS (v2)

```tsx
import { usePermisosQuery } from '@/modules/usuarios/hooks'

function MiComponente() {
  const {
    puede,
    esAdmin,
    esContador,    // ✅ Nuevo rol
    esSupervisor,  // ✅ Nuevo rol
    esGerencia,    // ✅ Nuevo rol (reemplaza esGerente)
    isLoading,     // ✅ IMPORTANTE: Manejar estado de carga
  } = usePermisosQuery()

  if (isLoading) return <LoadingSpinner />

  if (puede('clientes', 'crear')) {
    return <Button>Crear</Button>
  }
}
```

---

## 🎨 Migración de Componentes

### ProtectedAction (No requiere cambios)

```tsx
// ✅ Funciona igual, usa el sistema nuevo automáticamente
<ProtectedAction modulo="proyectos" accion="eliminar">
  <DeleteButton />
</ProtectedAction>

// ✅ Ahora maneja isLoading internamente
<CanCreate modulo="viviendas">
  <CreateButton />
</CanCreate>
```

### Componentes Personalizados

**ANTES:**
```tsx
function Toolbar() {
  const { esGerente, esAdmin } = usePermissions()

  return (
    <div>
      {(esAdmin || esGerente) && <AdvancedPanel />}
    </div>
  )
}
```

**DESPUÉS:**
```tsx
function Toolbar() {
  const { esGerencia, esAdmin, isLoading } = usePermisosQuery()

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      {(esAdmin || esGerencia) && <AdvancedPanel />}
    </div>
  )
}
```

---

## 🗂️ Mapeo de Roles

| Sistema Antiguo | Sistema Nuevo | Notas |
|----------------|---------------|-------|
| `Administrador` | `Administrador` | ✅ Sin cambios |
| `Gerente` | `Gerencia` | ⚠️ Nombre actualizado |
| `Vendedor` | `Contador` | ⚠️ Rol reemplazado |
| N/A | `Supervisor` | ✨ Nuevo rol (solo lectura) |

---

## 🚨 Cambios Críticos

### 1. Helpers de Rol

```tsx
// ❌ Ya NO existe
esGerente

// ✅ Usar en su lugar
esGerencia
```

### 2. Manejo de Loading

```tsx
// ❌ INCORRECTO: No manejar loading
const { puede } = usePermisosQuery()
if (puede('proyectos', 'crear')) { ... }

// ✅ CORRECTO: Siempre manejar loading
const { puede, isLoading } = usePermisosQuery()
if (isLoading) return <Loading />
if (puede('proyectos', 'crear')) { ... }
```

### 3. Componentes AdminOnly/ManagerOrAbove

```tsx
// ✅ Ahora manejan isLoading automáticamente
<AdminOnly fallback={<p>Sin acceso</p>}>
  <AdminPanel />
</AdminOnly>

<ManagerOrAbove>
  <ReportsPanel />
</ManagerOrAbove>
```

---

## 📦 Checklist de Migración por Archivo

### Para cada archivo que usa permisos:

- [ ] Cambiar import: `usePermissions` → `usePermisosQuery`
- [ ] Agregar manejo de `isLoading`
- [ ] Actualizar `esGerente` → `esGerencia`
- [ ] Actualizar `esVendedor` → `esContador` (revisar contexto)
- [ ] Verificar que funciona en modo oscuro
- [ ] Probar con diferentes roles

---

## 🧪 Testing después de Migración

### 1. Verificar Componentes

```tsx
// Componente de prueba
function DebugPermisos() {
  const permisos = usePermisosQuery()

  console.log('Permisos cargados:', permisos)

  return (
    <div>
      <p>Rol: {permisos.rol}</p>
      <p>Es Admin: {permisos.esAdmin ? 'Sí' : 'No'}</p>
      <p>Es Contador: {permisos.esContador ? 'Sí' : 'No'}</p>
      <p>Es Supervisor: {permisos.esSupervisor ? 'Sí' : 'No'}</p>
      <p>Es Gerencia: {permisos.esGerencia ? 'Sí' : 'No'}</p>
      <p>Loading: {permisos.isLoading ? 'Sí' : 'No'}</p>
    </div>
  )
}
```

### 2. Verificar RLS Policies

```sql
-- Conectar como usuario específico
SET LOCAL request.jwt.claims = '{"sub": "user-uuid"}';

-- Intentar operación
SELECT * FROM proyectos;  -- Debe funcionar si tiene permiso 'ver'
DELETE FROM proyectos WHERE id = 'xxx';  -- Debe fallar si no tiene permiso 'eliminar'
```

### 3. Casos de Prueba por Rol

#### Administrador
- ✅ Puede ver matriz de permisos
- ✅ Puede editar permisos
- ✅ Bypass automático en RLS

#### Contador
- ✅ Puede crear/editar proyectos
- ❌ NO puede eliminar proyectos
- ❌ NO puede ver matriz de permisos

#### Supervisor
- ✅ Puede ver proyectos
- ❌ NO puede crear/editar
- ❌ NO puede eliminar

#### Gerencia
- ✅ Puede ver auditorías
- ✅ Puede aprobar negociaciones
- ❌ NO puede crear/editar datos

---

## 🐛 Problemas Comunes

### 1. "Cannot read property 'puede' of undefined"

**Causa**: Hook no está dentro de AuthProvider

**Solución**:
```tsx
// Verificar que el componente esté dentro de <AuthProvider>
export default function MyApp({ children }) {
  return (
    <AuthProvider>
      {children}  {/* Aquí puedes usar usePermisosQuery */}
    </AuthProvider>
  )
}
```

### 2. "No se actualizan permisos después de cambio"

**Causa**: React Query no invalida cache

**Solución**:
```tsx
import { useQueryClient } from '@tanstack/react-query'

function PermisosMatrix() {
  const queryClient = useQueryClient()

  const handleChange = async () => {
    await actualizarPermiso(...)

    // Invalidar cache manualmente
    queryClient.invalidateQueries({ queryKey: ['permisos'] })
  }
}
```

### 3. "RLS Policy bloquea operación válida"

**Causa**: Permiso no configurado en BD

**Solución**:
```tsx
// 1. Ir a UsuariosTabs → Pestaña "Permisos"
// 2. Buscar rol → módulo → acción
// 3. Activar switch
```

---

## 📊 Comparación de Performance

| Métrica | Sistema v1 | Sistema v2 |
|---------|-----------|-----------|
| Primera carga | ~50ms | ~120ms* |
| Revalidación | N/A | Automática |
| Cache | No | Sí (5 min) |
| Validación server | No | Sí (RLS) |

*_Incluye query a BD, pero con cache posterior_

---

## 🔗 Recursos Adicionales

- **Documentación completa**: `docs/SISTEMA-PERMISOS-COMPLETO.md`
- **Migraciones SQL**: `supabase/migrations/020_*.sql`, `021_*.sql`, `022_*.sql`
- **Hook principal**: `src/modules/usuarios/hooks/usePermisosQuery.ts`
- **Service**: `src/modules/usuarios/services/permisos.service.ts`
- **Componente UI**: `src/modules/usuarios/components/PermisosMatrix.tsx`

---

## ✅ Checklist de Migración Completa

- [ ] Ejecutar migraciones SQL (020, 021, 022)
- [ ] Regenerar tipos TypeScript (`npm run types:generate`)
- [ ] Migrar todos los hooks de `usePermissions` a `usePermisosQuery`
- [ ] Actualizar referencias de `esGerente` → `esGerencia`
- [ ] Agregar manejo de `isLoading` en componentes
- [ ] Probar con usuario Administrador
- [ ] Probar con usuario Contador
- [ ] Probar con usuario Supervisor
- [ ] Probar con usuario Gerencia
- [ ] Verificar RLS policies en Supabase
- [ ] Actualizar documentación del proyecto

---

**Última actualización**: 14 de noviembre de 2025
**Estado**: ✅ Listo para producción
**Soporte**: Sistema RyR
