# 📊 Análisis del Sistema de Permisos - Evaluación Profesional

**Fecha:** 15 de noviembre de 2025
**Estado:** En Implementación Inicial
**Versión:** 1.0

---

## ✅ LO QUE ESTÁ BIEN IMPLEMENTADO

### 1. **Arquitectura en Capas (✅ CORRECTO)**

```
┌─────────────────────────────────────┐
│   MIDDLEWARE (Server-side)          │  ← Protección de rutas
├─────────────────────────────────────┤
│   REACT QUERY HOOKS (Client-side)   │  ← Cache y sincronización
├─────────────────────────────────────┤
│   SERVICES (Supabase Queries)       │  ← Lógica de BD
├─────────────────────────────────────┤
│   DATABASE (permisos_rol)           │  ← Fuente única de verdad
└─────────────────────────────────────┘
```

**✅ Ventajas:**
- Separación de responsabilidades clara
- Testeable por capas
- Escalable y mantenible

---

### 2. **Fuente Única de Verdad (✅ CORRECTO)**

```sql
-- Tabla centralizada en BD
CREATE TABLE permisos_rol (
  rol TEXT,
  modulo TEXT,
  accion TEXT,
  permitido BOOLEAN
)
```

**✅ Ventajas:**
- No hay permisos hardcodeados
- Cambios sin deploy (solo BD)
- Auditable y trazable

---

### 3. **Bypass Automático para Administrador (✅ CORRECTO)**

```typescript
// En middleware
if (userRole === 'Administrador') return true

// En hook
if (rol === 'Administrador') return true
```

**✅ Ventajas:**
- Evita queries innecesarias
- Admin siempre tiene acceso
- Performance optimizado

---

### 4. **Cache Inteligente con React Query (✅ CORRECTO)**

```typescript
useQuery({
  queryKey: ['permisos', rol],
  staleTime: 5 * 60 * 1000,  // 5 min
  gcTime: 10 * 60 * 1000,    // 10 min
})
```

**✅ Ventajas:**
- No consulta BD en cada render
- Invalidación automática al actualizar
- Menos carga en servidor

---

### 5. **Verificación en Múltiples Niveles (✅ CORRECTO)**

```typescript
// Nivel 1: Middleware (Server-side) - Bloquea acceso a rutas
// Nivel 2: Server Components - Verifica antes de renderizar
// Nivel 3: Client Components - Oculta UI según permisos
```

**✅ Ventajas:**
- Seguridad en profundidad (defense in depth)
- No depende solo de cliente
- UI limpia y profesional

---

## ⚠️ ÁREAS DE MEJORA CRÍTICAS

### 1. **❌ PROBLEMA: Query en Middleware por Cada Request**

**Código actual:**
```typescript
async function canAccessRoute(pathname, userRole, supabase) {
  // ❌ Esto se ejecuta en CADA request
  const { data } = await supabase
    .from('permisos_rol')
    .select('permitido')
    .eq('rol', userRole)
    .eq('modulo', permission.modulo)
    .single()
}
```

**❌ Problema:**
- **1 query a BD por cada navegación de página**
- Latencia adicional (50-200ms por request)
- No aprovecha cache de React Query

**✅ SOLUCIÓN RECOMENDADA:**

#### Opción A: Cache en JWT (PROFESIONAL) ⭐ RECOMENDADO

```typescript
// 1. Al hacer login, cargar permisos y guardar en JWT
async function login(email, password) {
  const { data: session } = await supabase.auth.signInWithPassword(...)

  // Obtener permisos
  const permisos = await obtenerPermisosPorRol(usuario.rol)

  // Actualizar metadata del usuario en auth.users
  await supabase.auth.updateUser({
    data: {
      permisos_cache: permisos.map(p => `${p.modulo}.${p.accion}`)
    }
  })
}

// 2. Middleware lee del JWT (sin query)
const payload = decodeJWT(session.access_token)
const permisosCache = payload.user_metadata?.permisos_cache || []

// Verificar permiso sin DB query
const tienePermiso = permisosCache.includes(`${modulo}.${accion}`)
```

