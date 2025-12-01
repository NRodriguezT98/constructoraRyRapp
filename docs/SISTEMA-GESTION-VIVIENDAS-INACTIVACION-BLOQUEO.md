# 🏠 Sistema de Gestión de Viviendas: Inactivación y Bloqueo de Edición

**Fecha:** 21 de noviembre de 2025
**Versión:** 1.0
**Estado:** Diseño Aprobado - Pendiente Implementación

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Regla de Oro: Bloqueo Post-Minuta](#regla-de-oro)
3. [Sistema de Inactivación (Soft Delete)](#sistema-de-inactivación)
4. [Sistema de Bloqueo de Edición](#sistema-de-bloqueo-de-edición)
5. [Gestión de Conflictos (Número/Matrícula)](#gestión-de-conflictos)
6. [Migraciones SQL](#migraciones-sql)
7. [Implementación por Fases](#implementación-por-fases)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivos:
1. **Proteger integridad de datos legales** después de firma de minuta
2. **Permitir inactivación de viviendas** sin perder historial (soft delete)
3. **Gestionar conflictos** de número/matrícula al crear viviendas
4. **Auditar todas las acciones críticas** con trazabilidad completa

### Principios Fundamentales:
- ✅ **Soft Delete**: Nunca eliminar físicamente viviendas con historial
- ✅ **Bloqueo Progresivo**: Más restricciones según avanza el proceso de venta
- ✅ **Auditoría Robusta**: Registrar TODO cambio crítico con motivo obligatorio
- ✅ **Solo Admin**: Operaciones críticas exclusivas para Administradores

---

## 🔒 REGLA DE ORO

### Criterio de Bloqueo de Edición

```typescript
/**
 * CRITERIO CRÍTICO: Una vez firmada la minuta en notaría,
 * la vivienda queda en estado INMUTABLE (datos legales congelados)
 */

const ESTADOS_BLOQUEANTES = [
  'Escriturada',   // Ya tiene escritura pública
  'Entregada',     // Vivienda ya entregada
  'Finalizada'     // Proceso completado
]

// BLOQUEO TOTAL si:
const viviendaBloqueada =
  negociacion.fecha_firma_minuta !== null ||
  ESTADOS_BLOQUEANTES.includes(negociacion.estado)
```

### Matriz de Permisos por Fase

| Fase de Negociación | Matrícula | Dirección | Área | Valor | Descripción |
|---------------------|-----------|-----------|------|-------|-------------|
| **Sin negociaciones** | ✅ Admin | ✅ Admin | ✅ Admin | ✅ Libre | ✅ Libre |
| **Negociación Activa (pre-minuta)** | ⚠️ Admin + motivo | ⚠️ Admin + motivo | ⚠️ Admin + motivo | ✅ Libre | ✅ Libre |
| **Minuta Firmada** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** | ✅ Libre |
| **Escriturada/Entregada** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** | 🔒 **BLOQUEADO** |

---

## 💤 SISTEMA DE INACTIVACIÓN

### 1. Validaciones Pre-Inactivación

**Criterio:** Solo puede inactivarse si **NO** tiene:
- ❌ Negociaciones (nunca tuvo)
- ❌ Abonos registrados
- ❌ Documentos importantes (opcional)

```typescript
interface ValidacionEliminacion {
  puedeEliminar: boolean
  razon?: string
  detalles?: {
    negociaciones: number
    abonos: number
    montoTotal: number
    documentos: number
  }
}
```

### 2. Proceso de Inactivación

```
┌─────────────────────────────────────────┐
│ 1. Admin click "Desactivar Vivienda"   │
├─────────────────────────────────────────┤
│ 2. Sistema valida:                      │
│    ✓ No tiene negociaciones             │
│    ✓ No tiene abonos                    │
│    ✓ No tiene documentos críticos       │
├─────────────────────────────────────────┤
│ 3. Modal solicita:                      │
│    - Motivo (mínimo 50 caracteres)      │
│    - Confirmación                       │
├─────────────────────────────────────────┤
│ 4. Sistema ejecuta:                     │
│    - UPDATE estado = 'Inactiva'         │
│    - Registra fecha_inactivacion        │
│    - Registra motivo_inactivacion       │
│    - Incrementa contador_desactivaciones│
│    - INSERT auditoría                   │
│    - INSERT historial_estados           │
└─────────────────────────────────────────┘
```

### 3. Reactivación

**Validaciones:**
- ✅ Proyecto siga activo
- ✅ No haya otra vivienda activa con el mismo número
- ✅ Motivo obligatorio (mínimo 30 caracteres)

```typescript
// Flujo de reactivación
Inactiva → VALIDAR → Disponible
```

---

## 🔐 SISTEMA DE BLOQUEO DE EDICIÓN

### 1. Service de Validación

**Ubicación:** `src/modules/viviendas/services/viviendas-validacion.service.ts`

```typescript
export interface EstadoBloqueoVivienda {
  bloqueadaCompletamente: boolean
  razonBloqueo?: string
  negociacionBloqueante?: any
  camposEditables: string[]
  camposRestringidos: string[]
  camposBloqueados: string[]
}

export class ViviendaValidacionService {
  static async verificarEstadoBloqueo(viviendaId: string): Promise<EstadoBloqueoVivienda>
  static async puedeEditarCampo(viviendaId: string, campo: keyof Vivienda, esAdmin: boolean): Promise<{...}>
}
```

### 2. Casos de Bloqueo

#### Caso 1: Sin Negociaciones
```typescript
{
  bloqueadaCompletamente: false,
  camposEditables: ['matricula_inmobiliaria', 'direccion', 'area_total', 'valor_base', 'descripcion'],
  camposRestringidos: ['matricula_inmobiliaria', 'direccion', 'area_total'], // Requieren Admin
  camposBloqueados: []
}
```

#### Caso 2: Negociación Activa (Sin Minuta)
```typescript
{
  bloqueadaCompletamente: false,
  razonBloqueo: '⚠️ RESTRINGIDO: Negociación activa',
  camposEditables: ['descripcion', 'caracteristicas', 'valor_base'],
  camposRestringidos: ['matricula_inmobiliaria', 'direccion', 'area_total'], // Admin + motivo
  camposBloqueados: []
}
```

#### Caso 3: Minuta Firmada o Escriturada
```typescript
{
  bloqueadaCompletamente: true,
  razonBloqueo: '🔒 BLOQUEADO: Minuta firmada - Datos legales congelados',
  camposEditables: ['descripcion', 'caracteristicas'], // Solo informativos
  camposRestringidos: [],
  camposBloqueados: ['matricula_inmobiliaria', 'direccion', 'area_total', 'valor_base', 'numero']
}
```

### 3. UI - Banner de Bloqueo

Mostrar en formulario de edición:

```tsx
{estadoBloqueo?.bloqueadaCompletamente && (
  <div className="mb-6 p-6 bg-red-50 dark:bg-red-950/30 rounded-xl border-4 border-red-500">
    <Lock className="w-10 h-10 text-red-600" />
    <h3>🔒 Vivienda Bloqueada - Datos Legales Congelados</h3>
    <p>{estadoBloqueo.razonBloqueo}</p>

    <div className="grid grid-cols-2 gap-2">
      <div>❌ Matrícula Inmobiliaria</div>
      <div>❌ Dirección</div>
      <div>❌ Área Total</div>
      <div>❌ Valor Base</div>
    </div>

    <p>Solo puedes editar: Descripción, Características</p>
  </div>
)}
```

---

## 🔄 GESTIÓN DE CONFLICTOS

### Escenario: Crear Vivienda 3 con matrícula existente en vivienda inactiva

```
Usuario intenta crear Vivienda 3 con matrícula "123-ABC"
    ↓
Sistema detecta: Ya existe Vivienda 3 INACTIVA con matrícula "123-ABC"
    ↓
Sistema valida: ¿Vivienda inactiva tiene negociaciones/abonos?
    ├─ NO  → Modal: "¿Editar vivienda inactiva con nuevos datos?"
    └─ SÍ  → Error: "No se puede, usa otro número o reactiva manualmente"
```

### Flujo de Sobrescritura/Edición

```typescript
// 1. Detectar conflicto
const conflicto = await verificarViviendaInactivaReutilizable(proyectoId, manzanaId, numero)

if (conflicto.existeInactiva && conflicto.puedeReutilizar) {
  // 2. Redirigir a edición con datos sugeridos
  router.push(`/viviendas/${conflicto.vivienda.id}/editar?from=conflict&nuevos=${JSON.stringify(nuevosDatos)}`)
}
```

### Modal de Decisión

```tsx
<Modal>
  <h2>⚠️ Ya existe Vivienda #{numero} (Inactiva)</h2>

  <div className="grid grid-cols-2 gap-4">
    {/* Columna izquierda: Datos actuales */}
    <div className="bg-red-50">
      <h3>📁 Vivienda Existente (Inactiva)</h3>
      <ul>
        <li>Matrícula: {viviendaInactiva.matricula_inmobiliaria} ✅</li>
        <li>Dirección: {viviendaInactiva.direccion} ❌ (ERROR)</li>
        <li>Área: {viviendaInactiva.area_total} m² ❌</li>
      </ul>
    </div>

    {/* Columna derecha: Nuevos datos */}
    <div className="bg-green-50">
      <h3>✨ Nuevos Datos (correctos)</h3>
      <ul>
        <li>Matrícula: {nuevosDatos.matricula_inmobiliaria}</li>
        <li>Dirección: {nuevosDatos.direccion}</li>
        <li>Área: {nuevosDatos.area_total} m²</li>
      </ul>
    </div>
  </div>

  <button onClick={redirigirAEdicion}>
    📝 Editar Vivienda Inactiva
  </button>
</Modal>
```

---

## 🗄️ MIGRACIONES SQL

### 1. Agregar Columnas de Inactivación/Reactivación

```sql
-- Archivo: supabase/migrations/XXXXX_agregar_sistema_inactivacion_viviendas.sql

-- Columnas de inactivación
ALTER TABLE viviendas
ADD COLUMN IF NOT EXISTS fecha_inactivacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS motivo_inactivacion TEXT,
ADD COLUMN IF NOT EXISTS inactivada_por UUID REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS fecha_reactivacion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS motivo_reactivacion TEXT,
ADD COLUMN IF NOT EXISTS reactivada_por UUID REFERENCES usuarios(id),
ADD COLUMN IF NOT EXISTS contador_desactivaciones INTEGER DEFAULT 0;

-- Verificar/Actualizar constraint de estado
ALTER TABLE viviendas
DROP CONSTRAINT IF EXISTS viviendas_estado_check;

ALTER TABLE viviendas
ADD CONSTRAINT viviendas_estado_check CHECK (
  estado IN (
    'Disponible',
    'Asignada',
    'Vendida',
    'Reservada',
    'Suspendida',
    'Cancelada',
    'Inactiva'
  )
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_viviendas_estado ON viviendas(estado);
CREATE INDEX IF NOT EXISTS idx_viviendas_inactivas ON viviendas(estado) WHERE estado = 'Inactiva';

-- Comentarios
COMMENT ON COLUMN viviendas.fecha_inactivacion IS 'Fecha en que la vivienda fue marcada como inactiva (soft delete)';
COMMENT ON COLUMN viviendas.motivo_inactivacion IS 'Razón detallada por la que se inactivó la vivienda';
COMMENT ON COLUMN viviendas.contador_desactivaciones IS 'Contador de cuántas veces ha sido desactivada/reactivada';
```

### 2. Tabla de Historial de Estados

```sql
-- Archivo: supabase/migrations/XXXXX_crear_historial_estados_viviendas.sql

CREATE TABLE IF NOT EXISTS viviendas_historial_estados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_id UUID NOT NULL REFERENCES viviendas(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(50) NOT NULL,
  estado_nuevo VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
  motivo TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_viviendas_historial_vivienda ON viviendas_historial_estados(vivienda_id);
CREATE INDEX idx_viviendas_historial_fecha ON viviendas_historial_estados(fecha_cambio DESC);

-- RLS Policies
ALTER TABLE viviendas_historial_estados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver historial"
  ON viviendas_historial_estados
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden insertar historial"
  ON viviendas_historial_estados
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

-- Comentarios
COMMENT ON TABLE viviendas_historial_estados IS 'Historial completo de cambios de estado de viviendas (Disponible → Inactiva → Disponible)';
```

### 3. Tabla de Historial de Matrículas (Opcional - Alta Seguridad)

```sql
-- Archivo: supabase/migrations/XXXXX_crear_historial_matriculas_viviendas.sql

CREATE TABLE IF NOT EXISTS viviendas_historial_matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vivienda_id UUID NOT NULL REFERENCES viviendas(id) ON DELETE CASCADE,
  matricula_anterior VARCHAR(100) NOT NULL,
  matricula_nueva VARCHAR(100) NOT NULL,
  fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
  motivo TEXT NOT NULL CHECK (char_length(motivo) >= 100),
  usuario_id UUID REFERENCES usuarios(id),
  nivel_riesgo VARCHAR(20) CHECK (nivel_riesgo IN ('MODERADO', 'CRITICO', 'ALTO')),

  -- Snapshot de relaciones al momento del cambio
  negociaciones_snapshot JSONB,
  abonos_snapshot JSONB,
  documentos_snapshot JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_historial_matriculas_vivienda ON viviendas_historial_matriculas(vivienda_id);
CREATE INDEX idx_historial_matriculas_fecha ON viviendas_historial_matriculas(fecha_cambio DESC);

-- RLS Policies
ALTER TABLE viviendas_historial_matriculas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admins pueden ver/insertar historial matriculas"
  ON viviendas_historial_matriculas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'Administrador'
    )
  );

COMMENT ON TABLE viviendas_historial_matriculas IS 'Historial de cambios de matrícula (operación crítica - solo Admin)';
```

---

## 🚀 IMPLEMENTACIÓN POR FASES

### FASE 1: Base de Datos ✅
**Prioridad:** ALTA
**Tiempo estimado:** 1 hora

- [ ] Ejecutar migración de columnas de inactivación
- [ ] Ejecutar migración de tabla `viviendas_historial_estados`
- [ ] Ejecutar migración de tabla `viviendas_historial_matriculas` (opcional)
- [ ] Verificar tipos TypeScript: `npm run types:generate`
- [ ] Validar con `npm run type-check`

**Comando:**
```bash
npm run db:exec supabase/migrations/XXXXX_agregar_sistema_inactivacion_viviendas.sql
npm run db:exec supabase/migrations/XXXXX_crear_historial_estados_viviendas.sql
npm run types:generate
```

---

### FASE 2: Services (Lógica de Negocio) ✅
**Prioridad:** ALTA
**Tiempo estimado:** 3 horas

**Archivos a crear:**

1. `src/modules/viviendas/services/viviendas-validacion.service.ts`
   - `verificarEstadoBloqueo()`
   - `puedeEditarCampo()`
   - `obtenerHistorialCompleto()`

2. `src/modules/viviendas/services/viviendas-inactivacion.service.ts`
   - `validarEliminacion()`
   - `marcarComoInactiva()`
   - `validarReactivacion()`
   - `reactivarVivienda()`

3. `src/modules/viviendas/services/viviendas-conflictos.service.ts`
   - `verificarViviendaInactivaReutilizable()`
   - `sobrescribirViviendaInactiva()`
   - `validarMatriculaUnica()`

**Exportar en:**
```typescript
// src/modules/viviendas/services/index.ts
export * from './viviendas-validacion.service'
export * from './viviendas-inactivacion.service'
export * from './viviendas-conflictos.service'
```

---

### FASE 3: Hooks ✅
**Prioridad:** MEDIA
**Tiempo estimado:** 2 horas

**Archivos a crear:**

1. `src/modules/viviendas/hooks/useViviendaBloqueo.ts`
   ```typescript
   export function useViviendaBloqueo(viviendaId: string) {
     const [estadoBloqueo, setEstadoBloqueo] = useState<EstadoBloqueoVivienda | null>(null)
     // Cargar estado de bloqueo
     return { estadoBloqueo, cargando, refetch }
   }
   ```

2. `src/modules/viviendas/hooks/useViviendaInactivacion.ts`
   ```typescript
   export function useViviendaInactivacion() {
     const { marcarComoInactiva, reactivarVivienda } = useViviendaService()
     // Lógica de inactivación/reactivación
   }
   ```

---

### FASE 4: Components (UI) ✅
**Prioridad:** MEDIA
**Tiempo estimado:** 4 horas

**Archivos a crear:**

1. `src/modules/viviendas/components/modals/DesactivarViviendaModal.tsx`
2. `src/modules/viviendas/components/modals/ReactivarViviendaModal.tsx`
3. `src/modules/viviendas/components/modals/ConflictoViviendaModal.tsx`
4. `src/modules/viviendas/components/shared/BannerBloqueoVivienda.tsx`

**Integrar en:**
- Card de vivienda (botones desactivar/reactivar)
- Formulario de edición (campos bloqueados)
- Formulario de creación (detectar conflictos)

---

### FASE 5: Documentación ✅
**Prioridad:** BAJA
**Tiempo estimado:** 30 minutos

**Actualizar:**
- `.github/copilot-instructions.md` - Agregar sección de gestión de viviendas
- `docs/DATABASE-SCHEMA-REFERENCE.md` - Documentar nuevas tablas/columnas

---

## 📚 REFERENCIAS

### Archivos Relacionados:
- `docs/POLITICA-ELIMINACION-DOCUMENTOS-ADMIN-ONLY.md` - Patrón similar para documentos
- `docs/SISTEMA-SINCRONIZACION-SCHEMA-DB.md` - Sincronización de tipos
- `.github/copilot-instructions.md` - Reglas de desarrollo

### Principios Aplicados:
- ✅ Soft Delete (no eliminación física)
- ✅ Auditoría completa
- ✅ Solo Admin para operaciones críticas
- ✅ Validaciones robustas
- ✅ Trazabilidad legal

---

**Documento creado por:** GitHub Copilot (Claude Sonnet 4.5)
**Última actualización:** 21 de noviembre de 2025
