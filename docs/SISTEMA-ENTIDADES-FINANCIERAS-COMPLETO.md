# 🏦 Sistema Completo de Entidades Financieras

## 📋 Resumen

Sistema profesional para administrar bancos, cajas de compensación y cooperativas, reemplazando arrays hardcoded por datos dinámicos desde base de datos.

---

## ✅ Componentes Implementados

### 1️⃣ **Base de Datos**

#### Tabla: `entidades_financieras`
```sql
CREATE TABLE entidades_financieras (
  id UUID PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(50) CHECK IN ('Banco', 'Caja de Compensación', 'Cooperativa', 'Otro'),
  nit VARCHAR(20),
  razon_social VARCHAR(200),
  telefono VARCHAR(50),
  email_contacto VARCHAR(255),
  sitio_web VARCHAR(255),
  direccion TEXT,
  codigo_superintendencia VARCHAR(20),
  notas TEXT,
  logo_url TEXT,
  color VARCHAR(20) DEFAULT 'blue',
  orden INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Datos seed:** 27 entidades (17 bancos + 8 cajas + 2 otros)

#### Normalización: `fuentes_pago.entidad_financiera_id`
```sql
ALTER TABLE fuentes_pago
ADD COLUMN entidad_financiera_id UUID REFERENCES entidades_financieras(id);
```

**Migración automática:**
- Mapea texto existente → UUID
- Trigger mantiene sincronización
- Vista `fuentes_pago_con_entidad` para backward compatibility

---

### 2️⃣ **Domain Layer** (TypeScript)

**Archivo:** `src/modules/configuracion/types/entidades-financieras.types.ts`

```typescript
// Domain Model
export interface EntidadFinanciera {
  id: string
  nombre: string
  codigo: string
  tipo: TipoEntidadFinanciera
  // ... 15+ campos más
}

// DTOs
export interface CrearEntidadFinancieraDTO { ... }
export interface ActualizarEntidadFinancieraDTO { ... }

// Enums
export type TipoEntidadFinanciera = 'Banco' | 'Caja de Compensación' | 'Cooperativa' | 'Otro'
export type EntidadColor = 'blue' | 'green' | 'orange' | ...
```

---

### 3️⃣ **Service Layer** (Clean Architecture)

**Archivo:** `src/modules/configuracion/services/entidades-financieras.service.ts`

```typescript
export class EntidadesFinancierasService {
  // CRUD
  async getAll(filters?, orderBy?): Promise<EntidadFinancieraResult<EntidadFinanciera[]>>
  async getById(id: string): Promise<EntidadFinancieraResult<EntidadFinanciera>>
  async create(dto: CrearEntidadFinancieraDTO): Promise<EntidadFinancieraResult<EntidadFinanciera>>
  async update(id: string, dto: ActualizarEntidadFinancieraDTO): Promise<...>
  async softDelete(id: string): Promise<...>
  async reactivate(id: string): Promise<...>

  // Especiales
  async getActivas(tipo?: TipoEntidadFinanciera): Promise<...>
  async getStats(): Promise<EntidadFinancieraResult<EntidadesFinancierasStats>>
  async reordenar(updates: Array<{ id: string; orden: number }>): Promise<...>

  // Validaciones privadas
  private async existeNombre(nombre: string, excludeId?: string): Promise<boolean>
  private async existeCodigo(codigo: string, excludeId?: string): Promise<boolean>
}
```

**Singleton:**
```typescript
export const entidadesFinancierasService = new EntidadesFinancierasService()
```

---

### 4️⃣ **React Query Hooks** (State Management)

**Archivo:** `src/modules/configuracion/hooks/useEntidadesFinancieras.ts`

```typescript
// Query Hooks
export function useEntidadesFinancieras(filters?, orderBy?) // Lista con filtros
export function useEntidadFinanciera(id: string) // Por ID
export function useEntidadesFinancierasStats() // Estadísticas
export function useEntidadesFinancierasActivas(tipo?) // Solo activas
export function useEntidadesFinancierasOptions(tipo?) // Para <select>

