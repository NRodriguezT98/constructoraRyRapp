/**
 * Hook para obtener configuración de tipos de fuentes de pago
 *
 * Este hook se conecta a la tabla `tipos_fuentes_pago` para obtener
 * la configuración de colores e iconos desde el panel de administración
 */

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface TipoFuenteConfig {
  icono: string
  color: string
  from: string
  to: string
}

type TiposFuenteConfigMap = Record<string, TipoFuenteConfig>

const FALLBACK_CONFIG: TiposFuenteConfigMap = {
  'Cuota Inicial': {
    icono: 'Wallet',
    color: 'purple',
    from: 'rgb(168, 85, 247)',
    to: 'rgb(147, 51, 234)',
  },
  'Crédito Hipotecario': {
    icono: 'Building2',
    color: 'blue',
    from: 'rgb(59, 130, 246)',
    to: 'rgb(37, 99, 235)',
  },
  'Subsidio Mi Casa Ya': {
    icono: 'HandCoins',
    color: 'green',
    from: 'rgb(34, 197, 94)',
    to: 'rgb(16, 185, 129)',
  },
  'Subsidio Caja Compensación': {
    icono: 'BadgeDollarSign',
    color: 'orange',
    from: 'rgb(251, 146, 60)',
    to: 'rgb(249, 115, 22)',
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

export function useTiposFuentePagoConfig() {
  const [tiposConfig, setTiposConfig] = useState<TiposFuenteConfigMap>(FALLBACK_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTiposConfig = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('tipos_fuentes_pago')
          .select('nombre, icono, color')
          .eq('activo', true)
          .order('orden')

        if (error) {
          console.error('Error al obtener tipos de fuente:', error)
          setError(error.message)
          return
        }

        if (data && data.length > 0) {
          const configMap: TiposFuenteConfigMap = {}

          data.forEach((tipo: any) => {
            const colorInfo = COLOR_MAP[tipo.color] || COLOR_MAP.blue
            configMap[tipo.nombre] = {
              icono: tipo.icono,
              color: tipo.color,
              from: colorInfo.from,
              to: colorInfo.to,
            }
          })

          setTiposConfig(configMap)
        }
      } catch (err) {
        console.error('Error al cargar configuración de tipos de fuente:', err)
        setError('Error al cargar configuración')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTiposConfig()
  }, [])

  const getTipoConfig = (tipoNombre: string): TipoFuenteConfig => {
    return tiposConfig[tipoNombre] || FALLBACK_CONFIG['Cuota Inicial']
  }

  return {
    tiposConfig,
    getTipoConfig,
    isLoading,
    error,
  }
}