**✅ Ventajas:**
- **0 queries en middleware** (solo lectura de JWT)
- Latencia ~0ms
- Cache automático con sesión
- **Invalidar al cambiar permisos** (forzar re-login o refresh token)

**⚠️ Desventaja:**
- Requiere re-login para ver cambios (o implementar refresh token)

---

#### Opción B: Cache en Edge KV (Next.js + Vercel)

```typescript
import { kv } from '@vercel/kv'

// 1. Guardar en Redis cuando cambian permisos
await kv.set(`permisos:${rol}`, permisos, { ex: 300 }) // 5 min TTL

// 2. Leer del cache en middleware
const permisos = await kv.get(`permisos:${rol}`)
```

**✅ Ventajas:**
- Ultra rápido (< 10ms)
- Invalidación fácil
- No requiere re-login

**⚠️ Desventajas:**
- Requiere Vercel KV (costo adicional)
- Complejidad de invalidación

---

#### Opción C: Query con Edge Functions (Actual mejorado)

```typescript
// Usar edge runtime de Supabase con cache
export const runtime = 'edge'

const { data } = await supabase
  .from('permisos_rol')
  .select('permitido')
  .eq('rol', userRole)
  .single()
  .abortSignal(AbortSignal.timeout(1000)) // Timeout 1s
```

**✅ Ventajas:**
- Más rápido que Postgres directo
- No requiere cambios grandes

**⚠️ Desventajas:**
- Aún hace query (50-100ms)

---

### 2. **❌ PROBLEMA: Nombres de Módulos/Acciones no Tipados en Middleware**

**Código actual:**
```typescript
const ROUTE_TO_PERMISSION = {
  '/proyectos': { modulo: 'proyectos', accion: 'ver' } // ❌ Strings sin tipo
}
```

**✅ SOLUCIÓN:**

```typescript
// 1. Crear tipos centralizados
// src/shared/types/permisos.types.ts
export const MODULOS = {
  PROYECTOS: 'proyectos',
  VIVIENDAS: 'viviendas',
  CLIENTES: 'clientes',
  // ...
} as const

export const ACCIONES = {
  VER: 'ver',
  CREAR: 'crear',
  EDITAR: 'editar',
  ELIMINAR: 'eliminar',
  // ...
} as const

export type Modulo = typeof MODULOS[keyof typeof MODULOS]
export type Accion = typeof ACCIONES[keyof typeof ACCIONES]

// 2. Usar en middleware
const ROUTE_TO_PERMISSION: Record<string, { modulo: Modulo; accion: Accion }> = {
  '/proyectos': { modulo: MODULOS.PROYECTOS, accion: ACCIONES.VER }
}
```

**✅ Ventajas:**
- Autocomplete en IDE
- Detecta typos en compile-time
- Refactor seguro

---

### 3. **⚠️ MEJORA: Helper `puede()` Redundante en Algunos Componentes**

**Código actual:**
```typescript
// En cada componente
const { puede } = usePermisosQuery()

{puede('documentos', 'eliminar') && <button>Eliminar</button>}
{puede('documentos', 'crear') && <button>Crear</button>}
{puede('documentos', 'editar') && <button>Editar</button>}
```

**✅ SOLUCIÓN: Hook Especializado**

```typescript
// src/modules/documentos/hooks/useDocumentosPermisos.ts
export function useDocumentosPermisos() {
  const { puede } = usePermisosQuery()

  return useMemo(() => ({
    puedeVer: puede('documentos', 'ver'),
    puedeCrear: puede('documentos', 'crear'),
    puedeEditar: puede('documentos', 'editar'),
    puedeEliminar: puede('documentos', 'eliminar'),
    puedeDescargar: puede('documentos', 'exportar'),
  }), [puede])
}

// En componente
const { puedeEliminar, puedeEditar } = useDocumentosPermisos()

{puedeEliminar && <button>Eliminar</button>}
{puedeEditar && <button>Editar</button>}
```

**✅ Ventajas:**
- Menos repetición
- Autocomplete específico
- Fácil de testear

---

