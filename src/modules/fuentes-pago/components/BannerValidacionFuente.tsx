/**
 * ============================================
 * COMPONENTE: Banner de Validación de Fuentes
 * ============================================
 *
 * Muestra estado de validación de documentos obligatorios.
 * Bloquea desembolsos si faltan documentos requeridos.
 *
 * Similar a BannerDocumentosPendientes pero para fuentes de pago.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, FileText, Lock } from 'lucide-react'

interface EstadoValidacion {
  puede_desembolsar: boolean
  total_pasos: number
  pasos_completados: number
  pasos_obligatorios: number
  obligatorios_completados: number
  progreso_porcentaje: number
  estado_validacion: 'bloqueado' | 'incompleto' | 'listo'
  documentos_faltantes: Array<{
    paso: string
    titulo: string
    descripcion: string
  }>
}

interface BannerValidacionFuenteProps {
  estado: EstadoValidacion
  onSubirDocumento?: () => void
}

export function BannerValidacionFuente({ estado, onSubirDocumento }: BannerValidacionFuenteProps) {
  // Si está todo completo, no mostrar banner
  if (estado.estado_validacion === 'listo') {
    return null
  }

  const colorConfig = {
    bloqueado: {
      gradient: 'from-red-600 via-rose-600 to-pink-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-300 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      textLight: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
    },
    incompleto: {
      gradient: 'from-amber-600 via-yellow-600 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-300 dark:border-amber-800',
      text: 'text-amber-900 dark:text-amber-100',
      textLight: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
    },
  }

  const config = colorConfig[estado.estado_validacion]
  const Icon = estado.estado_validacion === 'bloqueado' ? Lock : AlertTriangle

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border-2 ${config.border} ${config.bg} p-4 shadow-lg`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${config.text} mb-1`}>
              {estado.estado_validacion === 'bloqueado'
                ? '🚫 Desembolso Bloqueado'
                : '⚠️ Validación Incompleta'}
            </h3>
            <p className={`text-xs ${config.textLight} mb-3`}>
              {estado.estado_validacion === 'bloqueado'
                ? `Faltan ${estado.pasos_obligatorios - estado.obligatorios_completados} documento(s) obligatorio(s) para poder registrar el desembolso.`
                : `${estado.pasos_completados}/${estado.total_pasos} pasos completados (${estado.progreso_porcentaje}%)`}
            </p>

            {/* Documentos Faltantes */}
            {estado.documentos_faltantes && estado.documentos_faltantes.length > 0 && (
              <div className="space-y-2 mb-3">
                {estado.documentos_faltantes.map((doc, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-900/50 border ${config.border}`}
                  >
                    <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.icon}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${config.text}`}>
                        {doc.titulo}
                      </p>
                      <p className={`text-xs ${config.textLight} mt-0.5`}>
                        {doc.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón Subir Documento */}
            {onSubirDocumento && (
              <button
                onClick={onSubirDocumento}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  estado.estado_validacion === 'bloqueado'
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Subir Documento Faltante
              </button>
            )}
          </div>

          {/* Progreso */}
          <div className="flex-shrink-0 text-right">
            <div className={`text-2xl font-bold ${config.text}`}>
              {estado.progreso_porcentaje}%
            </div>
            <div className={`text-xs ${config.textLight}`}>
              {estado.pasos_completados}/{estado.total_pasos}
            </div>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${estado.progreso_porcentaje}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * ============================================
 * HOOK: useEstadoValidacionFuente
 * ============================================
 */

import { createClient } from '@/lib/supabase/client'

import { useQuery } from '@tanstack/react-query'

export function useEstadoValidacionFuente(fuentePagoId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['estado-validacion-fuente', fuentePagoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vista_estado_validacion_fuentes' as any)
        .select('*')
        .eq('fuente_pago_id', fuentePagoId)
        .single()

      if (error) throw error
      return data as unknown as EstadoValidacion
    },
    enabled: !!fuentePagoId,
    refetchInterval: 5000, // Actualizar cada 5 segundos
  })
}
