/**
 * 🎯 GUÍA DE INTEGRACIÓN: Fuentes de Pago Dinámicas en Negociaciones
 *
 * Pasos para reemplazar fuentes hardcodeadas por el sistema dinámico.
 */

// =====================================================
// ❌ ANTES: Hardcoded (NO USAR)
// =====================================================

const TIPOS_FUENTE_HARDCODED = {
  'Cuota Inicial': {
    icon: Wallet,
    color: 'purple',
    label: 'Cuota Inicial',
    requiereEntidad: false,
    permiteMultiples: true,
  },
  'Crédito Hipotecario': {
    icon: Building2,
    color: 'blue',
    label: 'Crédito Hipotecario',
    requiereEntidad: true,
    permiteMultiples: false,
  },
  // ... más fuentes hardcoded
}

// =====================================================
// ✅ DESPUÉS: Dinámico desde BD
// =====================================================

import { useTiposFuentesPagoOptions } from '@/modules/configuracion/hooks'

export function ConfigurarFuentesPago({ negociacionId, valorTotal }: Props) {
  // Cargar fuentes dinámicamente
  const { data: tiposFuentesDisponibles = [], isLoading } = useTiposFuentesPagoOptions()

  // Mapeo de iconos (importar según necesidad)
  const iconMap: Record<string, React.ComponentType> = {
    Wallet,
    Building2,
    Home,
    Shield,
    CreditCard,
    // ... resto de iconos
  }

  // Mapeo de colores
  const colorMap: Record<string, ColorConfig> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ... },
    green: { bg: 'bg-green-50', text: 'text-green-600', ... },
    // ... resto de colores
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div>
      {/* Selector de Tipo de Fuente */}
      <select name="tipo_fuente_id">
        <option value="">Selecciona una fuente...</option>
        {tiposFuentesDisponibles.map((tipo) => (
          <option key={tipo.value} value={tipo.value}>
            {tipo.label}
          </option>
        ))}
      </select>

      {/* Renderizado dinámico basado en configuración */}
      {tiposFuentesDisponibles.map((tipo) => {
        const Icon = iconMap[tipo.icono]
        const colors = colorMap[tipo.color]

        return (
          <div key={tipo.value} className={colors.bg}>
            <Icon className={colors.text} />
            <span>{tipo.label}</span>

            {/* Campos condicionales */}
            {tipo.requiere_entidad && (
              <input name="entidad" placeholder="Nombre del banco/caja" />
            )}

            {tipo.permite_multiples_abonos && (
              <button>Agregar Otro Abono</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// =====================================================
// 📋 INTEGRACIÓN COMPLETA: Paso a Paso
// =====================================================

/**
 * PASO 1: Importar hook de React Query
 */
import { useTiposFuentesPagoOptions, useTipoFuentePago } from '@/modules/configuracion/hooks'

/**
 * PASO 2: Cargar opciones en componente
 */
function MiComponente() {
  const { data: opciones = [], isLoading, error } = useTiposFuentesPagoOptions()

  // Manejo de estados
  if (isLoading) return <div>Cargando fuentes...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <select>
      {opciones.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

/**
 * PASO 3: Obtener detalle completo de una fuente
 */
function DetalleFuente({ fuenteId }: { fuenteId: string }) {
  const { data: fuente } = useTipoFuentePago(fuenteId)

  if (!fuente) return null

  return (
    <div>
      <h3>{fuente.nombre}</h3>
      <p>{fuente.descripcion}</p>
      {fuente.requiere_entidad && <p>Requiere especificar banco/caja</p>}
      {fuente.permite_multiples_abonos && <p>Permite pagos parciales</p>}
      {fuente.es_subsidio && <p>Es un subsidio gubernamental</p>}
    </div>
  )
}

/**
 * PASO 4: Formulario con validación dinámica
 */
function FormularioFuentePago() {
  const { data: opciones = [] } = useTiposFuentesPagoOptions()
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState<string | null>(null)

  const fuente = opciones.find(opt => opt.value === fuenteSeleccionada)

  return (
    <form>
      {/* Select dinámico */}
      <select
        value={fuenteSeleccionada || ''}
        onChange={(e) => setFuenteSeleccionada(e.target.value)}
      >
        <option value="">Selecciona fuente...</option>
        {opciones.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Campos condicionales según configuración */}
      {fuente?.requiere_entidad && (
        <input
          name="entidad"
          placeholder="Banco o Caja de Compensación"
          required
        />
      )}

      {fuente?.es_subsidio && (
        <input
          name="numero_subsidio"
          placeholder="Número de subsidio asignado"
          required
        />
      )}

      {fuente?.permite_multiples_abonos && (
        <div>
          <p>Esta fuente permite múltiples abonos</p>
          <button type="button">Agregar Abono</button>
        </div>
      )}
    </form>
  )
}

// =====================================================
// 🔄 MIGRACIÓN DE CÓDIGO EXISTENTE
// =====================================================

/**
 * ARCHIVO A MODIFICAR:
 * src/modules/clientes/components/negociaciones/configurar-fuentes-pago.tsx
 */

// 1. Importar hook
import { useTiposFuentesPagoOptions } from '@/modules/configuracion/hooks'

// 2. Reemplazar constante TIPOS_FUENTE
// ❌ ELIMINAR: const TIPOS_FUENTE = { ... }
// ✅ AGREGAR:
const { data: tiposFuentesDB = [], isLoading } = useTiposFuentesPagoOptions()

// 3. Mapear a formato esperado (si es necesario)
const TIPOS_FUENTE = useMemo(() => {
  return tiposFuentesDB.reduce((acc, tipo) => {
    acc[tipo.codigo] = {
      icon: getIcon(tipo.icono), // Helper para mapear string a componente
      color: tipo.color,
      label: tipo.label,
      requiereEntidad: tipo.requiere_entidad,
      permiteMultiples: tipo.permite_multiples_abonos,
    }
    return acc
  }, {} as Record<string, any>)
}, [tiposFuentesDB])

// 4. Helper para iconos
const getIcon = (iconName: string): React.ComponentType => {
  const icons: Record<string, React.ComponentType> = {
    Wallet,
    Building2,
    Home,
    Shield,
    CreditCard,
  }
  return icons[iconName] || Wallet
}

// =====================================================
// 📊 EJEMPLO REAL: Reemplazo Completo
// =====================================================

// ANTES (hardcoded):
const TIPOS_FUENTE = {
  'Cuota Inicial': {
    icon: Wallet,
    color: 'purple',
    bgLight: 'bg-purple-50',
    bgDark: 'bg-purple-900/20',
    textLight: 'text-purple-600',
    textDark: 'text-purple-400',
    borderLight: 'border-purple-200',
    borderDark: 'border-purple-700',
    label: 'Cuota Inicial',
    descripcion: 'Pagos directos del cliente (permite múltiples abonos)',
    requiereEntidad: false,
    permiteMultiples: true,
  },
}

// DESPUÉS (dinámico):
import { useTiposFuentesPagoOptions } from '@/modules/configuracion/hooks'

const { data: tiposDB = [] } = useTiposFuentesPagoOptions()

const TIPOS_FUENTE = useMemo(() => {
  return tiposDB.reduce((acc, tipo) => {
    acc[tipo.codigo] = {
      icon: iconMap[tipo.icono],
      color: tipo.color,
      bgLight: `bg-${tipo.color}-50`,
      bgDark: `bg-${tipo.color}-900/20`,
      textLight: `text-${tipo.color}-600`,
      textDark: `text-${tipo.color}-400`,
      borderLight: `border-${tipo.color}-200`,
      borderDark: `border-${tipo.color}-700`,
      label: tipo.label,
      descripcion: tipo.descripcion || '',
      requiereEntidad: tipo.requiere_entidad,
      permiteMultiples: tipo.permite_multiples_abonos,
    }
    return acc
  }, {})
}, [tiposDB])

// =====================================================
// ⚠️ CONSIDERACIONES IMPORTANTES
// =====================================================

/**
 * 1. CLASES DE TAILWIND DINÁMICAS
 *
 * ❌ NO FUNCIONA (Tailwind no compila strings dinámicos):
 * className={`bg-${color}-50`}
 *
 * ✅ SOLUCIÓN 1: Objeto de mapeo
 */
const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  // ... resto de colores
}
const classes = colorClasses[tipo.color]

/**
 * ✅ SOLUCIÓN 2: SafeList en tailwind.config.js
 */
// tailwind.config.js
module.exports = {
  safelist: [
    'bg-blue-50', 'bg-green-50', 'bg-purple-50',
    'text-blue-600', 'text-green-600', 'text-purple-600',
    // ... todas las variantes usadas
  ]
}

/**
 * 2. CACHE DE REACT QUERY
 *
 * Las fuentes se cachean por 10 minutos.
 * Para forzar recarga:
 */
import { useInvalidarTiposFuentesPago } from '@/modules/configuracion/hooks'

const invalidar = useInvalidarTiposFuentesPago()
invalidar() // Fuerza refetch

/**
 * 3. MANEJO DE ERRORES
 *
 * Siempre manejar estado de error:
 */
const { data: opciones = [], isLoading, error } = useTiposFuentesPagoOptions()

if (error) {
  return <ErrorState message={error.message} />
}

/**
 * 4. FALLBACK DURANTE MIGRACIÓN
 *
 * Mantener hardcode como fallback temporal:
 */
const TIPOS_FUENTE_FALLBACK = { /* hardcoded */ }
const TIPOS_FUENTE = tiposDB.length > 0 ? mapearTiposDB(tiposDB) : TIPOS_FUENTE_FALLBACK

// =====================================================
// 🚀 BENEFICIOS POST-INTEGRACIÓN
// =====================================================

/**
 * ✅ Agregar nueva fuente: 2 minutos desde UI de admin
 * ✅ Cambiar orden: Drag & drop en admin
 * ✅ Desactivar fuente obsoleta: Toggle en admin
 * ✅ Sin deployments para cambios de configuración
 * ✅ Auditoría completa de cambios
 * ✅ Sincronización en tiempo real
 */

// =====================================================
// 📚 DOCUMENTACIÓN COMPLETA
// =====================================================

/**
 * Ver: docs/SISTEMA-FUENTES-PAGO-DINAMICAS.md
 *
 * Incluye:
 * - Arquitectura completa
 * - Schema de BD
 * - Ejemplos de uso
 * - Troubleshooting
 * - Roadmap
 */
