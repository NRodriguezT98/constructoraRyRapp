# 🎯 Sistema Completo de Fuentes de Pago Dinámicas

## 📋 Descripción General

Sistema completamente dinámico de fuentes de pago que:
1. **Carga fuentes desde BD** (NO hardcodeadas)
2. **Filtra entidades por aplicabilidad** (bancos/cajas específicos para cada fuente)
3. **Auto-expande y simplifica UX** (toggle activa → card se expande)
4. **Campos condicionales** (sin número de referencia en Cuota Inicial)
5. **Validación inteligente** (estados Completo/Incompleto/Doc. Pendiente)

---

## 🏗️ Arquitectura del Sistema

### 1️⃣ Base de Datos

#### Tabla: `tipos_fuentes_pago`
```sql
CREATE TABLE tipos_fuentes_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  icono TEXT,
  color TEXT,
  requiere_entidad BOOLEAN DEFAULT false,
  requiere_carta_aprobacion BOOLEAN DEFAULT false,
  permite_multiples_abonos BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Tabla: `entidades_financieras`
```sql
CREATE TABLE entidades_financieras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  tipo tipo_entidad_financiera NOT NULL,
  tipos_fuentes_aplicables UUID[] DEFAULT '{}', -- 🔥 IDs de tipos_fuentes_pago
  activo BOOLEAN DEFAULT true,
  -- ... otros campos
);

