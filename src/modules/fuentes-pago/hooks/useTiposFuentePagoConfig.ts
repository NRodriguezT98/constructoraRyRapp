/**
 * Hook para obtener configuración de tipos de fuentes de pago
 *
 * ✅ Migrado a React Query (useQuery)
 * ✅ Cache automático por 5 minutos (datos raramente cambian)
 */

import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

interface TipoFuenteConfig {
  icono: string
  color: string
  from: string
  to: string
  /** Si true, la fuente requiere entidad financiera y puede requerir documentos de aprobación */
  requiere_entidad: boolean
}

type TiposFuenteConfigMap = Record<string, TipoFuenteConfig>

const FALLBACK_CONFIG: TiposFuenteConfigMap = {
  'Cuota Inicial': {
    icono: 'Wallet',
    color: 'purple',
    from: 'rgb(168, 85, 247)',
    to: 'rgb(147, 51, 234)',
    requiere_entidad: false,
  },
  'Crédito Hipotecario': {
    icono: 'Building2',
    color: 'blue',
    from: 'rgb(59, 130, 246)',
    to: 'rgb(37, 99, 235)',
    requiere_entidad: true,
  },
  'Subsidio Mi Casa Ya': {
    icono: 'HandCoins',
    color: 'green',
    from: 'rgb(34, 197, 94)',
    to: 'rgb(16, 185, 129)',
    requiere_entidad: false,
  },
  'Subsidio Caja Compensación': {
    icono: 'BadgeDollarSign',
    color: 'orange',
    from: 'rgb(251, 146, 60)',
    to: 'rgb(249, 115, 22)',
    requiere_entidad: true,
  },
}

const COLOR_MAP: Record<string, { from: string; to: string }> = {
  blue: { from: 'rgb(59, 130, 246)', to: 'rgb(37, 99, 235)' },
  purple: { from: 'rgb(168, 85, 247)', to: 'rgb(147, 51, 234)' },
  green: { from: 'rgb(34, 197, 94)', to: 'rgb(16, 185, 129)' },
  orange: { from: 'rgb(251, 146, 60)', to: 'rgb(249, 115, 22)' },
  red: { from: 'rgb(239, 68, 68)', to: 'rgb(220, 38, 38)' },
  cyan: { from: 'rgb(6, 182, 212)', to: 'rgb(8, 145, 178)' },
  pink: { from: 'rgb(236, 72, 153)', to: 'rgb(219, 39, 119)' },
  indigo: { from: 'rgb(99, 102, 241)', to: 'rgb(79, 70, 229)' },
  yellow: { from: 'rgb(245, 158, 11)', to: 'rgb(217, 119, 6)' },
  emerald: { from: 'rgb(16, 185, 129)', to: 'rgb(5, 150, 105)' },
}

export const tiposFuenteConfigKeys = {
  all: ['tipos-fuente-config'] as const,
}

async function fetchTiposConfig(): Promise<TiposFuenteConfigMap> {
  const { data, error } = await supabase
    .from('tipos_fuentes_pago')
    .select('nombre, icono, color, requiere_entidad')
    .eq('activo', true)
    .order('orden')

  if (error) {
    logger.error('Error al obtener tipos de fuente:', error)
    throw new Error(error.message)
  }

  if (!data || data.length === 0) return FALLBACK_CONFIG

  const configMap: TiposFuenteConfigMap = {}
  data.forEach(tipo => {
    const colorInfo = COLOR_MAP[tipo.color] || COLOR_MAP.blue
    configMap[tipo.nombre] = {
      icono: tipo.icono,
      color: tipo.color,
      from: colorInfo.from,
      to: colorInfo.to,
      requiere_entidad: tipo.requiere_entidad ?? false,
    }
  })
  return configMap
}

export function useTiposFuentePagoConfig() {
  const { data, isLoading, error } = useQuery({
    queryKey: tiposFuenteConfigKeys.all,
    queryFn: fetchTiposConfig,
    staleTime: 5 * 60 * 1000, // 5 minutos — raramente cambia
    placeholderData: FALLBACK_CONFIG,
  })

  const tiposConfig = data ?? FALLBACK_CONFIG

  const getTipoConfig = useMemo(
    () =>
      (tipoNombre: string): TipoFuenteConfig =>
        tiposConfig[tipoNombre] ?? FALLBACK_CONFIG['Cuota Inicial'],
    [tiposConfig]
  )

  return {
    tiposConfig,
    getTipoConfig,
    isLoading,
    error: error ? (error as Error).message : null,
  }
}
