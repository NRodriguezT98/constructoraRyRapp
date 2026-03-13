'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, DollarSign, Info } from 'lucide-react'
import { useCallback } from 'react'

import { FuentePagoCard } from '@/modules/clientes/components/fuente-pago-card'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import type { FuentePagoConfig, FuentePagoConfiguracion, FuentePagoErrores } from '../types'

interface Paso2FuentesPagoProps {
  // 🔥 Estado de carga
  cargandoTipos?: boolean
  fuentes: FuentePagoConfiguracion[]
  valorTotal: number
  totalFuentes: number
  diferencia: number
  sumaCierra: boolean
  erroresFuentes?: Record<TipoFuentePago, FuentePagoErrores>
  mostrarErrores?: boolean
  clienteId: string
  clienteNombre: string
  manzana?: string
  numeroVivienda?: string
  onFuenteEnabledChange: (tipo: TipoFuentePago, enabled: boolean) => void
  onFuenteConfigChange: (tipo: TipoFuentePago, config: FuentePagoConfig | null) => void
}

export function Paso2FuentesPago({
  cargandoTipos = false,
  fuentes,
  valorTotal,
  totalFuentes,
  diferencia,
  sumaCierra,
  erroresFuentes,
  mostrarErrores = false,
  clienteId,
  clienteNombre,
  manzana,
  numeroVivienda,
  onFuenteEnabledChange,
  onFuenteConfigChange,
}: Paso2FuentesPagoProps) {
  // ============================================
  // REACT QUERY: CARGAR CONFIGURACIÓN DE CAMPOS
  // ============================================

  const { data: tiposConCampos = [], isLoading: cargandoCampos } = useTiposFuentesConCampos()

  // ✅ Memoizar callbacks para evitar re-renders innecesarios
  const handleEnabledChange = useCallback((tipo: TipoFuentePago) => {
    return (enabled: boolean) => onFuenteEnabledChange(tipo, enabled)
  }, [onFuenteEnabledChange])

  const handleConfigChange = useCallback((tipo: TipoFuentePago) => {
    return (config: FuentePagoConfig | null) => onFuenteConfigChange(tipo, config)
  }, [onFuenteConfigChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {/* Información Guía */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-2.5 shadow-lg">
        <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
          <span className="font-bold">💰 Instrucciones:</span> Activa y configura las <span className="font-semibold">fuentes de pago</span> que el cliente utilizará para cubrir el valor total de la vivienda. La suma de todas las fuentes debe ser exactamente <span className="font-semibold">${valorTotal.toLocaleString('es-CO')}</span>. Puedes combinar cuota inicial, crédito hipotecario y subsidios.
        </p>
      </div>

      {/* 🔥 Estado de carga de fuentes desde BD */}
      {(cargandoTipos || cargandoCampos) && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-cyan-200/50 dark:border-cyan-800/50 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">
              {cargandoTipos
                ? 'Cargando fuentes de pago activas desde el sistema...'
                : 'Cargando configuración de campos dinámicos...'}
            </p>
          </div>
        </div>
      )}

      {/* 🔥 Lista dinámica de fuentes */}
      {!cargandoTipos && fuentes.length === 0 && (
        <div className="backdrop-blur-xl bg-yellow-50/90 dark:bg-yellow-950/30 border border-yellow-200/50 dark:border-yellow-800/50 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ No hay fuentes de pago activas configuradas. Contacta al administrador.
          </p>
        </div>
      )}

      {!cargandoTipos && !cargandoCampos && fuentes.length > 0 && (
        <div className="space-y-3">
          {fuentes.map((fuente) => {
            // ✅ Obtener configuración de campos para este tipo
            const tipoConCampos = tiposConCampos.find(t => t.nombre === fuente.tipo)
            const camposConfig = tipoConCampos?.configuracion_campos?.campos || []

            return (
              <FuentePagoCard
                key={fuente.tipo}
                tipo={fuente.tipo}
                config={fuente.config}
                camposConfig={camposConfig} // ← Pasar configuración dinámica
                enabled={fuente.enabled}
                valorTotal={valorTotal}
                errores={mostrarErrores ? erroresFuentes?.[fuente.tipo] : undefined}
                clienteId={clienteId}
                clienteNombre={clienteNombre}
                manzana={manzana}
                numeroVivienda={numeroVivienda}
                onEnabledChange={handleEnabledChange(fuente.tipo)}
                onChange={handleConfigChange(fuente.tipo)}
              />
            )
          })}
        </div>
      )}

      <div
        className={`rounded-xl border-2 p-4 transition-all backdrop-blur-xl ${
          sumaCierra
            ? 'border-green-500 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg shadow-green-500/10'
            : totalFuentes > 0
              ? 'border-red-500 bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-950/30 dark:to-rose-950/30 shadow-lg shadow-red-500/10'
              : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 shadow-xl'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Fuentes de Pago
            </span>
            <span className={`text-lg font-bold ${
              sumaCierra
                ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent'
                : totalFuentes > 0
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent'
                  : 'text-gray-600 dark:text-gray-400'
            }`}>
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Diferencia
            </span>
            <span className={`text-lg font-bold ${
              sumaCierra
                ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              ${diferencia.toLocaleString('es-CO')}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={sumaCierra ? s.alert.success : totalFuentes > 0 ? s.alert.error : s.alert.info}
          >
            {sumaCierra ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800 dark:text-green-200">
                    ¡Perfecto! Las fuentes cubren exactamente el valor total
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Puedes continuar al siguiente paso
                  </p>
                </div>
              </>
            ) : totalFuentes > 0 ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-200">
                    Las fuentes no coinciden con el valor total
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {diferencia > 0
                      ? `Falta cubrir $${diferencia.toLocaleString('es-CO')}`
                      : `Sobra $${Math.abs(diferencia).toLocaleString('es-CO')}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-cyan-800 dark:text-cyan-200">
                    Activa y configura las fuentes de pago necesarias
                  </p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                    La suma debe ser exactamente ${valorTotal.toLocaleString('es-CO')}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