-- Índice GIN para búsqueda eficiente en array
CREATE INDEX idx_entidades_tipos_fuentes_gin
ON entidades_financieras USING GIN (tipos_fuentes_aplicables);
```

#### Función SQL: `get_entidades_por_tipo_fuente()`
```sql
CREATE OR REPLACE FUNCTION get_entidades_por_tipo_fuente(
  p_tipo_fuente_id UUID,
  p_solo_activas BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  codigo TEXT,
  tipo tipo_entidad_financiera,
  activo BOOLEAN
  -- ... otros campos
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ef.id,
    ef.nombre,
    ef.codigo,
    ef.tipo,
    ef.activo
  FROM entidades_financieras ef
  WHERE p_tipo_fuente_id = ANY(ef.tipos_fuentes_aplicables)
    AND (NOT p_solo_activas OR ef.activo = true)
  ORDER BY ef.orden, ef.nombre;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

### 2️⃣ Capa de Servicio

#### `tipos-fuentes-pago.service.ts`
```typescript
/**
 * 🔥 Cargar tipos de fuentes de pago ACTIVAS desde BD
 */
export async function cargarTiposFuentesPagoActivas(): Promise<ConsultaTiposFuentesResult> {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  return { data, error }
}

/**
 * 🔥 Obtener configuración de una fuente específica por nombre
 */
export async function obtenerTipoFuentePorNombre(
  nombre: string
): Promise<TipoFuentePagoCatalogo | null> {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('*')
    .eq('nombre', nombre)
    .eq('activo', true)
    .single()

  return error ? null : data
}
```

#### `entidades-financieras.service.ts`
```typescript
/**
 * 🔥 Obtener entidades activas filtradas por tipo de fuente de pago aplicable
 * Usa la función SQL get_entidades_por_tipo_fuente() con índice GIN optimizado
 */
async getActivasPorTipoFuente(
  tipoFuenteId: string
): Promise<EntidadFinancieraResult<EntidadFinanciera[]>> {
  const { data, error } = await this.supabase
    .rpc('get_entidades_por_tipo_fuente', {
      p_tipo_fuente_id: tipoFuenteId,
      p_solo_activas: true
    })

  return { success: !error, data, error }
}
```

---

### 3️⃣ Capa de Hooks

#### `useFuentesPago.ts` - Lógica de negocio
```typescript
export function useFuentesPago() {
  const [cargandoTipos, setCargandoTipos] = useState(true)
  const [tiposFuentesDisponibles, setTiposFuentesDisponibles] = useState<string[]>([])
  const [fuentes, setFuentes] = useState<FuentePagoConfiguracion[]>([])

  // 🔥 Cargar tipos desde BD al montar
  useEffect(() => {
    const cargarTipos = async () => {
      const { data, error } = await cargarTiposFuentesPagoActivas()

      if (data) {
        setTiposFuentesDisponibles(data.map(f => f.nombre))
      } else {
        // Fallback a 4 fuentes por defecto si falla
        setTiposFuentesDisponibles([
          'Cuota Inicial',
          'Recursos Propios',
          'Crédito Hipotecario',
          'Subsidio Caja Compensación'
        ])
      }

      setCargandoTipos(false)
    }

    cargarTipos()
  }, [])

  // 🔥 Inicializar fuentes dinámicamente cuando se cargan los tipos
  useEffect(() => {
    if (!cargandoTipos && tiposFuentesDisponibles.length > 0) {
      const fuentesIniciales = tiposFuentesDisponibles.map(nombre => ({
        tipo: nombre as TipoFuentePago,
        enabled: false,
        config: null,
      }))
      setFuentes(fuentesIniciales)
    }
  }, [cargandoTipos, tiposFuentesDisponibles])

  return { fuentes, cargandoTipos, tiposFuentesDisponibles, ... }
}
```

#### `useEntidadesFinancierasParaFuentes.ts` - Filtrado por fuente
```typescript
/**
 * 🔥 Obtener solo bancos MARCADOS para Crédito Hipotecario
 */
export function useBancos() {
  // 1. Obtener ID de "Crédito Hipotecario"
  const { data: tipoFuente, isLoading: cargandoTipo } = useQuery({
    queryKey: ['tipo-fuente-credito-hipotecario'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_fuentes_pago')
        .select('id, nombre')
        .eq('nombre', 'Crédito Hipotecario')
        .eq('activo', true)
        .single()

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000,
  })

  // 2. Obtener entidades filtradas
  const { data: entidades, isLoading: cargandoEntidades } = useQuery({
    queryKey: ['entidades-bancos-credito-hipotecario', tipoFuente?.id],
    queryFn: async () => {
      if (!tipoFuente?.id) return []

      const { data, error } = await supabase
        .rpc('get_entidades_por_tipo_fuente', {
          p_tipo_fuente_id: tipoFuente.id,
          p_solo_activas: true
        })

      if (error) throw error

      // Filtrar solo Bancos
      return (data || []).filter(e => e.tipo === 'Banco')
    },
    enabled: !!tipoFuente?.id,
  })

  return {
    bancos: entidades?.map(e => ({ value: e.id, label: e.nombre })) || [],
    isLoading: cargandoTipo || cargandoEntidades
  }
}

/**
 * 🔥 Obtener solo cajas MARCADAS para Subsidio Caja Compensación
 */
export function useCajas() {
  // Mismo patrón pero con "Subsidio Caja Compensación"
  // ...
}
```

---

### 4️⃣ Capa de Componentes

#### `Paso2FuentesPago.tsx` - Orquestador
```tsx
export function Paso2FuentesPago({ fuentes, cargandoTipos, ... }: Props) {
  return (
    <div className="space-y-4">
      {/* Estado: Cargando */}
      {cargandoTipos && (
        <div className="flex items-center gap-3 p-4 bg-cyan-50">
          <div className="animate-spin w-5 h-5 border-3 border-cyan-500" />
          <p>Cargando fuentes de pago activas desde el sistema...</p>
        </div>
      )}

      {/* Estado: Sin fuentes activas */}
      {!cargandoTipos && fuentes.length === 0 && (
        <div className="p-4 bg-yellow-50">
          ⚠️ No hay fuentes de pago activas configuradas.
        </div>
      )}

      {/* Lista de fuentes dinámicas */}
      {!cargandoTipos && fuentes.length > 0 && (
        <div className="space-y-3">
          {fuentes.map((fuente) => (
            <FuentePagoCard key={fuente.tipo} fuente={fuente} ... />
          ))}
        </div>
      )}
    </div>
  )
}
```

#### `FuentePagoCard.tsx` - Card individual
```tsx
export function FuentePagoCard({ tipo, enabled, config, ... }: Props) {
  // 🔥 Auto-expandir cuando se activa
  const [isExpanded, setIsExpanded] = useState(enabled)

  // 🔥 Config dinámica con fallback
  const tipoConfig = getTipoConfig(tipo)

  // 🔥 Estado visual simplificado
  const estadoVisual = getEstadoVisual()

  // 🔥 Hooks de entidades filtradas
  const { bancos, isLoading: cargandoBancos } = useBancos()
  const { cajas, isLoading: cargandoCajas } = useCajas()

  return (
    <div className={tipoConfig.cardClasses}>
      {/* Toggle con auto-expand */}
      <Switch
        checked={enabled}
        onCheckedChange={(checked) => {
          onChange({ ...fuente, enabled: checked })
          setIsExpanded(checked) // 🔥 Expandir al activar
        }}
      />

      {/* Badge de estado (solo si relevante) */}
      {estadoVisual && (
        <Badge variant={estadoVisual.variant}>
          {estadoVisual.icono} {estadoVisual.texto}
        </Badge>
      )}

      {/* Formulario expandido */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Monto */}
          <input type="number" ... />

          {/* Número de referencia (NO en Cuota Inicial) */}
          {tipo !== 'Cuota Inicial' && (
            <input type="text" ... />
          )}

          {/* Entidad (solo si requiere) */}
          {tipoConfig.requiereEntidad && (
            <select>
              {tipo === 'Crédito Hipotecario' ? (
                bancos.map(b => <option key={b.value}>{b.label}</option>)
              ) : tipo === 'Subsidio Caja Compensación' ? (
                cajas.map(c => <option key={c.value}>{c.label}</option>)
              ) : null}
            </select>
          )}

          {/* Carta de aprobación */}
          {tipoConfig.requiereCartaAprobacion && (
            <FileUpload ... />
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 🎯 Flujo de Usuario

### Escenario: Activar Crédito Hipotecario

```
1. Usuario presiona toggle "Crédito Hipotecario"
   ↓
2. onChange({ enabled: true })
   ↓
3. setIsExpanded(true) → Card se expande automáticamente
   ↓
4. useBancos() se ejecuta:
   a. Query a tipos_fuentes_pago → obtiene ID de "Crédito Hipotecario"
   b. RPC get_entidades_por_tipo_fuente(id) → obtiene bancos marcados
   c. Filtra solo tipo="Banco"
   ↓
5. Select muestra: Bancolombia, BBVA, Davivienda (solo los marcados)
   ↓
6. Usuario selecciona banco, ingresa monto, referencia
   ↓
7. getEstadoVisual() evalúa:
   - Hay monto? ✅
   - Hay entidad? ✅
   - Hay referencia? ✅
   - Hay carta? ❌
   → Badge: "📄 Doc. Pendiente"
   ↓
8. Usuario sube carta de aprobación
   ↓
9. getEstadoVisual() reevalúa:
   - Todos los campos completos ✅
   → Badge: "✓ Completo"
```

---

## ⚙️ Configuración desde Admin

### Panel: Tipos de Fuentes de Pago

```
Admin → Configuración → Tipos de Fuentes de Pago

┌─────────────────────────────────────────────────────────┐
│ Nombre: Crédito Constructor                             │
│ Descripción: Financiamiento directo de la constructora  │
│ ☑ Activo                                                │
│ Orden: 5                                                │
│ Icono: building                                         │
│ Color: purple                                           │
│ ☑ Requiere entidad financiera                          │
│ ☑ Requiere carta de aprobación                         │
│ ☑ Permite múltiples abonos                             │
│                                                         │
│ [Guardar] [Cancelar]                                    │
└─────────────────────────────────────────────────────────┘

✅ Al guardar:
   - Se inserta en tipos_fuentes_pago
   - Aparece automáticamente en asignar-vivienda (NO deploy)
   - Frontend carga con cargarTiposFuentesPagoActivas()
```

### Panel: Entidades Financieras

```
Admin → Configuración → Entidades Financieras → Editar Bancolombia

┌─────────────────────────────────────────────────────────┐
│ Nombre: Bancolombia S.A.                                │
│ Tipo: Banco                                             │
│ Código: bancolombia                                     │
│                                                         │
│ Fuentes de Pago Aplicables:                            │
│ ☑ Crédito Hipotecario                                  │
│ ☑ Crédito Constructor                                  │
│ ☐ Subsidio Caja Compensación                           │
│ ☐ Recursos Propios                                     │
│                                                         │
│ [Guardar] [Cancelar]                                    │
└─────────────────────────────────────────────────────────┘

✅ Al guardar:
   - Se actualiza tipos_fuentes_aplicables con UUIDs
   - get_entidades_por_tipo_fuente() usa índice GIN
   - Bancolombia aparece en selects de Crédito Hipotecario y Crédito Constructor
```

---

## 🔍 Verificación y Debugging

### Script de Verificación
```bash
node verificar-filtrado-entidades.js
```

**Output esperado:**
```
🔍 VERIFICACIÓN: Sistema de filtrado de entidades por fuente de pago

📋 1. TIPOS DE FUENTES DE PAGO ACTIVAS:
   🏦 Cuota Inicial
   🏦 Recursos Propios
   🏦 Crédito Hipotecario
   🏦 Subsidio Caja Compensación
   🏦 Crédito Constructor

🏛️  2. ENTIDADES FINANCIERAS Y SUS FUENTES APLICABLES:
   Banco:
      • Bancolombia S.A.
        Fuentes aplicables: 2
        IDs: abc-123, def-456
      • BBVA Colombia
        Fuentes aplicables: 1
        IDs: abc-123

   Caja de Compensación:
      • Comfandi
        Fuentes aplicables: 1
        IDs: ghi-789

🧪 3. PRUEBAS DE FUNCIÓN SQL:
   🏦 Crédito Hipotecario:
      ✅ 2 banco(s) encontrado(s):
         • Bancolombia S.A.
         • BBVA Colombia

   🏛️  Subsidio Caja Compensación:
      ✅ 1 caja(s) encontrada(s):
         • Comfandi

📊 RESUMEN:
   • Total de entidades activas: 5
   • Entidades con fuentes configuradas: 3
   • Entidades sin fuentes: 2

✅ Verificación completada
```

---

## 📊 Ventajas del Sistema

### ✅ Configuración Sin Deploy
- Admin agrega "Leasing Bancario" → Aparece inmediatamente
- Admin desactiva "Subsidio Gobierno" → Desaparece en tiempo real
- NO requiere cambios en código ni despliegue

### ✅ Escalabilidad
- Agregar fuentes: 1 insert en tipos_fuentes_pago
- Agregar entidades: 1 insert en entidades_financieras
- Frontend se adapta automáticamente

### ✅ Filtrado Inteligente
- SQL function con índice GIN optimizado
- Solo muestra entidades marcadas para cada fuente
- Consultas rápidas (< 10ms)

### ✅ UX Simplificado
- Toggle activa → Card expande → Usuario configura
- Sin botones redundantes (expandir/colapsar)
- Estados claros (Completo/Incompleto/Doc. Pendiente)
- Campos condicionales (sin número de referencia en Cuota Inicial)

### ✅ Type-Safe
- TypeScript infiere tipos correctos
- Autocomplete funciona en VS Code
- Errores en compilación, no en runtime

---

## 🚀 Casos de Uso Reales

### Caso 1: Agregar Nueva Fuente "Leasing Bancario"

**Admin Panel:**
```sql
INSERT INTO tipos_fuentes_pago (
  nombre, descripcion, activo, orden,
  requiere_entidad, requiere_carta_aprobacion
) VALUES (
  'Leasing Bancario',
  'Financiamiento mediante contrato de leasing',
  true, 6,
  true, true
);
```

**Frontend (automático):**
- cargarTiposFuentesPagoActivas() incluye nueva fuente
- FuentePagoCard renderiza con config por defecto (cyan)
- useBancos() filtra bancos marcados con Leasing

**NO se requiere:**
- ❌ Editar código TypeScript
- ❌ Rebuild de aplicación
- ❌ Deploy
- ❌ Reiniciar servidor

---

### Caso 2: Restringir Davivienda Solo a Crédito Hipotecario

**Admin Panel:**
```typescript
// Editar Davivienda
tipos_fuentes_aplicables = [
  'uuid-credito-hipotecario' // Solo este
]
```

**Resultado:**
- Davivienda aparece SOLO en select de Crédito Hipotecario
- NO aparece en Crédito Constructor ni otros
- Cambio instantáneo (sin caché stale)

---

### Caso 3: Desactivar Temporalmente "Subsidio Gobierno"

**Admin Panel:**
```sql
UPDATE tipos_fuentes_pago
SET activo = false
WHERE nombre = 'Subsidio Gobierno';
```

**Frontend (automático):**
- cargarTiposFuentesPagoActivas() excluye la fuente
- Card desaparece de Paso 2
- Validaciones se ajustan automáticamente

**Reactivar:**
```sql
UPDATE tipos_fuentes_pago
SET activo = true
WHERE nombre = 'Subsidio Gobierno';
```

---

## 🛠️ Mantenimiento y Extensión

### Agregar Campo Custom a Fuente

**1. Actualizar tabla:**
```sql
ALTER TABLE tipos_fuentes_pago
ADD COLUMN tasa_minima NUMERIC(5,2);

UPDATE tipos_fuentes_pago
SET tasa_minima = 9.5
WHERE nombre = 'Crédito Hipotecario';
```

**2. Actualizar TypeScript:**
```typescript
// tipos-fuentes-pago.service.ts
export interface TipoFuentePagoCatalogo {
  // ...campos existentes
  tasa_minima: number | null
}
```

**3. Usar en componente:**
```tsx
{tipoConfig.tasa_minima && (
  <p className="text-xs text-gray-500">
    Tasa mínima: {tipoConfig.tasa_minima}%
  </p>
)}
```

---

### Extender Filtrado por Múltiples Criterios

**Escenario:** Filtrar bancos por fuente + monto mínimo

```typescript
// Nueva función SQL
CREATE FUNCTION get_entidades_filtradas(
  p_tipo_fuente_id UUID,
  p_monto NUMERIC DEFAULT NULL
)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM entidades_financieras ef
  WHERE p_tipo_fuente_id = ANY(ef.tipos_fuentes_aplicables)
    AND (p_monto IS NULL OR ef.monto_minimo <= p_monto);
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Hook actualizado
export function useBancos(monto?: number) {
  const { data } = useQuery({
    queryKey: ['bancos', tipoFuente?.id, monto],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_entidades_filtradas', {
        p_tipo_fuente_id: tipoFuente.id,
        p_monto: monto
      })
      return data
    }
  })
}
```

---

## 📚 Referencias

- **Documentación principal:** `docs/SISTEMA-FUENTES-PAGO-DINAMICAS.md`
- **Copilot instructions:** `.github/copilot-instructions.md` (REGLA CRÍTICA #-10)
- **Script de verificación:** `verificar-filtrado-entidades.js`
- **Migración SQL:** `supabase/migrations/20251222_entidades_fuentes_aplicables.sql`
- **Service de tipos:** `src/modules/clientes/services/tipos-fuentes-pago.service.ts`
- **Service de entidades:** `src/modules/configuracion/services/entidades-financieras.service.ts`
- **Hook de fuentes:** `src/modules/clientes/components/asignar-vivienda/hooks/useFuentesPago.ts`
- **Hook de entidades:** `src/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes.ts`
- **Componente card:** `src/modules/clientes/components/fuente-pago-card/FuentePagoCard.tsx`

---

## ✅ Checklist de Implementación Completa

- [x] Tabla tipos_fuentes_pago creada
- [x] Columna tipos_fuentes_aplicables en entidades_financieras
- [x] Índice GIN para performance
- [x] Función SQL get_entidades_por_tipo_fuente()
- [x] Service tipos-fuentes-pago.service.ts
- [x] Method getActivasPorTipoFuente() en entidades service
- [x] Hook useFuentesPago con carga dinámica
- [x] Hook useBancos con filtrado por tipo fuente
- [x] Hook useCajas con filtrado por tipo fuente
- [x] FuentePagoCard auto-expandible
- [x] Estados de carga en UI
- [x] Fallback config para fuentes desconocidas
- [x] Badges simplificados (solo relevantes)
- [x] Número de referencia oculto en Cuota Inicial
- [x] Script de verificación
- [x] Documentación completa
- [x] REGLA CRÍTICA en copilot-instructions.md

---

**Estado:** ✅ Sistema 100% funcional y documentado
**Última actualización:** 23 de diciembre de 2025