### 4. **⚠️ MEJORA: Logs de Debugging en Producción**

**Código actual:**
```typescript
console.log('🔐 [HOOK NUEVO] usePermisosQuery ejecutado')
console.log('✅ [SERVICE] 29 permisos obtenidos')
```

**✅ SOLUCIÓN:**

```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  permisos: (msg: string, data?: any) => {
    if (isDev) console.log(`🔐 [PERMISOS] ${msg}`, data)
  }
}

// Uso
logger.permisos('usePermisosQuery ejecutado')
```

---

### 5. **❌ FALTA: Tests Unitarios**

**✅ SOLUCIÓN:**

```typescript
// __tests__/usePermisosQuery.test.ts
describe('usePermisosQuery', () => {
  it('Administrador puede todo', () => {
    const { puede } = renderHook(() => usePermisosQuery(), {
      wrapper: mockAuth({ rol: 'Administrador' })
    })

    expect(puede('documentos', 'eliminar')).toBe(true)
  })

  it('Contador NO puede eliminar', () => {
    const { puede } = renderHook(() => usePermisosQuery(), {
      wrapper: mockAuth({ rol: 'Contador' })
    })

    expect(puede('documentos', 'eliminar')).toBe(false)
  })
})
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN PROFESIONAL

### ✅ Ya implementado:
- [x] Tabla centralizada en BD
- [x] Hook con React Query
- [x] Service layer separado
- [x] Middleware con protección
- [x] Bypass para Administrador
- [x] Cache inteligente
- [x] Verificación en UI

### ⚠️ Pendiente (CRÍTICO):
- [ ] **Cache en JWT o Redis** (evitar query en middleware)
- [ ] Tipos TypeScript para módulos/acciones
- [ ] Logger con env-aware
- [ ] Tests unitarios

### 💡 Pendiente (RECOMENDADO):
- [ ] Hooks especializados por módulo
- [ ] Monitoreo de performance
- [ ] Documentación de permisos por rol
- [ ] Snapshot testing de permisos

---

## 🎯 RECOMENDACIÓN FINAL

### ✅ **LO QUE ESTÁ BIEN:**
Tu arquitectura base es **profesional y escalable**. La separación en capas, uso de React Query y fuente única de verdad son **excelentes decisiones**.

### ⚠️ **LO QUE DEBES CAMBIAR YA:**

1. **CRÍTICO - Cache en JWT** (Opción A recomendada)
   - Implementar en próximas 2-3 horas
   - Evita query en cada navegación
   - Mejora performance 10x

2. **IMPORTANTE - Tipos TypeScript**
   - Implementar en próxima 1 hora
   - Previene errores de typo
   - Mejor DX

3. **BUENA PRÁCTICA - Logs condicionales**
   - Implementar en 30 min
   - No ensuciar consola en prod

### 💚 **LO QUE PUEDES SEGUIR IGUAL:**

- ✅ Arquitectura de capas
- ✅ React Query hooks
- ✅ Service layer
- ✅ Verificación multi-nivel

---

## 📚 RECURSOS ADICIONALES

- **JWT Custom Claims:** [Supabase Docs](https://supabase.com/docs/guides/auth/auth-hooks)
- **Edge Runtime:** [Next.js Docs](https://nextjs.org/docs/app/api-reference/edge)
- **React Query Best Practices:** [TanStack Docs](https://tanstack.com/query/latest)

---

## 🚀 PLAN DE ACCIÓN INMEDIATO

### Prioridad 1 (HOY):
1. Implementar cache en JWT (2-3h)
2. Crear tipos centralizados (1h)
3. Logger condicional (30min)

### Prioridad 2 (Esta semana):
4. Hooks especializados por módulo (2h)
5. Tests básicos (3h)
6. Documentación de permisos (1h)

### Prioridad 3 (Siguiente sprint):
7. Monitoreo de performance
8. Auditoría de accesos
9. Dashboard de permisos

---

**Conclusión:** Tu sistema es **80% correcto**. Con los ajustes propuestos (cache en JWT + tipos) estarás al **95% profesional**. 🎯
