/**
 * Sidebar: Resumen Financiero Sticky
 *
 * Mejora #2: Preview del valor total siempre visible
 * Muestra en tiempo real el resumen financiero en todos los pasos
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Home,
    Percent,
    TrendingDown,
} from 'lucide-react'

import type { FuentePagoConfig } from '@/modules/clientes/components/asignar-vivienda/types'
import type { TipoFuentePago } from '@/modules/clientes/types'

import { animations } from '../styles'

// Mapeo de tipos de fuente a nombres legibles
const FUENTE_LABELS: Record<string, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}

// Función helper para obtener nombre legible de fuente
const getFuenteLabel = (tipo: TipoFuentePago | string): string => {
  return FUENTE_LABELS[tipo] || tipo
}

interface SidebarResumenProps {
  currentStep: 1 | 2 | 3
  // Paso 1
  viviendaNumero?: string
  valorVivienda: number
  descuentoAplicado: number
  valorTotal: number
  // Paso 2
  fuentesConfiguradas: {
    tipo: TipoFuentePago
    config: FuentePagoConfig
  }[]
  totalFuentes: number
  sumaCierra: boolean
  // Progreso
  progressStep1: number
  progressStep2: number
}

export function SidebarResumen({
  currentStep,
  viviendaNumero,
  valorVivienda,
  descuentoAplicado,
  valorTotal,
  fuentesConfiguradas,
  totalFuentes,
  sumaCierra,
  progressStep1,
  progressStep2,
}: SidebarResumenProps) {
  const diferencia = valorTotal - totalFuentes
  const porcentajeDescuento = valorVivienda > 0
    ? ((descuentoAplicado / valorVivienda) * 100).toFixed(1)
    : '0'

  return (
    <motion.div {...animations.sidebar} className="space-y-4">
      {/* Vivienda Seleccionada */}
      {viviendaNumero && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Vivienda
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {viviendaNumero}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumen Financiero */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Resumen Financiero
          </h3>
        </div>

        <div className="space-y-4">
          {/* Valor Vivienda */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Valor Vivienda
            </p>
            <p className="text-xl font-light text-gray-900 dark:text-white">
              ${valorVivienda.toLocaleString('es-CO')}
            </p>
          </div>

          {/* Descuento */}
          {descuentoAplicado > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <TrendingDown className="w-3 h-3" />
                    Descuento
                  </p>
                  <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {porcentajeDescuento}%
                  </span>
                </div>
                <p className="text-lg font-light text-orange-600 dark:text-orange-400">
                  -${descuentoAplicado.toLocaleString('es-CO')}
                </p>
              </div>
            </>
          )}

          {/* Total a Financiar */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total a Financiar
            </p>
            <p className="text-2xl font-medium text-green-600 dark:text-green-400">
              ${valorTotal.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* Progreso de Fuentes (Solo en Paso 2 y 3) */}
      {currentStep >= 2 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuentes de Pago
            </h3>
          </div>

          <div className="space-y-4">
            {/* Total Fuentes */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Total Configurado
              </p>
              <p className="text-xl font-light text-gray-900 dark:text-white">
                ${totalFuentes.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Estado de Cierre */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              {sumaCierra ? (
                <div className="flex items-start gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Cierre completo</p>
                    <p className="text-xs opacity-80 mt-0.5">
                      Las fuentes cubren el total
                    </p>
                  </div>
                </div>
              ) : diferencia !== 0 ? (
                <div className="flex items-start gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {diferencia > 0 ? 'Faltan' : 'Excedente'}
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">
                      ${Math.abs(diferencia).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Sin configurar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Fuentes */}
            {fuentesConfiguradas.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                {fuentesConfiguradas.map((fuente) => {
                  const porcentaje = ((fuente.config.monto_aprobado / valorTotal) * 100).toFixed(0)

                  return (
                    <div
                      key={fuente.tipo}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {getFuenteLabel(fuente.tipo)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-500">
                          {porcentaje}%
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ${fuente.config.monto_aprobado.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progreso por Paso (Mejora #3) */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Progreso
        </h3>

        <div className="space-y-3">
          {/* Paso 1 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Paso 1: Información
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {progressStep1}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressStep1}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Paso 2 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Paso 2: Fuentes
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {progressStep2}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressStep2}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