// Mutation Hooks
export function useCrearEntidadFinanciera() // Create
export function useActualizarEntidadFinanciera() // Update
export function useEliminarEntidadFinanciera() // Soft delete
export function useReactivarEntidadFinanciera() // Reactivate
export function useReordenarEntidadesFinancieras() // Reorder
```

**Cache strategy:**
- `staleTime`: 5-10 minutos
- `gcTime`: 10-15 minutos
- Optimistic updates en edición
- Auto-invalidation después de mutaciones

---

### 5️⃣ **Hooks para Formularios de Fuentes de Pago**

**Archivo:** `src/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes.ts`

```typescript
// Reemplazan arrays BANCOS y CAJAS hardcoded
export function useBancos(): { bancos: EntidadOption[], isLoading, isError }
export function useCajas(): { cajas: EntidadOption[], isLoading, isError }
export function useEntidadesFinancieras(): { bancos, cajas, entidades, isLoading, isError }
export function useEntidadesPorTipo(tipo: TipoEntidadFinanciera)
export function useEntidadNombre(entidadId: string | null)
```

**Uso en componentes:**
```typescript
const { bancos, isLoading } = useBancos()

<select disabled={isLoading}>
  <option>{isLoading ? 'Cargando...' : 'Seleccionar...'}</option>
  {bancos.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
</select>
```

---

### 6️⃣ **UI Components** (Premium Design)

#### Modal de Formulario
**Archivo:** `src/modules/configuracion/components/EntidadFinancieraFormModal.tsx`

- React Hook Form + Zod validation
- 12 campos con validación completa
- Preview de color en tiempo real
- Animaciones con Framer Motion
- Dark mode completo

#### Tabla Administrativa
**Archivo:** `src/modules/configuracion/components/EntidadesFinancierasLista.tsx`

- Búsqueda en tiempo real
- Filtros por tipo y estado
- Acciones inline (edit, delete, reactivate)
- Loading/Error/Empty states
- Responsive design

---

### 7️⃣ **Admin Page**

**Ruta:** `/admin/entidades-financieras`

**Archivo:** `src/app/admin/entidades-financieras/page.tsx`

- Server Component con permission check
- Header hero con estadísticas
- Integración completa con componentes UI

**Card en Panel de Admin:**
- Gradiente naranja/ámbar
- Icono Building2
- Badge "✨ Nuevo"

---

## 🔄 Integración con Módulo de Asignar Vivienda

### ✅ Componentes Actualizados

#### 1. `FuentePagoCard.tsx`
**Antes:**
```typescript
const BANCOS = ['Bancolombia', 'Davivienda', ...] // ❌ Hardcoded
const CAJAS = ['Comfandi', 'Comfenalco', ...] // ❌ Hardcoded

<select>
  {BANCOS.map(b => <option>{b}</option>)}
</select>
```

**Después:**
```typescript
const { bancos, isLoading: loadingBancos } = useBancos() // ✅ Dinámico
const { cajas, isLoading: loadingCajas } = useCajas() // ✅ Dinámico

<select disabled={loadingBancos}>
  <option>{loadingBancos ? 'Cargando...' : 'Seleccionar...'}</option>
  {bancos.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
</select>
```

#### 2. `EditarFuentesPagoModalV2.tsx`
```typescript
const { bancos } = useBancos()
const { cajas } = useCajas()

// Select dinámico con loading state
<select disabled={loadingBancos}>
  {bancos.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
</select>
```

#### 3. Schemas de Validación
**Archivo:** `negociaciones/schemas/fuentes-pago.schema.ts`

```typescript
// ANTES: Validaba texto libre
entidad: z.string().optional()

// DESPUÉS: Valida UUID
entidad: z.string().uuid('ID de entidad inválido').optional()
```

---

## 📊 Migración de Datos

### Proceso Automático

1. **Nueva columna FK:**
   ```sql
   ALTER TABLE fuentes_pago ADD COLUMN entidad_financiera_id UUID;
   ```

2. **Mapeo texto → UUID:**
   - Función `map_entidad_to_id()` busca por nombre
   - Fallback a código
   - Fallback a coincidencia parcial

3. **Sincronización:**
   ```sql
   -- Trigger mantiene campo text actualizado
   CREATE TRIGGER sync_entidad_from_fk ...
   ```

4. **Vista de compatibilidad:**
   ```sql
   CREATE VIEW fuentes_pago_con_entidad AS
   SELECT fp.*, ef.nombre AS entidad_nombre, ...
   FROM fuentes_pago fp
   LEFT JOIN entidades_financieras ef ON fp.entidad_financiera_id = ef.id;
   ```

---

## 🎯 Ventajas del Sistema

### Antes (Hardcoded)
- ❌ Arrays hardcoded en múltiples archivos
- ❌ Cambios requieren deploy
- ❌ No auditable
- ❌ Duplicación de código
- ❌ Sin información adicional (NIT, teléfono, etc.)

### Después (Dinámico)
- ✅ Base de datos única
- ✅ Cambios en tiempo real sin deploy
- ✅ Auditoría completa
- ✅ Código reutilizable
- ✅ Información corporativa completa
- ✅ Ordenamiento personalizable
- ✅ Búsqueda y filtros
- ✅ Soft delete (desactivar sin eliminar)

---

## 🚀 Uso Rápido

### Administrar Entidades
```
1. Ir a /admin/entidades-financieras
2. Crear/editar/desactivar entidades
3. Los cambios son inmediatos en formularios
```

### Usar en Componente
```typescript
import { useBancos } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'

function MiComponente() {
  const { bancos, isLoading } = useBancos()

  return (
    <select disabled={isLoading}>
      {bancos.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
    </select>
  )
}
```

### Obtener Nombre por ID
```typescript
import { useEntidadNombre } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'

const nombreBanco = useEntidadNombre(entidadId)
```

---

## 📁 Estructura de Archivos

```
src/
├── modules/configuracion/
│   ├── types/
│   │   └── entidades-financieras.types.ts (15+ tipos)
│   ├── services/
│   │   └── entidades-financieras.service.ts (450 líneas)
│   ├── hooks/
│   │   ├── useEntidadesFinancieras.ts (8 hooks)
│   │   └── useEntidadesFinancierasParaFuentes.ts (hooks simplificados)
│   └── components/
│       ├── EntidadFinancieraFormModal.tsx (500 líneas)
│       └── EntidadesFinancierasLista.tsx (450 líneas)
│
├── modules/clientes/components/
│   └── fuente-pago-card/
│       └── FuentePagoCard.tsx (✅ ACTUALIZADO)
│
└── app/
    ├── admin/
    │   ├── admin-content.tsx (✅ Card agregada)
    │   └── entidades-financieras/
    │       ├── page.tsx
    │       └── entidades-financieras-admin-content.tsx
    │
    └── clientes/[id]/tabs/negociaciones/
        ├── EditarFuentesPagoModalV2.tsx (✅ ACTUALIZADO)
        └── schemas/fuentes-pago.schema.ts (✅ ACTUALIZADO)

supabase/migrations/
├── 20251211_entidades_financieras.sql (tabla + seed)
└── 20251211_normalizar_entidad_fuentes_pago.sql (FK + migración)
```

---

## ✅ Checklist de Implementación

- [x] Crear tabla `entidades_financieras`
- [x] Seed de 27 entidades
- [x] RLS policies
- [x] Tipos TypeScript
- [x] Service layer
- [x] React Query hooks
- [x] Hooks para formularios
- [x] Modal de formulario
- [x] Tabla administrativa
- [x] Admin page
- [x] Card en panel admin
- [x] Migración FK en `fuentes_pago`
- [x] Actualizar `FuentePagoCard`
- [x] Actualizar `EditarFuentesPagoModalV2`
- [x] Actualizar schemas de validación
- [x] Ejecutar migraciones SQL
- [x] Regenerar tipos TypeScript

---

## 🎓 Aprendizajes Clave

1. **Clean Architecture:** Separación estricta de capas (DB → Service → Hooks → UI)
2. **React Query:** Cache inteligente con staleTime y optimistic updates
3. **Migración sin downtime:** FK nullable + trigger + vista de compatibilidad
4. **Type Safety:** TypeScript end-to-end (DB types → Service → UI)
5. **Professional UX:** Loading states, error handling, empty states

---

## 📚 Documentación Relacionada

- `SISTEMA-FUENTES-PAGO-DINAMICAS.md` - Sistema de tipos de fuentes de pago
- `SISTEMA-THEMING-MODULAR.md` - Sistema de theming por módulo
- `PLANTILLA-ESTANDAR-MODULOS.md` - Plantilla para crear módulos

---

**Fecha:** 2025-12-11
**Autor:** Sistema de IA (GitHub Copilot)
**Estado:** ✅ COMPLETADO
