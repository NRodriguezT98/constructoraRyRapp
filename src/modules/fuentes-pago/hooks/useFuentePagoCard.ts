/**
 * ============================================
 * HOOK: useFuentePagoCard (Business Logic)
 * ============================================
 *
 * Hook especializado que encapsula TODA la lógica de negocio
 * para las tarjetas de fuente de pago.
 *
 * Responsabilidades:
 * - Formateo de datos
 * - Cálculos financieros
 * - Estados visuales
 * - Handlers de eventos
 *
 * ✅ BENEFICIOS:
 * - Lógica reutilizable
 * - Testing aislado
 * - Separación clara UI/Logic
 * - Performance optimizado
 */

import type { LucideIcon } from 'lucide-react'
import {
  BadgeDollarSign,
  Banknote,
  Building2,
  DollarSign,
  Gift,
  HandCoins,
  Home,
  Wallet
} from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { usePasosFuentePago, useTiposFuentePagoConfig } from '../hooks'

// =====================================================
// TYPES
// =====================================================

interface EstadoVisual {
  tipo: 'completo' | 'progreso' | 'sin-configurar' | 'bloqueado'
  label: string
  color: string
  iconClass: string
}

interface MetricasFinancieras {
  total: number
  abonado: number
  pendiente: number
  porcentajePagado: number
}

interface TemaColores {
  gradientFrom: string
  gradientTo: string
}

export interface FuentePagoData {
  id: string
  tipo: string
  entidad?: string | null
  monto_aprobado: number
  monto_recibido: number
  numero_referencia?: string | null
  saldo_pendiente?: number
  porcentaje_completado?: number
  estado?: string
  negociacion_id?: string
  permite_multiples_abonos?: boolean
  fecha_creacion?: string
  fecha_actualizacion?: string
}

interface UseFuentePagoCardProps {
  fuente: FuentePagoData
  clienteId?: string
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useFuentePagoCard({ fuente, clienteId }: UseFuentePagoCardProps) {
  // ✅ Data fetching con React Query
  const {
    pasos,
    progreso,
    validacion,
    puedeDesembolsar,
    isLoading: isLoadingPasos,
    error: errorPasos,
  } = usePasosFuentePago(fuente.id)

  // ✅ Configuración dinámica desde BD
  const { getTipoConfig, isLoading: isLoadingConfig } = useTiposFuentePagoConfig()

  // ✅ Mapeo de iconos optimizado
  const iconMap = useMemo<Record<string, LucideIcon>>(() => ({
    // Iconos principales configurados en BD
    Wallet,
    Building2,
    HandCoins,
    BadgeDollarSign,
    // Iconos adicionales
    DollarSign,
    Home,
    Gift,
    Banknote,
    // Compatibilidad
    Shield: Gift,
    CreditCard: Building2,
    Landmark: Building2,
  }), [])

  // ✅ Métricas financieras (memoizadas)
  const metricas = useMemo<MetricasFinancieras>(() => ({
    total: fuente.monto_aprobado || 0,
    abonado: fuente.monto_recibido || 0,
    pendiente: (fuente.monto_aprobado || 0) - (fuente.monto_recibido || 0),
    porcentajePagado: fuente.monto_aprobado
      ? Math.round(((fuente.monto_recibido || 0) / fuente.monto_aprobado) * 100)
      : 0,
  }), [fuente.monto_aprobado, fuente.monto_recibido])

  // ✅ Configuración visual (memoizada)
  const configuracion = useMemo(() => {
    const config = getTipoConfig(fuente.tipo)
    const iconName = config.icono || 'Banknote'
    const IconComponent = iconMap[iconName] || Banknote

    return {
      icono: IconComponent,
      colores: {
        gradientFrom: config.from,
        gradientTo: config.to,
      },
      config,
    }
  }, [fuente.tipo, getTipoConfig, iconMap])

  // ✅ Tipos que requieren validación (constante)
  const tiposQueRequierenValidacion = useMemo(
    () => ['Crédito Hipotecario', 'Subsidio Mi Casa Ya', 'Subsidio Caja Compensación'],
    []
  )

  // ✅ Estado visual calculado (memoizado)
  const estadoVisual = useMemo<EstadoVisual>(() => {
    const requiereValidacion = tiposQueRequierenValidacion.includes(fuente.tipo)

    // Cuota Inicial - sin requisitos
    if (!requiereValidacion) {
      if (metricas.porcentajePagado === 100) {
        return {
          tipo: 'completo',
          label: '✓ Totalmente pagada',
          color: 'text-green-600 dark:text-green-400',
          iconClass: 'text-green-600 dark:text-green-400'
        }
      }
      return {
        tipo: 'completo',
        label: '✓ Lista para recibir abonos',
        color: 'text-green-600 dark:text-green-400',
        iconClass: 'text-green-600 dark:text-green-400'
      }
    }

    // Fuentes con requisitos
    if (progreso.porcentaje === 100) {
      return {
        tipo: 'completo',
        label: '✓ Habilitada para desembolso',
        color: 'text-green-600 dark:text-green-400',
        iconClass: 'text-green-600 dark:text-green-400'
      }
    }

    if (progreso.pendientes > 0) {
      return {
        tipo: 'progreso',
        label: `⚠️ ${progreso.pendientes} documento${progreso.pendientes > 1 ? 's' : ''} para habilitar desembolso`,
        color: 'text-amber-600 dark:text-amber-400',
        iconClass: 'text-amber-600 dark:text-amber-400'
      }
    }

    if (progreso.completados === 0 && pasos.length > 0) {
      return {
        tipo: 'sin-configurar',
        label: '⚠️ Sin documentos - No se puede desembolsar',
        color: 'text-amber-600 dark:text-amber-400',
        iconClass: 'text-amber-600 dark:text-amber-400'
      }
    }

    return {
      tipo: 'bloqueado',
      label: '❌ Bloqueada para desembolso',
      color: 'text-red-600 dark:text-red-400',
      iconClass: 'text-red-600 dark:text-red-400'
    }
  }, [fuente.tipo, metricas.porcentajePagado, progreso, pasos.length, tiposQueRequierenValidacion])

  // ✅ Formateador de moneda (memoizado)
  const formatCurrency = useCallback((amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount), []
  )

  // ✅ Estados derivados
  const isLoading = isLoadingPasos || isLoadingConfig
  const hasError = !!errorPasos

  return {
    // Datos
    fuente,
    pasos,
    progreso,
    validacion,
    metricas,
    estadoVisual,
    configuracion,

    // Estados
    isLoading,
    hasError,
    errorPasos,
    puedeDesembolsar,

    // Utilidades
    formatCurrency,
    tiposQueRequierenValidacion,

    // Configuración
    clienteId,
  }
}
